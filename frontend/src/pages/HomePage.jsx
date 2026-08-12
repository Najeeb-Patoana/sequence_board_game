import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Card images to use as background decoration ──────────── */
const BG_CARDS = [
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

/* Seeded spread of 20 cards with randomized positions */
function buildCards() {
    const positions = [
        // left column  (x in vw from center, so negative = left)
        { x: -42, y: -30 }, { x: -48, y:  5  }, { x: -38, y: 38  }, { x: -52, y: -8  },
        { x: -44, y: 22  }, { x: -36, y: -45 },
        // right column
        { x:  42, y: -28 }, { x:  48, y:  8  }, { x:  38, y: 35  }, { x:  52, y: -10 },
        { x:  44, y: 24  }, { x:  36, y: -42 },
        // scattered across top / bottom
        { x: -22, y: -48 }, { x:  18, y: -46 }, { x: -14, y:  46 }, { x:  20, y:  48 },
        { x:  -4, y: -52 }, { x:   6, y:  52 }, { x: -30, y:  58 }, { x:  32, y: -55 },
    ];

    return positions.map((pos, i) => {
        const card = BG_CARDS[i % BG_CARDS.length];
        const rot  = -28 + (i * 17 % 57);          // -28° to +28°
        const spin = (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 1.5); // small rotation drift
        const dur  = 18 + (i % 7) * 3.5;           // 18s – 39s
        const delay= -(i * 2.1) % dur;              // stagger so not all start same frame
        const scale= 0.55 + (i % 5) * 0.07;        // 0.55 – 0.83
        const opacity = 0.12 + (i % 4) * 0.04;     // 0.12 – 0.24
        const drift = 28 + (i % 5) * 8;             // how far up they float (px)

        return { card, pos, rot, spin, dur, delay, scale, opacity, drift };
    });
}

const MODES = [
    {
        key: 'online', route: '/online',
        label: 'Online', sub: 'Multiplayer',
        desc: 'Host or join a private room and play with friends anywhere in the world.',
        cta: 'Play Online',
        delay: 0,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
        ),
    },
    {
        key: 'local', route: '/offline',
        label: 'Local', sub: 'Pass & Play',
        desc: 'Share a single screen. Pass the device between turns — perfect for game nights.',
        cta: 'Play Local',
        delay: 90,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
        ),
    },
    {
        key: 'cpu', route: '/cpu',
        label: 'Versus', sub: 'Computer',
        desc: 'Test your strategy against a heuristic AI engine and sharpen your skills.',
        cta: 'Play vs AI',
        delay: 180,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
                <rect x="9" y="9" width="6" height="6"/>
                <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
                <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
                <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
                <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
            </svg>
        ),
    },
];

