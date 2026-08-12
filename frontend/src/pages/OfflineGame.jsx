import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOfflineGame } from '../hooks/useOfflineGame';
import GameBoard from '../components/GameBoard';
import PlayerHand from '../components/PlayerHand';
import GameInfoPanel from '../components/GameInfoPanel';
import PassDeviceScreen from '../components/PassDeviceScreen';
import WinnerModal from '../components/WinnerModal';

export default function OfflineGame() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [hoveredMatches, setHoveredMatches] = useState([]);
    // selectedHandCard now stores the full card object (or null)
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

    // Store setup params for Play Again
    const setupParams = location.state;

    useEffect(() => {
        if (setupParams?.p1Name && setupParams?.p2Name) {
            startLocalGame(
                setupParams.p1Name,
                setupParams.p2Name,
                setupParams.p3Name,
                setupParams.sequencesToWin
            );
        } else {
            navigate('/offline');
        }
    }, []);  // run once on mount

    const handleQuit = () => {
        quitGame();
        navigate('/');
    };

    const handleBoardClick = (cardId) => {
        if (!selectedHandCard) return;
        // selectedHandCard is the full card object; pass its id to makeMove
        const success = makeMove(cardId, selectedHandCard.id);
        if (success) {
            setSelectedHandCard(null);
            setHoveredMatches([]);
        }
    };

    const handleCardSelect = (card) => {
        setSelectedHandCard(card);
        // When deselecting, clear hover highlights too
        if (!card) setHoveredMatches([]);
    };

    const handlePlayAgain = () => {
        if (setupParams) {
            startLocalGame(
                setupParams.p1Name,
                setupParams.p2Name,
                setupParams.p3Name,
                setupParams.sequencesToWin
            );
        }
        setSelectedHandCard(null);
        setHoveredMatches([]);
    };

    if (!gameState) return null;

    const currentTurn = Object.keys(gameState.players).find(key => gameState.players[key].isTurn);
    const currentPlayerObj = gameState.players[currentTurn];
    
    return (
        <div className="game-layout">
            {/* Left Sidebar */}
            <aside className="game-sidebar">
                <button
                    className="btn btn-ghost"
                    onClick={handleQuit}
                    style={{ fontSize: '0.82rem' }}
                >
                    ← Menu
                </button>

                <GameInfoPanel
                    scores={gameState.scores}
                    players={gameState.players}
                    currentTurn={currentTurn}
                    deckCount={gameState.shuffledDeck ? gameState.shuffledDeck.length : 0}
                    playingAs={null}
                />
            </aside>

            {/* Main: Board + Hand */}
            <main className="game-main">
                <div className="board-area">
                    <div className="board-wrapper">
                        <GameBoard
                            cards={gameState.cards}
                            hoveredCards={hoveredMatches}
                            selectedBoardId={null}
                            hasCardSelected={!!selectedHandCard}
                            onBoardClick={handleBoardClick}
                        />
                    </div>
                </div>

                {status === 'playing' && (
                    <PlayerHand
                        hand={currentPlayerObj.hand}
                        isMyTurn={true}
                        selectedHandCard={selectedHandCard}
                        onCardSelect={handleCardSelect}
                        onCardHover={setHoveredMatches}
                    />
                )}
            </main>

            {/* Pass Device Overlay */}
            {status === 'pass-device' && (
                <PassDeviceScreen
                    nextPlayerName={currentPlayerObj.name}
                    nextTeam={currentPlayerObj.team}
                    onReady={continueTurn}
                />
            )}

            {/* Winner Modal */}
            <WinnerModal
                winner={winner}
                players={gameState.players}
                sequencesToWin={setupParams?.sequencesToWin || 2}
                onPlayAgain={handlePlayAgain}
            />
        </div>
    );
}
