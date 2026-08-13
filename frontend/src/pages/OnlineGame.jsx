import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOnlineGame } from '../hooks/useOnlineGame';
import GameBoard from '../components/GameBoard';
import PlayerHand from '../components/PlayerHand';
import GameInfoPanel from '../components/GameInfoPanel';
import TurnIndicator from '../components/TurnIndicator';
import WaitingRoom from '../components/WaitingRoom';
import WinnerModal from '../components/WinnerModal';
import LeaveGameDialog from '../components/LeaveGameDialog';

export default function OnlineGame() {
    const { roomId: urlRoomId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [setupState, setSetupState] = useState(urlRoomId ? 'joining' : 'setup');
    // Hover-only highlights
    const [hoveredMatches, setHoveredMatches] = useState([]);
    // Persistent highlights for selected card
    const [selectedHighlights, setSelectedHighlights] = useState([]);
    const [selectedHandCard, setSelectedHandCard] = useState(null);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);

    const {
        isConnected, status, roomInfo, playerInfo, gameState, errorMsg, winner,
        createCustomRoom, joinCustomRoom, playOnline, makeMove, quitGame, setStatus
    } = useOnlineGame();

    useEffect(() => {
        if (errorMsg) setSetupState('error');
    }, [errorMsg]);

    const handleJoinWithUrl = (e) => {
        e.preventDefault();
        if (name.trim()) joinCustomRoom(urlRoomId, name.trim());
    };
    const handleCreateRoom = () => { if (name.trim()) createCustomRoom(name.trim()); };
    const handleJoinCustom = () => { if (name.trim() && joinRoomId.trim()) joinCustomRoom(joinRoomId.trim(), name.trim()); };
    const handleQuickMatch = () => { if (name.trim()) playOnline(name.trim()); };

    const handleQuitConfirmed = () => {
        quitGame();
        navigate('/');
    };

    const handleBoardClick = (cardId) => {
        if (selectedHandCard) {
            makeMove(cardId, selectedHandCard.id);
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
        if (!selectedHandCard) {
            setHoveredMatches(matches);
        }
    };

    /* ── Join private room (URL) ─────────────────────────── */
    if (setupState === 'joining' && status === 'idle') {
        return (
            <div className="page-center">
                <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem', textAlign: 'center' }}>Join Private Room</h2>
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Room: <strong style={{ color: 'var(--text-primary)' }}>{urlRoomId}</strong>
                    </p>
                    <form onSubmit={handleJoinWithUrl} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <input type="text" className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={15} required autoFocus />
                        <button type="submit" className="btn btn-primary btn-lg">Join Game</button>
                        <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>Cancel</button>
                    </form>
                </div>
            </div>
        );
    }

    /* ── Setup / Error screen ────────────────────────────── */
    if (status === 'idle' || setupState === 'error') {

        // Connection status banner
        const connBanner = !isConnected ? (
            <div style={{
                background: 'rgba(193,74,74,0.12)',
                border: '1px solid rgba(193,74,74,0.3)',
                color: '#de7a7a',
                padding: '0.6rem 1rem',
                borderRadius: 'var(--r-md)',
                marginBottom: '1rem',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
            }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#de7a7a', flexShrink: 0, animation: 'dotPulse 1.4s ease-in-out infinite' }} />
                Connecting to server… buttons will enable once connected.
            </div>
        ) : (
            <div style={{
                background: 'rgba(52,199,89,0.1)',
                border: '1px solid rgba(52,199,89,0.25)',
                color: '#34c759',
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--r-md)',
                marginBottom: '1rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
            }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34c759', flexShrink: 0 }} />
                Connected to server
            </div>
        );

        return (
            <div className="page-center">
                <div style={{ width: '100%', maxWidth: '500px' }}>
                    <button className="btn btn-ghost" style={{ marginBottom: '1.5rem', fontSize: '0.82rem' }} onClick={() => navigate('/')}>← Back</button>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 900, textAlign: 'center', marginBottom: '0.4rem' }}>Online Multiplayer</h1>
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.25rem', fontSize: '0.85rem' }}>Play with friends over the internet</p>

                        {connBanner}

                        {errorMsg && (
                            <div style={{ background: 'rgba(193,74,74,0.1)', border: '1px solid rgba(193,74,74,0.3)', color: '#de7a7a', padding: '0.75rem 1rem', borderRadius: 'var(--r-md)', marginBottom: '1.25rem', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <span>{errorMsg}</span>
                                <button style={{ background: 'none', border: 'none', color: '#de7a7a', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }} onClick={() => { setStatus('idle'); setSetupState('setup'); }}>✕</button>
                            </div>
                        )}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Your Name</label>
                            <input type="text" className="input" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={15} autoFocus />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Quick Match */}
                            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: '1.25rem' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quick Match</h3>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>Get matched with a random opponent anywhere in the world.</p>
                                <button className="btn btn-primary w-full" onClick={handleQuickMatch} disabled={!name.trim() || !isConnected}>
                                    {isConnected ? 'Find Random Opponent' : 'Connecting…'}
                                </button>
                            </div>

                            {/* Play with Friends */}
                            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: '1.25rem' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Play with Friends</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <input type="text" className="input" placeholder="Enter Room ID" value={joinRoomId} onChange={(e) => setJoinRoomId(e.target.value)} style={{ flex: 1 }} />
                                    <button className="btn btn-primary" onClick={handleJoinCustom} disabled={!name.trim() || !joinRoomId.trim() || !isConnected}>Join</button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>OR</span>
                                    <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                                </div>
                                <button className="btn btn-ghost w-full" onClick={handleCreateRoom} disabled={!name.trim() || !isConnected}>
                                    {isConnected ? 'Create Private Room' : 'Connecting…'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Waiting room ────────────────────────────────────── */
    if (status === 'waiting') {
        return (
            <div className="page-center" style={{ flexDirection: 'column', gap: '1.5rem' }}>
                <WaitingRoom
                    roomId={roomInfo?.roomId}
                    onLeave={() => { quitGame(); navigate('/'); }}
                />
            </div>
        );
    }

    /* ── In-game (3-column) ──────────────────────────────── */
    if ((status === 'playing' || status === 'gameover') && gameState) {
        const isMyTurn = gameState.currentTurn === playerInfo?.playingAs;
        const currentTurnKey = gameState.currentTurn;
        const effectiveHighlights = selectedHandCard ? selectedHighlights : hoveredMatches;

        return (
            <div className="game-layout">

                {/* ── Left: info sidebar ──────────────── */}
                <aside className="game-sidebar">
                    <button
                        className="btn btn-ghost"
                        style={{ fontSize: '0.8rem' }}
                        onClick={() => setShowLeaveDialog(true)}
                    >
                        ← Leave
                    </button>
                    <GameInfoPanel
                        scores={gameState.scores}
                        players={gameState.players}
                        currentTurn={currentTurnKey}
                        deckCount={gameState.deckCount}
                        playingAs={playerInfo?.name}
                    />
                    <TurnIndicator
                        currentTurn={currentTurnKey}
                        playingAs={playerInfo?.playingAs}
                        players={gameState.players}
                        isOffline={false}
                    />
                </aside>

                {/* ── Center: board only ──────────────── */}
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

                {/* ── Right: player hand (vertical) ───── */}
                <aside className="hand-sidebar">
                    <PlayerHand
                        hand={playerInfo?.hand}
                        isMyTurn={isMyTurn}
                        selectedHandCard={selectedHandCard}
                        onCardSelect={handleCardSelect}
                        onCardHover={handleCardHover}
                        vertical={true}
                    />
                </aside>

                {/* Leave confirmation dialog */}
                <LeaveGameDialog
                    isOpen={showLeaveDialog}
                    onCancel={() => setShowLeaveDialog(false)}
                    onLeave={handleQuitConfirmed}
                    isOnline={true}
                />

                <WinnerModal
                    winner={winner}
                    players={gameState.players}
                    sequencesToWin={2}
                    onPlayAgain={null}
                />
            </div>
        );
    }

    return null;
}