export default function HomePage() {
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);
    const bgCards = useMemo(() => buildCards(), []);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 60);
        return () => clearTimeout(t);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0d0d0d',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>

            {/* ── Floating card background ──────────────── */}
            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                overflow: 'hidden',
            }}>
                {bgCards.map((item, i) => (
                    <img
                        key={i}
                        src={item.card}
                        alt=""
                        aria-hidden="true"
                        className="hp-bg-card"
                        style={{
                            width: '90px',
                            height: 'auto',
                            '--card-x': `${item.pos.x}vw`,
                            '--card-y': `${item.pos.y}vh`,
                            '--card-rot': `${item.rot}deg`,
                            '--card-spin': `${item.spin}deg`,
                            '--card-scale': item.scale,
                            '--card-opacity': item.opacity,
                            '--card-dur': `${item.dur}s`,
                            '--card-delay': `${item.delay}s`,
                            '--card-drift': `${item.drift}px`,
                        }}
                    />
                ))}
            </div>

            {/* ── Ambient glow on top of cards ─────────── */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background:
                    'radial-gradient(ellipse 55% 45% at 50% 0%,   rgba(201,168,76,0.10) 0%, transparent 70%),' +
                    'radial-gradient(ellipse 70% 70% at 50% 50%,  rgba(13,13,13,0.55) 0%, transparent 80%)',
                pointerEvents: 'none',
            }} />

            {/* ── Grain texture ─────────────────────────── */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.022,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
                pointerEvents: 'none',
                mixBlendMode: 'overlay',
            }} />

            {/* ── Top gold rule ─────────────────────────── */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.5) 50%, transparent 100%)',
            }} />

            {/* ── MAIN CONTENT ──────────────────────────── */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '940px',
                padding: 'clamp(2rem, 5vh, 3.5rem) 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>

                {/* ── Hero text ──────────────────────────── */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: 'clamp(2.5rem, 5vh, 4rem)',
                    opacity: ready ? 1 : 0,
                    transform: ready ? 'translateY(0)' : 'translateY(18px)',
                    transition: 'opacity 0.75s ease, transform 0.75s ease',
                }}>
                    <p style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.32em',
                        textTransform: 'uppercase',
                        color: 'rgba(201,168,76,0.65)',
                        marginBottom: '1rem',
                    }}>
                        The Classic Strategy Card Game
                    </p>

                    <h1 style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 'clamp(3.5rem, 11vw, 8.5rem)',
                        fontWeight: 900,
                        lineHeight: 0.93,
                        letterSpacing: '-0.025em',
                        backgroundImage: 'linear-gradient(175deg, #ffffff 0%, #e8e0cc 40%, #9a9080 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '1.5rem',
                        textShadow: 'none',
                    }}>
                        SEQUENCE
                    </h1>

                    {/* Ornamental divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center' }}>
                        <div style={{ width: '50px', height: '1px', background: 'rgba(201,168,76,0.35)' }} />
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 0 L8.5 5.5 L14 7 L8.5 8.5 L7 14 L5.5 8.5 L0 7 L5.5 5.5 Z" fill="rgba(201,168,76,0.5)"/>
                        </svg>
                        <div style={{ width: '50px', height: '1px', background: 'rgba(201,168,76,0.35)' }} />
                    </div>
                </div>

                {/* ── Mode cards grid ─────────────────────── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(255px, 1fr))',
                    width: '100%',
                    /* Single dark surface with internal dividers */
                    background: '#111',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.65)',
                }}>
                    {MODES.map((mode, idx) => (
                        <ModeCard
                            key={mode.key}
                            mode={mode}
                            ready={ready}
                            isLast={idx === MODES.length - 1}
                            onClick={() => navigate(mode.route)}
                        />
                    ))}
                </div>

                {/* ── Footer ──────────────────────────────── */}
                <p style={{
                    marginTop: '2.25rem',
                    fontSize: '0.68rem',
                    color: 'rgba(255,255,255,0.16)',
                    letterSpacing: '0.08em',
                    textAlign: 'center',
                    opacity: ready ? 1 : 0,
                    transition: 'opacity 1.1s ease 0.5s',
                }}>
                    2–3 PLAYERS  ·  STRATEGY  ·  CARD PLACEMENT
                </p>
            </div>
        </div>
    );
}

/* ── Individual mode card ──────────────────────────────────── */
function ModeCard({ mode, ready, isLast, onClick }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                background: hovered ? '#181818' : 'transparent',
                /* Right border as internal divider — skip on last */
                borderRight: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
                padding: '2rem 1.75rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'background 0.18s ease',
                userSelect: 'none',
                outline: 'none',
                overflow: 'hidden',
                opacity: ready ? 1 : 0,
                transform: ready ? 'none' : 'translateY(10px)',
                transitionProperty: 'background, opacity, transform',
                transitionDuration: `0.18s, 0.55s, 0.55s`,
                transitionDelay: `0s, ${mode.delay}ms, ${mode.delay}ms`,
            }}
        >
            {/* Hover top-edge gold accent line */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.7) 50%, transparent 100%)',
                opacity: hovered ? 1 : 0,
                transition: 'opacity 0.22s ease',
            }} />

            {/* Icon */}
            <div style={{
                color: hovered ? '#c9a84c' : 'rgba(255,255,255,0.28)',
                marginBottom: '1.25rem',
                transition: 'color 0.18s ease',
            }}>
                {mode.icon}
            </div>

            {/* Title */}
            <div style={{ marginBottom: '0.65rem' }}>
                <span style={{
                    display: 'block',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#ede8dc',
                    letterSpacing: '-0.01em',
                    lineHeight: 1,
                    marginBottom: '4px',
                }}>
                    {mode.label}
                </span>
                <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }}>
                    {mode.sub}
                </span>
            </div>

            {/* Description */}
            <p style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.35)',
                lineHeight: 1.65,
                marginBottom: '1.75rem',
                flexGrow: 1,
            }}>
                {mode.desc}
            </p>

            {/* CTA row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.875rem',
                borderTop: `1px solid ${hovered ? 'rgba(201,168,76,0.22)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'border-color 0.18s ease',
            }}>
                <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: hovered ? '#c9a84c' : 'rgba(255,255,255,0.35)',
                    transition: 'color 0.18s ease',
                    letterSpacing: '0.02em',
                }}>
                    {mode.cta}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={hovered ? '#c9a84c' : 'rgba(255,255,255,0.22)'}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transition: 'stroke 0.18s, transform 0.18s', transform: hovered ? 'translateX(4px)' : 'none' }}
                >
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                </svg>
            </div>
        </div>
    );
}