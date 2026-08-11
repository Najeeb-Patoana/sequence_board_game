const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const allCards = require('./allCards.js');
const gameEngine = require('./gameEngine.js');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ["GET", "POST", "OPTIONS"]
    }
});

// In-memory data stores
const rooms = new Map();
const activeSockets = new Map();
const sessions = new Map();

function generateUniqueRoomId() {
    let roomId;
    do {
        roomId = Math.random().toString(36).substring(2, 9);
    } while (rooms.has(roomId));
    return roomId;
}

function createSession(socketId, roomId = null, playingAs = null) {
    const sessionId = Math.random().toString(36).substring(2, 15);
    sessions.set(sessionId, {
        userId: socketId,
        roomId: roomId,
        playingAs: playingAs,
        expiresAt: Date.now() + (2 * 60 * 60 * 1000)
    });
    return sessionId;
}

async function initializeGameForRoom(roomId, playerName, socketId) {
    let room = rooms.get(roomId);
    if (!room) return;

    if (!room.game) {
        let gameInitialState = gameEngine.initializeGame(allCards);
        gameInitialState.players.player1.socketId = socketId;
        gameInitialState.players.player1.name = playerName;
        room.game = gameInitialState;
    }
}

async function startGameForRoom(roomId, playerName, socketId) {
    let room = rooms.get(roomId);
    if (!room || !room.game) return;

    let game = room.game;
    if (!game.players.player2.socketId) {
        game.players.player2.socketId = socketId;
        game.players.player2.name = playerName;
        
        // Emit to Player 1
        io.to(game.players.player1.socketId).emit('OpponentFound', {
            opponentName: playerName,
            yourHand: game.players.player1.hand,
            playingAs: "player1",
            deckCount: game.shuffledDeck.length,
            cards: game.cards,
        });

        // Emit to Player 2
        io.to(socketId).emit('OpponentFound', {
            opponentName: game.players.player1.name,
            yourHand: game.players.player2.hand,
            playingAs: "player2",
            deckCount: game.shuffledDeck.length,
            cards: game.cards,
        });
    }
}

io.on('connection', (socket) => {
    let sessionID = socket.handshake.query.sessionId;
    
    if (sessionID && sessions.has(sessionID)) {
        const existingSocket = activeSockets.get(sessionID);
        if (existingSocket) {
            existingSocket.disconnect();
        }
        activeSockets.set(sessionID, socket);
        
        const session = sessions.get(sessionID);
        session.userId = socket.id; // Update to new socket id

        if (session.roomId && rooms.has(session.roomId)) {
            socket.join(session.roomId);
            let game = rooms.get(session.roomId).game;
            if (game) {
                // Re-emit game state on reconnect if game started
                if (game.players.player2.socketId) {
                    const isPlayer1 = session.playingAs === "player1";
                    io.to(socket.id).emit('OpponentFound', {
                        opponentName: isPlayer1 ? game.players.player2.name : game.players.player1.name,
                        yourHand: isPlayer1 ? game.players.player1.hand : game.players.player2.hand,
                        playingAs: session.playingAs,
                        deckCount: game.shuffledDeck.length,
                        cards: game.cards,
                    });
                }
            }
        }
    } else {
        sessionID = createSession(socket.id);
        activeSockets.set(sessionID, socket);
        socket.emit('session', { sessionId: sessionID });
    }

    // --- ROOM CONTROLLER EVENTS ---
    
    socket.on('create_custom_room', (data, callback) => {
        const { playerName } = data;
        const roomId = generateUniqueRoomId();
        
        rooms.set(roomId, {
            roomId,
            players: [socket.id],
            playersName: [playerName],
            isCustom: true,
            empty: true,
            game: null
        });

        socket.join(roomId);
        sessions.get(sessionID).roomId = roomId;
        sessions.get(sessionID).playingAs = 'player1';

        initializeGameForRoom(roomId, playerName, socket.id);
        socket.emit('custom_room_created', { roomId });
        
        if (typeof callback === 'function') callback({ roomId });
    });

    socket.on('join_custom_room', (data, callback) => {
        const { roomId, playerName } = data;
        let room = rooms.get(roomId);

        if (room && room.players.length < 2) {
            room.players.push(socket.id);
            room.playersName.push(playerName);
            room.empty = false;
            
            socket.join(roomId);
            sessions.get(sessionID).roomId = roomId;
            sessions.get(sessionID).playingAs = 'player2';
            
            startGameForRoom(roomId, playerName, socket.id);
            if (typeof callback === 'function') callback({ success: true });
        } else {
            socket.emit('room_join_error', { message: 'Room is full or does not exist.' });
            if (typeof callback === 'function') callback({ success: false, message: 'Room full or invalid' });
        }
    });

    socket.on('play_online', (data, callback) => {
        const { playerName } = data;
        
        // Find an empty non-custom room
        let room = Array.from(rooms.values()).find(r => !r.isCustom && r.empty);
        
        if (!room) {
            const roomId = generateUniqueRoomId();
            room = {
                roomId,
                players: [socket.id],
                playersName: [playerName],
                isCustom: false,
                empty: true,
                game: null
            };
            rooms.set(roomId, room);
            socket.join(roomId);
            sessions.get(sessionID).roomId = roomId;
            sessions.get(sessionID).playingAs = 'player1';
            
            initializeGameForRoom(roomId, playerName, socket.id);
            if (typeof callback === 'function') callback({ waiting: true, waitingroom: roomId });
        } else {
            room.players.push(socket.id);
            room.playersName.push(playerName);
            room.empty = false;
            socket.join(room.roomId);
            sessions.get(sessionID).roomId = room.roomId;
            sessions.get(sessionID).playingAs = 'player2';
            
            startGameForRoom(room.roomId, playerName, socket.id);
            if (typeof callback === 'function') callback({ roomId: room.roomId });
        }
    });

    // --- GAME CONTROLLER EVENTS ---

    socket.on('Boardcardclicked', (data) => {
        const { roomId, cardId, selectedCard } = data;
        let room = rooms.get(roomId);
        
        if (!room || !room.game) return;
        let game = room.game;

        let currentTurn = game.players.player1.isTurn ? 'player1' : 'player2';
        let currentPlayer = game.players[currentTurn];
        
        if (socket.id !== currentPlayer.socketId || !currentPlayer.hand.some(card => card.id === selectedCard)) {
            // Invalid move or not turn
            return;
        }

        let updatedGameResult = gameEngine.handleCardSelection(game, cardId, currentTurn, selectedCard);
        
        if (!updatedGameResult.success) {
            return; // E.g., protected pattern
        }

        room.game = updatedGameResult.game;
        
        let patternResult = gameEngine.checkPatterns(room.game);
        room.game = patternResult.game;

        if (patternResult.winner) {
            io.to(roomId).emit('gameOver', { winner: patternResult.winner });
        } else {
            Object.keys(room.game.players).forEach(playerKey => {
                const player = room.game.players[playerKey];
                if (player.socketId) {
                    io.to(player.socketId).emit('updateGameState', {
                        deckCount: room.game.shuffledDeck.length,
                        score: room.game.scores,
                        cards: room.game.cards,
                        prevTurn: currentTurn,
                        currentTurn: room.game.players.player1.isTurn ? 'player1' : 'player2',
                        playerHand: player.hand,
                    });
                }
            });
        }
    });

    socket.on('gameOverclicked', (roomId) => {
        rooms.delete(roomId);
        io.to(roomId).emit('room_closed', roomId);
    });

    socket.on('disconnect', () => {
        // We keep session alive for reconnect
        activeSockets.delete(sessionID);
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
