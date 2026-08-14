import React from 'react';

export default function GameInfoPanel({ scores, deckCount, players, currentTurn, playingAs, config }) {
    const playerList = players ? Object.entries(players) : [];
    const teamColorClass = { blue: 'blue', red: 'red', green: 'green' };

    // Derive sequencesToWin from config; fallback to old heuristic
    const sequencesToWin = config?.sequencesToWin
        ?? (playerList.length === 3 ? 1 : 2);

    // Group players by team for team-play display
    const numTeams = config?.numTeams ?? (playerList.length <= 3 ? playerList.length : 2);
    const isTeamPlay = numTeams < playerList.length;

    const teams = {};
    for (const [key, player] of playerList) {
        const t = player.team || 'blue';
        if (!teams[t]) teams[t] = [];
        teams[t].push({ key, ...player });
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>

            {/* Players & Scores */}
            <div className="info-card">
                <div className="info-card-title">
                    {isTeamPlay ? 'Teams' : 'Players'}
                </div>

                {isTeamPlay ? (
                    /* Team view: group by color */
                    Object.entries(teams).map(([teamColor, members]) => {
                        const score = scores?.[teamColor] ?? 0;
                        const isActive = members.some(m => m.key === currentTurn);
                        return (
                            <div key={teamColor} style={{ marginBottom: '0.4rem' }}>
                                <div className={`player-row ${isActive ? 'active' : ''}`} style={{ marginBottom: '0.15rem' }}>
                                    <div className={`player-dot ${teamColorClass[teamColor]}`} />
                                    <span className="player-name" style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                                        {teamColor} Team
                                    </span>
                                    {isActive && (
                                        <div className={`turn-pulse ${teamColor}`} style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0 }} />
                                    )}
                                    <span className={`player-score ${teamColorClass[teamColor]}`}>{score}</span>
                                </div>
                                {members.map(m => {
                                    const isTurn = m.key === currentTurn;
                                    const isMe = playingAs && m.name === playingAs;
                                    return (
                                        <div key={m.key} style={{
                                            paddingLeft: '1.25rem', fontSize: '0.75rem',
                                            color: isTurn ? '#ede8dc' : 'rgba(255,255,255,0.4)',
                                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                                            marginBottom: '0.1rem',
                                        }}>
                                            {isTurn && <span style={{ fontSize: '0.6rem' }}>▶</span>}
                                            {m.name}{isMe && <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(You)</span>}
                                            {m.isCpu && <span style={{ fontSize: '0.6rem', color: '#b78df5' }}>[CPU]</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })
                ) : (
                    /* Individual view */
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
                                        {player.isCpu && <span style={{ color: '#b78df5', fontSize: '0.68rem', marginLeft: '4px' }}>[CPU]</span>}
                                    </span>
                                    {isActive && (
                                        <div className={`turn-pulse ${team}`} style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0 }} />
                                    )}
                                    <span className={`player-score ${teamColorClass[team]}`}>{score}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
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

            {/* Deck */}
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
