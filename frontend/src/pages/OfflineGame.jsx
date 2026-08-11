import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOfflineGame } from '../hooks/useOfflineGame';
import GameBoard from '../components/GameBoard';
import PlayerHand from '../components/PlayerHand';
import GameInfoPanel from '../components/GameInfoPanel';
import TurnIndicator from '../components/TurnIndicator';
import DeckDisplay from '../components/DeckDisplay';
import PassDeviceScreen from '../components/PassDeviceScreen';
import WinnerModal from '../components/WinnerModal';

export default function OfflineGame() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [hoveredMatches, setHoveredMatches] = useState([]);
    const [selectedHandCard, setSelectedHandCard] = useState(null);

    const {
        status,
        gameState,
        winner,
        startLocalGame,
        makeMove,
        continueTurn,
        quitGame
    } = useOfflineGame();

    useEffect(() => {
        if (location.state?.p1Name && location.state?.p2Name) {
            startLocalGame(location.state.p1Name, location.state.p2Name);
        } else {
            // No state passed, redirect to setup
            navigate('/offline');
        }
    }, [location, startLocalGame, navigate]);

    const handleQuit = () => {
        quitGame();
        navigate('/');
    };

    const handleBoardClick = (cardId) => {
        if (selectedHandCard) {
            const success = makeMove(cardId, selectedHandCard);
            if (success) {
                setSelectedHandCard(null);
                setHoveredMatches([]);
            }
        }
    };

    if (!gameState) return null;

    const currentTurn = gameState.players.player1.isTurn ? 'player1' : 'player2';
    const currentPlayerObj = gameState.players[currentTurn];
    
    // For PassDeviceScreen, we need the NEXT player name, which is the currentTurn AFTER state updates.
    // Since state is updated before PassDeviceScreen is shown, currentTurn is already the next player.

    return (
        <div className="game-layout relative">
            {/* Left Sidebar */}
            <div className="flex flex-col gap-6 h-full">
                <button className="text-muted hover:text-white flex items-center gap-2 self-start transition-colors" onClick={handleQuit}>
                    ← Quit Game
                </button>
                
                <GameInfoPanel 
                    scores={gameState.scores} 
                    deckCount={gameState.deckCount} 
                    players={gameState.players} 
                    playingAs={null} // Offline doesn't have a "you", both play on this device
                />

                <div className="flex-1"></div>

                <div className="flex flex-col items-center gap-4">
                    <DeckDisplay count={gameState.deckCount} />
                    <TurnIndicator 
                        currentTurn={currentTurn} 
                        playingAs={null} 
                        players={gameState.players}
                        isOffline={true}
                    />
                </div>
            </div>

            {/* Right Area - Board & Hand */}
            <div className="flex flex-col justify-between h-full relative">
                <GameBoard 
                    cards={gameState.cards} 
                    hoveredCards={hoveredMatches}
                    selectedBoardId={null} 
                    onBoardClick={handleBoardClick}
                />
                
                {status === 'playing' && (
                    <PlayerHand 
                        hand={currentPlayerObj.hand}
                        isMyTurn={true} // In offline, it's always the turn of the person looking
                        selectedHandCard={selectedHandCard}
                        onCardSelect={setSelectedHandCard}
                        onCardHover={setHoveredMatches}
                    />
                )}
            </div>

            {status === 'pass-device' && (
                <PassDeviceScreen 
                    nextPlayerName={currentPlayerObj.name} 
                    onReady={continueTurn} 
                />
            )}

            <WinnerModal 
                winner={winner} 
                onPlayAgain={() => startLocalGame(gameState.players.player1.name, gameState.players.player2.name)} 
            />
        </div>
    );
}
