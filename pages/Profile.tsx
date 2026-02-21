
import React from 'react';
import { User, HighScore } from '../types';
import { GAMES } from '../constants';
import { Link } from 'react-router-dom';

interface ProfileProps {
  user: User | null;
  highScores: HighScore[];
  walletAddress: string | null;
}

const Profile: React.FC<ProfileProps> = ({ user, highScores, walletAddress }) => {
  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border-2 border-dashed border-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="font-orbitron text-3xl font-black text-white mb-4 uppercase tracking-tight">IDENTITY NOT VERIFIED</h1>
        <p className="text-white/40 max-w-sm mb-8 leading-relaxed">Please log in to your account to synchronize your high scores and access the global competitive network.</p>
        <button className="bg-cyan-500 text-black font-orbitron font-black px-12 py-4 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs">
          AUTHENTICATE NOW
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Total Score', value: user.totalScore.toLocaleString(), color: 'text-cyan-400' },
    { label: 'Network', value: walletAddress ? 'Linked' : 'Offline', color: walletAddress ? 'text-green-400' : 'text-orange-400' },
    { label: 'Ranking', value: '#1,248', color: 'text-emerald-400' },
    { label: 'Medals', value: '12', color: 'text-orange-400' },
  ];

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      {/* Header Profile Card */}
      <div className="glass-panel rounded-[2rem] p-10 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-[60px] -ml-24 -mb-24"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl border-2 border-cyan-400 p-1">
              <img src={user.avatar} alt={user.username} className="w-full h-full rounded-2xl object-cover" />
            </div>
            {walletAddress && (
              <div className="absolute -top-2 -left-2 bg-green-500 p-1.5 rounded-full shadow-lg border-2 border-black" title="Verified Wallet">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-grow text-center md:text-left">
            <h1 className="font-orbitron text-4xl font-black text-white mb-2 uppercase tracking-tight">{user.username}</h1>
            <div className="flex flex-col space-y-2">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{user.email}</p>
              {walletAddress && (
                <p className="text-cyan-400 text-[10px] font-mono font-bold tracking-widest">{walletAddress}</p>
              )}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
              <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-white/60">EST. {new Date(user.joinedDate).getFullYear()}</span>
              {walletAddress ? (
                <span className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl text-xs font-bold text-green-400">VERIFIED CHAIN IDENTITY</span>
              ) : (
                // Fix: cast window as any to resolve property 'ethereum' not existing on type 'Window' (Line 72)
                <button onClick={() => (window as any).ethereum?.request({ method: 'eth_requestAccounts' })} className="bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl text-xs font-bold text-orange-400 hover:bg-orange-500/20 transition-all">UNLINKED - CONNECT NOW</button>
              )}
            </div>
          </div>
          
          <div className="hidden lg:block w-px h-32 bg-white/5"></div>
          
          <div className="grid grid-cols-2 gap-8 min-w-[300px]">
            {stats.map(stat => (
              <div key={stat.label}>
                <div className="text-[10px] font-orbitron font-bold text-white/30 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
                <div className={`font-orbitron font-black text-2xl ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <h2 className="font-orbitron text-xl font-black text-white uppercase tracking-widest">CHAIN <span className="text-cyan-400">LOG</span></h2>
          <div className="space-y-4">
            {highScores.length > 0 ? highScores.map((score, i) => {
              const game = GAMES.find(g => g.id === score.gameId);
              return (
                <div key={i} className="glass-panel rounded-2xl p-6 flex items-center justify-between hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center space-x-6">
                    <img src={game?.thumbnail} className="w-16 h-16 rounded-xl object-cover grayscale opacity-50" alt="" />
                    <div>
                      <div className="font-orbitron font-black text-white text-lg uppercase tracking-tight">{game?.title}</div>
                      <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                        Validated on {new Date(score.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-orbitron font-bold text-cyan-400 uppercase tracking-widest mb-1">Signed High Score</div>
                    <div className="font-orbitron font-black text-2xl text-white">{score.score.toLocaleString()}</div>
                  </div>
                </div>
              );
            }) : (
              <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <p className="text-white/20 font-bold uppercase tracking-[0.2em]">No gaming sessions recorded on chain.</p>
                <Link to="/" className="inline-block mt-4 text-cyan-400 font-bold hover:underline">Explore Arcade Lobby</Link>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <h2 className="font-orbitron text-xl font-black text-white uppercase tracking-widest">BADGES</h2>
          <div className="glass-panel rounded-2xl p-6 grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`aspect-square rounded-xl flex items-center justify-center border-2 border-dashed ${i < 1 && walletAddress ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-white/5'}`}>
                {i < 1 && walletAddress ? (
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg" className="w-8 h-8 opacity-60" alt="" />
                ) : (
                  <div className="text-white/5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
