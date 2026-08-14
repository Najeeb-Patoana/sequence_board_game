import { useState, useCallback } from 'react';
import {
    initializeGame,
    handleCardSelection,
    checkPatterns,
    deriveNumTeams,
    deriveSequencesToWin,
    isDeadCard,
} from '../engine/gameEngine';
import allCards from '../data/allCards';

export function useOfflineGame() {
    const [gameState, setGameState] = useState(null);
    const [status, setStatus]       = useState('idle'); // idle | pass-device | playing | gameover
    const [winner, setWinner]       = useState(null);

    /**
     * @param {string[]} playerNames   Ordered array of player names
     * @param {number}   numPlayers    2 | 3 | 4
     */
    const startLocalGame = useCallback((playerNames, numPlayers = 2) => {
        const numTeams = deriveNumTeams(numPlayers);
        const initialGame = initializeGame(allCards, {
            numPlayers,
            numTeams,
            playerNames,
        });
        setGameState(initialGame);
        setStatus('playing');
        setWinner(null);
    }, []);

    const makeMove = useCallback((boardId, selectedCardId) => {
        if (!gameState) return false;

        const currentTurn = gameState.turnOrder[gameState.currentTurnIndex];
        const result = handleCardSelection(gameState, boardId, currentTurn, selectedCardId, 'PLAY_CARD');

        if (!result.success) {
            console.warn('Invalid move:', result.message);
            return false;
        }

        const patResult = checkPatterns(result.game);
        setGameState(patResult.game);

        if (patResult.winner) {
            setWinner(patResult.winner);
            setStatus('gameover');
        } else {
            setStatus('pass-device');
        }
        return true;
    }, [gameState]);

    const declareDeadCard = useCallback((cardId) => {
        if (!gameState) return false;

        const currentTurn = gameState.turnOrder[gameState.currentTurnIndex];
        const result = handleCardSelection(gameState, null, currentTurn, cardId, 'DISCARD_DEAD_CARD');

        if (!result.success) {
            console.warn('Dead card rejected:', result.message);
            return false;
        }

        // Dead card: no pattern change possible, just advance turn
        setGameState(result.game);
        setStatus('pass-device');
        return true;
    }, [gameState]);

    const continueTurn = useCallback(() => {
        setStatus('playing');
    }, []);

    const quitGame = useCallback(() => {
        setStatus('idle');
        setGameState(null);
        setWinner(null);
    }, []);

    // Helper: is the current player's selected card a dead card?
    const checkIsDeadCard = useCallback((card) => {
        if (!gameState || !card) return false;
        return isDeadCard(card, gameState.cards);
    }, [gameState]);

    return {
        status,
        gameState,
        winner,
        startLocalGame,
        makeMove,
        declareDeadCard,
        continueTurn,
        quitGame,
        checkIsDeadCard,
    };
}
