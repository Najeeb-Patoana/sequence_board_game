import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOnlineGame } from '../hooks/useOnlineGame';
import GameBoard from '../components/GameBoard';
import PlayerHand from '../components/PlayerHand';
import GameInfoPanel from '../components/GameInfoPanel';
import TurnIndicator from '../components/TurnIndicator';
import WaitingRoom from '../components/WaitingRoom';
import WinnerModal from '../components/WinnerModal';

export default function OnlineGame() {
    const { roomId: urlRoomId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [setupState, setSetupState] = useState(urlRoomId ? 'joining' : 'setup');
    const [hoveredMatches, setHoveredMatches] = useState([]);
    // Store full card object (not just id)
    const [selectedHandCard, setSelectedHandCard] = useState(null);
    
    const { 
        status, roomInfo, playerInfo, gameState, errorMsg, winner, 
        createCustomRoom, joinCustomRoom, playOnline, makeMove, quitGame, setStatus 
    } = useOnlineGame();

    useEffect(() => {
        if (errorMsg) {
            setSetupState('error');
        }
    }, [errorMsg]);

    const handleJoinWithUrl = (e) => {
        e.preventDefault();
        if (name.trim()) {
            joinCustomRoom(urlRoomId, name.trim());
        }
    };

    const handleCreateRoom = () => {
        if (name.trim()) createCustomRoom(name.trim());
    };

    const handleJoinCustom = () => {
        if (name.trim() && joinRoomId.trim()) {
            joinCustomRoom(joinRoomId.trim(), name.trim());
        }
    };

    const handleQuickMatch = () => {
        if (name.trim()) playOnline(name.trim());
    };

    const handleQuit = () => {
        quitGame();
        navigate('/');
    };

    const handleBoardClick = (cardId) => {
        if (selectedHandCard) {
            makeMove(cardId, selectedHandCard.id);
            setSelectedHandCard(null);
            setHoveredMatches([]);
        }
    };

    const handleCardSelect = (card) => {
        setSelectedHandCard(card);
        if (!card) setHoveredMatches([]);
    };

    // ── Join private room (URL-based) ──────────────────────
    if (setupState === 'joining' && status === 'idle') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>
                        Join Private Room
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Room: <strong style={{ color: 'var(--text-primary)' }}>{urlRoomId}</strong>
                    </p>
                    <form onSubmit={handleJoinWithUrl} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <input
                            type="text"
                            className="input"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={15}
                            required
                            autoFocus
                        />
                        <button type="submit" className="btn btn-primary btn-lg">Join Game</button>
                        <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>Cancel</button>
                    </form>
                </div>
            </div>
        );
    }

    // ── Setup / Error screen ───────────────────────────────
    if (status === 'idle' || setupState === 'error') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                <div style={{ width: '100%', maxWidth: '500px' }}>
                    <button className="btn btn-ghost" style={{ marginBottom: '1.5rem', fontSize: '0.82rem' }} onClick={() => navigate('/')}>
                        ← Back
                    </button>

                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 900, textAlign: 'center', marginBottom: '0.4rem' }}>
                            Online Multiplayer
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.75rem', fontSize: '0.85rem' }}>
                            Play with friends over the internet
                        </p>

                        {errorMsg && (
                            <div style={{ background: 'rgba(232,64,64,0.1)', border: '1px solid rgba(232,64,64,0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: 'var(--r-md)', marginBottom: '1.25rem', fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span>{errorMsg}</span>
                                <button style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700 }} onClick={() => { setStatus('idle'); setSetupState('setup'); }}>✕</button>
                            </div>
                        )}

                        {/* Name input */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                                Your Name
                            </label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={15}
                                autoFocus
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Quick Match */}
                            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: '1.25rem' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Quick Match</h3>
                                <button className="btn btn-primary w-full" onClick={handleQuickMatch} disabled={!name.trim()}>
                                    Find Random Opponent
                                </button>
                            </div>

                            {/* Friends */}
                            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: '1.25rem' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Play with Friends</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Room ID"
                                        value={joinRoomId}
                                        onChange={(e) => setJoinRoomId(e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <button className="btn btn-primary" onClick={handleJoinCustom} disabled={!name.trim() || !joinRoomId.trim()}>
                                        Join
                                    </button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>OR</span>
                                    <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                                </div>
                                <button className="btn btn-ghost w-full" onClick={handleCreateRoom} disabled={!name.trim()}>
                                    Create Private Room
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Waiting room ───────────────────────────────────────
    if (status === 'waiting') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                <button className="btn btn-ghost" style={{ marginBottom: '1.5rem', alignSelf: 'flex-start', fontSize: '0.82rem', maxWidth: '500px', width: '100%', margin: '0 auto 1.5rem' }} onClick={handleQuit}>
                    ← Leave Room
                </button>
                <WaitingRoom roomId={roomInfo?.roomId} />
            </div>
        );
    }

    // ── In-game ────────────────────────────────────────────
    if ((status === 'playing' || status === 'gameover') && gameState) {
        const isMyTurn = gameState.currentTurn === playerInfo.playingAs;
        const currentTurnKey = gameState.currentTurn;

        return (
            <div className="game-layout">
                {/* Sidebar */}
                <aside className="game-sidebar">
                    <button className="btn btn-ghost" style={{ fontSize: '0.82rem' }} onClick={handleQuit}>
                        ← Leave
                    </button>

                    <GameInfoPanel
                        scores={gameState.scores}
                        players={gameState.players}
                        currentTurn={currentTurnKey}
                        deckCount={gameState.deckCount}
                        playingAs={playerInfo.playingAs}
                    />

                    <TurnIndicator
                        currentTurn={currentTurnKey}
                        playingAs={playerInfo.playingAs}
                        players={gameState.players}
                        isOffline={false}
                    />
                </aside>

                {/* Main */}
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

                    <PlayerHand
                        hand={playerInfo.hand}
                        isMyTurn={isMyTurn}
                        selectedHandCard={selectedHandCard}
                        onCardSelect={handleCardSelect}
                        onCardHover={setHoveredMatches}
                    />
                </main>

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
