import React from 'react';
import { useNavigate } from 'react-router-dom';

const TEAM_CONFIG = {
    blue: {
        label: 'Blue Team',
        emoji: '🔵',
        color: 'var(--blue-light)',
        glow: 'var(--blue-glow)',
        bg: 'var(--blue-dim)',
    },
    red: {
        label: 'Red Team',
        emoji: '🔴',
        color: 'var(--red-light)',
        glow: 'var(--red-glow)',
        bg: 'var(--red-dim)',
    },
    green: {
        label: 'Green Team',
        emoji: '🟢',
        color: 'var(--green-light)',
        glow: 'var(--green-glow)',
        bg: 'var(--green-dim)',
    },
};

export default function WinnerModal({ winner, players, sequencesToWin, onPlayAgain }) {
    const navigate = useNavigate();

    if (!winner) return null;

    const config = TEAM_CONFIG[winner] || TEAM_CONFIG.blue;

    // Find the winning player's name
    const winningPlayer = players
        ? Object.values(players).find(p => p.team === winner)
        : null;

    return (
        <div className="overlay" style={{ zIndex: 2000 }}>
            <div
                className="modal-card text-center"
                style={{ borderColor: config.glow, boxShadow: `0 0 40px ${config.glow}, 0 24px 60px rgba(0,0,0,0.7)` }}
            >
                <div className="winner-emoji" style={{ marginBottom: '1rem' }}>🏆</div>

                <h1
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '2.25rem',
                        fontWeight: 900,
                        color: config.color,
                        textShadow: `0 0 24px ${config.glow}`,
                        marginBottom: '0.5rem',
                    }}
                >
                    {config.label} Wins!
                </h1>

                {winningPlayer && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>
                        Congratulations, <strong style={{ color: 'var(--text-primary)' }}>{winningPlayer.name}</strong>!
                    </p>
                )}

                <div
                    style={{
                        display: 'inline-block',
                        background: config.bg,
                        border: `1px solid ${config.glow}`,
                        borderRadius: 'var(--r-full)',
                        padding: '0.4rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: config.color,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        marginBottom: '2rem',
                        marginTop: '0.5rem',
                    }}
                >
                    {sequencesToWin} Sequence{sequencesToWin > 1 ? 's' : ''} Completed
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {onPlayAgain && (
                        <button className="btn btn-primary btn-lg w-full" onClick={onPlayAgain}>
                            Play Again
                        </button>
                    )}
                    <button
                        className="btn btn-ghost w-full"
                        onClick={() => navigate('/')}
                    >
                        Main Menu
                    </button>
                </div>
            </div>
        </div>
    );
}
