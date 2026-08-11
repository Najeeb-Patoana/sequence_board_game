import React from 'react';

export default function TurnIndicator({ currentTurn, playingAs, players, isOffline }) {
    const isMyTurn = currentTurn === playingAs;
    const teamColor = currentTurn === 'player1' ? 'blue' : 'red';
    const currentPlayerName = players[currentTurn].name;
    
    let text = '';
    
    if (isOffline) {
        text = `${currentPlayerName}'s Turn`;
    } else {
        text = isMyTurn ? 'YOUR TURN' : `Waiting for ${currentPlayerName}...`;
    }

    return (
        <div className={`turn-badge ${teamColor}`}>
            {!isMyTurn && !isOffline && <div className="spinner" style={{width: 16, height: 16, borderWidth: 2}}></div>}
            {text}
        </div>
    );
}
