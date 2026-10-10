import React from 'react';

const TEAM_STYLE = {
    blue:  { color: '#7aadde', bg: 'rgba(74,127,193,0.08)',  border: 'rgba(74,127,193,0.25)' },
    red:   { color: '#de7a7a', bg: 'rgba(193,74,74,0.08)',   border: 'rgba(193,74,74,0.25)' },
    green: { color: '#7ade9e', bg: 'rgba(74,156,110,0.08)',  border: 'rgba(74,156,110,0.25)' },
};

export default function PassDeviceScreen({ nextPlayerName, nextTeam, onReady }) {
    const ts = TEAM_STYLE[nextTeam] || TEAM_STYLE.blue;

    return (
        <div className="overlay" style={{ zIndex: 1000 }}>
            <div style={{
                background: '#141414',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '2.25rem',
                maxWidth: '380px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
                animation: 'modalUp 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards',
                transform: 'translateY(20px)',
                opacity: 0,
                fontFamily: "'Inter', system-ui, sans-serif",
            }}>
                {/* Icon */}
                <div style={{
                    width: '52px',
                    height: '52px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                        <line x1="12" y1="18" x2="12.01" y2="18"></line>
                    </svg>
                </div>

                <h2 style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#ede8dc',
                    marginBottom: '0.4rem',
                }}>
                    Pass the Device
                </h2>

                <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                    Hand it to the next player before pressing ready.
                </p>

                {/* Player highlight */}
                <div style={{
                    background: ts.bg,
                    border: `1px solid ${ts.border}`,
                    borderRadius: '10px',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.35rem' }}>
                        Next Up
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: ts.color, fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {nextPlayerName}
                    </div>
                </div>

                <button
                    onClick={onReady}
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
                        transition: 'background 0.15s ease',
                        fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#e2c47a'}
                    onMouseLeave={(e) => e.target.style.background = '#c9a84c'}
                >
                    I'm Ready →
                </button>
            </div>
        </div>
    );
}
