/**
 * CardBackground
 * ─────────────────────────────────────────────────────────────
 * Reusable animated background of drifting playing-card images.
 * Drop this as the FIRST child inside any `position: relative`
 * full-height container to get the floating card effect.
 */

import React, { useMemo } from 'react';

/* The card images to use */
const CARD_IMGS = [
    '/cards/king_of_spades.svg',
    '/cards/queen_of_hearts.svg',
    '/cards/jack_of_clubs.svg',
    '/cards/ace_of_spades.svg',
    '/cards/king_of_hearts.svg',
    '/cards/queen_of_spades.svg',
    '/cards/jack_of_diamonds.svg',
    '/cards/ace_of_hearts.svg',
    '/cards/king_of_clubs.svg',
    '/cards/queen_of_clubs.svg',
    '/cards/jack_of_hearts.svg',
    '/cards/ace_of_clubs.svg',
    '/cards/king_of_diamonds.svg',
    '/cards/queen_of_diamonds.svg',
    '/cards/jack_of_spades.svg',
    '/cards/ace_of_diamonds.svg',
];

/* Fixed positions so each render is deterministic (no randomness on re-render) */
const POSITIONS = [
    // Left column
    { x: -38, y: -32 }, { x: -44, y:  6  }, { x: -34, y: 36  }, { x: -48, y: -14 },
    { x: -40, y: 24  }, { x: -30, y: -50 },
    // Right column
    { x:  38, y: -30 }, { x:  44, y:  8  }, { x:  34, y: 34  }, { x:  48, y: -12 },
    { x:  40, y: 26  }, { x:  30, y: -48 },
    // Top
    { x: -18, y: -44 }, { x:  16, y: -42 }, { x: -28, y: -36 }, { x:  26, y: -38 },
    // Bottom
    { x: -16, y:  46 }, { x:  18, y:  44 }, { x: -26, y:  40 }, { x:  24, y:  42 },
    // Far outer
    { x: -54, y:  2  }, { x:  54, y: -4  }, { x: -22, y:  58 }, { x:  20, y: -58 },
];

function buildCards() {
    return POSITIONS.map((pos, i) => ({
        img:     CARD_IMGS[i % CARD_IMGS.length],
        x:       pos.x,
        y:       pos.y,
        rot:     -35 + (i * 19 % 70),
        spin:    (i % 2 === 0 ? 1 : -1) * (4 + (i % 4) * 2.5),
        dur:     20 + (i % 6) * 4,
        delay:   -(i * 2.3) % (20 + (i % 6) * 4),
        scale:   0.7 + (i % 4) * 0.1,
        opacity: 0.22 + (i % 5) * 0.04,
        drift:   32 + (i % 5) * 10,
    }));
}

export default function CardBackground() {
    const cards = useMemo(() => buildCards(), []);

    return (
        <>
            {/* ── Floating cards ──────────────────────────────────── */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    overflow: 'hidden',
                    zIndex: 0,
                }}
            >
                {cards.map((c, i) => (
                    <img
                        key={i}
                        src={c.img}
                        alt=""
                        className="hp-bg-card"
                        style={{
                            width: '130px',
                            height: 'auto',
                            '--card-x':       `${c.x}vw`,
                            '--card-y':       `${c.y}vh`,
                            '--card-rot':     `${c.rot}deg`,
                            '--card-spin':    `${c.spin}deg`,
                            '--card-scale':   c.scale,
                            '--card-opacity': c.opacity,
                            '--card-dur':     `${c.dur}s`,
                            '--card-delay':   `${c.delay}s`,
                            '--card-drift':   `${c.drift}px`,
                        }}
                    />
                ))}
            </div>

            {/* ── Dark vignette over cards to keep text readable ── */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                        'radial-gradient(ellipse 55% 45% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%),' +
                        'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(13,13,13,0.5) 0%, transparent 80%)',
                    pointerEvents: 'none',
                    zIndex: 1,
                }}
            />

            {/* ── Grain texture ─────────────────────────────────── */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.022,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    pointerEvents: 'none',
                    mixBlendMode: 'overlay',
                    zIndex: 1,
                }}
            />

            {/* ── Top gold rule ────────────────────────────────── */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.45) 50%, transparent 100%)',
                    pointerEvents: 'none',
                    zIndex: 2,
                }}
            />
        </>
    );
}
