import { useState, useCallback } from 'react';
import { initializeGame, handleCardSelection, checkPatterns } from '../engine/gameEngine';
import allCards from '../data/allCards';

export function useOfflineGame() {
    const [gameState, setGameState] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, pass-device, playing, gameover
    const [winner, setWinner] = useState(null);

    const startLocalGame = useCallback((player1Name, player2Name, player3Name, sequencesToWin) => {
        const numPlayers = player3Name ? 3 : 2;
        let initialGame = initializeGame(allCards, { numPlayers, sequencesToWin });
        initialGame.players.player1.name = player1Name;
        initialGame.players.player2.name = player2Name;
        if (numPlayers === 3) {
            initialGame.players.player3.name = player3Name;
        }
        setGameState(initialGame);
        setStatus('playing'); 
        setWinner(null);
    }, []);

    const makeMove = useCallback((cardId, selectedCard) => {
        if (!gameState) return;

        const currentTurn = Object.keys(gameState.players).find(key => gameState.players[key].isTurn);
        
        let result = handleCardSelection(gameState, cardId, currentTurn, selectedCard);
        
        if (!result.success) {
            console.warn("Invalid move:", result.message, "Card:", selectedCard, "Board:", cardId);
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
