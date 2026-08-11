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
            startLocalGame(
                location.state.p1Name, 
                location.state.p2Name, 
                location.state.p3Name, 
                location.state.sequencesToWin
            );
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
            const success = makeMove(cardId, selectedHandCard.id);
            if (success) {
                setSelectedHandCard(null);
                setHoveredMatches([]);
            }
        }
    };

    if (!gameState) return null;

    const currentTurn = Object.keys(gameState.players).find(key => gameState.players[key].isTurn);
    const currentPlayerObj = gameState.players[currentTurn];
    
    return (
        <div className="game-layout relative">
            {/* Left Sidebar */}
            <div className="flex flex-col gap-6 h-full">
                <button className="btn btn-secondary flex items-center gap-2 self-start py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10" onClick={handleQuit}>
                    ← Back to Menu
                </button>
                
                <GameInfoPanel 
                    scores={gameState.scores} 
                    deckCount={gameState.shuffledDeck ? gameState.shuffledDeck.length : 0} 
                    players={gameState.players} 
                    playingAs={null} 
                />

                <div className="flex-1"></div>

                <div className="flex flex-col items-center gap-4">
                    <DeckDisplay count={gameState.shuffledDeck ? gameState.shuffledDeck.length : 0} />
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
