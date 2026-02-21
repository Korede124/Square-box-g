
import React, { useEffect, useRef, useState } from 'react';

interface BrickBreakerProps {
  onGameOver: (score: number) => void;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 12;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 35;

const BrickBreaker: React.FC<BrickBreakerProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const requestRef = useRef<number>();
  const ballPos = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50 });
  const ballVel = useRef({ dx: 4, dy: -4 });
  const paddleX = useRef(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
  const bricks = useRef<any[]>([]);

  const initBricks = () => {
    const b = [];
    for (let c = 0; c < BRICK_COLS; c++) {
      b[c] = [];
      for (let r = 0; r < BRICK_ROWS; r++) {
        b[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
    bricks.current = b;
  };

  const resetBall = () => {
    ballPos.current = { x: paddleX.current + PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 35 };
    ballVel.current = { dx: 4, dy: -4 };
  };

  const startGame = () => {
    initBricks();
    setScore(0);
    setLives(3);
    setGameState('PLAYING');
    resetBall();
  };

  const draw = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Bricks
    for (let c = 0; c < BRICK_COLS; c++) {
      for (let r = 0; r < BRICK_ROWS; r++) {
        if (bricks.current[c][r].status === 1) {
          const brickX = c * (80 + BRICK_PADDING) + BRICK_OFFSET_LEFT;
          const brickY = r * (25 + BRICK_PADDING) + BRICK_OFFSET_TOP;
          bricks.current[c][r].x = brickX;
          bricks.current[c][r].y = brickY;
          
          ctx.beginPath();
          ctx.rect(brickX, brickY, 80, 25);
          ctx.fillStyle = `hsl(${r * 40 + 200}, 70%, 50%)`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = `hsl(${r * 40 + 200}, 70%, 50%)`;
          ctx.fill();
          ctx.closePath();
          ctx.shadowBlur = 0;
        }
      }
    }

    // Draw Paddle
    ctx.beginPath();
    ctx.rect(paddleX.current, CANVAS_HEIGHT - PADDLE_HEIGHT - 10, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = "#00f2ff";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00f2ff";
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ballPos.current.x, ballPos.current.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ffffff";
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;

    // Collision Logic
    // Wall
    if (ballPos.current.x + ballVel.current.dx > CANVAS_WIDTH - BALL_RADIUS || ballPos.current.x + ballVel.current.dx < BALL_RADIUS) {
      ballVel.current.dx = -ballVel.current.dx;
    }
    if (ballPos.current.y + ballVel.current.dy < BALL_RADIUS) {
      ballVel.current.dy = -ballVel.current.dy;
    } else if (ballPos.current.y + ballVel.current.dy > CANVAS_HEIGHT - BALL_RADIUS - 10) {
      if (ballPos.current.x > paddleX.current && ballPos.current.x < paddleX.current + PADDLE_WIDTH) {
        ballVel.current.dy = -ballVel.current.dy;
        // Add velocity based on hit position
        const hitPos = (ballPos.current.x - (paddleX.current + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        ballVel.current.dx = hitPos * 6;
      } else if (ballPos.current.y + ballVel.current.dy > CANVAS_HEIGHT) {
        setLives(prev => {
          if (prev <= 1) {
            setGameState('GAMEOVER');
            onGameOver(score);
            return 0;
          }
          resetBall();
          return prev - 1;
        });
      }
    }

    // Brick Collision
    for (let c = 0; c < BRICK_COLS; c++) {
      for (let r = 0; r < BRICK_ROWS; r++) {
        const b = bricks.current[c][r];
        if (b.status === 1) {
          if (ballPos.current.x > b.x && ballPos.current.x < b.x + 80 && ballPos.current.y > b.y && ballPos.current.y < b.y + 25) {
            ballVel.current.dy = -ballVel.current.dy;
            b.status = 0;
            setScore(s => s + 100);
          }
        }
      }
    }

    if (gameState === 'PLAYING') {
      ballPos.current.x += ballVel.current.dx;
      ballPos.current.y += ballVel.current.dy;
      requestRef.current = requestAnimationFrame(draw);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
        paddleX.current = relativeX - PADDLE_WIDTH / 2;
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') paddleX.current = Math.max(0, paddleX.current - 20);
      if (e.key === 'ArrowRight') paddleX.current = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, paddleX.current + 20);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
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
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="absolute top-6 left-6 z-10 flex space-x-12">
        <div className="flex flex-col">
          <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Points</span>
          <span className="text-white font-orbitron text-2xl font-black">{score.toLocaleString()}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Hulls</span>
          <div className="flex space-x-1 mt-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-white/10'}`}></div>
            ))}
          </div>
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT} 
        className="max-w-full max-h-full object-contain cursor-none"
      />

      {gameState !== 'PLAYING' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
          <h2 className="font-orbitron text-4xl font-black text-white mb-2 uppercase tracking-tight">
            {gameState === 'GAMEOVER' ? 'SYSTEM FAILURE' : 'BRICK BOX'}
          </h2>
          <p className="text-white/40 mb-8 uppercase text-xs font-bold tracking-widest">
            {gameState === 'GAMEOVER' ? `Blocks Destroyed Points: ${score}` : 'Ready to breach?'}
          </p>
          
          <button 
            onClick={startGame}
            className="bg-white text-black font-orbitron font-black px-12 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            {gameState === 'GAMEOVER' ? 'REBOOT' : 'INITIATE'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BrickBreaker;
