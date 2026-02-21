
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { User, HighScore } from './types';
import Lobby from './pages/Lobby';
import GamePage from './pages/GamePage';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const location = useLocation();

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      setWalletAddress(null);
    } else {
      setWalletAddress(accounts[0]);
    }
  }, []);

  useEffect(() => {
    const savedScores = localStorage.getItem('sqb_high_scores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
    const savedUser = localStorage.getItem('sqb_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const ethereum = (window as any).ethereum;

    if (ethereum) {
      // Check for already connected accounts
      ethereum.request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch((err: any) => console.error("Metamask connection check failed", err));

      // Listen for account and chain changes
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (ethereum && ethereum.removeListener) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [handleAccountsChanged]);

  const connectWallet = async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      alert("MetaMask not detected! Please install the MetaMask extension to access the arcade.");
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      handleAccountsChanged(accounts);
    } catch (error: any) {
      if (error.code === 4001) {
        console.warn("User rejected the connection request.");
      } else {
        console.error("MetaMask Error:", error);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogin = () => {
    const mockUser: User = {
      id: 'u123',
      username: 'Web3Voyager',
      email: 'arcade@yaks.tech',
      avatar: 'https://i.pravatar.cc/150?u=web3',
      totalScore: 45000,
      joinedDate: new Date().toISOString()
    };
    setUser(mockUser);
    localStorage.setItem('sqb_user', JSON.stringify(mockUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sqb_user');
  };

  const updateHighScore = (gameId: string, score: number) => {
    const existingIndex = highScores.findIndex(s => s.gameId === gameId);
    let newScores = [...highScores];
    
    if (existingIndex > -1) {
      if (score > highScores[existingIndex].score) {
        newScores[existingIndex] = { gameId, score, date: new Date().toISOString() };
      }
    } else {
      newScores.push({ gameId, score, date: new Date().toISOString() });
    }
    
    setHighScores(newScores);
    localStorage.setItem('sqb_high_scores', JSON.stringify(newScores));
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-12">
          <Link to="/" className="flex items-center space-x-4 group">
            <Logo className="w-10 h-10 transition-transform duration-500 group-hover:rotate-[360deg]" />
            <div className="flex flex-col">
              <span className="font-orbitron text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white">
                SQUARE BOX
              </span>
              <span className="text-[9px] font-orbitron font-bold tracking-[0.3em] text-white/30 uppercase">
                By Yaks Technology
              </span>
            </div>
          </Link>
          <div className="hidden lg:flex space-x-8">
            <Link to="/" className={`font-orbitron text-xs font-bold uppercase tracking-widest transition-all ${location.pathname === '/' ? 'text-cyan-400' : 'text-white/40 hover:text-white'}`}>Home</Link>
            <Link to="/leaderboard" className={`font-orbitron text-xs font-bold uppercase tracking-widest transition-all ${location.pathname === '/leaderboard' ? 'text-cyan-400' : 'text-white/40 hover:text-white'}`}>Leaderboard</Link>
          </div>
        </div>

        <div className="flex items-center space-x-4 lg:space-x-6">
          {/* Wallet Status / Connect Button */}
          <button 
            onClick={connectWallet}
            disabled={isConnecting}
            className={`flex items-center space-x-3 px-5 py-2.5 rounded-xl font-orbitron text-[10px] font-black uppercase tracking-widest transition-all border ${
              walletAddress 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : 'bg-orange-500/10 border-orange-500/50 text-orange-400 hover:bg-orange-500/20 active:scale-95 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${walletAddress ? 'bg-green-400' : 'bg-orange-400 animate-pulse'}`}></div>
            <span>{walletAddress ? truncateAddress(walletAddress) : (isConnecting ? 'Linking...' : 'Connect Wallet')}</span>
          </button>

          <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="flex items-center space-x-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 hover:border-cyan-500/50 transition-all group">
                <img src={user.avatar} className="w-8 h-8 rounded-full border border-cyan-400" alt="avatar" />
                <span className="text-xs font-bold text-white/80 hidden sm:inline group-hover:text-cyan-400">{user.username}</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="text-[10px] font-black text-white/20 hover:text-red-400 uppercase tracking-widest transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="bg-white/5 border border-white/10 hover:bg-white/10 px-6 py-2.5 rounded-xl font-orbitron font-black text-xs text-white transition-all active:scale-95"
            >
              LOGIN
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Lobby walletAddress={walletAddress} connectWallet={connectWallet} />} />
          <Route path="/game/:gameId" element={<GamePage updateHighScore={updateHighScore} highScores={highScores} walletAddress={walletAddress} connectWallet={connectWallet} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile user={user} highScores={highScores} walletAddress={walletAddress} />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/5 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-12">
          <div className="max-w-md">
            <Link to="/" className="flex items-center space-x-4 mb-6">
              <Logo className="w-12 h-12" />
              <div className="flex flex-col">
                <span className="font-orbitron text-2xl font-black text-white">SQUARE BOX</span>
                <span className="text-[10px] font-orbitron font-bold text-white/20 uppercase tracking-[0.2em]">Developed by Yaks Technology</span>
              </div>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              The premier destination for high-performance arcade experiences in the browser. 
              Our proprietary game engine ensures low-latency competitive play across all modern devices.
              MetaMask authentication required for high-score verification and leaderboard placement.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
            <div>
              <h4 className="font-orbitron text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6">Arcade</h4>
              <ul className="space-y-4 text-xs font-bold text-white/30">
                <li><Link to="/" className="hover:text-cyan-400 transition-colors uppercase">Lobby</Link></li>
                <li><Link to="/leaderboard" className="hover:text-cyan-400 transition-colors uppercase">Rankings</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
          <div>© 2024 YAKS TECHNOLOGY • POWERED BY METAMASK API</div>
          <div className="flex space-x-6">
            <span className="text-green-500/50">SYSTEMS: OPERATIONAL</span>
            <span className="text-cyan-500/50">VERSION: 2.1.0-STABLE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
