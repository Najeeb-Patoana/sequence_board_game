import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OfflineSetup() {
    const navigate = useNavigate();
    const [p1Name, setP1Name] = useState('Player 1');
    const [p2Name, setP2Name] = useState('Player 2');
    const [p3Name, setP3Name] = useState('Player 3');
    const [numPlayers, setNumPlayers] = useState(2);
    const [sequencesToWin, setSequencesToWin] = useState(2);

    const handleStart = (e) => {
        e.preventDefault();
        if (p1Name.trim() && p2Name.trim() && (numPlayers === 2 || p3Name.trim())) {
            navigate('/offline/game', { 
                state: { 
                    p1Name: p1Name.trim(), 
                    p2Name: p2Name.trim(),
                    p3Name: numPlayers === 3 ? p3Name.trim() : null,
                    sequencesToWin
                } 
            });
        }
    };

    return (
        <div className="container max-w-lg mx-auto mt-12 flex flex-col items-center">
            <button className="btn btn-secondary flex items-center gap-2 self-start py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10 mb-8" onClick={() => navigate('/')}>
                ← Back to Menu
            </button>

            <div className="glass-card p-8 w-full">
                <h2 className="text-3xl mb-8 text-center text-gradient">Local Game Setup</h2>
                
                <form onSubmit={handleStart} className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                            <label className="block text-sm text-muted mb-2">Players</label>
                            <select className="input w-full" value={numPlayers} onChange={(e) => setNumPlayers(Number(e.target.value))}>
                                <option value={2}>2 Players</option>
                                <option value={3}>3 Players</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-muted mb-2">Sequences to Win</label>
                            <select className="input w-full" value={sequencesToWin} onChange={(e) => setSequencesToWin(Number(e.target.value))}>
                                <option value={1}>1 Sequence</option>
                                <option value={2}>2 Sequences</option>
                                <option value={3}>3 Sequences</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-[#60a5fa] mb-2 font-bold">Player 1 (Blue Team)</label>
                        <input type="text" className="input border-[#3b82f6]/50 focus:border-[#3b82f6]" value={p1Name} onChange={(e) => setP1Name(e.target.value)} maxLength={15} required />
                    </div>
                    
                    <div>
                        <label className="block text-sm text-[#f87171] mb-2 font-bold">Player 2 (Red Team)</label>
                        <input type="text" className="input border-[#ef4444]/50 focus:border-[#ef4444]" value={p2Name} onChange={(e) => setP2Name(e.target.value)} maxLength={15} required />
                    </div>
                    
                    {numPlayers === 3 && (
                        <div>
                            <label className="block text-sm text-[#10b981] mb-2 font-bold">Player 3 (Green Team)</label>
                            <input type="text" className="input border-[#10b981]/50 focus:border-[#10b981]" value={p3Name} onChange={(e) => setP3Name(e.target.value)} maxLength={15} required />
                        </div>
                    )}
                    
                    <button type="submit" className="btn btn-primary mt-4" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}>
                        Start Local Game
                    </button>
                </form>
            </div>
        </div>
    );
}
