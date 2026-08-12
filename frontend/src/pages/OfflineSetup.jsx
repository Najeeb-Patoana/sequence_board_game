import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TEAM = {
    1: { label: 'Blue Team',  color: '#7aadde', border: 'rgba(74,127,193,0.3)',  bg: 'rgba(74,127,193,0.08)'  },
    2: { label: 'Red Team',   color: '#de7a7a', border: 'rgba(193,74,74,0.3)',   bg: 'rgba(193,74,74,0.08)'   },
    3: { label: 'Green Team', color: '#7ade9e', border: 'rgba(74,156,110,0.3)',  bg: 'rgba(74,156,110,0.08)'  },
};

export default function OfflineSetup() {
    const navigate = useNavigate();
    const [p1Name, setP1Name] = useState('');
    const [p2Name, setP2Name] = useState('');
    const [p3Name, setP3Name] = useState('');
    const [numPlayers, setNumPlayers] = useState(2);
    const [sequencesToWin, setSequencesToWin] = useState(2);

    const handleStart = (e) => {
        e.preventDefault();
        const n1 = p1Name.trim() || 'Player 1';
        const n2 = p2Name.trim() || 'Player 2';
        const n3 = p3Name.trim() || 'Player 3';
        navigate('/offline/game', {
            state: {
                p1Name: n1,
                p2Name: n2,
                p3Name: numPlayers === 3 ? n3 : null,
                sequencesToWin,
            },
        });
    };

    const players = [1, 2, ...(numPlayers === 3 ? [3] : [])];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0d0d0d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>

                {/* Back */}
                <button
                    className="btn btn-ghost"
                    onClick={() => navigate('/')}
                    style={{ marginBottom: '1.25rem', fontSize: '0.8rem' }}
                >
                    ← Back
                </button>

                <div style={{
                    background: '#141414',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                        <h1 style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: '1.6rem',
                            fontWeight: 900,
                            color: '#ede8dc',
                            marginBottom: '0.3rem',
                        }}>
                            Local Game
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>
                            Pass &amp; play on one screen
                        </p>
                    </div>

                    {/* Thin divider */}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.5rem' }} />

                    <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

                        {/* Settings row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label style={labelStyle}>Players</label>
                                <select
                                    className="input"
                                    value={numPlayers}
                                    onChange={(e) => setNumPlayers(Number(e.target.value))}
                                    style={selectExtra}
                                >
                                    <option value={2}>2 Players</option>
                                    <option value={3}>3 Players</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Sequences to Win</label>
                                <select
                                    className="input"
                                    value={sequencesToWin}
                                    onChange={(e) => setSequencesToWin(Number(e.target.value))}
                                    style={selectExtra}
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                </select>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

                        {/* Player name fields */}
                        {players.map((n) => {
                            const t = TEAM[n];
                            const val = n === 1 ? p1Name : n === 2 ? p2Name : p3Name;
                            const set = n === 1 ? setP1Name : n === 2 ? setP2Name : setP3Name;
                            return (
                                <div key={n}>
                                    <label style={{ ...labelStyle, color: t.color, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.color, display: 'inline-block', flexShrink: 0 }} />
                                        Player {n} — {t.label}
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder={`Player ${n}`}
                                        value={val}
                                        onChange={(e) => set(e.target.value)}
                                        maxLength={15}
                                        style={{
                                            borderColor: t.border,
                                            background: t.bg,
                                        }}
                                    />
                                </div>
                            );
                        })}

                        {/* Submit */}
                        <button
                            type="submit"
                            style={{
                                marginTop: '0.5rem',
                                padding: '0.8rem',
                                background: '#c9a84c',
                                color: '#0d0d0d',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                letterSpacing: '0.03em',
                                transition: 'background 0.15s ease, transform 0.15s ease',
                                fontFamily: "'Inter', system-ui, sans-serif",
                            }}
                            onMouseEnter={(e) => { e.target.style.background = '#e2c47a'; e.target.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={(e) => { e.target.style.background = '#c9a84c'; e.target.style.transform = 'translateY(0)'; }}
                        >
                            Start Game →
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

const labelStyle = {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '0.4rem',
};

const selectExtra = {
    fontSize: '0.85rem',
};
