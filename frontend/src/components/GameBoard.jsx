import React from 'react';

export default function GameBoard({ cards, hoveredCards = [], selectedBoardId, onBoardClick }) {
    // 10x10 board
    // cards array has 100 elements (id 1 to 100)

    if (!cards || cards.length !== 100) return null;

    return (
        <div className="board-container">
            <div className="board-grid">
                {cards.map((card) => {
                    const isCorner = [1, 10, 91, 100].includes(card.id);
                    const isHovered = hoveredCards.includes(card.id);
                    const isSelected = selectedBoardId === card.id;

                    return (
                        <div
                            key={card.id}
                            className={`board-cell ${isCorner ? 'corner' : ''} ${(isHovered || isSelected) && !isCorner ? 'highlight-valid' : ''}`}
                            onClick={() => !isCorner && onBoardClick(card.id)}
                        >
                            {!isCorner && card.img && (
                                <img src={card.img} alt={card.name || `Card ${card.id}`} title={card.name || `Card ${card.id}`} />
                            )}
                            
                            {card.selected === "True" && (
                                <div className={`chip ${card.selectedby === 'blue' ? 'blue' : 'red'}`}></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
