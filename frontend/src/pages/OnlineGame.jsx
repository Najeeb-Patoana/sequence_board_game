import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOnlineGame } from '../hooks/useOnlineGame';
import GameBoard from '../components/GameBoard';
import PlayerHand from '../components/PlayerHand';
import GameInfoPanel from '../components/GameInfoPanel';
import TurnIndicator from '../components/TurnIndicator';
import DeckDisplay from '../components/DeckDisplay';
import WaitingRoom from '../components/WaitingRoom';
import WinnerModal from '../components/WinnerModal';

export default function OnlineGame() {
    const { roomId: urlRoomId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [setupState, setSetupState] = useState(urlRoomId ? 'joining' : 'setup'); // setup, joining, error
    const [hoveredMatches, setHoveredMatches] = useState([]);
    const [selectedHandCard, setSelectedHandCard] = useState(null);
    
    const { 
        status, roomInfo, playerInfo, gameState, errorMsg, winner, 
        createCustomRoom, joinCustomRoom, playOnline, makeMove, quitGame, setStatus 
    } = useOnlineGame();

    // Auto-join if URL has roomId and user submits name
    const handleJoinWithUrl = (e) => {
        e.preventDefault();
        if (name.trim()) {
            joinCustomRoom(urlRoomId, name.trim());
        }
    };

    useEffect(() => {
        if (errorMsg) {
            setSetupState('error');
        }
    }, [errorMsg]);

    const handleCreateRoom = () => {
        if (name.trim()) {
            createCustomRoom(name.trim());
        }
    };

    const handleJoinCustom = () => {
        if (name.trim() && joinRoomId.trim()) {
            joinCustomRoom(joinRoomId.trim(), name.trim());
        }
    };

    const handleQuickMatch = () => {
        if (name.trim()) {
            playOnline(name.trim());
        }
    };

    const handleQuit = () => {
        quitGame();
        navigate('/');
    };

    const handleBoardClick = (cardId) => {
        if (selectedHandCard) {
            makeMove(cardId, selectedHandCard);
            setSelectedHandCard(null);
            setHoveredMatches([]);
        }
    };

    // UI Renders based on connection status

    if (setupState === 'joining' && status === 'idle') {
        return (
            <div className="container max-w-md mx-auto mt-20">
                <div className="glass-card p-8">
                    <h2 className="text-2xl mb-6 text-center">Join Private Room</h2>
                    <p className="text-center text-muted mb-6">You've been invited to room: <strong>{urlRoomId}</strong></p>
                    <form onSubmit={handleJoinWithUrl} className="flex flex-col gap-4">
                        <input 
                            type="text" 
                            className="input" 
                            placeholder="Enter your name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            maxLength={15}
                            required
                        />
                        <button type="submit" className="btn btn-primary mt-2">Join Game</button>
                        <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>Cancel</button>
                    </form>
                </div>
            </div>
        );
    }

    if (status === 'idle' || setupState === 'error') {
        return (
            <div className="container max-w-lg mx-auto mt-12">
                <button className="text-muted hover:text-white mb-8 flex items-center gap-2 transition-colors" onClick={() => navigate('/')}>
                    ← Back to Menu
                </button>

                <div className="glass-card p-8">
                    <h2 className="text-3xl mb-8 text-center text-gradient">Online Multiplayer</h2>
                    
                    {errorMsg && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-md mb-8">
                            {errorMsg}
                            <button className="float-right font-bold" onClick={() => { setStatus('idle'); setSetupState('setup'); }}>&times;</button>
                        </div>
                    )}

                    <div className="mb-8">
                        <label className="block text-sm text-muted mb-2">Player Name</label>
                        <input 
                            type="text" 
                            className="input" 
                            placeholder="Enter your name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            maxLength={15}
                        />
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="border border-gray-700 rounded-lg p-6">
                            <h3 className="text-lg mb-4">Quick Match</h3>
                            <button className="btn btn-primary w-full" onClick={handleQuickMatch} disabled={!name.trim()}>
                                Find Random Opponent
                            </button>
                        </div>

                        <div className="border border-gray-700 rounded-lg p-6">
                            <h3 className="text-lg mb-4">Play with Friends</h3>
                            <div className="flex gap-4 mb-4">
                                <input 
                                    type="text" 
                                    className="input flex-1" 
                                    placeholder="Room ID" 
                                    value={joinRoomId} 
                                    onChange={(e) => setJoinRoomId(e.target.value)}
                                />
                                <button className="btn btn-primary whitespace-nowrap" onClick={handleJoinCustom} disabled={!name.trim() || !joinRoomId.trim()}>
                                    Join
                                </button>
                            </div>
                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-gray-700"></div>
                                <span className="flex-shrink-0 mx-4 text-muted text-sm">OR</span>
                                <div className="flex-grow border-t border-gray-700"></div>
                            </div>
                            <button className="btn btn-outline w-full mt-4" onClick={handleCreateRoom} disabled={!name.trim()}>
                                Create Private Room
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'waiting') {
        return (
            <div className="container">
                <button className="text-muted hover:text-white mb-8 flex items-center gap-2" onClick={handleQuit}>
                    ← Leave Room
                </button>
                <WaitingRoom roomId={roomInfo?.roomId} />
            </div>
        );
    }

    if ((status === 'playing' || status === 'gameover') && gameState) {
        const isMyTurn = gameState.currentTurn === playerInfo.playingAs;

        return (
            <div className="game-layout">
                {/* Left Sidebar */}
                <div className="flex flex-col gap-6 h-full">
                    <button className="text-muted hover:text-white flex items-center gap-2 self-start transition-colors" onClick={handleQuit}>
                        ← Leave Game
                    </button>
                    
                    <GameInfoPanel 
                        scores={gameState.scores} 
                        deckCount={gameState.deckCount} 
                        players={gameState.players} 
                        playingAs={playerInfo.playingAs}
                    />

                    <div className="flex-1"></div>

                    <div className="flex flex-col items-center gap-4">
                        <DeckDisplay count={gameState.deckCount} />
                        <TurnIndicator 
                            currentTurn={gameState.currentTurn} 
                            playingAs={playerInfo.playingAs} 
                            players={gameState.players}
                            isOffline={false}
                        />
                    </div>
                </div>

                {/* Right Area - Board & Hand */}
                <div className="flex flex-col justify-between h-full">
                    <GameBoard 
                        cards={gameState.cards} 
                        hoveredCards={hoveredMatches}
                        selectedBoardId={null} // We select hand card first, then board
                        onBoardClick={handleBoardClick}
                    />
                    
                    <PlayerHand 
                        hand={playerInfo.hand}
                        isMyTurn={isMyTurn}
                        selectedHandCard={selectedHandCard}
                        onCardSelect={setSelectedHandCard}
                        onCardHover={setHoveredMatches}
                    />
                </div>

                <WinnerModal winner={winner} onPlayAgain={null /* online requires re-queuing */} />
            </div>
        );
    }

    return null;
}
