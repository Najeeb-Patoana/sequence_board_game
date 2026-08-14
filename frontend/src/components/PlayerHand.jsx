import React from 'react';
import { TWO_EYED_JACK_IDS, ONE_EYED_JACK_IDS, isDeadCard } from '../engine/gameEngine';

export default function PlayerHand({
    hand,
    isMyTurn,
    selectedHandCard,
    onCardSelect,
    onCardHover,
    onDeclareDeadCard,
    boardCards,      // needed for dead card detection
    vertical = false,
}) {
    const handleMouseEnter = (card) => {
        if (isMyTurn && onCardHover) onCardHover(card.matches || []);
    };

    const handleMouseLeave = () => {
        if (onCardHover) onCardHover([]);
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

    const hintText = !isMyTurn
        ? 'Waiting…'
        : selectedIsDead
            ? 'Dead card — declare or pick another'
            : hasSelection
                ? 'Click a highlighted cell'
                : 'Select a card';

    const getCardMeta = (card) => {
        const isTwoEyed = TWO_EYED_JACK_IDS.has(card.id);
        const isOneEyed = ONE_EYED_JACK_IDS.has(card.id);
        const dead = boardCards ? isDeadCard(card, boardCards) : false;
        return { isTwoEyed, isOneEyed, dead };
    };

    const JackBadge = ({ isTwoEyed, isOneEyed }) => {
        if (!isTwoEyed && !isOneEyed) return null;
        return (
            <div style={{
                position: 'absolute', bottom: 3, left: 3,
                background: isTwoEyed ? 'rgba(52,199,89,0.85)' : 'rgba(193,74,74,0.85)',
                borderRadius: '3px', padding: '1px 4px',
                fontSize: '0.52rem', fontWeight: 800, color: '#fff',
                letterSpacing: '0.04em', lineHeight: 1.2,
                backdropFilter: 'blur(4px)',
                zIndex: 5,
            }}>
                {isTwoEyed ? '2👁' : '1👁'}
            </div>
        );
    };

    const DeadBadge = () => (
        <div style={{
            position: 'absolute', top: 3, right: 3,
            background: 'rgba(255,60,60,0.85)',
            borderRadius: '3px', padding: '1px 4px',
            fontSize: '0.5rem', fontWeight: 800, color: '#fff',
            lineHeight: 1.2, zIndex: 5,
        }} title="Dead card — both board spaces are occupied">
            💀
        </div>
    );

    /* ── Vertical layout ────────────────────────────────────── */
    if (vertical) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flex: 1 }}>
                {/* Hint */}
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
                            background: 'rgba(255,107,107,0.12)',
                            border: '1px solid rgba(255,107,107,0.35)',
                            color: '#ff6b6b',
                            borderRadius: '8px',
                            fontSize: '0.75rem', fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            fontFamily: "'Inter', system-ui, sans-serif",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,107,107,0.12)'; }}
                    >
                        💀 Declare Dead Card
                    </button>
                )}

                {/* Cards */}
                <div className="hand-cards-v">
                    {hand.map((card, idx) => {
                        const isSelected = selectedHandCard?.id === card.id;
                        const { isTwoEyed, isOneEyed, dead } = getCardMeta(card);
                        return (
                            <div
                                key={`${card.id}-${idx}`}
                                className={`hand-card-v ${isSelected ? 'selected' : ''} ${dead ? 'dead-card' : ''}`}
                                onClick={() => handleClick(card)}
                                onMouseEnter={() => handleMouseEnter(card)}
                                onMouseLeave={handleMouseLeave}
                                title={card.name || `Card ${card.id}`}
                                style={{ zIndex: isSelected ? 20 : idx + 1, position: 'relative' }}
                            >
                                {card.img && <img src={card.img} alt={card.name || `Card ${card.id}`} draggable={false} />}
                                <JackBadge isTwoEyed={isTwoEyed} isOneEyed={isOneEyed} />
                                {dead && <DeadBadge />}
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
                {!isMyTurn
                    ? 'Waiting for turn…'
                    : selectedIsDead
                        ? '💀 Dead card — use the button below or pick another'
                        : hasSelection
                            ? `"${selectedHandCard.name || 'Card'}" selected — click a highlighted board space`
                            : 'Select a card from your hand'}
            </div>

            {/* Dead card action in horizontal mode */}
            {selectedIsDead && isMyTurn && onDeclareDeadCard && (
                <button
                    id="btn-declare-dead-card-h"
                    onClick={() => onDeclareDeadCard(selectedHandCard.id)}
                    style={{
                        margin: '0.4rem auto 0', display: 'block',
                        padding: '0.35rem 1rem',
                        background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.35)',
                        color: '#ff6b6b', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 700,
                        cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                >
                    💀 Declare Dead Card
                </button>
            )}

            <div className="hand-cards">
                {hand.map((card, idx) => {
                    const isSelected = selectedHandCard?.id === card.id;
                    const { isTwoEyed, isOneEyed, dead } = getCardMeta(card);
                    return (
                        <div
                            key={`${card.id}-${idx}`}
                            className={`hand-card ${isSelected ? 'selected' : ''} ${dead ? 'dead-card' : ''}`}
                            onClick={() => handleClick(card)}
                            onMouseEnter={() => handleMouseEnter(card)}
                            onMouseLeave={handleMouseLeave}
                            title={card.name || `Card ${card.id}`}
                            style={{ position: 'relative' }}
                        >
                            {card.img && <img src={card.img} alt={card.name || `Card ${card.id}`} draggable={false} />}
                            <JackBadge isTwoEyed={isTwoEyed} isOneEyed={isOneEyed} />
                            {dead && <DeadBadge />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
