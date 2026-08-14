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

    const [hoveredMatches,    setHoveredMatches]    = useState([]);
    const [selectedHighlights, setSelectedHighlights] = useState([]);
    const [selectedHandCard,  setSelectedHandCard]  = useState(null);
    const [showLeaveDialog,   setShowLeaveDialog]   = useState(false);

    const {
        status, gameState, winner,
        startLocalGame, makeMove, declareDeadCard, continueTurn, quitGame,
    } = useOfflineGame();

    const setupParams = location.state;

    useEffect(() => {
        if (setupParams?.playerNames && setupParams?.numPlayers) {
            startLocalGame(setupParams.playerNames, setupParams.numPlayers);
        } else {
            navigate('/offline');
        }
    }, []);

    const handleQuitConfirmed = () => { quitGame(); navigate('/'); };

    const handleBoardClick = (boardId) => {
        if (!selectedHandCard) return;
        const success = makeMove(boardId, selectedHandCard.id);
        if (success) {
            setSelectedHandCard(null);
            setHoveredMatches([]);
            setSelectedHighlights([]);
        }
    };

    const handleCardSelect = (card) => {
        setSelectedHandCard(card);
        if (card) {
            setSelectedHighlights(card.matches || []);
        } else {
            setSelectedHighlights([]);
            setHoveredMatches([]);
        }
    };

    const handleCardHover = (matches) => {
        if (!selectedHandCard) setHoveredMatches(matches);
    };

    const handleDeclareDeadCard = (cardId) => {
        const success = declareDeadCard(cardId);
        if (success) {
            setSelectedHandCard(null);
            setHoveredMatches([]);
            setSelectedHighlights([]);
        }
    };

    const handlePlayAgain = () => {
        if (setupParams) startLocalGame(setupParams.playerNames, setupParams.numPlayers);
        setSelectedHandCard(null);
        setHoveredMatches([]);
        setSelectedHighlights([]);
    };

    if (!gameState) return null;

    const currentTurnKey = gameState.turnOrder[gameState.currentTurnIndex];
    const currentPlayerObj = gameState.players[currentTurnKey];
    const effectiveHighlights = selectedHandCard ? selectedHighlights : hoveredMatches;
    const lockedCells = gameState.protectedPatterns?.flat() || [];

    return (
        <div className="game-layout">

            {/* ── Left: info sidebar ─────────────────── */}
            <aside className="game-sidebar">
                <button className="btn btn-ghost" onClick={() => setShowLeaveDialog(true)} style={{ fontSize: '0.8rem' }}>
                    ← Menu
                </button>
                <GameInfoPanel
                    scores={gameState.scores}
                    players={gameState.players}
                    currentTurn={currentTurnKey}
                    deckCount={gameState.shuffledDeck ? gameState.shuffledDeck.length : 0}
                    playingAs={null}
                    config={gameState.config}
                />
            </aside>

            {/* ── Center: board ──────────────────────── */}
            <main className="game-main">
                <div className="board-area">
                    <div className="board-wrapper">
                        <GameBoard
                            cards={gameState.cards}
                            hoveredCards={effectiveHighlights}
                            selectedBoardId={null}
                            hasCardSelected={!!selectedHandCard}
                            selectedHandCard={selectedHandCard}
                            lockedCells={lockedCells}
                            myTeamColor={currentPlayerObj?.team}
                            onBoardClick={handleBoardClick}
                        />
                    </div>
                </div>
            </main>

            {/* ── Right: player hand ─────────────────── */}
            <aside className="hand-sidebar">
                {status === 'playing' ? (
                    <PlayerHand
                        hand={currentPlayerObj?.hand}
                        isMyTurn={true}
                        selectedHandCard={selectedHandCard}
                        onCardSelect={handleCardSelect}
                        onCardHover={handleCardHover}
                        onDeclareDeadCard={handleDeclareDeadCard}
                        boardCards={gameState.cards}
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
                    nextPlayerName={currentPlayerObj?.name}
                    nextTeam={currentPlayerObj?.team}
                    onReady={continueTurn}
                />
            )}

            <LeaveGameDialog
                isOpen={showLeaveDialog}
                onCancel={() => setShowLeaveDialog(false)}
                onLeave={handleQuitConfirmed}
                isOnline={false}
            />

            <WinnerModal
                winner={winner}
                players={gameState.players}
                sequencesToWin={gameState.config?.sequencesToWin || 2}
                onPlayAgain={handlePlayAgain}
            />
        </div>
    );
}
