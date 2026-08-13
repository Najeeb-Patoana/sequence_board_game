import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

// Set VITE_SERVER_URL in frontend/.env — for ngrok use the https URL
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export function useOnlineGame() {
    const socketRef = useRef(null);           // stable ref — avoids stale closures
    const [isConnected, setIsConnected] = useState(false);
    const [gameState, setGameState]     = useState(null);
    const [status, setStatus]           = useState('idle');
    const [roomInfo, setRoomInfo]       = useState(null);
    const [playerInfo, setPlayerInfo]   = useState(null);
    const [errorMsg, setErrorMsg]       = useState(null);
    const [winner, setWinner]           = useState(null);
    const pendingNameRef = useRef('');    // stores name used for room creation

    /* ── Build and connect socket once ─────────────────────── */
    useEffect(() => {
        const existingSession = localStorage.getItem('sequenceSessionId');

        const socket = io(SERVER_URL, {
            autoConnect: true,
            query: existingSession ? { sessionId: existingSession } : {},
            transports: ['websocket', 'polling'],
            timeout: 8000,
            reconnectionAttempts: 5,
            reconnectionDelay: 1500,
        });

        socketRef.current = socket;

        /* ── Connection lifecycle ── */
        socket.on('connect', () => {
            setIsConnected(true);
            setErrorMsg(null);
        });

        socket.on('disconnect', (reason) => {
            setIsConnected(false);
            if (reason !== 'io client disconnect') {
                setErrorMsg('Connection lost. Trying to reconnect…');
            }
        });

        socket.on('connect_error', (err) => {
            setIsConnected(false);
            setErrorMsg(`Cannot reach server at ${SERVER_URL}. Make sure the backend is running.`);
        });

        socket.on('reconnect', () => {
            setIsConnected(true);
            setErrorMsg(null);
        });

        socket.on('reconnect_failed', () => {
            setErrorMsg('Could not reconnect to server. Please refresh the page.');
        });

        /* ── Session ── */
        socket.on('session', (data) => {
            localStorage.setItem('sequenceSessionId', data.sessionId);
        });

        /* ── Game events ── */
        socket.on('OpponentFound', (data) => {
            setStatus('playing');
            setErrorMsg(null);

            const myKey  = data.playingAs;
            const oppKey = myKey === 'player1' ? 'player2' : 'player1';

            const playersObj = {
                [myKey]: {
                    name:   data.yourName || pendingNameRef.current || 'You',
                    team:   myKey === 'player1' ? 'blue' : 'red',
                    isTurn: myKey === 'player1',
                    hand:   data.yourHand,
                },
                [oppKey]: {
                    name:   data.opponentName || 'Opponent',
                    team:   oppKey === 'player1' ? 'blue' : 'red',
                    isTurn: myKey !== 'player1',
                    hand:   [],
                },
            };

            setPlayerInfo(prev => ({
                ...prev,
                playingAs:    data.playingAs,
                name:         data.yourName || prev?.name || 'You',
                opponentName: data.opponentName,
                hand:         data.yourHand,
            }));

            setGameState({
                deckCount:   data.deckCount,
                cards:       data.cards,
                currentTurn: 'player1',
                scores:      { red: 0, blue: 0 },
                players:     playersObj,
            });
        });

        socket.on('updateGameState', (data) => {
            setGameState(prev => {
                if (!prev) return prev;
                const updatedPlayers = prev.players ? { ...prev.players } : {};
                Object.keys(updatedPlayers).forEach(key => {
                    updatedPlayers[key] = { ...updatedPlayers[key], isTurn: key === data.currentTurn };
                });
                return {
                    ...prev,
                    deckCount:   data.deckCount,
                    cards:       data.cards,
                    currentTurn: data.currentTurn,
                    scores:      data.score,
                    players:     updatedPlayers,
                };
            });
            setPlayerInfo(prev => ({ ...prev, hand: data.playerHand }));
        });

        socket.on('gameOver', (data) => {
            setStatus('gameover');
            setWinner(data.winner);
        });

        socket.on('custom_room_created', (data) => {
            setRoomInfo({ roomId: data.roomId, isCustom: true });
            setStatus('waiting');
            setErrorMsg(null);
        });

        socket.on('room_join_error', (error) => {
            setErrorMsg(error?.message || 'Could not join room. Check the room ID and try again.');
            setStatus('idle');
        });

        socket.on('room_closed', () => {
            setErrorMsg('The room was closed by the other player.');
            setStatus('error');
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []); // run once on mount

    /* ── Actions ────────────────────────────────────────────── */

    const createCustomRoom = useCallback((playerName) => {
        const socket = socketRef.current;
        if (!socket?.connected) {
            setErrorMsg('Not connected to server. Please wait or refresh.');
            return;
        }
        pendingNameRef.current = playerName;
        setPlayerInfo(prev => ({ ...prev, name: playerName }));
        setErrorMsg(null);
        socket.emit('create_custom_room', { playerName });
    }, []);

    const joinCustomRoom = useCallback((roomId, playerName) => {
        const socket = socketRef.current;
        if (!socket?.connected) {
            setErrorMsg('Not connected to server. Please wait or refresh.');
            return;
        }
        pendingNameRef.current = playerName;
        setPlayerInfo(prev => ({ ...prev, name: playerName }));
        setErrorMsg(null);
        socket.emit('join_custom_room', { roomId, playerName }, (response) => {
            if (response?.success) {
                setRoomInfo({ roomId, isCustom: true });
            } else {
                setErrorMsg(response?.message || 'Could not join that room.');
            }
        });
    }, []);

    const playOnline = useCallback((playerName) => {
        const socket = socketRef.current;
        if (!socket?.connected) {
            setErrorMsg('Not connected to server. Please wait or refresh.');
            return;
        }
        pendingNameRef.current = playerName;
        setPlayerInfo(prev => ({ ...prev, name: playerName }));
        setErrorMsg(null);
        socket.emit('play_online', { playerName }, (response) => {
            if (response?.roomId) {
                setRoomInfo({ roomId: response.roomId, isCustom: false });
            } else if (response?.waiting) {
                setRoomInfo({ roomId: response.waitingroom, isCustom: false });
                setStatus('waiting');
            }
        });
    }, []);

    const makeMove = useCallback((cardId, selectedCard) => {
        const socket = socketRef.current;
        if (socket?.connected && roomInfo && status === 'playing') {
            socket.emit('Boardcardclicked', { roomId: roomInfo.roomId, cardId, selectedCard });
        }
    }, [roomInfo, status]);

    const quitGame = useCallback(() => {
        const socket = socketRef.current;
        if (socket?.connected && roomInfo) {
            socket.emit('gameOverclicked', roomInfo.roomId);
        }
        setStatus('idle');
        setRoomInfo(null);
        setGameState(null);
        setPlayerInfo(null);
        setWinner(null);
        setErrorMsg(null);
    }, [roomInfo]);

    return {
        isConnected,
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
        setStatus,
    };
}


// Use env variable for server URL — set VITE_SERVER_URL in your .env file
// For ngrok: VITE_SERVER_URL=https://xxxx.ngrok-free.app
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

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
            const existingSession = localStorage.getItem('sequenceSessionId');
            const newSocket = io(SERVER_URL, {
                autoConnect: true,
                query: existingSession ? { sessionId: existingSession } : {},
                transports: ['websocket', 'polling'],
            });

            newSocket.on('session', (data) => {
                localStorage.setItem('sequenceSessionId', data.sessionId);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err.message);
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

                // Build a players object compatible with GameInfoPanel
                // Server sends: playingAs ('player1'|'player2'), opponentName, yourHand
                const myKey = data.playingAs;         // 'player1' or 'player2'
                const oppKey = myKey === 'player1' ? 'player2' : 'player1';

                const playersObj = {
                    [myKey]: {
                        name: data.yourName || playerInfo?.name || 'You',
                        team: myKey === 'player1' ? 'blue' : 'red',
                        isTurn: myKey === 'player1',
                        hand: data.yourHand,
                    },
                    [oppKey]: {
                        name: data.opponentName || 'Opponent',
                        team: oppKey === 'player1' ? 'blue' : 'red',
                        isTurn: myKey !== 'player1',
                        hand: [],
                    },
                };

                setPlayerInfo(prev => ({
                    ...prev,
                    playingAs: data.playingAs,
                    opponentName: data.opponentName,
                    hand: data.yourHand,
                }));

                setGameState({
                    deckCount: data.deckCount,
                    cards: data.cards,
                    currentTurn: 'player1', // player1 always starts
                    scores: { red: 0, blue: 0 },
                    players: playersObj,
                });
            });

            socket.on('updateGameState', (data) => {
                setGameState(prev => {
                    if (!prev) return prev;

                    // Update isTurn flags on the players object
                    const updatedPlayers = prev.players ? { ...prev.players } : {};
                    Object.keys(updatedPlayers).forEach(key => {
                        updatedPlayers[key] = {
                            ...updatedPlayers[key],
                            isTurn: key === data.currentTurn,
                        };
                    });

                    return {
                        ...prev,
                        deckCount: data.deckCount,
                        cards: data.cards,
                        currentTurn: data.currentTurn,
                        scores: data.score,
                        players: updatedPlayers,
                    };
                });
                setPlayerInfo(prev => ({
                    ...prev,
                    hand: data.playerHand,
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
                setErrorMsg(error.message || 'Could not join room.');
            });

            socket.on('room_closed', () => {
                setStatus('error');
                setErrorMsg('The room was closed by the opponent.');
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
        }
        setStatus('idle');
        setRoomInfo(null);
        setGameState(null);
        setPlayerInfo(null);
        setWinner(null);
        setErrorMsg(null);
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
