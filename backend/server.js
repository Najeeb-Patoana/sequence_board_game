const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const allCards = require('./allCards.js');
const gameEngine = require('./gameEngine.js');
const { BotPlayer, runBotTurn } = require('./botPlayer.js');
const {
    sanitiseName, sanitiseRoomCode, sanitiseRoomId,
    sanitisePlayerCount, sanitiseNumTeams,
    sanitiseCardId, sanitiseBoardId, sanitiseDifficulty,
    sanitiseSessionId, rateLimiter,
} = require('./validate.js');

// ── Config ────────────────────────────────────────────────────

const ALLOWED_ORIGIN   = process.env.ALLOWED_ORIGIN || '*';
const MAX_ROOMS        = 200;   // hard cap to prevent memory exhaustion
const MAX_SESSIONS     = 1000;  // max live sessions
const RECONNECT_GRACE_MS = 60_000;
const SESSION_TTL_MS     = 2 * 60 * 60 * 1000; // 2 h

// ── Rate limit budgets (calls / 5 s per socket per event) ─────
const RL = {
    create_custom_room:  { max: 3,  win: 10_000 }, // 3 creates per 10 s
    join_custom_room:    { max: 5,  win: 10_000 },
    play_online:         { max: 3,  win: 10_000 },
    player_ready_toggle: { max: 10, win: 5_000  },
    add_cpu_player:      { max: 5,  win: 5_000  },
    start_game:          { max: 3,  win: 5_000  },
    Boardcardclicked:    { max: 20, win: 5_000  }, // fast gameplay
    declare_dead_card:   { max: 5,  win: 5_000  },
    gameOverclicked:     { max: 3,  win: 5_000  },
};

// ── Express + Socket.io setup ─────────────────────────────────

const app = express();

// CORS: restrict to allowed origin in production
app.use(cors({
    origin: ALLOWED_ORIGIN,
    methods: ['GET'],
}));

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        time: new Date().toISOString()
    });
});

// Block all unexpected HTTP routes (this is a WS server)
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ALLOWED_ORIGIN,
        methods: ['GET', 'POST'],
    },
    // Limit inbound message size (prevent payload bombs)
    maxHttpBufferSize: 16 * 1024, // 16 KB
    pingTimeout:  20_000,
    pingInterval: 25_000,
});

// ── In-memory stores ──────────────────────────────────────────
const rooms    = new Map(); // roomId → Room
const activeSockets = new Map(); // sessionId → socket
const sessions = new Map(); // sessionId → Session

// ── Helper: reject event if rate-limited ─────────────────────
function rl(socket, eventName) {
    const cfg = RL[eventName] || { max: 10, win: 5_000 };
    if (!rateLimiter.allow(socket.id, eventName, cfg.max, cfg.win)) {
        socket.emit('error_msg', { code: 'RATE_LIMITED', message: 'Too many requests. Slow down.' });
        return true; // true = blocked
    }
    return false;
}

// ── helpers ───────────────────────────────────────────────────

function generateCode(len = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    do {
        code = Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    } while ([...rooms.values()].some(r => r.code === code));
    return code;
}

function generateRoomId() {
    let id;
    do { id = Math.random().toString(36).substring(2, 12); } while (rooms.has(id));
    return id;
}

function createSession(socketId) {
    // Enforce session cap
    if (sessions.size >= MAX_SESSIONS) {
        // Evict oldest expired sessions first
        const now = Date.now();
        for (const [id, s] of sessions) {
            if (s.expiresAt < now) { sessions.delete(id); break; }
        }
    }
    const sessionId = require('crypto').randomBytes(16).toString('hex'); // 32-char hex, cryptographically random
    sessions.set(sessionId, {
        userId:   socketId,
        roomId:   null,
        playerKey: null,
        expiresAt: Date.now() + SESSION_TTL_MS,
    });
    return sessionId;
}

function buildLobbyPlayerList(room) {
    return room.players.map(p => ({
        playerKey: p.playerKey,
        name:      p.name,     // already sanitised on entry
        team:      p.team,
        isHost:    p.isHost,
        isReady:   p.isReady,
        isCpu:     p.isCpu || false,
        cpuDiff:   p.cpuDiff || null,
    }));
}

function broadcastLobbySync(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    io.to(roomId).emit('LOBBY_STATE_SYNC', {
        roomId:            room.roomId,
        roomCode:          room.code,
        targetPlayerCount: room.targetPlayerCount,
        numTeams:          room.numTeams,
        players:           buildLobbyPlayerList(room),
        canStart:
            room.players.length === room.targetPlayerCount &&
            room.players.every(p => p.isReady),
    });
}

