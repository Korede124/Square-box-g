
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Zap, AlertTriangle, Car } from 'lucide-react';

interface CarRacingProps {
  onGameOver: (score: number) => void;
  onStart?: () => void;
}

const LANES = 3;
const LANE_WIDTH = 100;
const CANVAS_WIDTH = LANES * LANE_WIDTH;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 40;
const ENEMY_SIZE = 40;

interface Enemy {
  id: number;
  lane: number;
  y: number;
  speed: number;
  color: string;
}

const CarRacing: React.FC<CarRacingProps> = ({ onGameOver, onStart }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');
  const [score, setScore] = useState(0); // Distance in meters
  const [playerLane, setPlayerLane] = useState(1);
  const [speed, setSpeed] = useState(10);
  
  const enemies = useRef<Enemy[]>([]);
  const distance = useRef(0);
  const lastTime = useRef(0);
  const frameId = useRef<number>(0);
  const enemyIdCounter = useRef(0);

  const resetGame = () => {
    enemies.current = [];
    distance.current = 0;
    setScore(0);
    setPlayerLane(1);
    setSpeed(10);
    setGameState('PLAYING');
    if (onStart) onStart();
  };

  const spawnEnemy = useCallback(() => {
    const lane = Math.floor(Math.random() * LANES);
    const speedVariation = Math.random() * 5 + 2;
    enemies.current.push({
      id: enemyIdCounter.current++,
      lane,
      y: -ENEMY_SIZE,
      speed: speedVariation,
      color: ['#ff007b', '#00f2ff', '#ffeb3b', '#ff5722'][Math.floor(Math.random() * 4)]
    });
  }, []);

  const update = (dt: number) => {
    if (gameState !== 'PLAYING') return;

    // Update distance
    distance.current += speed * dt * 10;
    setScore(Math.floor(distance.current));

    // Gradually increase speed
    setSpeed(s => Math.min(30, s + 0.05 * dt));

    // Spawn enemies
    if (Math.random() < 0.02) {
      spawnEnemy();
    }

    // Update enemies
    enemies.current = enemies.current.filter(enemy => {
      enemy.y += (enemy.speed + speed * 0.5) * dt * 60;

      // Collision detection
      const playerX = playerLane * LANE_WIDTH + (LANE_WIDTH - PLAYER_SIZE) / 2;
      const playerY = CANVAS_HEIGHT - PLAYER_SIZE - 40;
      const enemyX = enemy.lane * LANE_WIDTH + (LANE_WIDTH - ENEMY_SIZE) / 2;

      if (
        enemy.y + ENEMY_SIZE > playerY &&
        enemy.y < playerY + PLAYER_SIZE &&
        enemy.lane === playerLane
      ) {
        setGameState('GAMEOVER');
        onGameOver(Math.floor(distance.current));
        return false;
      }

      return enemy.y < CANVAS_HEIGHT;
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Road
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Lane Markings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -(distance.current % 40);
    ctx.lineWidth = 2;
    for (let i = 1; i < LANES; i++) {
      ctx.beginPath();
      ctx.moveTo(i * LANE_WIDTH, 0);
      ctx.lineTo(i * LANE_WIDTH, CANVAS_HEIGHT);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw Player
    const playerX = playerLane * LANE_WIDTH + (LANE_WIDTH - PLAYER_SIZE) / 2;
    const playerY = CANVAS_HEIGHT - PLAYER_SIZE - 40;
    
    // Player Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f2ff';
    ctx.fillStyle = '#00f2ff';
    ctx.fillRect(playerX, playerY, PLAYER_SIZE, PLAYER_SIZE);
    
    // Player Details (Simple car shape)
    ctx.fillStyle = '#000';
    ctx.fillRect(playerX + 5, playerY + 5, PLAYER_SIZE - 10, PLAYER_SIZE - 10);
    ctx.fillStyle = '#00f2ff';
    ctx.fillRect(playerX + 10, playerY + 10, PLAYER_SIZE - 20, 10); // Windshield
    ctx.shadowBlur = 0;

    // Draw Enemies
    enemies.current.forEach(enemy => {
      const enemyX = enemy.lane * LANE_WIDTH + (LANE_WIDTH - ENEMY_SIZE) / 2;
      
      ctx.fillStyle = enemy.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = enemy.color;
      ctx.fillRect(enemyX, enemy.y, ENEMY_SIZE, ENEMY_SIZE);
      
      ctx.fillStyle = '#000';
      ctx.fillRect(enemyX + 5, enemy.y + 5, ENEMY_SIZE - 10, ENEMY_SIZE - 10);
      ctx.shadowBlur = 0;
    });
  };

  const gameLoop = (time: number) => {
    if (lastTime.current) {
      const dt = Math.min(0.1, (time - lastTime.current) / 1000);
      update(dt);
      draw();
    }
    lastTime.current = time;
    frameId.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setPlayerLane(l => Math.max(0, l - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setPlayerLane(l => Math.min(LANES - 1, l + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  useEffect(() => {
    frameId.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId.current);
  }, [gameState]);

  return (
    <div className="relative w-full h-full bg-[#050505] flex flex-col items-center justify-center font-orbitron overflow-hidden">
      {/* HUD */}
      <div className="absolute top-8 left-8 z-10 space-y-4">
        <div className="flex flex-col">
          <span className="text-cyan-400/40 text-[10px] font-black uppercase tracking-widest">Velocity</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-white text-4xl font-black italic">{Math.floor(speed * 10)}</span>
            <span className="text-white/40 text-xs">KM/H</span>
          </div>
        </div>
      </div>

      <div className="absolute top-8 right-8 z-10 text-right space-y-4">
        <div className="flex flex-col">
          <span className="text-yellow-500/40 text-[10px] font-black uppercase tracking-widest">Points</span>
          <div className="flex items-baseline justify-end space-x-1">
            <span className="text-white text-4xl font-black italic">{Math.floor(score / 200)}</span>
            <span className="text-white/40 text-xs">PTS</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Distance</span>
          <span className="text-white/60 text-xl font-black italic">{score}M</span>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative border-x border-white/10 shadow-[0_0_50px_rgba(0,242,255,0.1)]">
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT} 
          className="bg-[#111]"
        />
      </div>

      {/* Mobile Controls */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center space-x-12 px-8 pointer-events-none">
        <button 
          onClick={() => setPlayerLane(l => Math.max(0, l - 1))}
          className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center pointer-events-auto active:scale-90 transition-transform"
        >
          <div className="w-0 h-0 border-t-[15px] border-t-transparent border-r-[25px] border-r-white border-b-[15px] border-b-transparent"></div>
        </button>
        <button 
          onClick={() => setPlayerLane(l => Math.min(LANES - 1, l + 1))}
          className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center pointer-events-auto active:scale-90 transition-transform"
        >
          <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent"></div>
        </button>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {gameState !== 'PLAYING' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="max-w-md w-full">
              <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-cyan-500/20">
                <Car className="w-10 h-10 text-cyan-400" />
              </div>
              
              <h2 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter italic">
                {gameState === 'GAMEOVER' ? 'CRASHED' : 'NEON DRIFT'}
              </h2>
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-10">
                <div className="text-3xl font-black text-white">
                  {Math.floor(score / 200)} <span className="text-xs text-white/40 uppercase tracking-widest">Points Earned</span>
                </div>
                <div className="text-xl font-black text-white/60 mt-2">
                  {score} <span className="text-xs text-white/40 uppercase tracking-widest">Meters Traveled</span>
                </div>
                <p className="mt-4 text-[10px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                  Avoid obstacles. Switch lanes with Arrows or A/D. 1 Point per 200m.
                </p>
              </div>

              <button 
                onClick={resetGame}
                className="w-full bg-white text-black font-black py-5 rounded-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-[0.3em]"
              >
                {gameState === 'GAMEOVER' ? 'RETRY' : 'START ENGINE'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarRacing;
