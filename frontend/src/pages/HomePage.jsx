import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MODES = [
    {
        key: 'online',
        route: '/online',
        label: 'Online',
        sub: 'Multiplayer',
        description: 'Host or join a private room and play with friends anywhere in the world.',
        cta: 'Play Online',
        delay: 0,
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
        ),
    },
    {
        key: 'local',
        route: '/offline',
        label: 'Local',
        sub: 'Pass & Play',
        description: 'Share a single screen. Pass the device between turns for game nights.',
        cta: 'Play Local',
        delay: 80,
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
        ),
    },
    {
        key: 'cpu',
        route: '/cpu',
        label: 'Versus',
        sub: 'Computer',
        description: 'Test your strategy against a heuristic AI engine. Refine your game.',
        cta: 'Play vs AI',
        delay: 160,
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
                <rect x="9" y="9" width="6" height="6"/>
                <line x1="9" y1="1" x2="9" y2="4"/>
                <line x1="15" y1="1" x2="15" y2="4"/>
                <line x1="9" y1="20" x2="9" y2="23"/>
                <line x1="15" y1="20" x2="15" y2="23"/>
                <line x1="20" y1="9" x2="23" y2="9"/>
                <line x1="20" y1="14" x2="23" y2="14"/>
                <line x1="1" y1="9" x2="4" y2="9"/>
                <line x1="1" y1="14" x2="4" y2="14"/>
            </svg>
        ),
    },
];

/* A single floating card for the background */
function BackgroundCard({ src, style }) {
    return (
        <img
            src={src}
            alt=""
            aria-hidden="true"
            style={{
                position: 'absolute',
                pointerEvents: 'none',
                borderRadius: '4px',
                ...style,
            }}
        />
    );
}

export default function HomePage() {
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 40);
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

            {/* ── Subtle ambient glow ─────────────────────── */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background:
                    'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%),' +
                    'radial-gradient(ellipse 40% 30% at 80% 80%, rgba(74,127,193,0.05) 0%, transparent 60%),' +
                    'radial-gradient(ellipse 40% 30% at 20% 70%, rgba(193,74,74,0.05) 0%, transparent 60%)',
                pointerEvents: 'none',
            }} />

            {/* ── Fine grain texture ──────────────────────── */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.025,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
                pointerEvents: 'none',
                mixBlendMode: 'overlay',
            }} />

            {/* ── Thin top rule ───────────────────────────── */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 50%, transparent 100%)',
            }} />

            {/* ── Main content ───────────────────────────── */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '960px',
                padding: '3rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>

                {/* ── Hero text ──────────────────────────── */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '4rem',
                    opacity: ready ? 1 : 0,
                    transform: ready ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'opacity 0.7s ease, transform 0.7s ease',
                }}>
                    {/* Eyebrow */}
                    <p style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        color: 'rgba(201,168,76,0.7)',
                        marginBottom: '1.25rem',
                    }}>
                        The Classic Strategy Board Game
                    </p>

                    {/* Title */}
                    <h1 style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 'clamp(4rem, 12vw, 9rem)',
                        fontWeight: 900,
                        lineHeight: 0.92,
                        letterSpacing: '-0.02em',
                        color: '#ede8dc',
                        marginBottom: '1.5rem',
                        /* Very subtle warmth gradient */
                        backgroundImage: 'linear-gradient(180deg, #ede8dc 0%, #b8ae98 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        SEQUENCE
                    </h1>

                    {/* Thin gold rule under title */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        justifyContent: 'center',
                    }}>
                        <div style={{ flex: 1, maxWidth: '80px', height: '1px', background: 'rgba(201,168,76,0.3)' }} />
                        <div style={{ width: '5px', height: '5px', background: '#c9a84c', borderRadius: '50%' }} />
                        <div style={{ flex: 1, maxWidth: '80px', height: '1px', background: 'rgba(201,168,76,0.3)' }} />
                    </div>
                </div>

                {/* ── Mode cards ─────────────────────────── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1px',
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                }}>
                    {MODES.map((mode) => (
                        <ModeCard
                            key={mode.key}
                            mode={mode}
                            ready={ready}
                            onClick={() => navigate(mode.route)}
                        />
                    ))}
                </div>

                {/* ── Footer note ────────────────────────── */}
                <p style={{
                    marginTop: '2.5rem',
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.18)',
                    letterSpacing: '0.06em',
                    textAlign: 'center',
                    opacity: ready ? 1 : 0,
                    transition: 'opacity 1s ease 0.4s',
                }}>
                    2 – 3 PLAYERS · STRATEGY · CARD PLACEMENT
                </p>
            </div>
        </div>
    );
}

function ModeCard({ mode, ready, onClick }) {
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
                background: hovered ? '#181818' : '#141414',
                padding: '2rem 1.75rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                transition: 'background 0.2s ease',
                userSelect: 'none',
                outline: 'none',
                opacity: ready ? 1 : 0,
                transform: ready ? 'translateY(0)' : 'translateY(12px)',
                /* Staggered entry */
                transitionProperty: 'background, opacity, transform',
                transitionDuration: `0.2s, 0.5s, 0.5s`,
                transitionDelay: `0s, ${mode.delay}ms, ${mode.delay}ms`,
                transitionTimingFunction: 'ease, ease, ease',
            }}
        >
            {/* Icon */}
            <div style={{
                color: hovered ? '#c9a84c' : 'rgba(255,255,255,0.3)',
                marginBottom: '1.25rem',
                transition: 'color 0.2s ease',
            }}>
                {mode.icon}
            </div>

            {/* Label */}
            <div style={{ marginBottom: '0.5rem' }}>
                <span style={{
                    display: 'block',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#ede8dc',
                    letterSpacing: '-0.01em',
                    lineHeight: 1,
                    marginBottom: '3px',
                }}>
                    {mode.label}
                </span>
                <span style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                }}>
                    {mode.sub}
                </span>
            </div>

            {/* Description */}
            <p style={{
                fontSize: '0.82rem',
                color: 'rgba(255,255,255,0.38)',
                lineHeight: 1.6,
                marginBottom: '1.75rem',
                flexGrow: 1,
            }}>
                {mode.description}
            </p>

            {/* CTA row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: `1px solid ${hovered ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.06)'}`,
                paddingTop: '1rem',
                transition: 'border-color 0.2s ease',
            }}>
                <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: hovered ? '#c9a84c' : 'rgba(255,255,255,0.4)',
                    transition: 'color 0.2s ease',
                    letterSpacing: '0.02em',
                }}>
                    {mode.cta}
                </span>
                <svg
                    width="16" height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={hovered ? '#c9a84c' : 'rgba(255,255,255,0.25)'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        transition: 'stroke 0.2s ease, transform 0.2s ease',
                        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
                    }}
                >
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                </svg>
            </div>
        </div>
    );
}