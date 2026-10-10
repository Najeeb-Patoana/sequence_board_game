import React, { useMemo } from 'react';
import { TWO_EYED_JACK_IDS, ONE_EYED_JACK_IDS, CORNER_IDS } from '../engine/gameEngine';

const BoardCell = React.memo(function BoardCell({
    card,
    isCorner,
    isLocked,
    hasChip,
    chipColor,
    isValidTarget,
    isHighlighted,
    isRemovableTarget,
    onBoardClick,
}) {
    let cellClass = 'board-cell';
    if (isCorner) {
        cellClass += ' corner';
    } else if (isLocked) {
        cellClass += ' locked';
    } else if (isRemovableTarget) {
        cellClass += ' highlight-removal';
    } else if (isHighlighted) {
        cellClass += ' highlight-valid';
    }

    const handleClick = () => {
        if (!isValidTarget || isCorner) return;
        onBoardClick(card.id);
    };

    const cursor = isValidTarget ? 'pointer' : 'default';

    return (
        <div
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
                    boxShadow: 'inset 0 0 0 2px rgba(255,215,0,0.45)',
                    pointerEvents: 'none',
                }} />
            )}
        </div>
    );
});

export default function GameBoard({
    cards,
    hoveredCards = [],
    selectedBoardId,
    hasCardSelected,
    selectedHandCard,    // full card object — used to determine Jack type
    lockedCells = [],    // flat array of board IDs in completed sequences
    myTeamColor,         // current player's team color
    onBoardClick,
    hoveredCard = null,  // optional hovered card object
}) {
    if (!cards || cards.length !== 100) return null;

    const lockedSet = useMemo(() => new Set(lockedCells), [lockedCells]);

    // Active Jack types for selected card
    const isTwoEyedJack = useMemo(() => {
        return !!selectedHandCard && TWO_EYED_JACK_IDS.has(Number(selectedHandCard.id));
    }, [selectedHandCard]);

    const isOneEyedJack = useMemo(() => {
        return !!selectedHandCard && ONE_EYED_JACK_IDS.has(Number(selectedHandCard.id));
    }, [selectedHandCard]);

    // Active Jack types for hovered card
    const isHoverTwoEyed = useMemo(() => {
        return !!hoveredCard && TWO_EYED_JACK_IDS.has(Number(hoveredCard.id));
    }, [hoveredCard]);

    const isHoverOneEyed = useMemo(() => {
        return !!hoveredCard && ONE_EYED_JACK_IDS.has(Number(hoveredCard.id));
    }, [hoveredCard]);

    // Fast lookup for normal card matching targets
    const selectedMatchesSet = useMemo(() => {
        if (!selectedHandCard || isTwoEyedJack || isOneEyedJack) return new Set();
        return new Set(selectedHandCard.matches || []);
    }, [selectedHandCard, isTwoEyedJack, isOneEyedJack]);

    const hoveredMatchesSet = useMemo(() => {
        return new Set(hoveredCards || []);
    }, [hoveredCards]);

    return (
        <div className="board-grid">
            {cards.map((card) => {
                const isCorner = CORNER_IDS.includes(card.id);
                const isLocked = lockedSet.has(card.id);
                const hasChip  = Boolean(card.selected === 'True' || card.selected === true);
                const chipColor = hasChip ? (card.selectedby || '') : '';

                // Calculate if this cell is a strictly valid target for the selected card
                let isValidTarget = false;
                if (!isCorner && hasCardSelected) {
                    if (isTwoEyedJack) {
                        isValidTarget = !hasChip;
                    } else if (isOneEyedJack) {
                        isValidTarget = hasChip && !isLocked && !!myTeamColor && chipColor !== myTeamColor;
                    } else {
                        isValidTarget = !hasChip && selectedMatchesSet.has(card.id);
                    }
                }

                // Calculate highlighting (both from selection and hover preview)
                let isHighlighted = false;
                let isRemovableTarget = false;

                if (isOneEyedJack && isValidTarget) {
                    isRemovableTarget = true;
                    isHighlighted = true;
                } else if (isHoverOneEyed && hasChip && !isCorner && !isLocked && !!myTeamColor && chipColor !== myTeamColor) {
                    isRemovableTarget = true;
                    isHighlighted = true;
                } else if (isTwoEyedJack && isValidTarget) {
                    isHighlighted = true;
                } else if (isHoverTwoEyed && !hasChip && !isCorner) {
                    isHighlighted = true;
                } else if (isValidTarget) {
                    isHighlighted = true;
                } else if (!hasCardSelected && hoveredMatchesSet.has(card.id) && !hasChip && !isCorner) {
                    isHighlighted = true;
                } else if (selectedBoardId === card.id) {
                    isHighlighted = true;
                }

                return (
                    <BoardCell
                        key={card.id}
                        card={card}
                        isCorner={isCorner}
                        isLocked={isLocked}
                        hasChip={hasChip}
                        chipColor={chipColor}
                        isValidTarget={isValidTarget}
                        isHighlighted={isHighlighted}
                        isRemovableTarget={isRemovableTarget}
                        onBoardClick={onBoardClick}
                    />
                );
            })}
        </div>
    );
}
