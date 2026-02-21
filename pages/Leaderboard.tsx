
import React, { useState } from 'react';
import { GAMES, MOCK_PLAYERS } from '../constants';

const Leaderboard: React.FC = () => {
  const [activeGameId, setActiveGameId] = useState(GAMES[0].id);

  return (
    <div className="py-20 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="font-orbitron text-5xl font-black text-white mb-4 uppercase tracking-tighter">GLOBAL <span className="text-cyan-400">RANKINGS</span></h1>
        <p className="text-white/40 max-w-lg mx-auto uppercase text-xs font-bold tracking-[0.3em]">Where legends are written in neon</p>
      </div>

      {/* Game Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
        {GAMES.filter(g => g.status === 'playable').map(game => (
          <button
            key={game.id}
            onClick={() => setActiveGameId(game.id)}
            className={`px-8 py-3 rounded-xl font-orbitron font-black text-sm tracking-widest transition-all ${
              activeGameId === game.id 
              ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105' 
              : 'bg-white/5 text-white/40 hover:text-white border border-white/5'
            }`}
          >
            {game.title}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-8 py-6 border-b border-white/5 text-[10px] font-orbitron font-black text-white/30 uppercase tracking-[0.2em]">
          <div className="col-span-2">Rank</div>
          <div className="col-span-6">Player</div>
          <div className="col-span-4 text-right">High Score</div>
        </div>

        <div className="divide-y divide-white/5">
          {MOCK_PLAYERS.map((player) => (
            <div key={player.username} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-white/[0.02] transition-colors group">
              <div className="col-span-2">
                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-orbitron font-black text-lg ${
                  player.rank === 1 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' : 
                  player.rank === 2 ? 'bg-gray-400/10 text-gray-400 border border-gray-400/30' :
                  player.rank === 3 ? 'bg-orange-600/10 text-orange-600 border border-orange-600/30' :
                  'bg-white/5 text-white/40'
                }`}>
                  {player.rank}
                </span>
              </div>
              <div className="col-span-6 flex items-center space-x-4">
                <div className="relative">
                  <img src={player.avatar} alt={player.username} className="w-12 h-12 rounded-full border-2 border-white/10" />
                  {player.rank <= 3 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-black flex items-center justify-center text-[10px] shadow-lg">
                      👑
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-orbitron font-black text-white text-lg group-hover:text-cyan-400 transition-colors uppercase">{player.username}</div>
                  <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Verified Player</div>
                </div>
              </div>
              <div className="col-span-4 text-right">
                <div className="font-orbitron font-black text-white text-2xl tracking-tighter">
                  {player.score.toLocaleString()}
                </div>
                <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Units</div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State / Footer */}
        <div className="p-8 bg-white/[0.02] text-center">
          <p className="text-white/20 text-xs font-bold uppercase tracking-widest">Scores are updated in real-time. Keep playing to climb the ranks.</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
