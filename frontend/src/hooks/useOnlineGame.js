import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'X';

export function useOnlineGame() {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [gameState, setGameState]     = useState(null);
    const [status, setStatus]           = useState('idle');
    const [roomInfo, setRoomInfo]       = useState(null);
    const [playerInfo, setPlayerInfo]   = useState(null);
    const [errorMsg, setErrorMsg]       = useState(null);
    const [winner, setWinner]           = useState(null);
    const pendingNameRef = useRef('');

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

        socket.on('connect', () => {
            setIsConnected(true);
            setErrorMsg(null);
        });

        socket.on('disconnect', (reason) => {
            setIsConnected(false);
            if (reason !== 'io client disconnect') {
                setErrorMsg('Connection lost. Trying to reconnect...');
            }
        });

        socket.on('connect_error', () => {
            setIsConnected(false);
            setErrorMsg(`Cannot reach server. Make sure the backend is running on ${SERVER_URL}.`);
        });

        socket.on('reconnect', () => {
            setIsConnected(true);
            setErrorMsg(null);
        });

        socket.on('reconnect_failed', () => {
            setErrorMsg('Could not reconnect to server. Please refresh the page.');
        });

        socket.on('session', (data) => {
            localStorage.setItem('sequenceSessionId', data.sessionId);
        });

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
            setErrorMsg(error?.message || 'Could not join room. Check the Room ID.');
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
    }, []);

    const createCustomRoom = useCallback((playerName) => {
        const socket = socketRef.current;
        if (!socket?.connected) {
            setErrorMsg('Not connected to server. Please wait or refresh the page.');
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
            setErrorMsg('Not connected to server. Please wait or refresh the page.');
            return;
        }
        pendingNameRef.current = playerName;
        setPlayerInfo(prev => ({ ...prev, name: playerName }));
        setErrorMsg(null);
        socket.emit('join_custom_room', { roomId, playerName }, (response) => {
            if (response?.success) {
                setRoomInfo({ roomId, isCustom: true });
            } else {
                setErrorMsg(response?.message || 'Could not join that room. Check the Room ID.');
            }
        });
    }, []);

    const playOnline = useCallback((playerName) => {
        const socket = socketRef.current;
        if (!socket?.connected) {
            setErrorMsg('Not connected to server. Please wait or refresh the page.');
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
