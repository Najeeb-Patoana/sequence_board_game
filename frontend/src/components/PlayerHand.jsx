import React, { useState } from 'react';

export default function PlayerHand({ hand, isMyTurn, selectedHandCard, onCardSelect, onCardHover }) {
    
    const handleMouseEnter = (card) => {
        if (isMyTurn && onCardHover) {
            onCardHover(card.matches || []);
        }
    };

    const handleMouseLeave = () => {
        if (onCardHover) {
            onCardHover([]);
        }
    };

    const handleClick = (card) => {
        if (isMyTurn && onCardSelect) {
            onCardSelect(selectedHandCard === card.id ? null : card.id);
        }
    };

    if (!hand) return null;

    return (
        <div className="hand-container">
            {hand.map((card, idx) => {
                const isSelected = selectedHandCard === card.id;
                
                return (
                    <div
                        key={`${card.id}-${idx}`}
                        className={`hand-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleClick(card)}
                        onMouseEnter={() => handleMouseEnter(card)}
                        onMouseLeave={handleMouseLeave}
                    >
                        {card.img && <img src={card.img} alt={`Card ${card.id}`} />}
                    </div>
                );
            })}
        </div>
    );
}
