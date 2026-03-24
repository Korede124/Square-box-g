import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const duration = 4; // 4 seconds for a snappy, pro feel

  const statuses = [
    "Initializing Core Systems...",
    "Syncing with Somnia Network...",
    "Loading EVM Protocols...",
    "Verifying Security Handshake...",
    "Ready to Launch"
  ];

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const currentProgress = Math.min(100, (elapsed / (duration * 1000)) * 100);
      
      setProgress(currentProgress);
      setStatusIndex(Math.min(statuses.length - 1, Math.floor((currentProgress / 100) * statuses.length)));

      if (now >= endTime) {
        clearInterval(interval);
        setTimeout(onComplete, 500); // Small delay for smooth transition
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Circular progress calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Digital Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-cyan-500/20 rounded-full blur-[120px]"
        ></motion.div>
        
        {/* Global Scanning Line */}
        <motion.div 
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent z-10"
        ></motion.div>
      </div>

      {/* Side System Log (Pro Detail) */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 w-48 h-64 hidden lg:flex flex-col space-y-1 opacity-20 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="font-mono text-[8px] text-cyan-400 uppercase tracking-tighter"
          >
            [{new Date().toISOString().split('T')[1].split('.')[0]}] :: SYS_INIT_{Math.random().toString(36).substring(7)}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center">
        {/* Logo Section with Corner Brackets */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            filter: ["hue-rotate(0deg)", "hue-rotate(45deg)", "hue-rotate(0deg)"]
          }}
          transition={{ 
            scale: { duration: 1, ease: "backOut" },
            opacity: { duration: 1 },
            filter: { duration: 0.5, repeat: Infinity, repeatDelay: 4 }
          }}
          className="relative mb-8"
        >
          {/* Corner Brackets */}
          <div className="absolute -top-4 -left-4 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50"></div>
          <div className="absolute -top-4 -right-4 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50"></div>
          <div className="absolute -bottom-4 -left-4 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50"></div>
          <div className="absolute -bottom-4 -right-4 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50"></div>

          <div className="relative overflow-hidden flex items-center justify-center rounded-xl p-6 bg-white/5 backdrop-blur-sm border border-white/10">
            <motion.div
              animate={{ 
                filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Logo className="w-24 h-24" />
            </motion.div>
            
            {/* Logo Glitch Overlay */}
            <motion.div
              animate={{ 
                opacity: [0, 0.3, 0],
                x: [-3, 3, -3],
                skewX: [-5, 5, -5]
              }}
              transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 2.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Logo className="w-24 h-24 text-cyan-400 opacity-40" />
            </motion.div>

            {/* Logo Scanning Line */}
            <motion.div
              animate={{ top: ['-20%', '120%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-cyan-400/60 blur-[1px] z-20"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-12"
        >
          <motion.h1 
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 0.05, repeat: Infinity, repeatDelay: 3 }}
            className="font-orbitron text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 uppercase"
          >
            SBG <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">GAMING</span>
          </motion.h1>
          <div className="flex items-center justify-center space-x-4">
            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-cyan-500/50"></div>
            <p className="font-orbitron text-[10px] md:text-xs font-bold tracking-[0.6em] text-cyan-400/60 uppercase">
              The Future of Arcade
            </p>
            <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-cyan-500/50"></div>
          </div>
        </motion.div>

        {/* Industrial Segmented Progress Bar */}
        <div className="w-full max-w-md mb-12">
          <div className="flex justify-between items-end mb-3">
            <div className="flex flex-col items-start">
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-[0.2em] mb-1">System Status</span>
              <AnimatePresence mode="wait">
                <motion.span 
                  key={statusIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="text-[10px] font-orbitron font-black text-cyan-400 uppercase tracking-widest"
                >
                  {statuses[statusIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-[0.2em] mb-1">Load Factor</span>
              <span className="text-[14px] font-orbitron font-black text-white uppercase tracking-widest">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          
          <div className="relative h-3 w-full bg-white/5 border border-white/10 p-0.5 overflow-hidden">
            {/* Segmented Background */}
            <div className="absolute inset-0 flex justify-between px-1">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-px h-full bg-white/10"></div>
              ))}
            </div>

            {/* Progress Fill */}
            <motion.div 
              className="relative h-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              style={{ width: `${progress}%` }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            >
              {/* Scanning Glow */}
              <motion.div
                animate={{ left: ['-100%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
              />
            </motion.div>
          </div>

          {/* Activity Indicators */}
          <div className="mt-3 flex justify-center space-x-1">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  opacity: (progress / 100) * 40 > i ? [0.3, 1, 0.3] : 0.1,
                  backgroundColor: (progress / 100) * 40 > i ? "#22d3ee" : "#ffffff"
                }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.02 }}
                className="w-1 h-1 rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Floating Data Streams */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: '110%',
                opacity: 0 
              }}
              animate={{ 
                y: '-10%',
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: Math.random() * 5 + 5, 
                repeat: Infinity, 
                delay: Math.random() * 5 
              }}
              className="absolute font-mono text-[6px] text-cyan-500 whitespace-nowrap flex flex-col"
            >
              <span>0x{Math.random().toString(16).substring(2, 10).toUpperCase()}</span>
              <span>MEM_ALLOC_{Math.floor(Math.random() * 1000)}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 flex items-center space-x-6 opacity-30 grayscale"
        >
          <span className="font-orbitron text-[10px] font-black text-white tracking-widest">SOMNIA NETWORK</span>
          <div className="w-1 h-1 bg-white/50 rounded-full"></div>
          <span className="font-orbitron text-[10px] font-black text-white tracking-widest">EVM PROTOCOL</span>
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;
