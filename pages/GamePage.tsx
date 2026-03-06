
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ShieldCheck, Zap, Cpu, Gamepad2, Wallet } from 'lucide-react';
import { GAMES } from '../constants';
import { HighScore } from '../types';
import SnakeGame from '../games/SnakeGame';
import BrickBreaker from '../games/BrickBreaker';
import CarRacing from '../games/CarRacing';

interface GamePageProps {
  updateHighScore: (gameId: string, score: number) => void;
  highScores: HighScore[];
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
}

const GamePage: React.FC<GamePageProps> = ({ updateHighScore, highScores, walletAddress, connectWallet }) => {
  const { gameId } = useParams<{ gameId: string }>();
  const game = GAMES.find(g => g.id === gameId);
  const userBest = highScores.find(s => s.gameId === gameId)?.score || 0;

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
        return <SnakeGame onGameOver={(score) => updateHighScore('snake', score)} personalBest={userBest} walletAddress={walletAddress} />;
      case 'brick-box':
        return <BrickBreaker onGameOver={(score) => updateHighScore('brick-box', score)} />;
      case 'car-racing':
        return <CarRacing onGameOver={(score) => updateHighScore('car-racing', score)} />;
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
            
            <div className="glass-panel px-8 py-4 rounded-3xl flex items-center space-x-10 shadow-lg">
              <div className="text-center">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Personal Best</div>
                <div className="font-orbitron font-black text-cyan-400 text-xl">{userBest.toLocaleString()}</div>
              </div>
              <div className="h-10 w-px bg-white/10"></div>
              <div className="text-center">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Session Status</div>
                <div className={`flex items-center space-x-2 font-orbitron font-black text-[10px] uppercase tracking-widest ${walletAddress ? 'text-green-400' : 'text-orange-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${walletAddress ? 'bg-green-400' : 'bg-orange-400 animate-pulse'}`}></div>
                  <span>{walletAddress ? 'AUTHORIZED' : 'LOCKED'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* The Main Game Container */}
            <motion.div 
              layout
              className={`bg-[#050505] rounded-[3rem] overflow-hidden border transition-all duration-1000 min-h-[550px] ${walletAddress ? 'border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,1)]' : 'border-orange-500/20 shadow-[0_0_100px_rgba(249,115,22,0.03)]'} aspect-video md:aspect-[16/9] flex items-center justify-center`}
            >
              {renderGameFrame()}
            </motion.div>
            
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

              <div className="glass-panel p-8 rounded-[2rem] flex flex-col justify-center items-center text-center border border-white/5 hover:border-white/10 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/5 flex items-center justify-center mb-5 border border-cyan-500/20 shadow-inner">
                  <Cpu className="h-7 w-7 text-cyan-400" />
                </div>
                <h4 className="font-orbitron text-[11px] font-black text-white uppercase tracking-[0.3em] mb-1">PRO ENGINE</h4>
                <p className="text-white/30 text-[9px] uppercase font-bold tracking-widest leading-relaxed">
                  SECURE COMPUTE <br/> ANTI-CHEAT ACTIVE
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GamePage;
