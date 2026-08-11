import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import allCards from '../data/allCards';

export default function HomePage() {
    const navigate = useNavigate();

    // Generate 24 unique background cards dynamically
    const backgroundCards = useMemo(() => {
        const uniqueCards = [];
        const seen = new Set();
        for (let c of allCards) {
            if (!seen.has(c.img) && !c.img.includes('corner')) {
                uniqueCards.push(c);
                seen.add(c.img);
            }
            if (uniqueCards.length >= 24) break;
        }

        return uniqueCards.map((card, i) => {
            const isLeft = i % 2 === 0;
            // Distribute primarily on left and right sides to keep center clear
            const xPos = isLeft ? Math.random() * 25 : 75 + Math.random() * 25; 
            const yPos = Math.random() * 100;
            const delay = Math.random() * 1.5;
            const duration = 12 + Math.random() * 10;
            const rotation = -40 + Math.random() * 80;
            const scale = 0.5 + Math.random() * 0.5;
            
            return {
                card,
                style: {
                    '--tx': `${xPos}vw`,
                    '--ty': `${yPos}vh`,
                    '--rot': `${rotation}deg`,
                    '--scale': scale,
                    '--final-opacity': 0.4 + Math.random() * 0.4,
                    animation: `dealSpread 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s forwards, floatRandom ${duration}s ease-in-out infinite ${delay + 1.2}s`,
                    opacity: 0,
                }
            };
        });
    }, []);

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
            {/* Animated Background Cards */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {backgroundCards.map((item, i) => (
                    <img 
                        key={i}
                        src={item.card.img} 
                        className="absolute top-1/2 left-1/2 -ml-[5vw] -mt-[7vw] rounded-lg shadow-2xl w-[10vw] min-w-[80px] max-w-[140px]" 
                        style={item.style} 
                        alt="Background Card" 
                    />
                ))}
            </div>

            <div className="container relative z-10 flex flex-col items-center justify-center pt-12 pb-24">
                <div className="text-center mb-16">
                    <h1 
                        className="text-6xl md:text-8xl mb-6 text-gradient tracking-tighter font-extrabold" 
                        style={{ textShadow: '0 10px 30px rgba(59, 130, 246, 0.3)' }}
                    >
                        SEQUENCE
                    </h1>
                    <p className="text-xl md:text-2xl text-muted max-w-2xl mx-auto font-light">
                        The classic board card game, reimagined. Play online with friends or locally on the same device.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl justify-center">
                    {/* Online Mode Card */}
                    <div 
                        className="glass-card p-6 flex-1 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] group border border-[#3b82f6]/20"
                        onClick={() => navigate('/online')}
                    >
                        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12h20"/>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                        </div>
                        <h2 className="text-2xl mb-2 font-bold tracking-tight">ONLINE GAME</h2>
                        <p className="text-muted mb-6 flex-1 text-base">Play with friends remotely in real-time across different devices.</p>
                        <button className="btn btn-primary w-full text-base py-2">Play Online</button>
                    </div>

                    {/* Local Mode Card */}
                    <div 
                        className="glass-card p-6 flex-1 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] group border border-[#10b981]/20"
                        onClick={() => navigate('/offline')}
                    >
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                <line x1="8" y1="21" x2="16" y2="21"/>
                                <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                        </div>
                        <h2 className="text-2xl mb-2 font-bold tracking-tight">LOCAL GAME</h2>
                        <p className="text-muted mb-6 flex-1 text-base">Pass-and-play together on a single screen without needing an internet connection.</p>
                        <button className="btn btn-primary w-full text-base py-2" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}>Play Offline</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
