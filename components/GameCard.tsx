
import React from 'react';
import { Link } from 'react-router-dom';
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
    <div className={`group glass-panel rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${accentColors[game.accentColor]}`}>
      <div className="relative h-48 overflow-hidden">
        <img 
          src={game.thumbnail} 
          alt={game.title} 
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${!isPlayable ? 'grayscale opacity-50' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-2 py-1 rounded text-[10px] font-orbitron font-black tracking-widest uppercase ${badgeColors[game.accentColor]}`}>
            {game.category}
          </span>
          {game.isBuiltIn && (
            <span className="bg-white/10 backdrop-blur-md border border-white/20 px-2 py-1 rounded text-[10px] font-orbitron font-black tracking-widest uppercase text-white">
              CORE ENGINE
            </span>
          )}
        </div>

        {!isPlayable && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-lg font-orbitron font-black text-white text-sm tracking-[0.2em] border border-white/20">
              COMING SOON
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-orbitron text-xl font-black text-white mb-2 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
          {game.title}
        </h3>
        <p className="text-white/40 text-sm leading-relaxed mb-6 line-clamp-2">
          {game.description}
        </p>
        
        {isPlayable ? (
          <Link 
            to={`/game/${game.id}`}
            className={`block w-full text-center py-3 rounded-xl font-orbitron font-black text-sm tracking-[0.2em] transition-all transform active:scale-95 ${
              game.accentColor === 'blue' ? 'bg-cyan-500 hover:bg-cyan-400 text-black' :
              game.accentColor === 'purple' ? 'bg-purple-600 hover:bg-purple-500 text-white' :
              'bg-emerald-500 hover:bg-emerald-400 text-black'
            }`}
          >
            PLAY NOW
          </Link>
        ) : (
          <button 
            disabled
            className="w-full text-center py-3 rounded-xl font-orbitron font-black text-sm tracking-[0.2em] bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
          >
            LOCKED
          </button>
        )}
      </div>
    </div>
  );
};

export default GameCard;
