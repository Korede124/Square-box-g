
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Lock, Cpu } from 'lucide-react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const isPlayable = game.status === 'playable';
  
  const accentColors = {
    blue: 'border-cyan-500/30 group-hover:border-cyan-400 shadow-cyan-500/10',
    purple: 'border-purple-500/30 group-hover:border-purple-400 shadow-purple-500/10',
    green: 'border-emerald-500/30 group-hover:border-emerald-400 shadow-emerald-500/10',
    orange: 'border-orange-500/30 group-hover:border-orange-400 shadow-orange-500/10'
  };

  const badgeColors = {
    blue: 'bg-cyan-500/20 text-cyan-400',
    purple: 'bg-purple-500/20 text-purple-400',
    green: 'bg-emerald-500/20 text-emerald-400',
    orange: 'bg-orange-500/20 text-orange-400'
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className={`group glass-panel rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] ${accentColors[game.accentColor]}`}
    >
      <div className="relative h-56 overflow-hidden">
        <motion.img 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
          src={game.thumbnail} 
          alt={game.title} 
          className={`w-full h-full object-cover ${!isPlayable ? 'grayscale opacity-50' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-5 left-5 flex gap-3">
          <span className={`px-3 py-1 rounded-lg text-[10px] font-orbitron font-black tracking-widest uppercase ${badgeColors[game.accentColor]}`}>
            {game.category}
          </span>
          {game.isBuiltIn && (
            <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-lg text-[10px] font-orbitron font-black tracking-widest uppercase text-white flex items-center space-x-2">
              <Cpu className="w-3 h-3" />
              <span>CORE</span>
            </span>
          )}
        </div>

        {!isPlayable && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-xl font-orbitron font-black text-white text-xs tracking-[0.3em] border border-white/20 uppercase">
              Coming Soon
            </span>
          </div>
        )}
      </div>

      <div className="p-8">
        <h3 className="font-orbitron text-2xl font-black text-white mb-3 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
          {game.title}
        </h3>
        <p className="text-white/40 text-sm leading-relaxed mb-8 line-clamp-2 font-medium">
          {game.description}
        </p>
        
        {isPlayable ? (
          <Link 
            to={`/game/${game.id}`}
            className={`group/btn flex items-center justify-center space-x-3 w-full py-4 rounded-2xl font-orbitron font-black text-xs tracking-[0.2em] transition-all transform active:scale-95 ${
              game.accentColor === 'blue' ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]' :
              game.accentColor === 'purple' ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]' :
              'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            }`}
          >
            <Play className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" />
            <span>PLAY MODULE</span>
          </Link>
        ) : (
          <button 
            disabled
            className="flex items-center justify-center space-x-3 w-full py-4 rounded-2xl font-orbitron font-black text-xs tracking-[0.2em] bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
          >
            <Lock className="w-4 h-4" />
            <span>LOCKED</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default GameCard;
