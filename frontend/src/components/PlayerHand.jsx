import React from 'react';
import { TWO_EYED_JACK_IDS, ONE_EYED_JACK_IDS, isDeadCard } from '../engine/gameEngine';

export default function PlayerHand({
    hand,
    isMyTurn,
    selectedHandCard,
    onCardSelect,
    onCardHover,
    onDeclareDeadCard,
    boardCards,
    vertical = false,
}) {
    const handleMouseEnter = (card) => {
        if (isMyTurn && onCardHover) onCardHover(card.matches || [], card);
    };

    const handleMouseLeave = () => {
        if (onCardHover) onCardHover([], null);
    };

    const handleClick = (card) => {
        if (!isMyTurn) return;
        if (onCardSelect) onCardSelect(selectedHandCard?.id === card.id ? null : card);
    };

    if (!hand) return null;

    const hasSelection = !!selectedHandCard;
    const selectedIsDead = hasSelection && boardCards
        ? isDeadCard(selectedHandCard, boardCards)
        : false;

    let hintText = 'Select a card from your hand';
    if (!isMyTurn) {
        hintText = 'Waiting for your turn...';
    } else if (selectedIsDead) {
        hintText = 'Dead card: Both spaces occupied. Click Replace Dead Card below.';
    } else if (selectedHandCard) {
        const cardIdNum = Number(selectedHandCard.id);
        if (TWO_EYED_JACK_IDS.has(cardIdNum)) {
            hintText = 'Two-Eyed Jack (Wild): Click any open space to place chip';
        } else if (ONE_EYED_JACK_IDS.has(cardIdNum)) {
            hintText = 'One-Eyed Jack (Removal): Click an opponent chip to remove it';
        } else {
            hintText = `"${selectedHandCard.name || 'Card'}" selected — click a highlighted space`;
        }
    }

    const checkIsDead = (card) => {
        return boardCards ? isDeadCard(card, boardCards) : false;
    };

    /* ── Vertical layout (desktop sidebar) ── */
    if (vertical) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flex: 1 }}>
                {/* Tip / Hint */}
                <div className={`hand-sidebar-hint ${hasSelection ? 'active' : ''} ${selectedIsDead ? 'dead' : ''}`}
                    style={selectedIsDead ? { color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.4)', background: 'rgba(255,107,107,0.08)' } : {}}>
                    {hintText}
                </div>

                {/* Dead Card action button */}
                {selectedIsDead && isMyTurn && onDeclareDeadCard && (
                    <button
                        id="btn-declare-dead-card"
                        onClick={() => onDeclareDeadCard(selectedHandCard.id)}
                        style={{
                            width: 'calc(100% - 1rem)',
                            margin: '0.4rem 0.5rem 0',
                            padding: '0.5rem',
                            background: 'rgba(255,107,107,0.14)',
                            border: '1px solid rgba(255,107,107,0.45)',
                            color: '#ff6b6b',
                            borderRadius: '8px',
                            fontSize: '0.75rem', fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            fontFamily: "'Inter', system-ui, sans-serif",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.25)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.14)'; }}
                    >
                        Replace Dead Card
                    </button>
                )}

                {/* Cards */}
                <div className="hand-cards-v">
                    {hand.map((card, idx) => {
                        const isSelected = selectedHandCard?.id === card.id;
                        const dead = checkIsDead(card);
                        return (
                            <div
                                key={`hand-v-${card.id}-${idx}`}
                                className={`hand-card-v ${isSelected ? 'selected' : ''} ${dead ? 'dead-card' : ''}`}
                                onClick={() => handleClick(card)}
                                onMouseEnter={() => handleMouseEnter(card)}
                                onMouseLeave={handleMouseLeave}
                                title={card.name || `Card ${card.id}`}
                                style={{ zIndex: isSelected ? 20 : idx + 1, position: 'relative' }}
                            >
                                {card.img && <img src={card.img} alt={card.name || `Card ${card.id}`} draggable={false} />}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    /* ── Horizontal layout ──────────────────────────────────── */
    return (
        <div className="hand-area">
            <div className={`hand-hint ${hasSelection ? 'active' : ''}`}>
                {hintText}
            </div>

            {/* Dead card action in horizontal mode */}
            {selectedIsDead && isMyTurn && onDeclareDeadCard && (
                <button
                    id="btn-declare-dead-card-h"
                    onClick={() => onDeclareDeadCard(selectedHandCard.id)}
                    style={{
                        margin: '0.4rem auto 0', display: 'block',
                        padding: '0.35rem 1rem',
                        background: 'rgba(255,107,107,0.14)', border: '1px solid rgba(255,107,107,0.45)',
                        color: '#ff6b6b', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 700,
                        cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                >
                    Replace Dead Card
                </button>
            )}

            <div className="hand-cards">
                {hand.map((card, idx) => {
                    const isSelected = selectedHandCard?.id === card.id;
                    const dead = checkIsDead(card);
                    return (
                        <div
                            key={`hand-h-${card.id}-${idx}`}
                            className={`hand-card ${isSelected ? 'selected' : ''} ${dead ? 'dead-card' : ''}`}
                            onClick={() => handleClick(card)}
                            onMouseEnter={() => handleMouseEnter(card)}
                            onMouseLeave={handleMouseLeave}
                            title={card.name || `Card ${card.id}`}
                            style={{ position: 'relative' }}
                        >
                            {card.img && <img src={card.img} alt={card.name || `Card ${card.id}`} draggable={false} />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
