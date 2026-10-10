import React from 'react';
import { useNavigate } from 'react-router-dom';

const TEAM_CONFIG = {
    blue: {
        label: 'Blue Team',
        chipColor: '#4a7fc1',
        chipHighlight: '#8bb8e8',
        textColor: '#7aadde',
        glowColor: 'rgba(74,127,193,0.30)',
        borderColor: 'rgba(74,127,193,0.25)',
        bgColor: 'rgba(74,127,193,0.07)',
    },
    red: {
        label: 'Red Team',
        chipColor: '#c14a4a',
        chipHighlight: '#e88b8b',
        textColor: '#de7a7a',
        glowColor: 'rgba(193,74,74,0.30)',
        borderColor: 'rgba(193,74,74,0.25)',
        bgColor: 'rgba(193,74,74,0.07)',
    },
    green: {
        label: 'Green Team',
        chipColor: '#4a9c6e',
        chipHighlight: '#8be8b0',
        textColor: '#7ade9e',
        glowColor: 'rgba(74,156,110,0.30)',
        borderColor: 'rgba(74,156,110,0.25)',
        bgColor: 'rgba(74,156,110,0.07)',
    },
};

export default function WinnerModal({ winner, players, sequencesToWin, onPlayAgain }) {
    const navigate = useNavigate();
    if (!winner) return null;

    const cfg = TEAM_CONFIG[winner] || TEAM_CONFIG.blue;
    const winnerPlayer = players
        ? Object.values(players).find(p => p.team === winner)
        : null;

    return (
        <div className="overlay" style={{ zIndex: 2000 }}>
            <div
                style={{
                    background: '#141414',
                    border: `1px solid ${cfg.borderColor}`,
                    borderRadius: '20px',
                    padding: '2.5rem',
                    maxWidth: '400px',
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: `0 0 50px ${cfg.glowColor}, 0 24px 60px rgba(0,0,0,0.8)`,
                    animation: 'modalUp 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
                    transform: 'translateY(20px)',
                    opacity: 0,
                }}
            >
                {/* Chip graphic */}
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 38% 32%, ${cfg.chipHighlight}, ${cfg.chipColor} 80%)`,
                    boxShadow: `0 0 24px ${cfg.glowColor}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    margin: '0 auto 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                        <path d="M4 22h16"></path>
                        <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34"></path>
                        <path d="M6 4h12v6a6 6 0 0 1-12 0V4z"></path>
                    </svg>
                </div>

                <h1 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: cfg.textColor,
                    marginBottom: '0.4rem',
                    textShadow: `0 0 20px ${cfg.glowColor}`,
                }}>
                    {cfg.label} Wins!
                </h1>

                {winnerPlayer && (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        Well played, <strong style={{ color: '#ede8dc' }}>{winnerPlayer.name}</strong>.
                    </p>
                )}

                <div style={{
                    display: 'inline-block',
                    background: cfg.bgColor,
                    border: `1px solid ${cfg.borderColor}`,
                    borderRadius: '100px',
                    padding: '0.3rem 0.9rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: cfg.textColor,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    margin: '0.5rem 0 2rem',
                }}>
                    {sequencesToWin} Sequence{sequencesToWin !== 1 ? 's' : ''} Completed
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {onPlayAgain && (
                        <button
                            onClick={onPlayAgain}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: '#c9a84c',
                                color: '#0d0d0d',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'background 0.15s',
                                fontFamily: "'Inter', system-ui, sans-serif",
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#e2c47a'}
                            onMouseLeave={(e) => e.target.style.background = '#c9a84c'}
                        >
                            Play Again
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            width: '100%',
                            padding: '0.7rem',
                            background: 'transparent',
                            color: 'rgba(255,255,255,0.4)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'color 0.15s, background 0.15s',
                            fontFamily: "'Inter', system-ui, sans-serif",
                        }}
                        onMouseEnter={(e) => { e.target.style.color = '#ede8dc'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                        onMouseLeave={(e) => { e.target.style.color = 'rgba(255,255,255,0.4)'; e.target.style.background = 'transparent'; }}
                    >
                        Main Menu
                    </button>
                </div>
            </div>
        </div>
    );
}
