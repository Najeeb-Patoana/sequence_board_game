import React from 'react';

export default function GameInfoPanel({ scores, deckCount, players, playingAs }) {
    
    return (
        <div className="glass-card p-4">
            <h2 className="text-center mb-4 text-gradient">Game Info</h2>
            
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-muted">Goal</span>
                    <span className="font-heading font-bold">2 Sequences</span>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[#60a5fa] font-bold">{players.player1.name} {playingAs === 'player1' ? '(You)' : ''}</span>
                        <span className="text-sm text-muted">Blue Team</span>
                    </div>
                    <span className="font-heading text-2xl font-bold">{scores?.blue || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[#f87171] font-bold">{players.player2.name} {playingAs === 'player2' ? '(You)' : ''}</span>
                        <span className="text-sm text-muted">Red Team</span>
                    </div>
                    <span className="font-heading text-2xl font-bold">{scores?.red || 0}</span>
                </div>
                
                <div className="flex justify-between items-center border-t border-gray-700 pt-2 mt-2">
                    <span className="text-muted">Cards in Deck</span>
                    <span className="font-mono">{deckCount}</span>
                </div>
            </div>
        </div>
    );
}
