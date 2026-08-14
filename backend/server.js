const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const allCards = require('./allCards.js');
const gameEngine = require('./gameEngine.js');
const { BotPlayer, runBotTurn } = require('./botPlayer.js');

const app = express();
app.use(cors({ origin: '*' }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }
});

// ── In-memory stores ─────────────────────────────────────────
/** @type {Map<string, Room>} */
const rooms = new Map();
/** @type {Map<string, import('socket.io').Socket>} */
const activeSockets = new Map(); // sessionId → socket
/** @type {Map<string, Session>} */
const sessions = new Map();      // sessionId → session

const RECONNECT_GRACE_MS = 60_000;

// ── Room / Session helpers ────────────────────────────────────

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
    do { id = Math.random().toString(36).substring(2, 10); } while (rooms.has(id));
    return id;
}

function createSession(socketId, roomId = null, playerKey = null) {
    const sessionId = Math.random().toString(36).substring(2, 18);
    sessions.set(sessionId, {
        userId: socketId,
        roomId,
        playerKey,
        expiresAt: Date.now() + 2 * 60 * 60 * 1000,
    });
    return sessionId;
}

/**
 * Build the lobby-safe player list (no hands, no socket IDs).
 */
function buildLobbyPlayerList(room) {
    return room.players.map(p => ({
        playerKey:  p.playerKey,
        name:       p.name,
        team:       p.team,
        isHost:     p.isHost,
        isReady:    p.isReady,
        isCpu:      p.isCpu || false,
        cpuDiff:    p.cpuDiff || null,
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

// ── Game start helper ─────────────────────────────────────────

function startGame(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    const playerNames = room.players.map(p => p.name);
    const game = gameEngine.initializeGame(allCards, {
        numPlayers:  room.targetPlayerCount,
        numTeams:    room.numTeams,
        playerNames,
    });

    // Copy socket IDs into game player objects
    room.players.forEach((p, i) => {
        const key = `player${i + 1}`;
        if (game.players[key]) {
            game.players[key].socketId = p.socketId;
            game.players[key].isCpu = p.isCpu || false;
        }
    });

    room.game = game;
    room.status = 'playing';

    // Broadcast initial state — each player gets their own hand privately
    emitGameStateToAll(room, roomId);

    // If the first turn belongs to a CPU, kick it off
    scheduleCpuTurnIfNeeded(roomId);
}

/**
 * Send GAME_STATE_SYNC to every socket in room.
 * Each player receives their own hand; others see hand size only.
 */
function emitGameStateToAll(room, roomId) {
    const game = room.game;
    if (!game) return;

    const currentTurnKey = game.turnOrder[game.currentTurnIndex];

    room.players.forEach(p => {
        if (!p.socketId || p.isCpu) return;
        const socket = io.sockets.sockets.get(p.socketId);
        if (!socket) return;

        // Build a players summary (names, teams, scores) — no hands
        const playersSummary = {};
        Object.entries(game.players).forEach(([k, pl]) => {
            playersSummary[k] = {
                name:   pl.name,
                team:   pl.team,
                isTurn: k === currentTurnKey,
                isCpu:  pl.isCpu,
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

// ── CPU turn scheduler ────────────────────────────────────────

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

// ── Connection handler ────────────────────────────────────────

io.on('connection', (socket) => {
    let sessionID = socket.handshake.query.sessionId;

    // ── Session restore / creation ────────────────────────────
    if (sessionID && sessions.has(sessionID)) {
        const existing = activeSockets.get(sessionID);
        if (existing && existing.id !== socket.id) existing.disconnect(true);
        activeSockets.set(sessionID, socket);

        const session = sessions.get(sessionID);
        session.userId = socket.id;

        if (session.roomId && rooms.has(session.roomId)) {
            socket.join(session.roomId);
            const room = rooms.get(session.roomId);

            // Update socket ID in room player list
            const rp = room.players.find(p => p.playerKey === session.playerKey);
            if (rp) rp.socketId = socket.id;

            // Update socket ID in game state if game is live
            if (room.game && room.game.players[session.playerKey]) {
                room.game.players[session.playerKey].socketId = socket.id;
            }

            // Cancel reconnect timer
            if (room.disconnectTimers?.[session.playerKey]) {
                clearTimeout(room.disconnectTimers[session.playerKey]);
                delete room.disconnectTimers[session.playerKey];
            }

            if (room.status === 'lobby') {
                broadcastLobbySync(session.roomId);
            } else if (room.status === 'playing') {
                emitGameStateToAll(room, session.roomId);
            }
        }
    } else {
        sessionID = createSession(socket.id);
        activeSockets.set(sessionID, socket);
        socket.emit('session', { sessionId: sessionID });
    }

    // ── create_custom_room ────────────────────────────────────
    socket.on('create_custom_room', (data, cb) => {
        try {
            const { playerName, targetPlayerCount = 2, numTeams } = data;
            const resolvedTeams = numTeams || gameEngine.deriveNumTeams(targetPlayerCount);
            const roomId = generateRoomId();
            const code = generateCode();

            const hostPlayer = {
                playerKey:  'player1',
                socketId:   socket.id,
                name:       playerName || 'Host',
                team:       'blue',
                isHost:     true,
                isReady:    true, // host is auto-ready
                isCpu:      false,
                cpuDiff:    null,
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
            });

            socket.join(roomId);

            const sess = sessions.get(sessionID);
            if (sess) { sess.roomId = roomId; sess.playerKey = 'player1'; }

            broadcastLobbySync(roomId);
            socket.emit('custom_room_created', { roomId, roomCode: code });
            if (typeof cb === 'function') cb({ success: true, roomId, roomCode: code });
        } catch (err) {
            console.error('create_custom_room:', err);
            if (typeof cb === 'function') cb({ success: false, message: err.message });
        }
    });

    // ── join_custom_room ──────────────────────────────────────
    socket.on('join_custom_room', (data, cb) => {
        try {
            const { roomId: rawId, roomCode, playerName } = data;

            // Allow joining by code or by ID
            let room = rawId ? rooms.get(rawId) : null;
            if (!room && roomCode) {
                room = [...rooms.values()].find(r => r.code === roomCode.toUpperCase());
            }

            if (!room) {
                socket.emit('room_join_error', { message: 'Room not found. Check the Room Code.' });
                return typeof cb === 'function' && cb({ success: false, message: 'Room not found' });
            }
            if (room.status !== 'lobby') {
                socket.emit('room_join_error', { message: 'Game already in progress.' });
                return typeof cb === 'function' && cb({ success: false, message: 'Game already started' });
            }
            if (room.players.length >= room.targetPlayerCount) {
                socket.emit('room_join_error', { message: 'Room is full.' });
                return typeof cb === 'function' && cb({ success: false, message: 'Room full' });
            }

            const slotIndex = room.players.length;
            const playerKey = `player${slotIndex + 1}`;
            const teamColors = ['blue', 'red', 'green'];
            const teamIndex = room.numTeams === room.targetPlayerCount
                ? slotIndex
                : slotIndex % room.numTeams;

            const newPlayer = {
                playerKey,
                socketId:  socket.id,
                name:      playerName || `Player ${slotIndex + 1}`,
                team:      teamColors[teamIndex],
                isHost:    false,
                isReady:   false,
                isCpu:     false,
                cpuDiff:   null,
            };

            room.players.push(newPlayer);
            socket.join(room.roomId);

            const sess = sessions.get(sessionID);
            if (sess) { sess.roomId = room.roomId; sess.playerKey = playerKey; }

            broadcastLobbySync(room.roomId);
            if (typeof cb === 'function') cb({ success: true, roomId: room.roomId, roomCode: room.code, playerKey });
        } catch (err) {
            console.error('join_custom_room:', err);
            socket.emit('room_join_error', { message: 'Server error joining room.' });
            if (typeof cb === 'function') cb({ success: false, message: err.message });
        }
    });

    // ── player_ready_toggle ───────────────────────────────────
    socket.on('player_ready_toggle', (data) => {
        const sess = sessions.get(sessionID);
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
        const sess = sessions.get(sessionID);
        if (!sess?.roomId) return;
        const room = rooms.get(sess.roomId);
        if (!room || room.status !== 'lobby') return;
        if (room.hostSocketId !== socket.id) return; // host only
        if (room.players.length >= room.targetPlayerCount) {
            return typeof cb === 'function' && cb({ success: false, message: 'Room full' });
        }

        const slotIndex = room.players.length;
        const playerKey = `player${slotIndex + 1}`;
        const teamColors = ['blue', 'red', 'green'];
        const teamIndex = room.numTeams === room.targetPlayerCount
            ? slotIndex
            : slotIndex % room.numTeams;
        const difficulty = data?.difficulty || 'random';

        room.players.push({
            playerKey,
            socketId:  null,
            name:      `CPU ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
            team:      teamColors[teamIndex],
            isHost:    false,
            isReady:   true, // CPUs are always ready
            isCpu:     true,
            cpuDiff:   difficulty,
        });

        broadcastLobbySync(sess.roomId);
        if (typeof cb === 'function') cb({ success: true, playerKey });
    });

    // ── start_game ────────────────────────────────────────────
    socket.on('start_game', (data, cb) => {
        const sess = sessions.get(sessionID);
        if (!sess?.roomId) return;
        const room = rooms.get(sess.roomId);
        if (!room || room.status !== 'lobby') return;
        if (room.hostSocketId !== socket.id) return; // host only

        if (room.players.length !== room.targetPlayerCount) {
            return typeof cb === 'function' && cb({ success: false, message: 'Not enough players' });
        }
        if (!room.players.every(p => p.isReady)) {
            return typeof cb === 'function' && cb({ success: false, message: 'Not all players are ready' });
        }

        startGame(sess.roomId);
        if (typeof cb === 'function') cb({ success: true });
    });

    // ── Quick Match (2-player auto-match) ─────────────────────
    socket.on('play_online', (data, cb) => {
        const { playerName } = data;
        const sess = sessions.get(sessionID);

        // Find an open 2-player quick-match room
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
                    playerKey: 'player1',
                    socketId:  socket.id,
                    name:      playerName || 'Player 1',
                    team:      'blue',
                    isHost:    true,
                    isReady:   true,
                    isCpu:     false,
                }],
                game:             null,
                disconnectTimers: {},
            };
            rooms.set(roomId, room);
            socket.join(roomId);
            if (sess) { sess.roomId = roomId; sess.playerKey = 'player1'; }
            if (typeof cb === 'function') cb({ waiting: true, waitingroom: roomId, roomCode: room.code });
        } else {
            // Second player joins → auto-start
            const playerKey = 'player2';
            room.players.push({
                playerKey,
                socketId: socket.id,
                name:     playerName || 'Player 2',
                team:     'red',
                isHost:   false,
                isReady:  true,
                isCpu:    false,
            });
            socket.join(room.roomId);
            if (sess) { sess.roomId = room.roomId; sess.playerKey = playerKey; }
            startGame(room.roomId);
            if (typeof cb === 'function') cb({ roomId: room.roomId });
        }
    });

    // ── Boardcardclicked (legacy + new) ───────────────────────
    socket.on('Boardcardclicked', (data) => {
        const { roomId, cardId, selectedCard } = data;
        const room = rooms.get(roomId);
        if (!room || !room.game || room.status !== 'playing') return;

        const sess = sessions.get(sessionID);
        const currentKey = room.game.turnOrder[room.game.currentTurnIndex];

        // Validate it's the correct player's turn
        if (!sess || sess.playerKey !== currentKey) return;

        const action = {
            playerId:       currentKey,
            actionType:     'PLAY_CARD',
            card:           { id: selectedCard },
            targetPosition: {
                row: Math.floor((cardId - 1) / 10),
                col: (cardId - 1) % 10,
            },
        };

        const selResult = gameEngine.handleCardSelection(
            room.game, cardId, currentKey, selectedCard, 'PLAY_CARD'
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
        const { roomId, cardId } = data;
        const room = rooms.get(roomId);
        if (!room || !room.game || room.status !== 'playing') return;

        const sess = sessions.get(sessionID);
        const currentKey = room.game.turnOrder[room.game.currentTurnIndex];
        if (!sess || sess.playerKey !== currentKey) return;

        const result = gameEngine.handleCardSelection(
            room.game, null, currentKey, cardId, 'DISCARD_DEAD_CARD'
        );
        if (!result.success) return;
        room.game = result.game;

        emitGameStateToAll(room, roomId);
        scheduleCpuTurnIfNeeded(roomId);
    });

    // ── gameOverclicked ───────────────────────────────────────
    socket.on('gameOverclicked', (roomId) => {
        rooms.delete(roomId);
        io.to(roomId).emit('room_closed', roomId);
    });

    // ── disconnect ────────────────────────────────────────────
    socket.on('disconnect', () => {
        activeSockets.delete(sessionID);

        const sess = sessions.get(sessionID);
        if (!sess?.roomId) return;

        const room = rooms.get(sess.roomId);
        if (!room) return;

        if (room.status === 'lobby') {
            // Remove from lobby, tell remaining players
            room.players = room.players.filter(p => p.playerKey !== sess.playerKey);
            // Re-assign host if host left
            if (room.hostSocketId === socket.id && room.players.length > 0) {
                room.players[0].isHost = true;
                room.hostSocketId = room.players[0].socketId;
            }
            broadcastLobbySync(sess.roomId);
        } else if (room.status === 'playing') {
            // Start 60-second reconnect grace window
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
