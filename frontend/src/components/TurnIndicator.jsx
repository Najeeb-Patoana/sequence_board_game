import React from 'react';

export default function TurnIndicator({ currentTurn, playingAs, players, isOffline }) {
    if (!players || !currentTurn || !players[currentTurn]) return null;

    const isMyTurn = currentTurn === playingAs;
    // Derive team from the player object — fixes the player3/green bug
    const team = players[currentTurn].team || 'blue';
    const currentPlayerName = players[currentTurn].name;

    let text = '';
    if (isOffline) {
        text = `${currentPlayerName}'s Turn`;
    } else {
        text = isMyTurn ? 'YOUR TURN' : `${currentPlayerName}'s turn…`;
    }

    return (
        <div className={`turn-indicator ${team}`}>
            <div className={`turn-pulse ${team}`} />
            <span>{text}</span>
            {!isMyTurn && !isOffline && <div className="spinner" />}
        </div>
    );
}
