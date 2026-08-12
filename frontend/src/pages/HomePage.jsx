import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import allCards from '../data/allCards';

export default function HomePage() {
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 50);
        return () => clearTimeout(timer);
    }, []);

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
            const xPos = isLeft ? -40 - Math.random() * 20 : 40 + Math.random() * 20;
            const yPos = -50 + Math.random() * 100;
            
            return {
                card,
                style: {
                    '--tx': `${xPos}vw`,
                    '--ty': `${yPos}vh`,
                    '--rot': `${-45 + Math.random() * 90}deg`,
                    '--scale': 0.3 + Math.random() * 0.3,
                    '--delay': `${Math.random() * 1.5}s`,
                    '--duration': `${20 + Math.random() * 20}s`,
                }
            };
        });
    }, []);

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#050505] font-sans antialiased selection:bg-white/20">
            
            {/* Cinematic Noise Texture Overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

            {/* Subtle Center Spotlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

            <style>{`
                @keyframes fadeFloat {
                    0% { transform: translate(calc(var(--tx) * 0.8), calc(var(--ty) * 0.8)) scale(calc(var(--scale) * 0.8)) rotate(0deg); opacity: 0; filter: blur(10px); }
                    20% { opacity: 0.08; filter: blur(3px); }
                    80% { opacity: 0.08; filter: blur(3px); }
                    100% { transform: translate(var(--tx), var(--ty)) scale(var(--scale)) rotate(var(--rot)); opacity: 0; filter: blur(10px); }
                }
                .bg-card {
                    animation: fadeFloat var(--duration) ease-in-out infinite var(--delay);
                    will-change: transform, opacity;
                }
            `}</style>

            <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
                {backgroundCards.map((item, i) => (
                    <img 
                        key={i}
                        src={item.card.img} 
                        className="bg-card absolute w-[12vw] min-w-[100px] max-w-[160px] opacity-0 grayscale-[80%] brightness-50" 
                        style={item.style} 
                        alt="" 
                        aria-hidden="true"
                    />
                ))}
            </div>

            <div className="container relative z-10 flex flex-col items-center justify-center px-6 py-12 w-full max-w-5xl mx-auto">
                
                {/* Header Section */}
                <div className={`flex flex-col items-center mb-16 md:mb-24 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                    <p className="text-neutral-500 tracking-[0.3em] text-xs font-semibold uppercase mb-4 md:mb-6">
                        The Classic Board Game
                    </p>
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-200 to-neutral-600">
                        SEQUENCE
                    </h1>
                </div>

                {/* Game Modes Grid - Notice the h-full on the cards and mt-auto on buttons to fix alignment */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full items-stretch">
                    
                    {/* Online Mode */}
                    <div 
                        className={`group relative flex flex-col h-full bg-[#0a0a0a] border border-neutral-800/80 rounded-2xl p-7 md:p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:border-blue-500/40 hover:bg-[#0d1117] hover:-translate-y-1 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
                        style={{ transitionDelay: '100ms' }}
                        onClick={() => navigate('/online')}
                    >
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-colors duration-500 pointer-events-none" />
                        
                        <div className="mb-6 text-neutral-400 group-hover:text-blue-400 transition-colors duration-500">
                            <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                        </div>
                        
                        <h2 className="text-xl font-bold tracking-tight text-white mb-2">Online Multiplayer</h2>
                        <p className="text-neutral-500 text-sm leading-relaxed mb-8 flex-grow">
                            Host a private room and compete with friends remotely with real-time syncing.
                        </p>
                        
                        <div className="mt-auto w-full inline-flex items-center justify-between px-5 py-3 text-sm font-medium text-neutral-300 bg-neutral-900/50 border border-neutral-800 rounded-xl group-hover:bg-blue-500/10 group-hover:border-blue-500/30 group-hover:text-blue-300 transition-all duration-300">
                            <span>Create Room</span>
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                    </div>

                    {/* Local Mode */}
                    <div 
                        className={`group relative flex flex-col h-full bg-[#0a0a0a] border border-neutral-800/80 rounded-2xl p-7 md:p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:border-emerald-500/40 hover:bg-[#0a120e] hover:-translate-y-1 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
                        style={{ transitionDelay: '200ms' }}
                        onClick={() => navigate('/offline')}
                    >
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-colors duration-500 pointer-events-none" />
                        
                        <div className="mb-6 text-neutral-400 group-hover:text-emerald-400 transition-colors duration-500">
                            <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                        </div>
                        
                        <h2 className="text-xl font-bold tracking-tight text-white mb-2">Local Pass & Play</h2>
                        <p className="text-neutral-500 text-sm leading-relaxed mb-8 flex-grow">
                            Gather around a single screen. Perfect for in-person game nights.
                        </p>
                        
                        <div className="mt-auto w-full inline-flex items-center justify-between px-5 py-3 text-sm font-medium text-neutral-300 bg-neutral-900/50 border border-neutral-800 rounded-xl group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 group-hover:text-emerald-300 transition-all duration-300">
                            <span>Start Local</span>
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                    </div>

                    {/* VS CPU Mode */}
                    <div 
                        className={`group relative flex flex-col h-full bg-[#0a0a0a] border border-neutral-800/80 rounded-2xl p-7 md:p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:border-violet-500/40 hover:bg-[#100d17] hover:-translate-y-1 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
                        style={{ transitionDelay: '300ms' }}
                        onClick={() => navigate('/cpu')}
                    >
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 blur-[50px] rounded-full group-hover:bg-violet-500/20 transition-colors duration-500 pointer-events-none" />
                        
                        <div className="mb-6 text-neutral-400 group-hover:text-violet-400 transition-colors duration-500">
                            <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
                            </svg>
                        </div>
                        
                        <h2 className="text-xl font-bold tracking-tight text-white mb-2">Versus AI</h2>
                        <p className="text-neutral-500 text-sm leading-relaxed mb-8 flex-grow">
                            Test your strategy against a dedicated heuristic engine. Refine your skills.
                        </p>
                        
                        <div className="mt-auto w-full inline-flex items-center justify-between px-5 py-3 text-sm font-medium text-neutral-300 bg-neutral-900/50 border border-neutral-800 rounded-xl group-hover:bg-violet-500/10 group-hover:border-violet-500/30 group-hover:text-violet-300 transition-all duration-300">
                            <span>Play CPU</span>
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}