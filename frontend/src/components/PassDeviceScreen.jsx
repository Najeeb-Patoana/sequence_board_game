import React from 'react';

export default function PassDeviceScreen({ nextPlayerName, onReady }) {
    return (
        <div className="overlay" style={{ zIndex: 1000 }}>
            <div className="glass-card p-8 text-center" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-3xl mb-4 text-gradient">Pass The Device</h2>
                
                <div className="my-8">
                    <p className="text-xl mb-2">It's <strong>{nextPlayerName}</strong>'s turn.</p>
                    <p className="text-muted">
                        Make sure only {nextPlayerName} is looking at the screen to keep cards hidden.
                    </p>
                </div>
                
                <button className="btn btn-primary w-full" onClick={onReady}>
                    I'm Ready
                </button>
            </div>
        </div>
    );
}
