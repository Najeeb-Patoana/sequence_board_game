import React from 'react';

export default function DeckDisplay({ count }) {
    return (
        <div style={{ position: 'relative', width: '100px', height: '140px' }}>
            <div className="hand-card" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
                <img src="/cards/corner.svg" alt="Deck back" />
            </div>
            <div className="hand-card" style={{ position: 'absolute', top: '-4px', left: '-4px', zIndex: 2 }}>
                <img src="/cards/corner.svg" alt="Deck back" />
            </div>
            <div className="hand-card" style={{ position: 'absolute', top: '-8px', left: '-8px', zIndex: 3 }}>
                <img src="/cards/corner.svg" alt="Deck back" />
            </div>
            <div 
                style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    background: '#10b981',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    zIndex: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
            >
                {count}
            </div>
        </div>
    );
}
