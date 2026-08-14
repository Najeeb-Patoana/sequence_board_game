import React from 'react';
import { TWO_EYED_JACK_IDS, ONE_EYED_JACK_IDS } from '../engine/gameEngine';

const CORNER_IDS = [1, 10, 91, 100];

export default function GameBoard({
    cards,
    hoveredCards = [],
    selectedBoardId,
    hasCardSelected,
    selectedHandCard,    // full card object — used to determine Jack type
    lockedCells = [],    // flat array of board IDs in completed sequences
    myTeamColor,         // current player's team color
    onBoardClick,
}) {
    if (!cards || cards.length !== 100) return null;

    const lockedSet = new Set(lockedCells);

    const isTwoEyedJack = selectedHandCard && TWO_EYED_JACK_IDS.has(selectedHandCard.id);
    const isOneEyedJack = selectedHandCard && ONE_EYED_JACK_IDS.has(selectedHandCard.id);

    return (
        <div className="board-grid">
            {cards.map((card) => {
                const isCorner = CORNER_IDS.includes(card.id);
                const isLocked = lockedSet.has(card.id);
                const hasChip  = card.selected === 'True';
                const chipColor = card.selectedby || '';

                // ── Highlight logic ────────────────────────────────
                let isHighlighted = hoveredCards.includes(card.id) || selectedBoardId === card.id;
                let isRemovableTarget = false;

                if (isOneEyedJack && hasChip && !isCorner && !isLocked && chipColor !== myTeamColor) {
                    isRemovableTarget = true;
                    isHighlighted = true;
                } else if (isTwoEyedJack && !hasChip && !isCorner) {
                    isHighlighted = true;
                }

                // ── Cell classes ───────────────────────────────────
                let cellClass = 'board-cell';
                if (isCorner) {
                    cellClass += ' corner';
                } else if (isLocked) {
                    cellClass += ' locked';
                } else if (isRemovableTarget) {
                    cellClass += ' highlight-removal';
                } else if (isHighlighted) {
                    cellClass += ' highlight-valid';
                } else if (hasCardSelected && !hasChip) {
                    cellClass += ' can-click';
                }

                const handleClick = () => {
                    if (isCorner) return;
                    onBoardClick(card.id);
                };

                const cursor = isCorner
                    ? 'default'
                    : isHighlighted || isRemovableTarget || (hasCardSelected && !hasChip)
                        ? 'pointer'
                        : 'default';

                return (
                    <div
                        key={card.id}
                        className={cellClass}
                        onClick={handleClick}
                        style={{ cursor }}
                    >
                        {/* Corner: wild star image */}
                        {isCorner && (
                            <img src="/cards/corner.svg" alt="Wild corner" draggable={false} className="corner-img" />
                        )}

                        {/* Normal board image */}
                        {!isCorner && card.img && (
                            <img
                                src={card.img}
                                alt={card.name || `Card ${card.id}`}
                                title={card.name || `Card ${card.id}`}
                                draggable={false}
                            />
                        )}

                        {/* Chip */}
                        {hasChip && chipColor && (
                            <div className={`chip ${chipColor}${isLocked ? ' locked-chip' : ''}`}>
                                <div className="chip-center" />
                                {isLocked && <div className="chip-lock-ring" />}
                            </div>
                        )}

                        {/* Locked overlay glow */}
                        {isLocked && hasChip && (
                            <div className="locked-glow" style={{
                                position: 'absolute', inset: 0, borderRadius: 'inherit',
                                boxShadow: `inset 0 0 0 2px rgba(255,215,0,0.45)`,
                                pointerEvents: 'none',
                            }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
