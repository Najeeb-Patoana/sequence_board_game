import React from 'react';

export default function GameInfoPanel({ scores, deckCount, players, currentTurn, playingAs }) {
    const playerList = players ? Object.entries(players) : [];

    const teamLabel = { blue: 'Blue', red: 'Red', green: 'Green' };
    const teamColorClass = { blue: 'blue', red: 'red', green: 'green' };

    const sequencesToWin = playerList.length === 3 ? 1 : 2;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>

            {/* Players & Scores */}
            <div className="info-card">
                <div className="info-card-title">Players</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {playerList.map(([key, player]) => {
                        const isActive = key === currentTurn;
                        const team = player.team || 'blue';
                        const score = scores?.[team] ?? 0;
                        const isMe = playingAs && player.name === playingAs;

                        return (
                            <div key={key} className={`player-row ${isActive ? 'active' : ''}`}>
                                <div className={`player-dot ${teamColorClass[team]}`} />
                                <span className="player-name">
                                    {player.name}
                                    {isMe && <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>(You)</span>}
                                </span>
                                {isActive && (
                                    <div className={`turn-pulse ${team}`} style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0 }} />
                                )}
                                <span className={`player-score ${teamColorClass[team]}`}>{score}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Goal */}
            <div className="info-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Goal
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {sequencesToWin} Sequence{sequencesToWin > 1 ? 's' : ''}
                </span>
            </div>

            {/* Deck — card-back image stack */}
            <div className="deck-widget">
                <div className="deck-stack">
                    <img src="/cards/corner.svg" alt="" className="deck-stack-card" draggable={false} />
                    <img src="/cards/corner.svg" alt="" className="deck-stack-card" draggable={false} />
                    <img src="/cards/corner.svg" alt="" className="deck-stack-card" draggable={false} />
                    <div className="deck-stack-badge">{deckCount}</div>
                </div>
                <div className="deck-info">
                    <div className="deck-count">{deckCount}</div>
                    <div className="deck-label">Cards left</div>
                </div>
            </div>
        </div>
    );
}
