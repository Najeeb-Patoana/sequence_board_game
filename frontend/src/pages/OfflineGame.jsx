import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOfflineGame } from '../hooks/useOfflineGame';
import GameBoard from '../components/GameBoard';
import PlayerHand from '../components/PlayerHand';
import GameInfoPanel from '../components/GameInfoPanel';
import PassDeviceScreen from '../components/PassDeviceScreen';
import WinnerModal from '../components/WinnerModal';
import LeaveGameDialog from '../components/LeaveGameDialog';

export default function OfflineGame() {
    const location = useLocation();
    const navigate = useNavigate();

    // Hover-only highlights (mouse over a hand card)
    const [hoveredMatches, setHoveredMatches] = useState([]);
    // Persistent highlights for the selected card (survives mouseLeave)
    const [selectedHighlights, setSelectedHighlights] = useState([]);
    const [selectedHandCard, setSelectedHandCard] = useState(null);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);

    const {
        status, gameState, winner,
        startLocalGame, makeMove, continueTurn, quitGame
    } = useOfflineGame();

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
    }, []);

    const handleQuitConfirmed = () => {
        quitGame();
        navigate('/');
    };

    const handleBoardClick = (cardId) => {
        if (!selectedHandCard) return;
        const success = makeMove(cardId, selectedHandCard.id);
        if (success) {
            setSelectedHandCard(null);
            setHoveredMatches([]);
            setSelectedHighlights([]);
        }
    };

    const handleCardSelect = (card) => {
        setSelectedHandCard(card);
        if (card) {
            // Lock in the matches for this card so they stay highlighted
            // even after mouseLeave fires
            setSelectedHighlights(card.matches || []);
        } else {
            setSelectedHighlights([]);
            setHoveredMatches([]);
        }
    };

    const handleCardHover = (matches) => {
        // Only show hover highlights if no card is selected yet
        if (!selectedHandCard) {
            setHoveredMatches(matches);
        }
    };

    const handlePlayAgain = () => {
        if (setupParams) {
            startLocalGame(
                setupParams.p1Name, setupParams.p2Name,
                setupParams.p3Name, setupParams.sequencesToWin
            );
        }
        setSelectedHandCard(null);
        setHoveredMatches([]);
        setSelectedHighlights([]);
    };

    if (!gameState) return null;

    const currentTurn = Object.keys(gameState.players).find(k => gameState.players[k].isTurn);
    const currentPlayerObj = gameState.players[currentTurn];

    // Merge hover + selection highlights — selection takes priority
    const effectiveHighlights = selectedHandCard
        ? selectedHighlights
        : hoveredMatches;

    return (
        /* 3-column grid: sidebar | board | hand */
        <div className="game-layout">

            {/* ── Left: info sidebar ─────────────────── */}
            <aside className="game-sidebar">
                <button
                    className="btn btn-ghost"
                    onClick={() => setShowLeaveDialog(true)}
                    style={{ fontSize: '0.8rem' }}
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

            {/* ── Center: board only, fills remaining height ── */}
            <main className="game-main">
                <div className="board-area">
                    <div className="board-wrapper">
                        <GameBoard
                            cards={gameState.cards}
                            hoveredCards={effectiveHighlights}
                            selectedBoardId={null}
                            hasCardSelected={!!selectedHandCard}
                            onBoardClick={handleBoardClick}
                        />
                    </div>
                </div>
            </main>

            {/* ── Right: player hand (vertical) ─────── */}
            <aside className="hand-sidebar">
                {status === 'playing' ? (
                    <PlayerHand
                        hand={currentPlayerObj.hand}
                        isMyTurn={true}
                        selectedHandCard={selectedHandCard}
                        onCardSelect={handleCardSelect}
                        onCardHover={handleCardHover}
                        vertical={true}
                    />
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            Passing device…
                        </div>
                    </div>
                )}
            </aside>

            {/* Pass Device overlay */}
            {status === 'pass-device' && (
                <PassDeviceScreen
                    nextPlayerName={currentPlayerObj.name}
                    nextTeam={currentPlayerObj.team}
                    onReady={continueTurn}
                />
            )}

            {/* Leave confirmation dialog */}
            <LeaveGameDialog
                isOpen={showLeaveDialog}
                onCancel={() => setShowLeaveDialog(false)}
                onLeave={handleQuitConfirmed}
                isOnline={false}
            />

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
