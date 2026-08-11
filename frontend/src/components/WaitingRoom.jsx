import React, { useState } from 'react';

export default function WaitingRoom({ roomId }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const url = `${window.location.origin}/online/room/${roomId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4, borderColor: 'rgba(59, 130, 246, 0.3)', borderTopColor: '#3b82f6' }}></div>
            
            <div className="text-center">
                <h2 className="text-3xl mb-2">Waiting for opponent...</h2>
                <p className="text-muted mb-8">Share this room link with a friend to play together.</p>
                
                <div className="glass-card p-4 flex items-center justify-between gap-4 max-w-md mx-auto">
                    <code className="text-xl px-4 py-2 bg-[rgba(0,0,0,0.3)] rounded">{roomId}</code>
                    <button className="btn btn-primary" onClick={handleCopy}>
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>
            </div>
        </div>
    );
}
