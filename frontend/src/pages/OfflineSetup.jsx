import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OfflineSetup() {
    const navigate = useNavigate();
    const [p1Name, setP1Name] = useState('Player 1');
    const [p2Name, setP2Name] = useState('Player 2');

    const handleStart = (e) => {
        e.preventDefault();
        if (p1Name.trim() && p2Name.trim()) {
            // Pass state to the game page
            navigate('/offline/game', { state: { p1Name: p1Name.trim(), p2Name: p2Name.trim() } });
        }
    };

    return (
        <div className="container max-w-lg mx-auto mt-12">
            <button className="text-muted hover:text-white mb-8 flex items-center gap-2 transition-colors" onClick={() => navigate('/')}>
                ← Back to Menu
            </button>

            <div className="glass-card p-8">
                <h2 className="text-3xl mb-8 text-center text-gradient">Local Game Setup</h2>
                
                <form onSubmit={handleStart} className="flex flex-col gap-6">
                    <div>
                        <label className="block text-sm text-[#60a5fa] mb-2 font-bold">Player 1 (Blue Team)</label>
                        <input 
                            type="text" 
                            className="input border-[#3b82f6]/50 focus:border-[#3b82f6]" 
                            placeholder="Enter name" 
                            value={p1Name} 
                            onChange={(e) => setP1Name(e.target.value)}
                            maxLength={15}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm text-[#f87171] mb-2 font-bold">Player 2 (Red Team)</label>
                        <input 
                            type="text" 
                            className="input border-[#ef4444]/50 focus:border-[#ef4444]" 
                            placeholder="Enter name" 
                            value={p2Name} 
                            onChange={(e) => setP2Name(e.target.value)}
                            maxLength={15}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary mt-4" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}>
                        Start Local Game
                    </button>
                </form>
            </div>
        </div>
    );
}
