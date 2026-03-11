
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Zap, Trophy, Flag } from 'lucide-react';

interface CarRacingProps {
  onGameOver: (score: number) => void;
  onStart?: () => void;
}

// Pseudo-3D Racing Engine Constants
const ROAD_WIDTH = 2000;
const SEGMENT_LENGTH = 200;
const RUMBLE_LENGTH = 3;
const LANES = 3;
const FIELD_OF_VIEW = 100;
const CAMERA_HEIGHT = 1000;
const CAMERA_DEPTH = 1 / Math.tan((FIELD_OF_VIEW / 2) * Math.PI / 180);
const DRAW_DISTANCE = 300;
const MAX_SPEED = SEGMENT_LENGTH / (1/60); // Max speed: 1 segment per frame
const ACCEL = MAX_SPEED / 5;
const BREAKING = -MAX_SPEED;
const DECEL = -MAX_SPEED / 5;
const OFF_ROAD_DECEL = -MAX_SPEED / 2;
const OFF_ROAD_LIMIT = MAX_SPEED / 4;
const TOTAL_LAPS = 1;

interface Segment {
  index: number;
  p1: { world: { x: number, y: number, z: number }, screen: { x: number, y: number, w: number } };
  p2: { world: { x: number, y: number, z: number }, screen: { x: number, y: number, w: number } };
  curve: number;
  sprites?: { x: number, type: 'tower' | 'pillar' | 'light' }[];
  color: { road: string, grass: string, rumble: string, lane?: string };
  cars: any[];
}

