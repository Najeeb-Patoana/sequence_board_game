import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="container flex flex-col items-center justify-center min-h-[80vh]">
            <h1 className="text-6xl mb-12 text-gradient tracking-tight">SEQUENCE</h1>
            
            <p className="text-xl text-muted mb-12 text-center max-w-lg">
                Choose how you want to play. Play online with friends or locally on the same device.
            </p>

            <div className="flex flex-col sm:flex-row gap-8 w-full max-w-3xl justify-center">
                {/* Online Mode Card */}
                <div 
                    className="glass-card p-8 flex-1 flex flex-col items-center text-center cursor-pointer transition-all hover:-translate-y-2 hover:shadow-glow group"
                    onClick={() => navigate('/online')}
                >
                    <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12h20"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                    </div>
                    <h2 className="text-2xl mb-4">ONLINE GAME</h2>
                    <p className="text-muted mb-8 flex-1">Play with friends remotely in real-time across different devices.</p>
                    <button className="btn btn-primary w-full">Play Online</button>
                </div>

                {/* Local Mode Card */}
                <div 
                    className="glass-card p-8 flex-1 flex flex-col items-center text-center cursor-pointer transition-all hover:-translate-y-2 hover:shadow-glow group"
                    onClick={() => navigate('/offline')}
                >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                            <line x1="8" y1="21" x2="16" y2="21"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                    </div>
                    <h2 className="text-2xl mb-4">LOCAL GAME</h2>
                    <p className="text-muted mb-8 flex-1">Pass-and-play together on a single screen without needing an internet connection.</p>
                    <button className="btn btn-primary w-full" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}>Play Offline</button>
                </div>
            </div>
        </div>
    );
}
