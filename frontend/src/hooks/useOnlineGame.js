import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { sanitiseName, sanitiseRoomCode, isValidRoomCode, clampToSet, VALID_PLAYER_COUNTS } from '../utils/sanitise';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

export function useOnlineGame() {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected]   = useState(false);
    const [gameState, setGameState]       = useState(null);
    const [status, setStatus]             = useState('idle');   // idle | lobby | matchmaking | playing | gameover
    const [lobbyState, setLobbyState]     = useState(null);     // { players, targetPlayerCount, numTeams, roomCode }
    const [roomInfo, setRoomInfo]         = useState(null);     // { roomId, roomCode, isCustom }
    const [playerInfo, setPlayerInfo]     = useState(null);     // { playerKey, name, hand }
    const [errorMsg, setErrorMsg]         = useState(null);
    const [winner, setWinner]             = useState(null);
    const [disconnectAlert, setDisconnectAlert] = useState(null);
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

        socket.on('connect', () => { setIsConnected(true); setErrorMsg(null); });

        socket.on('disconnect', (reason) => {
            setIsConnected(false);
            if (reason !== 'io client disconnect') {
                setErrorMsg('Connection lost. Trying to reconnect…');
            }
        });

        socket.on('connect_error', () => {
            setIsConnected(false);
            setErrorMsg(`Cannot reach server at ${SERVER_URL}. Make sure the backend is running.`);
        });

        socket.on('reconnect', () => { setIsConnected(true); setErrorMsg(null); });
        socket.on('reconnect_failed', () => {
            setErrorMsg('Could not reconnect to server. Please refresh the page.');
        });

        socket.on('session', (data) => {
            localStorage.setItem('sequenceSessionId', data.sessionId);
        });

        // ── Lobby sync ────────────────────────────────────────
        socket.on('LOBBY_STATE_SYNC', (data) => {
            setLobbyState({
                players:           data.players,
                targetPlayerCount: data.targetPlayerCount,
                numTeams:          data.numTeams,
                roomCode:          data.roomCode,
                canStart:          data.canStart,
            });
            setRoomInfo(prev => ({ ...prev, roomId: data.roomId, roomCode: data.roomCode }));
        });

        // ── Game started ──────────────────────────────────────
        socket.on('GAME_STATE_SYNC', (data) => {
            setStatus('playing');
            setErrorMsg(null);
            setDisconnectAlert(null);

            const { yourKey, yourHand, cards, scores, currentTurn, deckCount, config, players, lockedCells } = data;

            setPlayerInfo(prev => ({
                ...prev,
                playerKey: yourKey,
                hand:      yourHand,
            }));

            setGameState({
                cards,
                scores,
                currentTurn,
                deckCount,
                config,
                players,
                lockedCells: lockedCells || [],
            });
        });

        // ── Game over ─────────────────────────────────────────
        socket.on('GAME_OVER', (data) => {
            setStatus('gameover');
            setWinner(data.winner);
        });

        // ── Room events ───────────────────────────────────────
        socket.on('custom_room_created', (data) => {
            setRoomInfo({ roomId: data.roomId, roomCode: data.roomCode, isCustom: true });
            setStatus('lobby');
            setErrorMsg(null);
        });

        socket.on('room_join_error', (err) => {
            setErrorMsg(err?.message || 'Could not join room. Check the Room Code.');
            setStatus('idle');
        });

        socket.on('room_closed', () => {
            setErrorMsg('The room was closed.');
            setStatus('idle');
            setGameState(null);
            setLobbyState(null);
        });

        // ── Disconnect alerts ─────────────────────────────────
        socket.on('PLAYER_DISCONNECTED', (data) => {
            setDisconnectAlert({
                type: 'disconnected',
                playerKey: data.playerKey,
                gracePeriodMs: data.gracePeriodMs,
            });
        });

        socket.on('PLAYER_DISCONNECTED_TIMEOUT', (data) => {
            setDisconnectAlert({
                type: 'timeout',
                playerKey: data.playerKey,
                name: data.name,
            });
        });

        // ── Legacy 2-player quick-match fallback ──────────────
        // (kept for backward compat; server now emits GAME_STATE_SYNC)
        socket.on('OpponentFound', (data) => {
            setStatus('playing');
            setErrorMsg(null);
            const myKey  = data.playingAs;
            const oppKey = myKey === 'player1' ? 'player2' : 'player1';
            const playersObj = {
                [myKey]:  { name: data.yourName || pendingNameRef.current || 'You',    team: myKey  === 'player1' ? 'blue' : 'red', isTurn: myKey  === 'player1', handCount: (data.yourHand || []).length },
                [oppKey]: { name: data.opponentName || 'Opponent',                     team: oppKey === 'player1' ? 'blue' : 'red', isTurn: myKey  !== 'player1', handCount: 0 },
            };
            setPlayerInfo(prev => ({ ...prev, playerKey: myKey, hand: data.yourHand }));
            setGameState({ deckCount: data.deckCount, cards: data.cards, currentTurn: 'player1', scores: { red: 0, blue: 0 }, players: playersObj, config: { sequencesToWin: 2, numTeams: 2 }, lockedCells: [] });
        });

        socket.on('updateGameState', (data) => {
            setGameState(prev => {
                if (!prev) return prev;
                const updPlayers = { ...prev.players };
                Object.keys(updPlayers).forEach(k => {
                    updPlayers[k] = { ...updPlayers[k], isTurn: k === data.currentTurn };
                });
                return { ...prev, deckCount: data.deckCount, cards: data.cards, currentTurn: data.currentTurn, scores: data.score, players: updPlayers, lockedCells: data.lockedCells || [] };
            });
            setPlayerInfo(prev => ({ ...prev, hand: data.playerHand }));
        });

        return () => { socket.disconnect(); socketRef.current = null; };
    }, []);

    // ── Action callbacks ──────────────────────────────────────

    const createCustomRoom = useCallback((playerName, targetPlayerCount = 2, numTeams) => {
        const socket = socketRef.current;
        if (!socket?.connected) { setErrorMsg('Not connected to server.'); return; }
        const safeName = sanitiseName(playerName);
        if (!safeName) { setErrorMsg('Please enter a valid name (letters, numbers, spaces only).'); return; }
        const safeCount = clampToSet(targetPlayerCount, VALID_PLAYER_COUNTS, 2);
        pendingNameRef.current = safeName;
        setPlayerInfo(prev => ({ ...prev, name: safeName }));
        setErrorMsg(null);
        socket.emit('create_custom_room', { playerName: safeName, targetPlayerCount: safeCount, numTeams });
    }, []);

    const joinCustomRoom = useCallback((roomIdOrCode, playerName) => {
        const socket = socketRef.current;
        if (!socket?.connected) { setErrorMsg('Not connected to server.'); return; }
        const safeName = sanitiseName(playerName);
        if (!safeName) { setErrorMsg('Please enter a valid name (letters, numbers, spaces only).'); return; }
        const safeCode = sanitiseRoomCode(roomIdOrCode);
        if (!safeCode) { setErrorMsg('Invalid Room Code — use letters and numbers only.'); return; }
        pendingNameRef.current = safeName;
        setPlayerInfo(prev => ({ ...prev, name: safeName }));
        setErrorMsg(null);

        const isCode = isValidRoomCode(safeCode);
        const payload = isCode
            ? { roomCode: safeCode, playerName: safeName }
            : { roomId: safeCode.toLowerCase(), playerName: safeName };

        socket.emit('join_custom_room', payload, (response) => {
            if (!response?.success) {
                setErrorMsg(response?.message || 'Could not join that room.');
            } else {
                setRoomInfo({ roomId: response.roomId, roomCode: response.roomCode, isCustom: true });
                setStatus('lobby');
            }
        });
    }, []);

    const toggleReady = useCallback(() => {
        socketRef.current?.emit('player_ready_toggle');
    }, []);

    const addCpuPlayer = useCallback((difficulty = 'random') => {
        socketRef.current?.emit('add_cpu_player', { difficulty });
    }, []);

    const startGame = useCallback(() => {
        socketRef.current?.emit('start_game', {}, (res) => {
            if (!res?.success) setErrorMsg(res?.message || 'Could not start game.');
        });
    }, []);

    const playOnline = useCallback((playerName) => {
        const socket = socketRef.current;
        if (!socket?.connected) { setErrorMsg('Not connected to server.'); return; }
        const safeName = sanitiseName(playerName);
        if (!safeName) { setErrorMsg('Please enter a valid name.'); return; }
        pendingNameRef.current = safeName;
        setPlayerInfo(prev => ({ ...prev, name: safeName }));
        setErrorMsg(null);
        socket.emit('play_online', { playerName: safeName }, (response) => {
            if (response?.waiting) {
                setRoomInfo({ roomId: response.waitingroom, roomCode: response.roomCode, isCustom: false });
                setStatus('matchmaking');
            } else if (response?.roomId) {
                setRoomInfo({ roomId: response.roomId, isCustom: false });
            }
        });
    }, []);

    const makeMove = useCallback((cardId, selectedCard) => {
        const socket = socketRef.current;
        if (socket?.connected && roomInfo && status === 'playing') {
            socket.emit('Boardcardclicked', { roomId: roomInfo.roomId, cardId, selectedCard });
        }
    }, [roomInfo, status]);

    const declareDeadCard = useCallback((cardId) => {
        const socket = socketRef.current;
        if (socket?.connected && roomInfo && status === 'playing') {
            socket.emit('declare_dead_card', { roomId: roomInfo.roomId, cardId });
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
        setLobbyState(null);
        setDisconnectAlert(null);
    }, [roomInfo]);

    return {
        isConnected, status, setStatus,
        roomInfo, lobbyState,
        playerInfo, gameState,
        errorMsg, winner, disconnectAlert,
        createCustomRoom, joinCustomRoom,
        toggleReady, addCpuPlayer, startGame,
        playOnline, makeMove, declareDeadCard, quitGame,
    };
}
