import React from 'react';

/**
 * LeaveGameDialog
 * Shown when the user clicks the "Leave / ← Menu" button mid-game.
 * Props:
 *   isOpen   {boolean}   – whether the dialog is visible
 *   onCancel {Function}  – "Continue Playing" — close dialog
 *   onLeave  {Function}  – "Leave Match" — quit and navigate away
 *   isOnline {boolean}   – adjusts subtitle text for online vs offline
 */
export default function LeaveGameDialog({ isOpen, onCancel, onLeave, isOnline = false }) {
    if (!isOpen) return null;

    return (
        <div className="overlay" style={{ zIndex: 3000 }} onClick={onCancel}>
            <div
                className="leave-dialog"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="leave-dialog-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#de7a7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </div>

                <h2>Leave Match?</h2>
                <p>
                    {isOnline
                        ? 'If you leave, your opponent will be notified and the match will end.'
                        : 'Your current game progress will be lost if you leave now.'}
                </p>

                <div className="leave-dialog-actions">
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={onCancel}
                        style={{ width: '100%' }}
                    >
                        Continue Playing
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={onLeave}
                        style={{ width: '100%' }}
                    >
                        Leave Match
                    </button>
                </div>
            </div>
        </div>
    );
}
