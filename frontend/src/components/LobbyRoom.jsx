import React, { useState } from 'react';

const TEAM_STYLES = {
    blue:  { color: '#7aadde', dot: '#4a7fc1', bg: 'rgba(74,127,193,0.10)', border: 'rgba(74,127,193,0.28)' },
    red:   { color: '#de7a7a', dot: '#c14a4a', bg: 'rgba(193,74,74,0.10)',  border: 'rgba(193,74,74,0.28)'  },
    green: { color: '#7ade9e', dot: '#4a9c6e', bg: 'rgba(74,156,110,0.10)', border: 'rgba(74,156,110,0.28)' },
};

function PlayerSlot({ player, isMe }) {
    const ts = TEAM_STYLES[player.team] || TEAM_STYLES.blue;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            padding: '0.65rem 0.85rem',
            background: isMe ? ts.bg : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isMe ? ts.border : 'rgba(255,255,255,0.07)'}`,
            borderRadius: '10px',
            transition: 'all 0.2s',
        }}>
            {/* Team dot */}
            <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: ts.dot,
                boxShadow: `0 0 6px ${ts.dot}`,
                flexShrink: 0,
            }} />

            {/* CPU / Name */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '0.875rem', fontWeight: 600,
                    color: isMe ? ts.color : '#ede8dc',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                    {player.name}
                    {isMe && <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>(You)</span>}
                    {player.isCpu && (
                        <span style={{
                            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
                            background: 'rgba(150,100,220,0.15)', border: '1px solid rgba(150,100,220,0.3)',
                            color: '#b78df5', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase',
                        }}>CPU</span>
                    )}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '1px', textTransform: 'capitalize' }}>
                    {player.team} team
                </div>
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                {player.isHost && (
                    <span title="Host" style={{ fontSize: '0.9rem' }}>👑</span>
                )}
                {player.isReady ? (
                    <span style={{
                        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
                        background: 'rgba(52,199,89,0.12)', border: '1px solid rgba(52,199,89,0.3)',
                        color: '#34c759', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase',
                    }}>Ready ✓</span>
                ) : (
                    <span style={{
                        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em',
                        background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.22)',
                        color: 'rgba(255,200,0,0.75)', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase',
                    }}>Waiting…</span>
                )}
            </div>
        </div>
    );
}

function EmptySlot({ index }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            padding: '0.65rem 0.85rem',
            background: 'rgba(255,255,255,0.015)',
            border: '1px dashed rgba(255,255,255,0.08)',
            borderRadius: '10px',
        }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
                Slot {index} — waiting for player…
            </span>
        </div>
    );
}

export default function LobbyRoom({
    lobbyState,
    roomInfo,
    myPlayerKey,
    isHost,
    onToggleReady,
    onAddCpu,
    onStartGame,
    onLeave,
}) {
    const [copied, setCopied] = useState(false);

    if (!lobbyState) return null;

    const { players, targetPlayerCount, numTeams, roomCode, canStart } = lobbyState;
    const myPlayer = players.find(p => p.playerKey === myPlayerKey);

    const shareUrl = roomCode
        ? `${window.location.origin}/online/room/${roomCode}`
        : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const slotsToShow = Array.from({ length: targetPlayerCount }, (_, i) => {
        return players[i] || null;
    });

    const numTeamsLabel = numTeams === targetPlayerCount
        ? 'Individual play'
        : `${numTeams} teams`;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0d0d0d',
            backgroundImage: 'radial-gradient(ellipse 55% 35% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 65%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>
            <div style={{ width: '100%', maxWidth: '480px' }}>

                {/* Back */}
                <button onClick={onLeave} style={{
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                    fontSize: '0.8rem', cursor: 'pointer', marginBottom: '1.5rem',
                    display: 'flex', alignItems: 'center', gap: '0.35rem', padding: 0,
                    transition: 'color 0.15s',
                }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                   onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                    ← Leave Room
                </button>

                <div style={{
                    background: '#111', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px', overflow: 'hidden',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                }}>
                    {/* Gold top strip */}
                    <div style={{
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.7), transparent)',
                    }} />

                    {/* Header */}
                    <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)', marginBottom: '0.3rem' }}>
                                    Game Lobby
                                </p>
                                <h1 style={{
                                    fontFamily: "'Playfair Display', Georgia, serif",
                                    fontSize: '1.4rem', fontWeight: 900, color: '#ede8dc', lineHeight: 1.1,
                                }}>
                                    Sequence
                                </h1>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>
                                    {targetPlayerCount} players · {numTeamsLabel}
                                </div>
                                <div style={{
                                    fontSize: '0.65rem', fontWeight: 700,
                                    color: 'rgba(201,168,76,0.8)', letterSpacing: '0.15em', textTransform: 'uppercase',
                                }}>
                                    Win: {numTeams === 3 ? '1' : '2'} sequence{numTeams === 3 ? '' : 's'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* Room Code */}
                        {roomCode && (
                            <div>
                                <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.5rem' }}>
                                    Room Code
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div style={{
                                        flex: 1, fontFamily: 'monospace',
                                        fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.25em',
                                        color: '#c9a84c', textAlign: 'center',
                                        background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)',
                                        borderRadius: '10px', padding: '0.5rem 0',
                                    }}>{roomCode}</div>
                                    <button onClick={handleCopy} style={{
                                        background: copied ? 'rgba(52,199,89,0.12)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${copied ? 'rgba(52,199,89,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                        color: copied ? '#34c759' : 'rgba(255,255,255,0.6)',
                                        borderRadius: '8px', padding: '0.55rem 0.85rem',
                                        fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                                        transition: 'all 0.2s', whiteSpace: 'nowrap',
                                    }}>{copied ? '✓ Copied' : 'Copy Link'}</button>
                                </div>
                            </div>
                        )}

                        {/* Player Slots */}
                        <div>
                            <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.5rem' }}>
                                Players ({players.length}/{targetPlayerCount})
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                {slotsToShow.map((player, i) =>
                                    player
                                        ? <PlayerSlot key={player.playerKey} player={player} isMe={player.playerKey === myPlayerKey} />
                                        : <EmptySlot key={`empty-${i}`} index={i + 1} />
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

                            {/* Ready toggle (non-hosts) */}
                            {!isHost && myPlayer && (
                                <button
                                    onClick={onToggleReady}
                                    id="btn-toggle-ready"
                                    style={{
                                        width: '100%', padding: '0.75rem',
                                        background: myPlayer.isReady
                                            ? 'rgba(193,74,74,0.12)'
                                            : 'rgba(52,199,89,0.12)',
                                        border: `1px solid ${myPlayer.isReady ? 'rgba(193,74,74,0.3)' : 'rgba(52,199,89,0.3)'}`,
                                        color: myPlayer.isReady ? '#de7a7a' : '#34c759',
                                        borderRadius: '9px', fontSize: '0.875rem', fontWeight: 700,
                                        cursor: 'pointer', transition: 'all 0.2s',
                                        fontFamily: "'Inter', system-ui, sans-serif",
                                    }}
                                >
                                    {myPlayer.isReady ? '✗ Cancel Ready' : '✓ Ready Up'}
                                </button>
                            )}

                            {/* Add CPU (host) */}
                            {isHost && players.length < targetPlayerCount && (
                                <button
                                    onClick={() => onAddCpu('random')}
                                    id="btn-add-cpu"
                                    style={{
                                        width: '100%', padding: '0.65rem',
                                        background: 'rgba(150,100,220,0.08)',
                                        border: '1px solid rgba(150,100,220,0.22)',
                                        color: '#b78df5',
                                        borderRadius: '9px', fontSize: '0.8rem', fontWeight: 600,
                                        cursor: 'pointer', transition: 'all 0.2s',
                                        fontFamily: "'Inter', system-ui, sans-serif",
                                    }}
                                >
                                    + Add CPU Player
                                </button>
                            )}

                            {/* Start game (host) */}
                            {isHost && (
                                <button
                                    onClick={onStartGame}
                                    disabled={!canStart}
                                    id="btn-start-game"
                                    style={{
                                        width: '100%', padding: '0.85rem',
                                        background: canStart
                                            ? 'linear-gradient(135deg, #c9a84c 0%, #dbb855 100%)'
                                            : 'rgba(255,255,255,0.04)',
                                        border: canStart
                                            ? 'none'
                                            : '1px solid rgba(255,255,255,0.08)',
                                        color: canStart ? '#0d0d0d' : 'rgba(255,255,255,0.2)',
                                        borderRadius: '10px', fontSize: '0.9rem', fontWeight: 800,
                                        cursor: canStart ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s',
                                        fontFamily: "'Inter', system-ui, sans-serif",
                                        letterSpacing: '0.02em',
                                    }}
                                >
                                    {canStart
                                        ? 'Start Game →'
                                        : `Waiting for ${targetPlayerCount - players.length > 0
                                            ? `${targetPlayerCount - players.length} more player${targetPlayerCount - players.length > 1 ? 's' : ''}`
                                            : 'players to ready up'}…`
                                    }
                                </button>
                            )}

                            {/* Non-host waiting message */}
                            {!isHost && (
                                <div style={{
                                    textAlign: 'center', fontSize: '0.78rem',
                                    color: 'rgba(255,255,255,0.25)', padding: '0.5rem',
                                }}>
                                    {canStart
                                        ? 'All ready! Waiting for host to start…'
                                        : 'Waiting for all players to ready up…'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
