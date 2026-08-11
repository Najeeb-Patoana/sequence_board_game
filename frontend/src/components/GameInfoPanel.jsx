import React from 'react';

export default function GameInfoPanel({ scores, deckCount, players, playingAs }) {
    return (
        <div className="glass-card p-6 flex flex-col gap-6">
            <h2 className="text-center mb-4 text-gradient">Game Info</h2>
            
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-muted">Goal</span>
                    <span className="font-heading font-bold">{players && Object.keys(players).length === 3 ? "1 Sequence (3 Teams)" : "2 Sequences"}</span>
                </div>
                
                {/* Team Scores */}
                <div className="flex flex-col gap-3 mt-2">
                    {/* Blue Team */}
                    <div className="flex justify-between items-center bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                        <span className="text-blue-400 font-bold flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                            Blue
                            {playingAs && players && Object.values(players).find(p => p.team === 'blue' && p.name === playingAs) && ' (You)'}
                        </span>
                        <span className="text-2xl font-bold">{scores.blue || 0}</span>
                    </div>

                    {/* Red Team */}
                    <div className="flex justify-between items-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        <span className="text-red-400 font-bold flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                            Red
                            {playingAs && players && Object.values(players).find(p => p.team === 'red' && p.name === playingAs) && ' (You)'}
                        </span>
                        <span className="text-2xl font-bold">{scores.red || 0}</span>
                    </div>

                    {/* Green Team (if 3 players) */}
                    {scores.green !== undefined && (
                        <div className="flex justify-between items-center bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                            <span className="text-green-400 font-bold flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                                Green
                                {playingAs && players && Object.values(players).find(p => p.team === 'green' && p.name === playingAs) && ' (You)'}
                            </span>
                            <span className="text-2xl font-bold">{scores.green || 0}</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Deck Info */}
            <div className="glass-card p-4 text-center mt-4">
                <h3 className="text-sm text-muted uppercase tracking-wider mb-2 font-semibold">Deck</h3>
                <div className="text-3xl font-bold text-white mb-1">
                    {deckCount} <span className="text-lg text-muted font-normal">/ 104</span>
                </div>
                <div className="text-sm text-muted">Cards Remaining</div>
            </div>
        </div>
    );
}
