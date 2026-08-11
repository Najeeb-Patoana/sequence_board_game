import { useState, useCallback } from 'react';
import { initializeGame, handleCardSelection, checkPatterns } from '../engine/gameEngine';
import allCards from '../data/allCards';

export function useOfflineGame() {
    const [gameState, setGameState] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, pass-device, playing, gameover
    const [winner, setWinner] = useState(null);

    const startLocalGame = useCallback((player1Name, player2Name) => {
        let initialGame = initializeGame(allCards);
        initialGame.players.player1.name = player1Name;
        initialGame.players.player2.name = player2Name;
        setGameState(initialGame);
        setStatus('playing'); // First player doesn't need 'pass-device' screen immediately
        setWinner(null);
    }, []);

    const makeMove = useCallback((cardId, selectedCard) => {
        if (!gameState) return;

        const currentTurn = gameState.players.player1.isTurn ? 'player1' : 'player2';
        
        let result = handleCardSelection(gameState, cardId, currentTurn, selectedCard);
        
        if (!result.success) {
            // Invalid move, handled by UI feedback ideally
            return false;
        }

        let patternResult = checkPatterns(result.game);
        
        setGameState(patternResult.game);

        if (patternResult.winner) {
            setWinner(patternResult.winner);
            setStatus('gameover');
        } else {
            // Transition to pass device screen
            setStatus('pass-device');
        }
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

    return {
        status,
        gameState,
        winner,
        startLocalGame,
        makeMove,
        continueTurn,
        quitGame
    };
}
