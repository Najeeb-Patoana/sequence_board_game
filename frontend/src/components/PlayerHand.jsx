import React from 'react';

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
        if (!isMyTurn) return;
        if (onCardSelect) {
            // Toggle: if same card clicked again, deselect
            onCardSelect(selectedHandCard?.id === card.id ? null : card);
        }
    };

    if (!hand) return null;

    const hasSelection = !!selectedHandCard;

    return (
        <div className="hand-area">
            <div className={`hand-hint ${hasSelection ? 'active' : ''}`}>
                {!isMyTurn
                    ? 'Waiting for turn…'
                    : hasSelection
                        ? `"${selectedHandCard.name || 'Card'}" selected — click a highlighted board space`
                        : 'Select a card from your hand'}
            </div>

            <div className="hand-cards">
                {hand.map((card, idx) => {
                    const isSelected = selectedHandCard?.id === card.id;

                    return (
                        <div
                            key={`${card.id}-${idx}`}
                            className={`hand-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleClick(card)}
                            onMouseEnter={() => handleMouseEnter(card)}
                            onMouseLeave={handleMouseLeave}
                            title={card.name || `Card ${card.id}`}
                        >
                            {card.img && (
                                <img
                                    src={card.img}
                                    alt={card.name || `Card ${card.id}`}
                                    draggable={false}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