function startGame(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    const playerNames = room.players.map(p => p.name);
    const game = gameEngine.initializeGame(allCards, {
        numPlayers:  room.targetPlayerCount,
        numTeams:    room.numTeams,
        playerNames,
    });

    room.players.forEach((p, i) => {
        const key = `player${i + 1}`;
        if (game.players[key]) {
            game.players[key].socketId = p.socketId;
            game.players[key].isCpu    = p.isCpu || false;
        }
    });

    room.game   = game;
    room.status = 'playing';

    emitGameStateToAll(room, roomId);
    scheduleCpuTurnIfNeeded(roomId);
}

function emitGameStateToAll(room, roomId) {
    const game = room.game;
    if (!game) return;

    const currentTurnKey = game.turnOrder[game.currentTurnIndex];

    room.players.forEach(p => {
        if (!p.socketId || p.isCpu) return;
        const socket = io.sockets.sockets.get(p.socketId);
        if (!socket) return;

        const playersSummary = {};
        Object.entries(game.players).forEach(([k, pl]) => {
            playersSummary[k] = {
                name:      pl.name,
                team:      pl.team,
                isTurn:    k === currentTurnKey,
                isCpu:     pl.isCpu,
                handCount: pl.hand.length,
            };
        });

        socket.emit('GAME_STATE_SYNC', {
            yourKey:     p.playerKey,
            yourHand:    game.players[p.playerKey]?.hand || [],
            cards:       game.cards,
            scores:      game.scores,
            currentTurn: currentTurnKey,
            deckCount:   game.shuffledDeck.length,
            config:      game.config,
            players:     playersSummary,
            lockedCells: game.protectedPatterns.flat(),
        });
    });
}

async function scheduleCpuTurnIfNeeded(roomId) {
    const room = rooms.get(roomId);
    if (!room || !room.game || room.status !== 'playing') return;

    const game = room.game;
    const currentKey = game.turnOrder[game.currentTurnIndex];
    const currentPlayer = game.players[currentKey];
    if (!currentPlayer?.isCpu) return;

    const difficulty = room.players.find(p => p.playerKey === currentKey)?.cpuDiff || 'random';
    const bot = new BotPlayer(currentKey, difficulty, 800);
    const result = await runBotTurn(game, bot);

    const freshRoom = rooms.get(roomId);
    if (!freshRoom || freshRoom.status !== 'playing') return;

    if (!result.success) {
        console.error(`Bot ${currentKey} failed:`, result.error);
        return;
    }

    freshRoom.game = result.game;
    if (result.winner) {
        io.to(roomId).emit('GAME_OVER', { winner: result.winner });
        freshRoom.status = 'finished';
    } else {
        emitGameStateToAll(freshRoom, roomId);
        scheduleCpuTurnIfNeeded(roomId);
    }
}

// Periodic cleanup of expired sessions and empty/finished rooms
setInterval(() => {
    const now = Date.now();

    // Expire sessions
    for (const [id, s] of sessions) {
        if (s.expiresAt < now) sessions.delete(id);
    }

    // Cleanup rooms idle for > 4 hours
    for (const [id, room] of rooms) {
        if (room.createdAt && now - room.createdAt > 4 * 60 * 60 * 1000) {
            io.to(id).emit('room_closed', 'Room expired due to inactivity.');
            rooms.delete(id);
        }
    }
}, 10 * 60 * 1000); // every 10 minutes

