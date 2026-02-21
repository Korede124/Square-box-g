
import React, { useEffect, useRef, useState } from 'react';

interface CarRacingProps {
  onGameOver: (score: number) => void;
}

const CarRacing: React.FC<CarRacingProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);

  const carX = useRef(175); // Center lane initially
  const enemies = useRef<any[]>([]);
  const requestRef = useRef<number>();
  const lastEnemyTime = useRef(0);
  const speed = useRef(5);

  const resetGame = () => {
    carX.current = 175;
    enemies.current = [];
    setScore(0);
    setDistance(0);
    speed.current = 5;
    setGameState('PLAYING');
  };

  const spawnEnemy = () => {
    const lanes = [50, 175, 300];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    enemies.current.push({
      x: lane,
      y: -100,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    });
  };

  const draw = (time: number) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 400, 600);

    // Draw Road
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 400, 600);

    // Lanes
    ctx.setLineDash([40, 40]);
    ctx.lineDashOffset = -(distance % 80);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(133, 0);
    ctx.lineTo(133, 600);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(266, 0);
    ctx.lineTo(266, 600);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Player Car
    ctx.fillStyle = '#00f2ff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00f2ff';
    ctx.fillRect(carX.current - 25, 500, 50, 80);
    ctx.shadowBlur = 0;
    // Car detail
    ctx.fillStyle = '#000';
    ctx.fillRect(carX.current - 20, 510, 10, 20); // Window
    ctx.fillRect(carX.current + 10, 510, 10, 20); // Window

    // Update & Draw Enemies
    if (time - lastEnemyTime.current > 1500 / (speed.current / 5)) {
      spawnEnemy();
      lastEnemyTime.current = time;
    }

    enemies.current = enemies.current.filter(enemy => {
      enemy.y += speed.current;
      
      // Hitbox
      if (enemy.y > 420 && enemy.y < 580 && Math.abs(enemy.x - carX.current) < 40) {
        setGameState('GAMEOVER');
        onGameOver(Math.floor(distance));
        return false;
      }

      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x - 25, enemy.y, 50, 80);
      return enemy.y < 650;
    });

    if (gameState === 'PLAYING') {
      setDistance(d => d + speed.current / 10);
      speed.current += 0.001;
      requestRef.current = requestAnimationFrame(draw);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') carX.current = Math.max(50, carX.current - 125);
      if (e.key === 'ArrowRight' || e.key === 'd') carX.current = Math.min(300, carX.current + 125);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(draw);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameState]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
      <div className="absolute top-6 left-6 z-10 flex flex-col">
        <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Velocity km/h</span>
        <span className="text-white font-orbitron text-2xl font-black">{Math.floor(speed.current * 20)}</span>
      </div>
      <div className="absolute top-6 right-6 z-10 text-right">
        <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Distance</span>
        <span className="text-white font-orbitron text-2xl font-black">{Math.floor(distance).toLocaleString()}m</span>
      </div>

      <canvas 
        ref={canvasRef} 
        width={400} 
        height={600} 
        className="h-full object-contain"
      />

      {gameState !== 'PLAYING' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
          <h2 className="font-orbitron text-4xl font-black text-white mb-2 uppercase tracking-tight">
            {gameState === 'GAMEOVER' ? 'COLLISION' : 'VELOCITY RACER'}
          </h2>
          <p className="text-white/40 mb-8 uppercase text-xs font-bold tracking-widest">
            {gameState === 'GAMEOVER' ? `Traveled: ${Math.floor(distance)} meters` : 'Engage engine?'}
          </p>
          
          <button 
            onClick={resetGame}
            className="bg-white text-black font-orbitron font-black px-12 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            {gameState === 'GAMEOVER' ? 'RESTART' : 'ENGAGE'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CarRacing;
