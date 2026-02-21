
import React, { useEffect, useRef, useState, useCallback } from 'react';

interface SnakeGameProps {
  onGameOver: (score: number) => void;
  personalBest: number;
  walletAddress: string | null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const GRID_SIZE = 20;
const CANVAS_SIZE = 600;

const SnakeGame: React.FC<SnakeGameProps> = ({ onGameOver, personalBest, walletAddress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lastEatTime, setLastEatTime] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameState, setGameState] = useState<'IDLE' | 'COUNTDOWN' | 'PLAYING'>('IDLE');
  const [countdown, setCountdown] = useState(3);
  const [speed, setSpeed] = useState(120);
  const [shake, setShake] = useState(0);

  // Visual Effects
  const particles = useRef<Particle[]>([]);
  const frameId = useRef<number>(0);

  const generateFood = useCallback((currentSnake: {x: number, y: number}[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
      };
      const collision = currentSnake.some(seg => seg.x === newFood!.x && seg.y === newFood!.y);
      if (!collision) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood([{ x: 10, y: 10 }]));
    setDirection({ x: 0, y: -1 });
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setIsGameOver(false);
    setGameState('COUNTDOWN');
    setCountdown(3);
    setSpeed(120);
    particles.current = [];
  };

  // Countdown Logic
  useEffect(() => {
    if (gameState === 'COUNTDOWN') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState('PLAYING');
      }
    }
  }, [gameState, countdown]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState === 'IDLE' && e.code === 'Space' && !isGameOver) {
        setGameState('COUNTDOWN');
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameState, isGameOver]);

  // Main Game Loop (Logic)
  useEffect(() => {
    if (gameState !== 'PLAYING' || isGameOver) return;

    const moveSnake = () => {
      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

      // Wall collision
      if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
        setIsGameOver(true);
        setShake(10);
        onGameOver(score);
        return;
      }

      // Self collision
      if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setIsGameOver(true);
        setShake(10);
        onGameOver(score);
        return;
      }

      const newSnake = [head, ...snake];

      // Food collision
      if (head.x === food.x && head.y === food.y) {
        const now = Date.now();
        const comboTime = now - lastEatTime;
        const newCombo = comboTime < 2000 ? combo + 1 : 0;
        
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);
        
        setLastEatTime(now);
        setScore(s => s + (10 * (newCombo + 1)));
        setFood(generateFood(newSnake));
        if (speed > 50) setSpeed(s => s - 2);

        // Spawn particles
        for (let i = 0; i < 15; i++) {
          particles.current.push({
            x: food.x * GRID_SIZE + GRID_SIZE / 2,
            y: food.y * GRID_SIZE + GRID_SIZE / 2,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            color: '#ff007b'
          });
        }
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
    };

    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [snake, direction, food, gameState, isGameOver, speed, score, combo, maxCombo, lastEatTime, onGameOver, generateFood]);

  // Animation Loop (Drawing & Particles)
  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    const animate = () => {
      context.fillStyle = '#050505';
      context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Apply Screenshake
      if (shake > 0) {
        const sx = (Math.random() - 0.5) * shake;
        const sy = (Math.random() - 0.5) * shake;
        context.save();
        context.translate(sx, sy);
        setShake(s => Math.max(0, s - 0.5));
      }

      // Draw Grid (Subtle Pulse)
      const pulse = Math.sin(Date.now() / 500) * 0.02 + 0.05;
      context.strokeStyle = `rgba(0, 242, 255, ${pulse})`;
      context.lineWidth = 0.5;
      for(let i = 0; i < CANVAS_SIZE; i += GRID_SIZE) {
          context.beginPath();
          context.moveTo(i, 0);
          context.lineTo(i, CANVAS_SIZE);
          context.stroke();
          context.beginPath();
          context.moveTo(0, i);
          context.lineTo(CANVAS_SIZE, i);
          context.stroke();
      }

      // Draw Food
      const foodPulse = Math.sin(Date.now() / 150) * 5;
      context.fillStyle = '#ff007b';
      context.shadowBlur = 15 + foodPulse;
      context.shadowColor = '#ff007b';
      context.beginPath();
      context.arc(
          food.x * GRID_SIZE + GRID_SIZE / 2,
          food.y * GRID_SIZE + GRID_SIZE / 2,
          (GRID_SIZE / 3) + (foodPulse / 4),
          0,
          Math.PI * 2
      );
      context.fill();
      context.shadowBlur = 0;

      // Draw Snake
      snake.forEach((segment, index) => {
        // Body color shift
        const ratio = index / snake.length;
        context.fillStyle = index === 0 ? '#00f2ff' : `rgba(0, 106, 113, ${1 - ratio * 0.5})`;
        
        // Head Glow
        if (index === 0) {
          context.shadowBlur = 20;
          context.shadowColor = '#00f2ff';
        } else {
          context.shadowBlur = 0;
        }

        // Draw segment with rounded corners
        const size = index === 0 ? GRID_SIZE - 2 : (GRID_SIZE - 4) * (1 - ratio * 0.2);
        const offset = (GRID_SIZE - size) / 2;
        
        context.beginPath();
        context.roundRect(
          segment.x * GRID_SIZE + offset, 
          segment.y * GRID_SIZE + offset, 
          size, 
          size, 
          4
        );
        context.fill();
      });

      // Update & Draw Particles
      particles.current = particles.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.vy += 0.1; // gravity
        
        context.fillStyle = p.color;
        context.globalAlpha = p.life;
        context.fillRect(p.x, p.y, 3, 3);
        context.globalAlpha = 1.0;
        
        return p.life > 0;
      });

      if (shake > 0) context.restore();
      
      frameId.current = requestAnimationFrame(animate);
    };

    frameId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId.current);
  }, [snake, food, shake]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden font-orbitron">
      {/* HUD */}
      <div className="absolute top-8 left-8 z-10 flex space-x-12">
        <div className="flex flex-col group">
          <span className="text-cyan-400/30 text-[10px] font-black uppercase tracking-[0.3em]">Score Matrix</span>
          <span className="text-white text-4xl font-black transition-transform group-hover:scale-110">{score.toLocaleString()}</span>
        </div>
        
        {combo > 0 && (
          <div className="flex flex-col animate-bounce">
            <span className="text-pink-500 text-[10px] font-black uppercase tracking-[0.3em]">Combo Active</span>
            <span className="text-white text-3xl font-black neon-text-pink">x{combo + 1}</span>
          </div>
        )}
      </div>

      <div className="absolute top-8 right-8 z-10 text-right">
        <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Engine Speed</span>
        <div className="flex items-center space-x-2">
          <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 transition-all duration-500" 
              style={{ width: `${((120 - speed) / 70) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        width={CANVAS_SIZE} 
        height={CANVAS_SIZE} 
        className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5"
      />

      {/* Countdown Overlay */}
      {gameState === 'COUNTDOWN' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="text-9xl font-black text-white animate-ping">
            {countdown === 0 ? 'GO!' : countdown}
          </div>
        </div>
      )}

      {/* Menus / Game Over Screen */}
      {(gameState === 'IDLE' || isGameOver) && (
        <div className="absolute inset-0 z-30 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-8 md:p-12 overflow-y-auto">
          {/* Main Content Container */}
          <div className="max-w-xl w-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
            
            {isGameOver && score > personalBest && score > 0 && (
              <div className="mb-6 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 text-[10px] font-black tracking-[0.4em] uppercase animate-pulse">
                NEW PERSONAL RECORD DETECTED
              </div>
            )}

            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] rounded-full group-hover:bg-cyan-500/40 transition-all duration-700"></div>
              <h2 className="relative text-6xl md:text-8xl font-black text-white mb-2 uppercase tracking-tighter italic leading-none">
                {isGameOver ? (
                  <span className="block">
                    SYSTEM<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 animate-pulse">CRASHED</span>
                  </span>
                ) : 'NEON SNAKE'}
              </h2>
              <div className={`h-1.5 w-32 mx-auto rounded-full ${isGameOver ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-cyan-500 shadow-[0_0_20px_rgba(0,242,255,0.5)]'}`}></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full mb-12">
              <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center border-white/5">
                <span className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-1">Final Score</span>
                <span className={`text-2xl font-black ${isGameOver ? 'text-white' : 'text-cyan-400'}`}>{score.toLocaleString()}</span>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center border-white/5">
                <span className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-1">Snake Length</span>
                <span className="text-2xl font-black text-white">{snake.length}</span>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center border-white/5 col-span-2 md:col-span-1">
                <span className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-1">Max Combo</span>
                <span className="text-2xl font-black text-pink-500">x{maxCombo + 1}</span>
              </div>
            </div>

            {/* Wallet Call to Action */}
            <div className="w-full glass-panel border-orange-500/20 bg-orange-500/5 p-6 rounded-3xl mb-12 flex items-center space-x-6 text-left">
              <div className="w-12 h-12 flex-shrink-0 bg-black/40 rounded-xl border border-orange-500/30 flex items-center justify-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg" className="w-8 h-8" alt="MetaMask" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Leaderboard Integrity</h4>
                <p className="text-[10px] text-white/40 uppercase font-bold leading-relaxed tracking-wide">
                  {walletAddress 
                    ? `AUTHENTICATED: THIS SCORE IS SIGNED BY ${walletAddress.slice(0,6)}...` 
                    : "UNVERIFIED: CONNECT YOUR WALLET TO SECURE THIS SCORE ON THE GLOBAL CHAIN."
                  }
                </p>
              </div>
            </div>
            
            <button 
              onClick={resetGame}
              className="group relative bg-white text-black font-black px-20 py-6 rounded-[2rem] transition-all hover:scale-105 active:scale-95 shadow-[0_30px_60px_rgba(255,255,255,0.15)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 uppercase tracking-[0.3em] text-sm group-hover:text-white transition-colors">
                {isGameOver ? 'REBOOT SESSION' : 'INITIALIZE LINK'}
              </span>
              <div className="absolute -inset-1 bg-white opacity-20 blur-xl scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
            </button>
            
            {!isGameOver && (
              <div className="mt-12 flex items-center space-x-8 text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">
                <div className="flex flex-col items-center gap-2">
                  <div className="px-4 py-2 rounded-xl border border-white/10 bg-white/5">WASD</div>
                  <span>MANEUVER</span>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="px-4 py-2 rounded-xl border border-white/10 bg-white/5">SPACE</div>
                  <span>START</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scanline Effect inside the game */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_2px,3px_100%]"></div>
    </div>
  );
};

export default SnakeGame;
