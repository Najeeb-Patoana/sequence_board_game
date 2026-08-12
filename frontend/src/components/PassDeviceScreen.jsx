import React from 'react';

const TEAM_BG = {
    blue: { bg: 'var(--blue-dim)', border: 'rgba(59,130,246,0.25)', color: 'var(--blue-light)' },
    red:  { bg: 'var(--red-dim)',  border: 'rgba(232,64,64,0.25)',  color: 'var(--red-light)' },
    green:{ bg: 'var(--green-dim)',border: 'rgba(34,197,94,0.25)',  color: 'var(--green-light)' },
};

export default function PassDeviceScreen({ nextPlayerName, nextTeam, onReady }) {
    const style = TEAM_BG[nextTeam] || TEAM_BG.blue;

    return (
        <div className="overlay" style={{ zIndex: 1000 }}>
            <div className="modal-card text-center">
                {/* Icon */}
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📱</div>

                <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    marginBottom: '0.5rem',
                }}>
                    Pass the Device
                </h2>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Hand the screen to the next player.
                </p>

                <div style={{
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    borderRadius: 'var(--r-md)',
                    padding: '1rem',
                    marginBottom: '1.75rem',
                }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>
                        Next Player
                    </div>
                    <div style={{ color: style.color, fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                        {nextPlayerName}
                    </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '1.5rem' }}>
                    Make sure only <strong style={{ color: 'var(--text-secondary)' }}>{nextPlayerName}</strong> is looking at the screen before pressing ready.
                </p>

                <button className="btn btn-primary btn-lg w-full" onClick={onReady}>
                    I'm Ready →
                </button>
            </div>
        </div>
    );
}
