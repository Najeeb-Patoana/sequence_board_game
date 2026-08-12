import React from 'react';

export default function GameBoard({ cards, hoveredCards = [], selectedBoardId, hasCardSelected, onBoardClick }) {
    if (!cards || cards.length !== 100) return null;

    return (
        <div className="board-grid">
            {cards.map((card) => {
                const isCorner = [1, 10, 91, 100].includes(card.id);
                const isHighlighted = hoveredCards.includes(card.id) || selectedBoardId === card.id;
                const hasChip = card.selected === 'True';
                const isOccupied = hasChip && !isCorner;

                // Determine cell classes
                let cellClass = 'board-cell';
                if (isCorner) {
                    cellClass += ' corner';
                } else if (isHighlighted) {
                    cellClass += ' highlight-valid';
                } else if (hasCardSelected && !isOccupied) {
                    // subtle pointer on all non-occupied when something is selected
                    cellClass += ' can-click';
                }

                const chipColor = card.selectedby === 'blue'
                    ? 'blue'
                    : card.selectedby === 'red'
                        ? 'red'
                        : card.selectedby === 'green'
                            ? 'green'
                            : '';

                return (
                    <div
                        key={card.id}
                        className={cellClass}
                        onClick={() => !isCorner && onBoardClick(card.id)}
                        style={!isCorner ? { cursor: isHighlighted ? 'pointer' : hasCardSelected ? 'pointer' : 'default' } : {}}
                    >
                        {!isCorner && card.img && (
                            <img
                                src={card.img}
                                alt={card.name || `Card ${card.id}`}
                                title={card.name || `Card ${card.id}`}
                                draggable={false}
                            />
                        )}

                        {hasChip && chipColor && (
                            <div className={`chip ${chipColor}`}>
                                <div className="chip-center" />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
