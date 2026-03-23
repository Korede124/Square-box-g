
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { User, HighScore } from './types';
import Lobby from './pages/Lobby';
import GamePage from './pages/GamePage';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Logo from './components/Logo';
import SplashScreen from './components/SplashScreen';
import MusicPlayer from './components/MusicPlayer';
import WalletSelector from './components/WalletSelector';
import WithdrawModal from './components/WithdrawModal';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const location = useLocation();

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    const savedPoints = localStorage.getItem('sqb_points');
    if (savedPoints) {
      setPoints(parseInt(savedPoints));
    }

    const ethereum = (window as any).ethereum;

    if (ethereum) {
      // Check for already connected accounts
      ethereum.request({ method: 'eth_accounts' })
        .then(handleAccountsChanged)
        .catch((err: any) => console.error("EVM connection check failed", err));

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

  const connectWallet = async (providerType?: 'metamask' | 'okx' | 'injected') => {
    if (!providerType) {
      setShowWalletSelector(true);
      return;
    }

    const walletName = providerType === 'okx' ? 'OKX Wallet' : (providerType === 'metamask' ? 'MetaMask' : 'EVM Wallet');
    let provider: any = null;
    setConnectionError(null);

    try {
      if (providerType === 'okx') {
        provider = (window as any).okxwallet;
      } else if (providerType === 'metamask') {
        // Look for MetaMask specifically if multiple providers exist
        const ethereum = (window as any).ethereum;
        if (ethereum?.providers && Array.isArray(ethereum.providers)) {
          provider = ethereum.providers.find((p: any) => p.isMetaMask);
        } else if (ethereum?.isMetaMask) {
          provider = ethereum;
        }
      } else {
        provider = (window as any).ethereum;
      }

      if (!provider) {
        setConnectionError(`${walletName} not detected! Please install the extension to continue.`);
        const downloadUrl = providerType === 'okx' ? 'https://www.okx.com/web3' : 'https://metamask.io/download/';
        window.open(downloadUrl, '_blank');
        return;
      }

      setIsConnecting(true);
      setShowWalletSelector(false);
      
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      handleAccountsChanged(accounts);
      
      // Listen for changes on the specific provider
      if (provider.on) {
        provider.on('accountsChanged', handleAccountsChanged);
        provider.on('chainChanged', () => window.location.reload());
      }
    } catch (error: any) {
      console.error("Wallet Connection Error Details:", error);
      
      if (error.code === 4001) {
        setConnectionError("Connection rejected. Please approve the request in your wallet.");
      } else if (error.code === -32002) {
        setConnectionError("Request already pending. Please check your wallet for a pending connection request.");
      } else {
        let errorMsg = `Failed to connect to ${walletName}.`;
        
        if (error.message) {
          errorMsg += ` ${error.message}`;
        }

        if (window.self !== window.top) {
          errorMsg += " CRITICAL: You are running this app in an iframe. Most wallets (MetaMask, OKX) block connection requests from iframes for security reasons.";
          errorMsg += " ACTION REQUIRED: Please open this application in a NEW TAB using the button in the top right of the preview to connect your wallet.";
        } else {
          errorMsg += " Please ensure your wallet is unlocked and you have approved the connection.";
        }
        
        setConnectionError(errorMsg);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogin = () => {
    const username = prompt("Enter your username for Mobile Login:") || "MobileGamer";
    const mockUser: User = {
      id: 'u' + Math.random().toString(36).substr(2, 9),
      username: username,
      email: `${username.toLowerCase()}@yaks.tech`,
      avatar: `https://i.pravatar.cc/150?u=${username}`,
      totalScore: 0,
      points: points,
      joinedDate: new Date().toISOString()
    };
    setUser(mockUser);
    localStorage.setItem('sqb_user', JSON.stringify(mockUser));
  };

  const handleUpdateProfile = (username: string, avatar: string) => {
    if (user) {
      const updatedUser = { ...user, username, avatar };
      setUser(updatedUser);
      localStorage.setItem('sqb_user', JSON.stringify(updatedUser));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sqb_user');
  };

  const handleWithdraw = (amount: number, pointsUsed: number, destination: string) => {
    const newPoints = points - pointsUsed;
    setPoints(newPoints);
    localStorage.setItem('sqb_points', newPoints.toString());
    if (user) {
      const updatedUser = { ...user, points: newPoints };
      setUser(updatedUser);
      localStorage.setItem('sqb_user', JSON.stringify(updatedUser));
    }
    console.log(`Withdrawal of $${amount} (${pointsUsed} SBG) to ${destination} initiated.`);
  };

  const updateHighScore = (gameId: string, score: number) => {
    // Reward Logic: Normalized per game type
    let earnedPoints = 2; // Base participation points

    if (gameId === 'snake') {
      // Snake: 10 points per food
      if (score >= 1000) earnedPoints += 100; // 100 food
      else if (score >= 500) earnedPoints += 50; // 50 food
      else if (score >= 200) earnedPoints += 10; // 20 food
    } else if (gameId === 'car-racing') {
      // Velocity Racer: 5 points per 1km (1 point per 200 meters)
      earnedPoints += Math.floor(score / 200);
      
      // Bonus for significant distances
      if (score >= 5000) earnedPoints += 25; // 5km bonus
      else if (score >= 2000) earnedPoints += 10; // 2km bonus
      else if (score >= 1000) earnedPoints += 5; // 1km bonus
    }

    const newTotalPoints = points + earnedPoints;
    setPoints(newTotalPoints);
    localStorage.setItem('sqb_points', newTotalPoints.toString());

    const existingIndex = highScores.findIndex(s => s.gameId === gameId);
    let newScores = [...highScores];
    
    if (existingIndex > -1) {
      if (score > highScores[existingIndex].score) {
        newScores[existingIndex] = { gameId, score, pointsEarned: earnedPoints, date: new Date().toISOString() };
      }
    } else {
      newScores.push({ gameId, score, pointsEarned: earnedPoints, date: new Date().toISOString() });
    }
    
    setHighScores(newScores);
    localStorage.setItem('sqb_high_scores', JSON.stringify(newScores));

    if (user) {
      const updatedUser = { ...user, points: newTotalPoints, totalScore: user.totalScore + score };
      setUser(updatedUser);
      localStorage.setItem('sqb_user', JSON.stringify(updatedUser));
    }

    return earnedPoints;
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-12">
          <Link to="/" className="flex items-center space-x-4 group">
            <Logo className="w-10 h-10 transition-transform duration-500 group-hover:rotate-[360deg]" />
            <div className="flex flex-col">
              <span className="font-orbitron text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white">
                SBG GAMING
              </span>
              <span className="text-[9px] font-orbitron font-bold tracking-[0.3em] text-white/30 uppercase">
                By Yaks Technology
              </span>
            </div>
          </Link>
          <div className="hidden lg:flex space-x-8">
            <Link to="/" className={`font-orbitron text-xs font-bold uppercase tracking-widest transition-all ${location.pathname === '/' ? 'text-cyan-400' : 'text-white/40 hover:text-white'}`}>Home</Link>
            <Link to="/leaderboard" className={`font-orbitron text-xs font-bold uppercase tracking-widest transition-all ${location.pathname === '/leaderboard' ? 'text-cyan-400' : 'text-white/40 hover:text-white'}`}>Leaderboard</Link>
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className="font-orbitron text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-all flex items-center space-x-2"
            >
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <span>Payment</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 lg:space-x-6">
          {/* Wallet Status / Connect Button */}
          {!isMobile && (
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
          )}

          <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="flex items-center space-x-3 bg-white/5 px-2 sm:px-4 py-1.5 rounded-full border border-white/10 hover:border-cyan-500/50 transition-all group">
                <img src={user.avatar} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-cyan-400" alt="avatar" />
                <span className="text-[10px] sm:text-xs font-bold text-white/80 hidden xs:inline group-hover:text-cyan-400">{user.username}</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="text-[9px] sm:text-[10px] font-black text-white/20 hover:text-red-400 uppercase tracking-widest transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="bg-white/5 border border-white/10 hover:bg-white/10 px-4 sm:px-6 py-2.5 rounded-xl font-orbitron font-black text-[10px] sm:text-xs text-white transition-all active:scale-95"
            >
              {isMobile ? 'MOBILE LOGIN' : 'LOGIN'}
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location}>
            <Route path="/" element={<Lobby walletAddress={walletAddress} connectWallet={connectWallet} />} />
            <Route path="/game/:gameId" element={<GamePage updateHighScore={updateHighScore} highScores={highScores} walletAddress={walletAddress} connectWallet={connectWallet} points={points} />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile user={user} highScores={highScores} walletAddress={walletAddress} points={points} onUpdateProfile={handleUpdateProfile} onOpenWithdraw={() => setShowWithdrawModal(true)} />} />
          </Routes>
        </AnimatePresence>
      </main>

      <MusicPlayer isMuted={isMuted} toggleMute={toggleMute} user={user} />

      <WalletSelector 
        isOpen={showWalletSelector} 
        onClose={() => {
          setShowWalletSelector(false);
          setConnectionError(null);
        }} 
        onSelect={(type) => connectWallet(type)} 
        error={connectionError}
      />

      <WithdrawModal 
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        currentPoints={points}
        walletAddress={walletAddress}
        onWithdraw={handleWithdraw}
      />

      {/* Footer */}
      <footer className="bg-black border-t border-white/5 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-12">
          <div className="max-w-md">
            <Link to="/" className="flex items-center space-x-4 mb-6">
              <Logo className="w-12 h-12" />
              <div className="flex flex-col">
                <span className="font-orbitron text-2xl font-black text-white">SBG GAMING</span>
                <span className="text-[10px] font-orbitron font-bold text-white/20 uppercase tracking-[0.2em]">Developed by Yaks Technology</span>
              </div>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              The premier destination for high-performance arcade experiences in the browser. 
              Our proprietary game engine ensures low-latency competitive play across all modern devices.
              Official partner with Somnia and OKX Wallet. EVM authentication required for high-score verification.
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
          <div>© 2024 YAKS TECHNOLOGY • POWERED BY EVM PROTOCOL • PARTNERED WITH SOMNIA & OKX</div>
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
