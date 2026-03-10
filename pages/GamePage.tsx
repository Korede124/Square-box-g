
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ShieldCheck, Zap, Cpu, Gamepad2, Wallet, Trophy, Maximize2, Minimize2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { GAMES } from '../constants';
import { HighScore } from '../types';
import SnakeGame from '../games/SnakeGame';
import BrickBreaker from '../games/BrickBreaker';
import CarRacing from '../games/CarRacing';

interface GamePageProps {
  updateHighScore: (gameId: string, score: number) => number;
  highScores: HighScore[];
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  points: number;
}

const GamePage: React.FC<GamePageProps> = ({ updateHighScore, highScores, walletAddress, connectWallet, points }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const [isGameActive, setIsGameActive] = React.useState(false);
  const [pointsWon, setPointsWon] = React.useState<number | null>(null);
  const [lastScore, setLastScore] = React.useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const gameContainerRef = React.useRef<HTMLDivElement>(null);
  const game = GAMES.find(g => g.id === gameId);
  const userBest = highScores.find(s => s.gameId === gameId)?.score || 0;

  const toggleFullScreen = () => {
    if (!gameContainerRef.current) return;

    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const closeGame = () => {
    setIsGameActive(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  React.useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const triggerKey = (key: string) => {
    const event = new KeyboardEvent('keydown', {
      key: key,
      code: key,
      bubbles: true
    });
    window.dispatchEvent(event);
  };

  const handleGameOver = (score: number) => {
    const earned = updateHighScore(gameId!, score);
    setPointsWon(earned);
    setLastScore(score);
    setIsGameActive(false);
    
    // Auto-hide popup after 5 seconds
    setTimeout(() => {
      setPointsWon(null);
      setLastScore(null);
    }, 5000);
  };

  React.useEffect(() => {
    if (isGameActive) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isGameActive]);

  if (!game) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-orbitron font-black text-white mb-4">GAME NOT FOUND</h1>
        <Link to="/" className="text-cyan-400 font-bold hover:underline uppercase tracking-widest text-xs">Back to Lobby</Link>
      </div>
    );
  }

  const renderGameFrame = () => {
    // WALLET GATE: User must be connected to access the core engine
    if (!walletAddress) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-full bg-[#080808] w-full">
          <div className="w-28 h-28 mb-12 p-6 bg-cyan-500/5 rounded-[2rem] border border-cyan-500/20 flex items-center justify-center animate-pulse shadow-[0_0_60px_rgba(6,182,212,0.05)]">
            <Wallet className="w-full h-full text-cyan-400" />
          </div>
          <h2 className="font-orbitron text-3xl font-black text-white mb-4 uppercase tracking-tighter">SECURE ACCESS REQUIRED</h2>
          <p className="text-white/40 text-sm max-w-sm mb-12 leading-relaxed uppercase font-bold tracking-widest">
            Identity verification is mandatory for competitive play. Link your EVM wallet to initialize the {game.title} engine.
          </p>
          <button 
            onClick={connectWallet}
            className="group relative bg-orange-600 text-white font-orbitron font-black px-14 py-5 rounded-2xl shadow-[0_0_40px_rgba(234,88,12,0.3)] hover:scale-105 active:scale-95 transition-all text-xs tracking-[0.2em] overflow-hidden"
          >
            <span className="relative z-10">INITIALIZE WALLET CONNECTION</span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
          <p className="mt-8 text-[10px] font-black text-white/20 uppercase tracking-widest">Signed sessions ensure leaderboard integrity</p>
        </div>
      );
    }

    switch (gameId) {
      case 'snake':
        return <SnakeGame onGameOver={handleGameOver} personalBest={userBest} walletAddress={walletAddress} onStart={() => setIsGameActive(true)} />;
      case 'brick-box':
        return <BrickBreaker onGameOver={handleGameOver} onStart={() => setIsGameActive(true)} />;
      case 'car-racing':
        return <CarRacing onGameOver={handleGameOver} onStart={() => setIsGameActive(true)} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center p-20">
            <span className="text-white/20 font-orbitron font-black text-xl mb-4 uppercase tracking-[0.3em]">Encrypted Module</span>
            <p className="text-white/40 text-center max-w-sm uppercase text-xs font-bold tracking-widest">This game engine is currently in cold storage.</p>
          </div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Game Area */}
        <div className="lg:col-span-8 w-full">
          <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div className="flex items-center space-x-6">
              <Link to="/" className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all border border-white/5 hover:border-white/10 hover:shadow-xl group">
                <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
              </Link>
              <div>
                <h1 className="font-orbitron text-4xl font-black text-white uppercase tracking-tight">{game.title}</h1>
                <div className="flex items-center space-x-3 mt-1.5">
                  <span className="text-[10px] font-orbitron font-black text-cyan-400 tracking-[0.2em] uppercase">{game.category}</span>
                  <span className="text-white/10">•</span>
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3 h-3 text-white/30" />
                    <span className="text-[10px] font-orbitron font-black text-white/30 tracking-[0.2em] uppercase">EVM Secured</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glass-panel px-8 py-4 rounded-3xl flex items-center space-x-10 shadow-lg overflow-x-auto">
              <div className="text-center min-w-fit">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Personal Best</div>
                <div className="font-orbitron font-black text-cyan-400 text-xl">{userBest.toLocaleString()}</div>
              </div>
              <div className="h-10 w-px bg-white/10 shrink-0"></div>
              <div className="text-center min-w-fit px-4 py-2 bg-yellow-400/5 rounded-2xl border border-yellow-400/10">
                <div className="text-[10px] font-black text-yellow-400/40 uppercase tracking-[0.2em] mb-1">Total Points</div>
                <div className="font-orbitron font-black text-yellow-400 text-2xl drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">{points.toLocaleString()}</div>
              </div>
              <div className="h-10 w-px bg-white/10 shrink-0"></div>
              <div className="text-center min-w-fit">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Session Status</div>
                <div className={`flex items-center space-x-2 font-orbitron font-black text-[10px] uppercase tracking-widest ${walletAddress ? 'text-green-400' : 'text-orange-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${walletAddress ? 'bg-green-400' : 'bg-orange-400 animate-pulse'}`}></div>
                  <span>{walletAddress ? 'AUTHORIZED' : 'LOCKED'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Game Preview / Placeholder */}
            <div className="bg-[#050505] rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] aspect-video md:aspect-[16/9] flex flex-col items-center justify-center relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-50"></div>
              
              {!walletAddress ? (
                renderGameFrame()
              ) : (
                <div className="relative z-10 flex flex-col items-center text-center p-8">
                  <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mb-8 border border-cyan-500/20 group-hover:scale-110 transition-transform duration-500">
                    <Gamepad2 className="w-10 h-10 text-cyan-400" />
                  </div>
                  <h2 className="font-orbitron text-2xl font-black text-white mb-4 uppercase tracking-tighter">READY TO PLAY?</h2>
                  <p className="text-white/40 text-xs max-w-xs mb-10 leading-relaxed uppercase font-bold tracking-widest">
                    The {game.title} engine is initialized and secured. 
                  </p>
                  <button 
                    onClick={() => setIsGameActive(true)}
                    className="group relative bg-cyan-600 text-white font-orbitron font-black px-12 py-4 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.2)] hover:scale-105 active:scale-95 transition-all text-[10px] tracking-[0.2em] overflow-hidden"
                  >
                    <span className="relative z-10">LAUNCH GAME POP-UP</span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </div>
              )}
            </div>

            {/* Game Pop-Up Modal */}
            <AnimatePresence>
              {isGameActive && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-xl"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="relative w-full max-w-4xl flex flex-col items-center"
                    ref={gameContainerRef}
                  >
                    {/* Modal Header */}
                    <div className="w-full flex items-center justify-between mb-6 px-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="font-orbitron text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Live Session: {game.title}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={toggleFullScreen}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white/50 hover:text-white transition-all"
                        >
                          {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={closeGame}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 text-red-400 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Game Container with Smaller Ratio (4:3 for better focus) */}
                    <div className={`bg-[#050505] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative ${isFullScreen ? 'h-screen w-screen rounded-none border-none' : 'w-full aspect-[4/3] md:aspect-[16/10] max-h-[70vh]'} flex items-center justify-center`}>
                      {renderGameFrame()}
                    </div>

                    {/* Mobile Controls in Modal */}
                    <div className="mt-8 flex flex-col items-center gap-6 md:hidden w-full">
                      <div className="flex flex-col items-center gap-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div></div>
                          <button 
                            onPointerDown={(e) => { e.preventDefault(); triggerKey('ArrowUp'); }}
                            className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:bg-cyan-500/20 active:border-cyan-500/50 transition-all touch-none"
                          >
                            <ArrowUp className="w-8 h-8 text-white" />
                          </button>
                          <div></div>
                          <button 
                            onPointerDown={(e) => { e.preventDefault(); triggerKey('ArrowLeft'); }}
                            className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:bg-cyan-500/20 active:border-cyan-500/50 transition-all touch-none"
                          >
                            <ArrowLeft className="w-8 h-8 text-white" />
                          </button>
                          <button 
                            onPointerDown={(e) => { e.preventDefault(); triggerKey('ArrowDown'); }}
                            className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:bg-cyan-500/20 active:border-cyan-500/50 transition-all touch-none"
                          >
                            <ArrowDown className="w-8 h-8 text-white" />
                          </button>
                          <button 
                            onPointerDown={(e) => { e.preventDefault(); triggerKey('ArrowRight'); }}
                            className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center active:bg-cyan-500/20 active:border-cyan-500/50 transition-all touch-none"
                          >
                            <ArrowRight className="w-8 h-8 text-white" />
                          </button>
                        </div>
                        
                        <button 
                          onPointerDown={(e) => { e.preventDefault(); triggerKey('Space'); }}
                          className="w-full max-w-[200px] bg-cyan-600 hover:bg-cyan-500 text-white font-orbitron font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                        >
                          START / ACTION
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Points Won Popup Overlay (Global) */}
            <AnimatePresence>
              {pointsWon !== null && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none p-6"
                >
                  <div className="glass-panel p-12 rounded-[3rem] border-2 border-yellow-500/50 bg-black/80 backdrop-blur-xl flex flex-col items-center text-center shadow-[0_0_100px_rgba(234,179,8,0.2)] pointer-events-auto max-w-md w-full">
                    <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 border border-yellow-500/30 animate-bounce">
                      <Zap className="w-10 h-10 text-yellow-400 fill-yellow-400" />
                    </div>
                    <h3 className="font-orbitron text-xs font-black text-white/40 uppercase tracking-[0.4em] mb-2">Session Complete</h3>
                    <div className="text-5xl font-orbitron font-black text-white mb-4">
                      SCORE: {lastScore}
                    </div>
                    <div className="h-px w-32 bg-white/10 mb-6"></div>
                    <div className="text-yellow-400 font-orbitron font-black text-5xl animate-pulse shadow-yellow-500/20 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                      +{pointsWon} POINTS
                    </div>
                    <p className="mt-6 text-[10px] font-black text-white/20 uppercase tracking-widest">Rewards added to your vault</p>
                    
                    <button 
                      onClick={() => setPointsWon(null)}
                      className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                    >
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Contextual UI */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-panel p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center space-x-3 mb-8">
                  <Gamepad2 className="w-4 h-4 text-white/20" />
                  <h4 className="font-orbitron text-[10px] font-black text-white/20 tracking-[0.3em] uppercase">CONTROL SCHEME</h4>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Primary Action</span>
                    <span className="flex gap-2">
                      <span className="bg-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black border border-white/10">W/A/S/D</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Interface</span>
                    <span className="bg-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black border border-white/10 uppercase tracking-widest">ESC</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center space-x-3 mb-8">
                  <Wallet className="w-4 h-4 text-white/20" />
                  <h4 className="font-orbitron text-[10px] font-black text-white/20 tracking-[0.3em] uppercase">NETWORK SIGNATURE</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${walletAddress ? 'bg-green-400' : 'bg-orange-500 animate-pulse'}`}></div>
                    <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                      {walletAddress ? 'VALID SESSION' : 'CONNECTION REQUIRED'}
                    </span>
                  </div>
                  <p className="text-white/30 text-[9px] leading-relaxed uppercase font-bold tracking-[0.2em]">
                    ADDRESS: <br/>
                    <span className="text-cyan-400 font-mono text-[11px] truncate block mt-1">
                      {walletAddress ? walletAddress : 'WAITING_FOR_HANDSHAKE'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center space-x-3 mb-8">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <h4 className="font-orbitron text-[10px] font-black text-white/20 tracking-[0.3em] uppercase">REWARDS SYSTEM</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-white/40">1000 Pts</span>
                    <span className="text-green-400">$0.20 USD</span>
                  </div>
                  <div className="h-px bg-white/5"></div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-white/40">Score 5+</span>
                    <span className="text-cyan-400">+10 Pts</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-white/40">Score 10+</span>
                    <span className="text-cyan-400">+50 Pts</span>
                  </div>
                  <div className="mt-4 p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-[9px] text-cyan-400 font-black uppercase tracking-widest text-center animate-pulse">
                    PLAY TO EARN REAL REWARDS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GamePage;
