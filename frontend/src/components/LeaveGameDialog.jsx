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
                <div className="leave-dialog-icon">🚪</div>

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
