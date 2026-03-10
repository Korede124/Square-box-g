
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Users, Wallet, Zap, Clock, Trophy, ArrowRight } from 'lucide-react';
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-20"
    >
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Partnership Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://storage.googleapis.com/test-full-stack-apps/ct6b44ynmdawtk2ywyz42c/1741606692257.png" 
            alt="Partnership Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-3 px-6 py-2 rounded-full border border-cyan-500/50 bg-black/60 backdrop-blur-md text-cyan-400 text-[10px] font-orbitron font-black tracking-[0.4em] uppercase mb-8"
          >
            <Zap className="w-3 h-3 fill-cyan-400" />
            <span>PAGANI X SQUARE BOX STRATEGIC PARTNER</span>
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-orbitron text-5xl sm:text-7xl md:text-9xl font-black text-white leading-[0.85] mb-8 uppercase tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
          >
            LIMITLESS <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-white">VELOCITY</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white text-lg md:text-2xl font-bold max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow-lg"
          >
            The world's most advanced arcade network, powered by OKX and Somnia. 
            Experience the fusion of high-performance engineering and Web3 gaming.
          </motion.p>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <a href="#games" className="group relative bg-white text-black font-orbitron font-black px-12 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              BROWSE GAMES
              <div className="absolute inset-0 rounded-xl bg-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity blur-lg"></div>
            </a>
            {!walletAddress && (
              <button 
                onClick={connectWallet} 
                className="group flex items-center space-x-3 font-orbitron font-black text-orange-400 border-2 border-orange-500/30 px-10 py-4 rounded-xl transition-all hover:bg-orange-500/5 hover:border-orange-500/50 active:scale-95"
              >
                <Wallet className="w-4 h-4 group-hover:animate-bounce" />
                <span>LINK EVM WALLET</span>
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Strategic Partnership Section */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="relative rounded-[3rem] overflow-hidden border border-white/10 bg-black shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative h-[300px] lg:h-auto overflow-hidden">
              <img 
                src="https://storage.googleapis.com/test-full-stack-apps/ct6b44ynmdawtk2ywyz42c/1741606692257.png" 
                alt="Pagani Partnership" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent lg:hidden"></div>
            </div>
            <div className="p-12 flex flex-col justify-center">
              <div className="flex items-center space-x-4 mb-6">
                <div className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-orbitron font-black tracking-[0.3em] uppercase">
                  Strategic Asset
                </div>
                <div className="h-px w-12 bg-white/10"></div>
                <span className="text-white/30 text-[10px] font-orbitron font-black tracking-[0.3em] uppercase">Verified</span>
              </div>
              <h2 className="font-orbitron text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter leading-none">
                PAGANI X <br/>
                <span className="text-cyan-400">SQUARE BOX</span>
              </h2>
              <p className="text-white/50 text-lg mb-10 leading-relaxed">
                Experience the pinnacle of digital performance. Our collaboration with Pagani brings world-class engineering aesthetics to the arcade, ensuring every session is as refined as it is fast.
              </p>
              <div className="flex items-center space-x-8">
                <div className="flex flex-col">
                  <span className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-1">Engine</span>
                  <span className="text-white font-orbitron font-black">V12 DIGITAL</span>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-1">Network</span>
                  <span className="text-cyan-400 font-orbitron font-black">SOMNIA MAINNET</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Stats Strip */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 mb-24 relative z-20">
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-panel rounded-3xl grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5 overflow-hidden shadow-2xl"
        >
          <div className="p-6 sm:p-10 text-center group hover:bg-white/[0.02] transition-colors">
            <Users className="w-5 h-5 mx-auto mb-3 text-cyan-400 opacity-50" />
            <div className="text-cyan-400 font-orbitron text-xl sm:text-3xl font-black mb-1">1,240+</div>
            <div className="text-white/30 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Active Players</div>
          </div>
          <div className="p-6 sm:p-10 text-center group hover:bg-white/[0.02] transition-colors">
            <Wallet className={`w-5 h-5 mx-auto mb-3 opacity-50 ${walletAddress ? 'text-green-400' : 'text-orange-400'}`} />
            <div className={`font-orbitron text-lg sm:text-2xl font-black mb-1 ${walletAddress ? 'text-green-400' : 'text-orange-400'}`}>
              {walletAddress ? 'CONNECTED' : 'UNLINKED'}
            </div>
            <div className="text-white/30 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Wallet Status</div>
          </div>
          <div className="p-6 sm:p-10 text-center group hover:bg-white/[0.02] transition-colors">
            <Zap className="w-5 h-5 mx-auto mb-3 text-emerald-400 opacity-50" />
            <div className="text-emerald-400 font-orbitron text-xl sm:text-3xl font-black mb-1">$0.00</div>
            <div className="text-white/30 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Platform Fee</div>
          </div>
          <div className="p-6 sm:p-10 text-center group hover:bg-white/[0.02] transition-colors">
            <Clock className="w-5 h-5 mx-auto mb-3 text-white opacity-50" />
            <div className="text-white font-orbitron text-xl sm:text-3xl font-black mb-1">24/7</div>
            <div className="text-white/30 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Live Uptime</div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div id="games" className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Games Grid Side */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h2 className="font-orbitron text-4xl font-black text-white uppercase tracking-tight mb-2">ARCADE <span className="text-cyan-400">LOBBY</span></h2>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest">Select a module to initialize</p>
            </div>
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                placeholder="Search games..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-cyan-500 transition-all text-white font-medium placeholder:text-white/20"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20">
                <Search className="w-5 h-5" />
              </div>
            </div>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-10"
          >
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GameCard game={game} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Sidebar Mini-Leaderboard */}
        <div className="lg:col-span-4 space-y-10">
          <div className="glass-panel rounded-[2.5rem] p-8 sticky top-28 shadow-xl">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-3">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-orbitron text-xs font-black text-white/50 tracking-widest uppercase">Global Hall</h3>
              </div>
              <Link to="/leaderboard" className="group flex items-center space-x-2 text-[10px] font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest">
                <span>View All</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="space-y-6">
              {MOCK_PLAYERS.map((player) => (
                <div key={player.username} className="flex items-center justify-between group p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer">
                  <div className="flex items-center space-x-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-orbitron font-black text-sm border transition-all ${
                      player.rank === 1 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                      'bg-white/5 text-white/40 border-white/5'
                    }`}>
                      {player.rank}
                    </div>
                    <div className="flex items-center space-x-4">
                      <img src={player.avatar} alt={player.username} className="w-10 h-10 rounded-full border-2 border-white/10 group-hover:border-cyan-400 transition-all" />
                      <div>
                        <div className="font-bold text-white group-hover:text-cyan-400 transition-colors text-sm">{player.username}</div>
                        <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Verified</div>
                      </div>
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
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-orange-900/40 to-black p-10 rounded-[2.5rem] border border-orange-500/30 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
                <Wallet className="w-12 h-12 text-cyan-400" />
              </div>
              <h4 className="font-orbitron text-sm font-black text-white mb-3 uppercase tracking-widest">EVM WALLET REQUIRED</h4>
              <p className="text-white/40 text-[10px] mb-8 leading-relaxed uppercase font-bold tracking-widest">To secure your high scores and join the global leaderboards, you must link your identity via the EVM Protocol. Compatible with MetaMask, OKX, and Somnia.</p>
              <button 
                onClick={connectWallet}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-orbitron font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                ACTIVATE WALLET
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Lobby;
