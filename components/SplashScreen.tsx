import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [duration] = useState(() => Math.floor(Math.random() * (45 - 25 + 1) + 25)); // 25-45 seconds

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      const currentProgress = Math.min(100, Math.max(0, 100 - (remaining / (duration * 1000)) * 100));
      
      setProgress(currentProgress);

      if (now >= endTime) {
        clearInterval(interval);
        onComplete();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px]"
        ></motion.div>
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-12"
        >
          <Logo className="w-32 h-32" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white tracking-tighter mb-2 uppercase">
            SQUARE BOX <span className="text-cyan-400">GAMING</span>
          </h1>
          <p className="font-orbitron text-[10px] md:text-xs font-bold tracking-[0.4em] text-white/30 uppercase">
            By Yaks Technology
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mb-16 space-y-6"
        >
          <div className="text-[10px] font-orbitron font-black text-white/20 tracking-[0.3em] uppercase">
            Official Partners
          </div>
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-3 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
              <span className="font-orbitron text-lg font-black text-white tracking-tighter">SOMNIA</span>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="flex items-center space-x-3 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
              <span className="font-orbitron text-lg font-black text-white tracking-tighter">OKX WALLET</span>
            </div>
          </div>
        </motion.div>

        {/* Loading Bar */}
        <div className="w-full max-w-md space-y-4">
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              style={{ width: `${progress}%` }}
            ></motion.div>
          </div>
          <div className="flex justify-between items-center text-[9px] font-orbitron font-black text-white/20 uppercase tracking-widest">
            <span>Initializing EVM Protocol</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-12 text-[8px] font-orbitron font-bold text-white/10 uppercase tracking-[0.5em]"
        >
          Securing Handshake with Somnia Network...
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;
