
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GAMES, MOCK_PLAYERS } from '../constants';
import GameCard from '../components/GameCard';

interface LobbyProps {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
}

const Lobby: React.FC<LobbyProps> = ({ walletAddress, connectWallet }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGames = GAMES.filter(game => 
    game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative h-[550px] flex items-center justify-center overflow-hidden">
        {/* Animated Background Element */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px] animate-pulse delay-700"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl">
          <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/5 text-orange-400 text-[10px] font-orbitron font-black tracking-[0.3em] uppercase mb-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg" className="w-4 h-4" alt="MetaMask" />
            <span>AUTHENTICATED GAMING NETWORK</span>
          </div>
          <h1 className="font-orbitron text-5xl md:text-7xl font-black text-white leading-tight mb-6 uppercase tracking-tighter">
            PRO GRADE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-white">ARCADE</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Retro thrills meet production-ready Web3 security. Link your MetaMask to unlock built-in games and secure your spot on the hall of fame.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#games" className="group relative bg-white text-black font-orbitron font-black px-12 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              BROWSE GAMES
              <div className="absolute inset-0 rounded-xl bg-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity blur-lg"></div>
            </a>
            {!walletAddress && (
              <button 
                onClick={connectWallet} 
                className="font-orbitron font-black text-orange-400 border-2 border-orange-500/30 px-10 py-4 rounded-xl transition-all hover:bg-orange-500/5 hover:border-orange-500/50 active:scale-95"
              >
                LINK METAMASK
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Dashboard Stats Strip */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 mb-20 relative z-20">
        <div className="glass-panel rounded-2xl grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5 overflow-hidden">
          <div className="p-8 text-center">
            <div className="text-cyan-400 font-orbitron text-2xl font-black mb-1">1,240+</div>
            <div className="text-white/30 text-xs font-bold uppercase tracking-widest">Active Players</div>
          </div>
          <div className="p-8 text-center">
            <div className={`font-orbitron text-2xl font-black mb-1 ${walletAddress ? 'text-green-400' : 'text-orange-400'}`}>
              {walletAddress ? 'CONNECTED' : 'UNLINKED'}
            </div>
            <div className="text-white/30 text-xs font-bold uppercase tracking-widest">Wallet Status</div>
          </div>
          <div className="p-8 text-center">
            <div className="text-emerald-400 font-orbitron text-2xl font-black mb-1">$0.00</div>
            <div className="text-white/30 text-xs font-bold uppercase tracking-widest">Platform Fee</div>
          </div>
          <div className="p-8 text-center">
            <div className="text-white font-orbitron text-2xl font-black mb-1">24/7</div>
            <div className="text-white/30 text-xs font-bold uppercase tracking-widest">Live Uptime</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div id="games" className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Games Grid Side */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 className="font-orbitron text-3xl font-black text-white uppercase tracking-tight">ARCADE <span className="text-cyan-400">LOBBY</span></h2>
            <div className="relative w-full md:w-80">
              <input 
                type="text" 
                placeholder="Search games..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all text-white font-medium"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>

        {/* Sidebar Mini-Leaderboard */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass-panel rounded-2xl p-6 sticky top-28">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-orbitron text-sm font-black text-white/50 tracking-widest uppercase">Global Hall</h3>
              <Link to="/leaderboard" className="text-xs font-bold text-cyan-400 hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {MOCK_PLAYERS.map((player) => (
                <div key={player.username} className="flex items-center justify-between group p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-white/40 border border-white/5 font-orbitron font-black text-xs">
                      {player.rank}
                    </div>
                    <div className="flex items-center space-x-3">
                      <img src={player.avatar} alt={player.username} className="w-8 h-8 rounded-full border border-white/10" />
                      <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{player.username}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-orbitron font-black text-white">{player.score.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!walletAddress && (
            <div className="bg-gradient-to-br from-orange-900/40 to-black p-8 rounded-2xl border border-orange-500/30 text-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg" className="w-12 h-12 mx-auto mb-4" alt="MetaMask" />
              <h4 className="font-orbitron text-sm font-black text-white mb-2 uppercase tracking-widest">METAMASK REQUIRED</h4>
              <p className="text-white/40 text-[10px] mb-6 leading-relaxed uppercase">To secure your high scores and join the global leaderboards, you must link your identity via the MetaMask API.</p>
              <button 
                onClick={connectWallet}
                className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
              >
                ACTIVATE WALLET
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
