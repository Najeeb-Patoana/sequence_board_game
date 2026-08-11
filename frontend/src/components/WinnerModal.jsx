import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function WinnerModal({ winner, onPlayAgain }) {
    const navigate = useNavigate();
    
    if (!winner) return null;

    const teamName = winner === 'blue' ? 'Blue Team' : 'Red Team';
    const colorClass = winner === 'blue' ? 'text-[#3b82f6]' : 'text-[#ef4444]';

    return (
        <div className="overlay" style={{ zIndex: 2000 }}>
            <div className="glass-card p-8 text-center" style={{ maxWidth: '400px', width: '100%', animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                <h1 className="text-4xl mb-2">🎉 SEQUENCE!</h1>
                
                <div className="my-8">
                    <p className="text-2xl mb-2">
                        <strong className={colorClass}>{teamName}</strong> Wins!
                    </p>
                    <p className="text-muted">
                        They completed 2 sequences.
                    </p>
                </div>
                
                <div className="flex flex-col gap-4">
                    {onPlayAgain && (
                        <button className="btn btn-primary w-full" onClick={onPlayAgain}>
                            Play Again
                        </button>
                    )}
                    <button className="btn btn-outline w-full" onClick={() => navigate('/')}>
                        Main Menu
                    </button>
                </div>
            </div>
        </div>
    );
}
