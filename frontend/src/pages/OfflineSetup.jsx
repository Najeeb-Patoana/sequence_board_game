import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deriveNumTeams, deriveSequencesToWin } from '../engine/gameEngine';
import { sanitiseName } from '../utils/sanitise';

const TEAM_COLORS = ['blue', 'red', 'green'];
const TEAM_STYLES = {
    blue:  { label: 'Blue Team',  color: '#7aadde', border: 'rgba(74,127,193,0.32)',  bg: 'rgba(74,127,193,0.07)',  dot: '#4a7fc1'  },
    red:   { label: 'Red Team',   color: '#de7a7a', border: 'rgba(193,74,74,0.32)',   bg: 'rgba(193,74,74,0.07)',   dot: '#c14a4a'  },
    green: { label: 'Green Team', color: '#7ade9e', border: 'rgba(74,156,110,0.32)',  bg: 'rgba(74,156,110,0.07)',  dot: '#4a9c6e'  },
};

const PLAYER_COUNTS = [2, 3, 4];

/** Returns the team color for a player slot given numPlayers and numTeams. */
function slotTeamColor(slotIndex, numPlayers, numTeams) {
    if (numTeams === numPlayers) return TEAM_COLORS[slotIndex]; // individual
    return TEAM_COLORS[slotIndex % numTeams];
}

export default function OfflineSetup() {
    const navigate = useNavigate();
    const [numPlayers, setNumPlayers] = useState(2);
    const [names, setNames] = useState(['', '', '', '']);

    const numTeams = deriveNumTeams(numPlayers);
    const sequencesToWin = deriveSequencesToWin(numTeams);
    const isTeamPlay = numTeams < numPlayers;

    const handleNameChange = (idx, val) => {
        // Sanitise in real-time so nothing invalid can even be typed in
        const safe = sanitiseName(val);
        setNames(prev => {
            const next = [...prev];
            next[idx] = safe;
            return next;
        });
    };

    const handleStart = (e) => {
        e.preventDefault();
        const playerNames = Array.from({ length: numPlayers }, (_, i) =>
            sanitiseName(names[i]) || `Player ${i + 1}`
        );
        navigate('/offline/game', {
            state: { playerNames, numPlayers },
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0d0d0d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            fontFamily: "'Inter', system-ui, sans-serif",
            backgroundImage: 'radial-gradient(ellipse 60% 35% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 65%)',
        }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>

                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'none', border: 'none',
                        color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        gap: '0.4rem', marginBottom: '1.5rem', padding: 0,
                        transition: 'color 0.15s', fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                >
                    ← Back
                </button>

                <div style={{
                    background: '#111',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.65)',
                }}>
                    {/* Gold top strip */}
                    <div style={{
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.6) 50%, transparent 100%)',
                    }} />

                    {/* Header */}
                    <div style={{
                        padding: '1.75rem 1.75rem 1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <p style={{
                            fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.22em',
                            textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)',
                            marginBottom: '0.4rem',
                        }}>Pass &amp; Play</p>
                        <h1 style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: '1.55rem', fontWeight: 900,
                            color: '#ede8dc', letterSpacing: '-0.01em', lineHeight: 1.1,
                        }}>Local Game Setup</h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleStart} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Player count */}
                        <div>
                            <label style={{
                                display: 'block', fontSize: '0.65rem', fontWeight: 700,
                                color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase',
                                letterSpacing: '0.12em', marginBottom: '0.35rem',
                            }}>Number of Players</label>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                {PLAYER_COUNTS.map(n => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setNumPlayers(n)}
                                        style={{
                                            flex: 1, padding: '0.5rem',
                                            background: numPlayers === n ? 'rgba(201,168,76,0.12)' : '#1a1a1a',
                                            border: `1px solid ${numPlayers === n ? 'rgba(201,168,76,0.45)' : 'rgba(255,255,255,0.1)'}`,
                                            color: numPlayers === n ? '#c9a84c' : 'rgba(255,255,255,0.5)',
                                            borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700,
                                            cursor: 'pointer', transition: 'all 0.15s',
                                            fontFamily: "'Inter', system-ui, sans-serif",
                                        }}
                                    >{n} Players</button>
                                ))}
                            </div>
                        </div>

                        {/* Game info badge */}
                        <div style={{
                            background: 'rgba(201,168,76,0.05)',
                            border: '1px solid rgba(201,168,76,0.15)',
                            borderRadius: '8px', padding: '0.65rem 0.9rem',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                                {isTeamPlay ? `${numTeams} Teams` : 'Individual Play'} · Win Condition
                            </span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c9a84c' }}>
                                {sequencesToWin} Sequence{sequencesToWin > 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                Player Names
                            </span>
                            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                        </div>

                        {/* Player name inputs */}
                        {Array.from({ length: numPlayers }, (_, i) => {
                            const teamColor = slotTeamColor(i, numPlayers, numTeams);
                            const ts = TEAM_STYLES[teamColor];
                            return (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <label style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        fontSize: '0.68rem', fontWeight: 700, color: ts.color,
                                        textTransform: 'uppercase', letterSpacing: '0.1em',
                                    }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: ts.dot, boxShadow: `0 0 6px ${ts.dot}` }} />
                                        Player {i + 1}{isTeamPlay ? ` — ${ts.label}` : ''}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={`Player ${i + 1}`}
                                        value={names[i]}
                                        onChange={e => handleNameChange(i, e.target.value)}
                                        maxLength={15}
                                        style={{
                                            background: ts.bg,
                                            border: `1px solid ${ts.border}`,
                                            borderRadius: '8px',
                                            padding: '0.6rem 0.8rem',
                                            color: '#ede8dc',
                                            fontSize: '0.9rem',
                                            fontFamily: "'Inter', system-ui, sans-serif",
                                            outline: 'none',
                                            transition: 'border-color 0.15s, box-shadow 0.15s',
                                            width: '100%',
                                        }}
                                        onFocus={e => {
                                            e.target.style.borderColor = ts.color;
                                            e.target.style.boxShadow = `0 0 0 3px ${ts.bg}`;
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor = ts.border;
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            );
                        })}

                        <GoldButton style={{ marginTop: '0.5rem' }}>
                            Start Game →
                        </GoldButton>
                    </form>
                </div>
            </div>
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
                width: '100%', padding: '0.8rem',
                background: hov ? '#dbb855' : '#c9a84c',
                color: '#0d0d0d', border: 'none', borderRadius: '8px',
                fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                letterSpacing: '0.03em',
                transition: 'background 0.15s, transform 0.12s',
                transform: hov ? 'translateY(-1px)' : 'none',
                boxShadow: hov ? '0 4px 16px rgba(201,168,76,0.3)' : 'none',
                fontFamily: "'Inter', system-ui, sans-serif",
                ...style,
            }}
        >{children}</button>
    );
}
