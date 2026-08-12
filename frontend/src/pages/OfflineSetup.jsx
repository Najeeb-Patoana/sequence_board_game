import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TEAM = {
    1: { label: 'Blue Team',  color: '#7aadde', border: 'rgba(74,127,193,0.32)',  bg: 'rgba(74,127,193,0.07)',  dot: '#4a7fc1'  },
    2: { label: 'Red Team',   color: '#de7a7a', border: 'rgba(193,74,74,0.32)',   bg: 'rgba(193,74,74,0.07)',   dot: '#c14a4a'  },
    3: { label: 'Green Team', color: '#7ade9e', border: 'rgba(74,156,110,0.32)',  bg: 'rgba(74,156,110,0.07)',  dot: '#4a9c6e'  },
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
        navigate('/offline/game', {
            state: {
                p1Name:        p1Name.trim() || 'Player 1',
                p2Name:        p2Name.trim() || 'Player 2',
                p3Name:        numPlayers === 3 ? (p3Name.trim() || 'Player 3') : null,
                sequencesToWin,
            },
        });
    };

    const players = [1, 2, ...(numPlayers === 3 ? [3] : [])];
    const vals    = [p1Name, p2Name, p3Name];
    const setters = [setP1Name, setP2Name, setP3Name];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0d0d0d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            fontFamily: "'Inter', system-ui, sans-serif",
            /* Subtle top glow matching homepage */
            backgroundImage: 'radial-gradient(ellipse 60% 35% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 65%)',
        }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>

                {/* Back link */}
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        marginBottom: '1.5rem',
                        padding: 0,
                        transition: 'color 0.15s',
                        fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                >
                    ← Back
                </button>

                {/* Main card */}
                <div style={{
                    background: '#111',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.65)',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.75rem 1.75rem 1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Gold top rule */}
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.6) 50%, transparent 100%)',
                        }} />
                        <p style={{
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: 'rgba(201,168,76,0.55)',
                            marginBottom: '0.4rem',
                        }}>
                            Pass &amp; Play
                        </p>
                        <h1 style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: '1.55rem',
                            fontWeight: 900,
                            color: '#ede8dc',
                            letterSpacing: '-0.01em',
                            lineHeight: 1.1,
                        }}>
                            Local Game Setup
                        </h1>
                    </div>

                    {/* Form body */}
                    <form onSubmit={handleStart} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Settings row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <SettingField
                                label="Players"
                                value={numPlayers}
                                onChange={(v) => setNumPlayers(Number(v))}
                            >
                                <option value={2}>2 Players</option>
                                <option value={3}>3 Players</option>
                            </SettingField>
                            <SettingField
                                label="Sequences to Win"
                                value={sequencesToWin}
                                onChange={(v) => setSequencesToWin(Number(v))}
                            >
                                <option value={1}>1 Sequence</option>
                                <option value={2}>2 Sequences</option>
                                <option value={3}>3 Sequences</option>
                            </SettingField>
                        </div>

                        {/* Divider with label */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                Players
                            </span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                        </div>

                        {/* Player name inputs */}
                        {players.map((n) => {
                            const t = TEAM[n];
                            return (
                                <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        color: t.color,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                    }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot, boxShadow: `0 0 6px ${t.dot}` }} />
                                        Player {n} — {t.label}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={`Player ${n}`}
                                        value={vals[n - 1]}
                                        onChange={(e) => setters[n - 1](e.target.value)}
                                        maxLength={15}
                                        style={{
                                            background: t.bg,
                                            border: `1px solid ${t.border}`,
                                            borderRadius: '8px',
                                            padding: '0.6rem 0.8rem',
                                            color: '#ede8dc',
                                            fontSize: '0.9rem',
                                            fontFamily: "'Inter', system-ui, sans-serif",
                                            outline: 'none',
                                            transition: 'border-color 0.15s, box-shadow 0.15s',
                                            width: '100%',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = t.color;
                                            e.target.style.boxShadow = `0 0 0 3px ${t.bg}`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = t.border;
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            );
                        })}

                        {/* Submit */}
                        <GoldButton style={{ marginTop: '0.5rem' }}>
                            Start Game →
                        </GoldButton>
                    </form>
                </div>
            </div>
        </div>
    );
}

/* ── Sub-components ──────────────────────────────────────── */

function SettingField({ label, value, onChange, children }) {
    return (
        <div>
            <label style={{
                display: 'block',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.28)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: '0.35rem',
            }}>
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: '100%',
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '0.55rem 0.75rem',
                    color: '#ede8dc',
                    fontSize: '0.85rem',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.6rem center',
                    paddingRight: '2rem',
                }}
            >
                {children}
            </select>
        </div>
    );
}

function GoldButton({ children, style = {}, ...props }) {
    const [hov, setHov] = useState(false);
    return (
        <button
            {...props}
            type="submit"
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                width: '100%',
                padding: '0.8rem',
                background: hov ? '#dbb855' : '#c9a84c',
                color: '#0d0d0d',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.03em',
                transition: 'background 0.15s, transform 0.12s',
                transform: hov ? 'translateY(-1px)' : 'none',
                boxShadow: hov ? '0 4px 16px rgba(201,168,76,0.3)' : 'none',
                fontFamily: "'Inter', system-ui, sans-serif",
                ...style,
            }}
        >
            {children}
        </button>
    );
}
