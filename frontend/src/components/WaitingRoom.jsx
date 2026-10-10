import React, { useState } from 'react';

export default function WaitingRoom({ roomId, onLeave }) {
    const [copied, setCopied] = useState(false);

    const shareUrl = roomId ? `${window.location.origin}/online/room/${roomId}` : '';

    const handleCopyLink = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    return (
        <div className="waiting-room">
            {/* Spinner */}
            <div className="waiting-spinner-ring" />

            {/* Title */}
            <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                marginBottom: '0.4rem',
            }}>
                Waiting for Opponent
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '0.25rem' }}>
                Share the room code or link below with your friend.
            </p>

            {/* Room code */}
            {roomId && (
                <>
                    <div style={{
                        display: 'inline-block',
                        background: 'var(--gold-dim)',
                        border: '1px solid var(--gold-glow)',
                        borderRadius: 'var(--r-xs)',
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: 'var(--gold)',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        marginTop: '1rem',
                        marginBottom: '0.25rem',
                    }}>
                        Room Code
                    </div>
                    <div className="room-code-box">
                        <span className="room-code-text">{roomId}</span>
                        <button
                            className={`room-code-copy-btn ${copied ? 'copied' : ''}`}
                            onClick={handleCopyLink}
                        >
                            {copied ? 'Copied' : 'Copy Link'}
                        </button>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', wordBreak: 'break-all', lineHeight: 1.4 }}>
                        {shareUrl}
                    </p>
                </>
            )}

            {/* Dots animation */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '1.5rem' }}>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{
                        width: 7, height: 7,
                        borderRadius: '50%',
                        background: 'var(--gold)',
                        opacity: 0.4,
                        animation: `dotPulse 1.4s ease-in-out ${i * 0.22}s infinite`,
                    }} />
                ))}
            </div>

            {/* Leave button */}
            {onLeave && (
                <button
                    className="btn btn-ghost"
                    onClick={onLeave}
                    style={{ marginTop: '1.5rem', width: '100%', fontSize: '0.82rem' }}
                >
                    ← Leave Room
                </button>
            )}
        </div>
    );
}