// ── Socket connection ─────────────────────────────────────────
io.on('connection', (socket) => {
    let sessionID = sanitiseSessionId(socket.handshake.query.sessionId);

    // ── Session restore / creation ────────────────────────────
    if (sessionID && sessions.has(sessionID)) {
        const sess = sessions.get(sessionID);

        // Check session not expired
        if (sess.expiresAt < Date.now()) {
            sessions.delete(sessionID);
            sessionID = createSession(socket.id);
            activeSockets.set(sessionID, socket);
            socket.emit('session', { sessionId: sessionID });
        } else {
            const existing = activeSockets.get(sessionID);
            if (existing && existing.id !== socket.id) existing.disconnect(true);
            activeSockets.set(sessionID, socket);
            sess.userId = socket.id;

            if (sess.roomId && rooms.has(sess.roomId)) {
                socket.join(sess.roomId);
                const room = rooms.get(sess.roomId);

                const rp = room.players.find(p => p.playerKey === sess.playerKey);
                if (rp) rp.socketId = socket.id;

                if (room.game?.players[sess.playerKey]) {
                    room.game.players[sess.playerKey].socketId = socket.id;
                }

                if (room.disconnectTimers?.[sess.playerKey]) {
                    clearTimeout(room.disconnectTimers[sess.playerKey]);
                    delete room.disconnectTimers[sess.playerKey];
                }

                if (room.status === 'lobby') {
                    broadcastLobbySync(sess.roomId);
                } else if (room.status === 'playing') {
                    emitGameStateToAll(room, sess.roomId);
                }
            }
        }
    } else {
        sessionID = createSession(socket.id);
        activeSockets.set(sessionID, socket);
        socket.emit('session', { sessionId: sessionID });
    }

    // ── Helper: get valid session ─────────────────────────────
    const getSession = () => sessions.get(sessionID);

    // ── create_custom_room ────────────────────────────────────
    socket.on('create_custom_room', (data, cb) => {
        if (rl(socket, 'create_custom_room')) return;
        if (rooms.size >= MAX_ROOMS) {
            return typeof cb === 'function' && cb({ success: false, message: 'Server is at capacity. Try again later.' });
        }

        const playerName = sanitiseName(data?.playerName);
        if (!playerName) {
            socket.emit('room_join_error', { message: 'Invalid player name.' });
            return typeof cb === 'function' && cb({ success: false, message: 'Invalid name.' });
        }

        const targetPlayerCount = sanitisePlayerCount(data?.targetPlayerCount) || 2;
        const resolvedTeams = sanitiseNumTeams(data?.numTeams) || gameEngine.deriveNumTeams(targetPlayerCount);

        const roomId = generateRoomId();
        const code   = generateCode();

        const hostPlayer = {
            playerKey: 'player1',
            socketId:  socket.id,
            name:      playerName,
            team:      'blue',
            isHost:    true,
            isReady:   true,
            isCpu:     false,
            cpuDiff:   null,
        };

        rooms.set(roomId, {
            roomId,
            code,
            hostSocketId:      socket.id,
            targetPlayerCount,
            numTeams:          resolvedTeams,
            isCustom:          true,
            status:            'lobby',
            players:           [hostPlayer],
            game:              null,
            disconnectTimers:  {},
            createdAt:         Date.now(),
        });

        socket.join(roomId);
        const sess = getSession();
        if (sess) { sess.roomId = roomId; sess.playerKey = 'player1'; }

        broadcastLobbySync(roomId);
        socket.emit('custom_room_created', { roomId, roomCode: code });
        if (typeof cb === 'function') cb({ success: true, roomId, roomCode: code });
    });

    // ── join_custom_room ──────────────────────────────────────
    socket.on('join_custom_room', (data, cb) => {
        if (rl(socket, 'join_custom_room')) return;

        const playerName = sanitiseName(data?.playerName);
        if (!playerName) {
            socket.emit('room_join_error', { message: 'Invalid player name.' });
            return typeof cb === 'function' && cb({ success: false, message: 'Invalid name.' });
        }

        // Accept join by roomCode or roomId
        const rawCode = sanitiseRoomCode(data?.roomCode);
        const rawId   = sanitiseRoomId(data?.roomId);

        let room = rawId ? rooms.get(rawId) : null;
        if (!room && rawCode) {
            room = [...rooms.values()].find(r => r.code === rawCode);
        }

        if (!room) {
            socket.emit('room_join_error', { message: 'Room not found. Check the Room Code.' });
            return typeof cb === 'function' && cb({ success: false, message: 'Room not found.' });
        }
        if (room.status !== 'lobby') {
            socket.emit('room_join_error', { message: 'Game already in progress.' });
            return typeof cb === 'function' && cb({ success: false, message: 'Game already started.' });
        }
        if (room.players.length >= room.targetPlayerCount) {
            socket.emit('room_join_error', { message: 'Room is full.' });
            return typeof cb === 'function' && cb({ success: false, message: 'Room full.' });
        }

        const slotIndex  = room.players.length;
        const playerKey  = `player${slotIndex + 1}`;
        const teamColors = ['blue', 'red', 'green'];
        const teamIndex  = room.numTeams === room.targetPlayerCount ? slotIndex : slotIndex % room.numTeams;

        room.players.push({
            playerKey,
            socketId:  socket.id,
            name:      playerName,
            team:      teamColors[teamIndex] || 'blue',
            isHost:    false,
            isReady:   false,
            isCpu:     false,
            cpuDiff:   null,
        });

        socket.join(room.roomId);
        const sess = getSession();
        if (sess) { sess.roomId = room.roomId; sess.playerKey = playerKey; }

        broadcastLobbySync(room.roomId);
        if (typeof cb === 'function') cb({ success: true, roomId: room.roomId, roomCode: room.code, playerKey });
    });

    // ── player_ready_toggle ───────────────────────────────────
    socket.on('player_ready_toggle', () => {
        if (rl(socket, 'player_ready_toggle')) return;
        const sess = getSession();
        if (!sess?.roomId) return;
        const room = rooms.get(sess.roomId);
        if (!room || room.status !== 'lobby') return;

        const rp = room.players.find(p => p.playerKey === sess.playerKey);
        if (rp && !rp.isHost) {
            rp.isReady = !rp.isReady;
            broadcastLobbySync(sess.roomId);
        }
    });

    // ── add_cpu_player ────────────────────────────────────────
    socket.on('add_cpu_player', (data, cb) => {
        if (rl(socket, 'add_cpu_player')) return;
        const sess = getSession();
        if (!sess?.roomId) return;
        const room = rooms.get(sess.roomId);
        if (!room || room.status !== 'lobby') return;

        // Host-only gate: verify socket is the host
        if (room.hostSocketId !== socket.id) return;

        if (room.players.length >= room.targetPlayerCount) {
            return typeof cb === 'function' && cb({ success: false, message: 'Room full.' });
        }

        const slotIndex  = room.players.length;
        const playerKey  = `player${slotIndex + 1}`;
        const teamColors = ['blue', 'red', 'green'];
        const teamIndex  = room.numTeams === room.targetPlayerCount ? slotIndex : slotIndex % room.numTeams;
        const difficulty = sanitiseDifficulty(data?.difficulty);

        room.players.push({
            playerKey,
            socketId:  null,
            name:      `CPU (${difficulty})`,
            team:      teamColors[teamIndex] || 'blue',
            isHost:    false,
            isReady:   true,
            isCpu:     true,
            cpuDiff:   difficulty,
        });

        broadcastLobbySync(sess.roomId);
        if (typeof cb === 'function') cb({ success: true, playerKey });
    });

    // ── start_game ────────────────────────────────────────────
    socket.on('start_game', (data, cb) => {
        if (rl(socket, 'start_game')) return;
        const sess = getSession();
        if (!sess?.roomId) return;
        const room = rooms.get(sess.roomId);
        if (!room || room.status !== 'lobby') return;

        // Host-only gate
        if (room.hostSocketId !== socket.id) return;

        if (room.players.length !== room.targetPlayerCount) {
            return typeof cb === 'function' && cb({ success: false, message: 'Not enough players.' });
        }
        if (!room.players.every(p => p.isReady)) {
            return typeof cb === 'function' && cb({ success: false, message: 'Not all players are ready.' });
        }

        startGame(sess.roomId);
        if (typeof cb === 'function') cb({ success: true });
    });

    // ── Quick Match (2-player auto-match) ─────────────────────
    socket.on('play_online', (data, cb) => {
        if (rl(socket, 'play_online')) return;
        if (rooms.size >= MAX_ROOMS) {
            return typeof cb === 'function' && cb({ success: false, message: 'Server at capacity.' });
        }

        const playerName = sanitiseName(data?.playerName) || 'Player';
        const sess = getSession();

        let room = [...rooms.values()].find(r =>
            !r.isCustom &&
            r.status === 'lobby' &&
            r.targetPlayerCount === 2 &&
            r.players.length < 2
        );

        if (!room) {
            const roomId = generateRoomId();
            room = {
                roomId,
                code:              generateCode(),
                hostSocketId:      socket.id,
                targetPlayerCount: 2,
                numTeams:          2,
                isCustom:          false,
                status:            'lobby',
                players:           [{
                    playerKey: 'player1', socketId: socket.id,
                    name: playerName, team: 'blue',
                    isHost: true, isReady: true, isCpu: false,
                }],
                game:             null,
                disconnectTimers: {},
                createdAt:        Date.now(),
            };
            rooms.set(roomId, room);
            socket.join(roomId);
            if (sess) { sess.roomId = roomId; sess.playerKey = 'player1'; }
            if (typeof cb === 'function') cb({ waiting: true, waitingroom: roomId, roomCode: room.code });
        } else {
            room.players.push({
                playerKey: 'player2', socketId: socket.id,
                name: playerName, team: 'red',
                isHost: false, isReady: true, isCpu: false,
            });
            socket.join(room.roomId);
            if (sess) { sess.roomId = room.roomId; sess.playerKey = 'player2'; }
            startGame(room.roomId);
            if (typeof cb === 'function') cb({ roomId: room.roomId });
        }
    });

    // ── Boardcardclicked ──────────────────────────────────────
    socket.on('Boardcardclicked', (data) => {
        if (rl(socket, 'Boardcardclicked')) return;

        // Validate IDs
        const boardId      = sanitiseBoardId(data?.cardId);
        const selectedCard = sanitiseCardId(data?.selectedCard);
        const roomId       = sanitiseRoomId(data?.roomId);

        if (!boardId || !selectedCard || !roomId) return;

        const room = rooms.get(roomId);
        if (!room || !room.game || room.status !== 'playing') return;

        const sess = getSession();
        const currentKey = room.game.turnOrder[room.game.currentTurnIndex];

        // Authorisation: only the current turn player may act
        if (!sess || sess.playerKey !== currentKey || sess.roomId !== roomId) return;

        // Double-check socket matches session (prevent session hijack)
        if (sess.userId !== socket.id) return;

        const selResult = gameEngine.handleCardSelection(
            room.game, boardId, currentKey, selectedCard, 'PLAY_CARD'
        );
        if (!selResult.success) return;
        room.game = selResult.game;

        const patResult = gameEngine.checkPatterns(room.game);
        room.game = patResult.game;

        if (patResult.winner) {
            io.to(roomId).emit('GAME_OVER', { winner: patResult.winner });
            room.status = 'finished';
        } else {
            emitGameStateToAll(room, roomId);
            scheduleCpuTurnIfNeeded(roomId);
        }
    });

    // ── declare_dead_card ─────────────────────────────────────
    socket.on('declare_dead_card', (data) => {
        if (rl(socket, 'declare_dead_card')) return;

        const cardId = sanitiseCardId(data?.cardId);
        const roomId = sanitiseRoomId(data?.roomId);
        if (!cardId || !roomId) return;

        const room = rooms.get(roomId);
        if (!room || !room.game || room.status !== 'playing') return;

        const sess = getSession();
        const currentKey = room.game.turnOrder[room.game.currentTurnIndex];
        if (!sess || sess.playerKey !== currentKey || sess.roomId !== roomId) return;
        if (sess.userId !== socket.id) return;

        const result = gameEngine.handleCardSelection(
            room.game, null, currentKey, cardId, 'DISCARD_DEAD_CARD'
        );
        if (!result.success) return;
        room.game = result.game;

        emitGameStateToAll(room, roomId);
        scheduleCpuTurnIfNeeded(roomId);
    });

    // ── gameOverclicked ───────────────────────────────────────
    socket.on('gameOverclicked', (rawRoomId) => {
        if (rl(socket, 'gameOverclicked')) return;
        const roomId = sanitiseRoomId(rawRoomId);
        if (!roomId) return;

        const sess = getSession();
        const room = rooms.get(roomId);
        if (!room) return;

        // Only allow host or a player in this room to close it
        const isInRoom = sess && sess.roomId === roomId;
        if (!isInRoom) return;

        rooms.delete(roomId);
        io.to(roomId).emit('room_closed', roomId);
    });

    // ── disconnect ────────────────────────────────────────────
    socket.on('disconnect', () => {
        activeSockets.delete(sessionID);

        const sess = getSession();
        if (!sess?.roomId) return;

        const room = rooms.get(sess.roomId);
        if (!room) return;

        if (room.status === 'lobby') {
            room.players = room.players.filter(p => p.playerKey !== sess.playerKey);
            if (room.hostSocketId === socket.id && room.players.length > 0) {
                room.players[0].isHost = true;
                room.hostSocketId = room.players[0].socketId;
            }
            if (room.players.length === 0) {
                rooms.delete(sess.roomId);
            } else {
                broadcastLobbySync(sess.roomId);
            }
        } else if (room.status === 'playing') {
            room.disconnectTimers = room.disconnectTimers || {};
            const key = sess.playerKey;
            room.disconnectTimers[key] = setTimeout(() => {
                const r = rooms.get(sess.roomId);
                if (!r) return;
                io.to(sess.roomId).emit('PLAYER_DISCONNECTED_TIMEOUT', {
                    playerKey: key,
                    name: r.game?.players[key]?.name,
                });
            }, RECONNECT_GRACE_MS);

            io.to(sess.roomId).emit('PLAYER_DISCONNECTED', {
                playerKey: key,
                gracePeriodMs: RECONNECT_GRACE_MS,
            });
        }
    });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Sequence server running on port ${PORT}`);
});
