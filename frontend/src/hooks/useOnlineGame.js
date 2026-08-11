import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';

export function useOnlineGame() {
    const [socket, setSocket] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, waiting, playing, gameover, error
    const [roomInfo, setRoomInfo] = useState(null);
    const [playerInfo, setPlayerInfo] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [winner, setWinner] = useState(null);

    useEffect(() => {
        if (!socket) {
            const newSocket = io(SERVER_URL, { autoConnect: true });
            
            // Session handling logic
            const existingSession = localStorage.getItem('sequenceSessionId');
            if (existingSession) {
                newSocket.io.opts.query = { sessionId: existingSession };
            }

            newSocket.on('session', (data) => {
                localStorage.setItem('sequenceSessionId', data.sessionId);
            });

            setSocket(newSocket);
            
            return () => {
                newSocket.close();
            };
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            socket.on('OpponentFound', (data) => {
                setStatus('playing');
                setPlayerInfo({
                    playingAs: data.playingAs,
                    opponentName: data.opponentName,
                    hand: data.yourHand
                });
                setGameState({
                    deckCount: data.deckCount,
                    cards: data.cards,
                    currentTurn: 'player1', // default at start
                    scores: { red: 0, blue: 0 }
                });
            });

            socket.on('updateGameState', (data) => {
                setGameState(prev => ({
                    ...prev,
                    deckCount: data.deckCount,
                    cards: data.cards,
                    currentTurn: data.currentTurn,
                    scores: data.score
                }));
                setPlayerInfo(prev => ({
                    ...prev,
                    hand: data.playerHand
                }));
            });

            socket.on('gameOver', (data) => {
                setStatus('gameover');
                setWinner(data.winner);
            });

            socket.on('custom_room_created', (data) => {
                setRoomInfo({ roomId: data.roomId, isCustom: true });
                setStatus('waiting');
            });

            socket.on('room_join_error', (error) => {
                setStatus('error');
                setErrorMsg(error.message);
            });

            socket.on('room_closed', () => {
                setStatus('error');
                setErrorMsg('Room was closed by the opponent.');
            });

            return () => {
                socket.off('OpponentFound');
                socket.off('updateGameState');
                socket.off('gameOver');
                socket.off('custom_room_created');
                socket.off('room_join_error');
                socket.off('room_closed');
            };
        }
    }, [socket]);

    const createCustomRoom = useCallback((playerName) => {
        if (socket) {
            socket.emit('create_custom_room', { playerName });
            setPlayerInfo(prev => ({ ...prev, name: playerName }));
        }
    }, [socket]);

    const joinCustomRoom = useCallback((roomId, playerName) => {
        if (socket) {
            socket.emit('join_custom_room', { roomId, playerName }, (response) => {
                if (response.success) {
                    setRoomInfo({ roomId, isCustom: true });
                    setPlayerInfo(prev => ({ ...prev, name: playerName }));
                }
            });
        }
    }, [socket]);

    const playOnline = useCallback((playerName) => {
        if (socket) {
            socket.emit('play_online', { playerName }, (response) => {
                if (response.roomId) {
                    setRoomInfo({ roomId: response.roomId, isCustom: false });
                } else if (response.waiting) {
                    setRoomInfo({ roomId: response.waitingroom, isCustom: false });
                    setStatus('waiting');
                }
                setPlayerInfo(prev => ({ ...prev, name: playerName }));
            });
        }
    }, [socket]);

    const makeMove = useCallback((cardId, selectedCard) => {
        if (socket && roomInfo && status === 'playing') {
            socket.emit('Boardcardclicked', { 
                roomId: roomInfo.roomId, 
                cardId, 
                selectedCard 
            });
        }
    }, [socket, roomInfo, status]);

    const quitGame = useCallback(() => {
        if (socket && roomInfo) {
            socket.emit('gameOverclicked', roomInfo.roomId);
            setStatus('idle');
            setRoomInfo(null);
            setGameState(null);
            setPlayerInfo(null);
            setWinner(null);
        }
    }, [socket, roomInfo]);

    return {
        status,
        roomInfo,
        playerInfo,
        gameState,
        errorMsg,
        winner,
        createCustomRoom,
        joinCustomRoom,
        playOnline,
        makeMove,
        quitGame,
        setStatus
    };
}