const CarRacing: React.FC<CarRacingProps> = ({ onGameOver, onStart }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');
  const [score, setScore] = useState(0); // Distance in meters
  const [speed, setSpeed] = useState(0);
  const [lapTime, setLapTime] = useState(0);
  const [shake, setShake] = useState(0);
  const [position_rank, setPositionRank] = useState(22);
  const [laps, setLaps] = useState(0);
  
  // Game state refs for the loop
  const position = useRef(0);
  const totalDistance = useRef(0);
  const playerX = useRef(0); // -1 to 1
  const playerSpeed = useRef(0);
  const trackLength = useRef(0);
  const segments = useRef<Segment[]>([]);
  const requestRef = useRef<number>();
  const lastTime = useRef(0);
  const keys = useRef<{ [key: string]: boolean }>({});

  const resetTrack = () => {
    const newSegments: Segment[] = [];
    
    const addSegment = (curve: number) => {
      const n = newSegments.length;
      const sprites: any[] = [];
      
      // Add roadside objects every few segments
      if (n % 10 === 0) {
        sprites.push({ x: -1.5, type: Math.random() > 0.5 ? 'tower' : 'pillar' });
        sprites.push({ x: 1.5, type: Math.random() > 0.5 ? 'tower' : 'pillar' });
      }

      newSegments.push({
        index: n,
        p1: { world: { x: 0, y: 0, z: n * SEGMENT_LENGTH }, screen: { x: 0, y: 0, w: 0 } },
        p2: { world: { x: 0, y: 0, z: (n + 1) * SEGMENT_LENGTH }, screen: { x: 0, y: 0, w: 0 } },
        curve: curve,
        sprites: sprites,
        color: Math.floor(n / RUMBLE_LENGTH) % 2 ? 
          { road: '#333', grass: '#111', rumble: '#555', lane: '#666' } : 
          { road: '#222', grass: '#080808', rumble: '#00f2ff' }
      ,
        cars: []
      });
    };

    const addRoad = (enter: number, hold: number, leave: number, curve: number) => {
      for (let i = 0; i < enter; i++) addSegment(curve * (i / enter));
      for (let i = 0; i < hold; i++) addSegment(curve);
      for (let i = 0; i < leave; i++) addSegment(curve * (1 - i / leave));
    };

    // Build a more complex track
    addRoad(100, 100, 100, 0); // Start Straight
    addRoad(50, 50, 50, 2); // Easy right
    addRoad(50, 50, 50, -3); // Hard left
    addRoad(100, 100, 100, 0); // Long Straight
    addRoad(50, 50, 50, 5); // Hairpin right
    addRoad(50, 50, 50, -5); // Hairpin left
    addRoad(100, 100, 100, 0); // Back Straight
    addRoad(50, 50, 50, 2); // Final corner
    addRoad(100, 100, 100, 0); // Finish Straight

    trackLength.current = newSegments.length * SEGMENT_LENGTH;
    segments.current = newSegments;

    // Add Finish Line markers
    for (let i = newSegments.length - 10; i < newSegments.length; i++) {
      newSegments[i].color.road = i % 2 === 0 ? '#333' : '#444';
      if (i === newSegments.length - 1) {
        newSegments[i].sprites = [{ x: 0, type: 'light' }]; // Marker for finish
      }
    }

    // Add more AI cars in a grid formation at the start (P22 start)
    // We need 21 cars ahead of us to be P22
    for (let i = 0; i < 21; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const zPos = (row + 1) * 400 + 200; // Tighter grid spacing for visibility
      const segIndex = Math.floor(zPos / SEGMENT_LENGTH);
      
      newSegments[segIndex].cars.push({
        offset: col === 0 ? -0.5 : 0.5,
        z: zPos,
        speed: MAX_SPEED * 0.6 + Math.random() * MAX_SPEED * 0.2,
        color: i % 5 === 0 ? '#ff1e00' : (i % 3 === 0 ? '#004225' : '#ffffff'),
        laneChangeDir: 0,
        laneChangeTimer: 100,
        isAggressive: Math.random() > 0.7
      });
    }

    // Add some random traffic further ahead
    for (let i = 0; i < 20; i++) {
      const segIndex = Math.floor(Math.random() * (newSegments.length - 500)) + 400;
      newSegments[segIndex].cars.push({
        offset: Math.random() * 1.6 - 0.8,
        z: segIndex * SEGMENT_LENGTH,
        speed: MAX_SPEED * 0.4 + Math.random() * MAX_SPEED * 0.4,
        color: '#ffffff',
        laneChangeDir: Math.random() > 0.5 ? 1 : -1,
        laneChangeTimer: Math.random() * 50,
        isAggressive: false
      });
    }
  };

  const project = (p: any, cameraX: number, cameraY: number, cameraZ: number, width: number, height: number) => {
    p.camera = {
      x: (p.world.x || 0) - cameraX,
      y: (p.world.y || 0) - cameraY,
      z: (p.world.z || 0) - cameraZ
    };
    p.screen.scale = CAMERA_DEPTH / p.camera.z;
    p.screen.x = Math.round((width / 2) + (p.screen.scale * p.camera.x * width / 2));
    p.screen.y = Math.round((height / 2) - (p.screen.scale * p.camera.y * height / 2));
    p.screen.w = Math.round(p.screen.scale * ROAD_WIDTH * width / 2);
  };

  const findSegment = (z: number) => segments.current[Math.floor(z / SEGMENT_LENGTH) % segments.current.length];

  const resetGame = () => {
    position.current = 0;
    totalDistance.current = 0;
    playerX.current = 0;
    playerSpeed.current = 0;
    setScore(0);
    setSpeed(0);
    setLapTime(0);
    setLaps(0);
    setPositionRank(22);
    resetTrack();
    setGameState('PLAYING');
    if (onStart) onStart();
  };

  const update = (dt: number) => {
    if (gameState !== 'PLAYING') return;

    // Handle Input
    if (keys.current['ArrowUp'] || keys.current['w']) playerSpeed.current += ACCEL * dt;
    else if (keys.current['ArrowDown'] || keys.current['s']) playerSpeed.current += BREAKING * dt;
    else playerSpeed.current += DECEL * dt;

    if (keys.current['ArrowLeft'] || keys.current['a']) playerX.current -= (dt * 2.5 * (playerSpeed.current / MAX_SPEED));
    if (keys.current['ArrowRight'] || keys.current['d']) playerX.current += (dt * 2.5 * (playerSpeed.current / MAX_SPEED));

    // Off-road penalty
    if ((playerX.current < -1 || playerX.current > 1) && (playerSpeed.current > OFF_ROAD_LIMIT)) {
      playerSpeed.current += OFF_ROAD_DECEL * dt;
    }

    playerX.current = Math.max(-2, Math.min(2, playerX.current));
    playerSpeed.current = Math.max(0, Math.min(MAX_SPEED, playerSpeed.current));
    
    const oldPos = position.current;
    const moveDist = playerSpeed.current * dt;
    position.current += moveDist;
    totalDistance.current += moveDist;
    
    if (position.current >= trackLength.current) {
      position.current -= trackLength.current;
      setLaps(l => {
        const newLaps = l + 1;
        if (newLaps >= TOTAL_LAPS) {
          setGameState('GAMEOVER');
          onGameOver(Math.floor(totalDistance.current));
        }
        return newLaps;
      });
    }
    
    setScore(Math.floor(totalDistance.current)); // Raw distance in meters
    setSpeed(Math.floor((playerSpeed.current / MAX_SPEED) * 340));

    // Update AI Cars
    segments.current.forEach(seg => {
      seg.cars.forEach(car => {
        car.z += car.speed * dt;
        if (car.z >= trackLength.current) car.z -= trackLength.current;
        
        // AI Lane changing & Aggression
        car.laneChangeTimer -= dt * (car.isAggressive ? 20 : 10);
        if (car.laneChangeTimer <= 0) {
          car.laneChangeDir *= -1;
          car.laneChangeTimer = (car.isAggressive ? 20 : 50) + Math.random() * 100;
        }
        
        // AI tries to block player if aggressive
        if (car.isAggressive && Math.abs(car.z - position.current) < SEGMENT_LENGTH * 5) {
          const targetOffset = playerX.current;
          car.offset += (targetOffset - car.offset) * 0.5 * dt;
        } else {
          car.offset += car.laneChangeDir * 0.3 * dt;
        }
        
        car.offset = Math.max(-0.85, Math.min(0.85, car.offset));

        // Collision detection
        if (Math.abs(car.z - position.current) < SEGMENT_LENGTH && Math.abs(car.offset - playerX.current) < 0.3) {
          if (playerSpeed.current > car.speed) {
            setGameState('GAMEOVER');
            onGameOver(Math.floor(totalDistance.current));
          } else {
            // Rear-ended by AI or side-swipe
            playerSpeed.current *= 0.7;
            setShake(15);
          }
        }
      });
    });

    // Update Rank
    let rank = 1;
    segments.current.forEach(seg => {
      if (seg.cars.length > 0) {
        seg.cars.forEach(car => {
          if (car.z > position.current) rank++;
        });
      }
    });
    setPositionRank(Math.min(22, rank));

    // Centrifugal force in curves
    const playerSegment = findSegment(position.current);
    playerX.current -= (dt * 3 * (playerSpeed.current / MAX_SPEED) * playerSegment.curve * 0.02);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      setShake(s => Math.max(0, s - 1));
    }

    ctx.clearRect(0, 0, width, height);

    // Background (Sky)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height / 2);
    skyGradient.addColorStop(0, '#000814');
    skyGradient.addColorStop(1, '#001d3d');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height / 2);

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const starX = (Math.sin(i * 123.45) * 0.5 + 0.5) * width;
      const starY = (Math.cos(i * 678.90) * 0.5 + 0.5) * (height / 2);
      ctx.globalAlpha = Math.random() * 0.5 + 0.5;
      ctx.fillRect(starX, starY, 1, 1);
    }
    ctx.globalAlpha = 1.0;

    const baseSegment = findSegment(position.current);
    const playerPercent = (position.current % SEGMENT_LENGTH) / SEGMENT_LENGTH;
    
    let x = 0;
    let dx = -(baseSegment.curve * playerPercent);

    // Draw Road
    for (let n = 0; n < DRAW_DISTANCE; n++) {
      const segment = segments.current[(baseSegment.index + n) % segments.current.length];
      const loop = segment.index < baseSegment.index ? trackLength.current : 0;
      
      project(segment.p1, playerX.current * ROAD_WIDTH, CAMERA_HEIGHT, position.current - loop, width, height);
      project(segment.p2, playerX.current * ROAD_WIDTH - x - dx, CAMERA_HEIGHT, position.current - loop, width, height);

      x += dx;
      dx += segment.curve;

      if (segment.p1.camera.z <= CAMERA_DEPTH) continue;

      const p1 = segment.p1.screen;
      const p2 = segment.p2.screen;

      // Grass
      ctx.fillStyle = segment.color.grass;
      ctx.fillRect(0, p2.y, width, p1.y - p2.y);

      // Rumble
      const r1 = p1.w * 0.1;
      const r2 = p2.w * 0.1;
      ctx.fillStyle = segment.color.rumble;
      ctx.beginPath();
      ctx.moveTo(p1.x - p1.w - r1, p1.y);
      ctx.lineTo(p1.x - p1.w, p1.y);
      ctx.lineTo(p2.x - p2.w, p2.y);
      ctx.lineTo(p2.x - p2.w - r2, p2.y);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(p1.x + p1.w + r1, p1.y);
      ctx.lineTo(p1.x + p1.w, p1.y);
      ctx.lineTo(p2.x + p2.w, p2.y);
      ctx.lineTo(p2.x + p2.w + r2, p2.y);
      ctx.fill();

      // Road
      ctx.fillStyle = segment.color.road;
      ctx.beginPath();
      ctx.moveTo(p1.x - p1.w, p1.y);
      ctx.lineTo(p1.x + p1.w, p1.y);
      ctx.lineTo(p2.x + p2.w, p2.y);
      ctx.lineTo(p2.x - p2.w, p2.y);
      ctx.fill();

      // Sprites (Towers/Pillars)
      if (segment.sprites) {
        segment.sprites.forEach(sprite => {
          const spriteX = p1.x + (p1.w * sprite.x);
          const spriteY = p1.y;
          const spriteW = (sprite.type === 'tower' ? 100 : 40) * p1.scale * width / 2;
          const spriteH = (sprite.type === 'tower' ? 400 : 150) * p1.scale * width / 2;
          
          ctx.fillStyle = sprite.type === 'tower' ? '#111' : '#222';
          ctx.fillRect(spriteX - spriteW / 2, spriteY - spriteH, spriteW, spriteH);
          
          // Lights on towers
          if (sprite.type === 'tower') {
            ctx.fillStyle = '#00f2ff';
            ctx.fillRect(spriteX - 2, spriteY - spriteH + 10, 4, 4);
            ctx.fillRect(spriteX - 2, spriteY - spriteH + 30, 4, 4);
          }
        });
      }

      // Lanes
      if (segment.color.lane) {
        const l1 = p1.w * 0.02;
        const l2 = p2.w * 0.02;
        ctx.fillStyle = segment.color.lane;
        ctx.fillRect(p1.x - l1/2, p2.y, l1, p1.y - p2.y);
      }
    }

    // Draw AI Cars
    for (let n = DRAW_DISTANCE - 1; n > 0; n--) {
      const segment = segments.current[(baseSegment.index + n) % segments.current.length];
      segment.cars.forEach(car => {
        const scale = segment.p1.screen.scale;
        const destX = segment.p1.screen.x + (scale * car.offset * ROAD_WIDTH * width / 2);
        const destY = segment.p1.screen.y;
        const carW = 400 * scale * width / 2;
        const carH = 200 * scale * width / 2;

        // Car Body
        ctx.fillStyle = car.color;
        ctx.fillRect(destX - carW/2, destY - carH, carW, carH);
        // Rear Wing
        ctx.fillStyle = '#000';
        ctx.fillRect(destX - carW/2, destY - carH - 10, carW, 5);
        // Wheels
        ctx.fillRect(destX - carW/2 - 5, destY - carH/2, 10, carH/2);
        ctx.fillRect(destX + carW/2 - 5, destY - carH/2, 10, carH/2);
      });
    }

    // Draw Player Car (Static at bottom)
    const bounce = (Math.random() * 2) * (playerSpeed.current / MAX_SPEED);
    const pX = width / 2;
    const pY = height - 100 + bounce;

    // Speed Lines (Graphics improvement)
    if (playerSpeed.current > MAX_SPEED * 0.7) {
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.2)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        const lineX = Math.random() * width;
        const lineY = Math.random() * height;
        const lineLen = Math.random() * 100 + 50;
        ctx.beginPath();
        ctx.moveTo(lineX, lineY);
        ctx.lineTo(lineX, lineY + lineLen);
        ctx.stroke();
      }
    }

    // F1 Car Body (Detailed)
    ctx.fillStyle = '#00f2ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00f2ff';
    
    // Main chassis
    ctx.beginPath();
    ctx.moveTo(pX - 25, pY);
    ctx.lineTo(pX + 25, pY);
    ctx.lineTo(pX + 15, pY - 80);
    ctx.lineTo(pX - 15, pY - 80);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Sidepods
    ctx.fillStyle = '#00a3ad';
    ctx.fillRect(pX - 35, pY - 40, 15, 30);
    ctx.fillRect(pX + 20, pY - 40, 15, 30);

    // Front Wing
    ctx.fillStyle = '#111';
    ctx.fillRect(pX - 60, pY - 15, 120, 12);
    // Rear Wing
    ctx.fillRect(pX - 50, pY - 90, 100, 15);
    // Rear Wing endplates
    ctx.fillRect(pX - 50, pY - 95, 5, 20);
    ctx.fillRect(pX + 45, pY - 95, 5, 20);

    // Wheels (Detailed)
    ctx.fillStyle = '#000';
    // Rear wheels
    ctx.fillRect(pX - 65, pY - 30, 20, 40);
    ctx.fillRect(pX + 45, pY - 30, 20, 40);
    // Front wheels
    ctx.fillRect(pX - 55, pY - 85, 15, 30);
    ctx.fillRect(pX + 40, pY - 85, 15, 30);

    // Halo
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pX, pY - 50, 15, Math.PI, 0);
    ctx.stroke();

    ctx.restore();
  };

  const loop = (time: number) => {
    if (lastTime.current) {
      const dt = Math.min(1, (time - lastTime.current) / 1000);
      update(dt);
      draw();
    }
    lastTime.current = time;
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(loop);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => keys.current[e.key] = false;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(loop);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameState]);

  return (
    <div className="relative w-full h-full bg-[#050505] overflow-hidden flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="w-full h-full object-cover"
      />

      {/* HUD */}
      <div className="absolute top-8 left-8 z-10 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Velocity</span>
          </div>
          <div className="font-orbitron text-4xl font-black text-white italic">
            {speed}<span className="text-xs ml-1 text-white/40 not-italic">KM/H</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">Tire Temp</div>
          <div className="flex space-x-1">
            <div className={`h-1 w-8 rounded-full ${speed > 300 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
            <div className={`h-1 w-8 rounded-full ${speed > 300 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
          </div>
        </div>
      </div>

      <div className="absolute top-8 right-8 z-10 text-right space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-end space-x-2">
            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Position</span>
            <Flag className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-orbitron text-4xl font-black text-white italic">
            P{position_rank}<span className="text-xs ml-1 text-white/40 not-italic">/22</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-end space-x-2">
            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Score</span>
            <Trophy className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="font-orbitron text-4xl font-black text-white italic">
            {Math.floor(score / 200)}<span className="text-xs ml-1 text-white/40 not-italic">PTS</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">Distance</div>
          <div className="text-xl font-orbitron font-black text-white/60 italic">
            {score}<span className="text-xs ml-1 text-white/40 not-italic">M</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">ERS Charge</div>
          <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden ml-auto">
            <div className="h-full bg-cyan-400 animate-pulse" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-20 px-8 flex justify-between items-end pointer-events-none">
        <div className="flex space-x-4 pointer-events-auto">
          <button 
            onTouchStart={() => keys.current['ArrowLeft'] = true}
            onTouchEnd={() => keys.current['ArrowLeft'] = false}
            onMouseDown={() => keys.current['ArrowLeft'] = true}
            onMouseUp={() => keys.current['ArrowLeft'] = false}
            className="w-20 h-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center active:bg-cyan-500/20 active:border-cyan-500/50 transition-all"
          >
            <ArrowLeft className="w-8 h-8 text-white" />
          </button>
          <button 
            onTouchStart={() => keys.current['ArrowRight'] = true}
            onTouchEnd={() => keys.current['ArrowRight'] = false}
            onMouseDown={() => keys.current['ArrowRight'] = true}
            onMouseUp={() => keys.current['ArrowRight'] = false}
            className="w-20 h-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center active:bg-cyan-500/20 active:border-cyan-500/50 transition-all"
          >
            <ArrowRight className="w-8 h-8 text-white" />
          </button>
        </div>

        <div className="flex flex-col space-y-4 pointer-events-auto">
          <button 
            onTouchStart={() => keys.current['ArrowUp'] = true}
            onTouchEnd={() => keys.current['ArrowUp'] = false}
            onMouseDown={() => keys.current['ArrowUp'] = true}
            onMouseUp={() => keys.current['ArrowUp'] = false}
            className="w-24 h-24 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full flex items-center justify-center active:bg-emerald-500/40 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <span className="font-orbitron font-black text-emerald-400 text-xs uppercase tracking-widest">GAS</span>
          </button>
          <button 
            onTouchStart={() => keys.current['ArrowDown'] = true}
            onTouchEnd={() => keys.current['ArrowDown'] = false}
            onMouseDown={() => keys.current['ArrowDown'] = true}
            onMouseUp={() => keys.current['ArrowDown'] = false}
            className="w-20 h-20 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-full flex items-center justify-center active:bg-red-500/40 transition-all"
          >
            <span className="font-orbitron font-black text-red-400 text-[10px] uppercase tracking-widest">BRAKE</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {gameState !== 'PLAYING' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full"
            >
              <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-cyan-500/20">
                <Flag className="w-10 h-10 text-cyan-400" />
              </div>
              
              <h2 className="font-orbitron text-5xl font-black text-white mb-4 uppercase tracking-tighter italic">
                {gameState === 'GAMEOVER' ? 'RETIRED' : 'VELOCITY RACER'}
              </h2>
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-10">
                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">
                  {gameState === 'GAMEOVER' ? 'Final Classification' : 'Grand Prix Briefing'}
                </div>
                <div className="text-3xl font-orbitron font-black text-white">
                  {Math.floor(score / 200)} <span className="text-xs text-white/40 uppercase tracking-widest">Points Earned</span>
                </div>
                <div className="text-xl font-orbitron font-black text-white/60 mt-2">
                  {score} <span className="text-xs text-white/40 uppercase tracking-widest">Meters Traveled</span>
                </div>
                <p className="mt-4 text-[10px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                  {gameState === 'GAMEOVER' 
                    ? 'Race concluded. Points awarded based on distance covered.' 
                    : 'Start from P22. Overtake the field. 1 Lap sprint. Points per meter.'}
                </p>
              </div>

              <button 
                onClick={resetGame}
                className="w-full group relative bg-white text-black font-orbitron font-black py-5 rounded-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10 uppercase tracking-[0.3em]">{gameState === 'GAMEOVER' ? 'RE-ENTER RACE' : 'START ENGINE'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarRacing;
