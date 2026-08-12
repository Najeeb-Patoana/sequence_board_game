import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PLAYER_COLORS = {
    1: { label: 'Blue Team', color: '#60a5fa', accent: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)' },
    2: { label: 'Red Team',  color: '#f87171', accent: 'rgba(232,64,64,0.15)',  border: 'rgba(232,64,64,0.35)' },
    3: { label: 'Green Team',color: '#4ade80', accent: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.35)' },
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
        const name1 = p1Name.trim() || 'Player 1';
        const name2 = p2Name.trim() || 'Player 2';
        const name3 = p3Name.trim() || 'Player 3';

        if (name1 && name2 && (numPlayers === 2 || name3)) {
            navigate('/offline/game', {
                state: {
                    p1Name: name1,
                    p2Name: name2,
                    p3Name: numPlayers === 3 ? name3 : null,
                    sequencesToWin,
                },
            });
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            background: 'var(--bg-base)',
        }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
                {/* Back */}
                <button
                    className="btn btn-ghost"
                    style={{ marginBottom: '1.5rem', fontSize: '0.82rem' }}
                    onClick={() => navigate('/')}
                >
                    ← Back
                </button>

                <div className="glass-card" style={{ padding: '2rem' }}>
                    {/* Title */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.75rem',
                            fontWeight: 900,
                            color: 'var(--text-primary)',
                            marginBottom: '0.35rem',
                        }}>
                            Local Game
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Set up your pass-and-play session
                        </p>
                    </div>

                    <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* Game settings row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                                    Players
                                </label>
                                <select
                                    className="input"
                                    value={numPlayers}
                                    onChange={(e) => setNumPlayers(Number(e.target.value))}
                                >
                                    <option value={2}>2 Players</option>
                                    <option value={3}>3 Players</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                                    Sequences to Win
                                </label>
                                <select
                                    className="input"
                                    value={sequencesToWin}
                                    onChange={(e) => setSequencesToWin(Number(e.target.value))}
                                >
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                </select>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="divider" />

                        {/* Player fields */}
                        {[1, 2, ...(numPlayers === 3 ? [3] : [])].map((n) => {
                            const cfg = PLAYER_COLORS[n];
                            const value = n === 1 ? p1Name : n === 2 ? p2Name : p3Name;
                            const setter = n === 1 ? setP1Name : n === 2 ? setP2Name : setP3Name;
                            const placeholder = `Player ${n}`;

                            return (
                                <div key={n}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        color: cfg.color,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        marginBottom: '0.4rem',
                                    }}>
                                        <span style={{
                                            width: '8px', height: '8px',
                                            borderRadius: '50%',
                                            background: cfg.color,
                                            display: 'inline-block',
                                        }} />
                                        Player {n} — {cfg.label}
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        style={{
                                            borderColor: cfg.border,
                                            background: cfg.accent,
                                        }}
                                        placeholder={placeholder}
                                        value={value}
                                        onChange={(e) => setter(e.target.value)}
                                        maxLength={15}
                                    />
                                </div>
                            );
                        })}

                        <button
                            type="submit"
                            className="btn btn-success btn-lg w-full"
                            style={{ marginTop: '0.5rem' }}
                        >
                            Start Game →
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
