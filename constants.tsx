
import { Game } from './types';

export const GAMES: Game[] = [
  {
    id: 'snake',
    title: 'Neon Snake',
    description: 'Classic snake with a retro-futuristic twist. Maneuver and grow.',
    thumbnail: 'https://picsum.photos/seed/snake/600/400',
    category: 'Arcade',
    isBuiltIn: true,
    status: 'playable',
    accentColor: 'green'
  },
  {
    id: 'car-racing',
    title: 'Velocity Racer',
    description: 'Pseudo-3D F1 racing. Complete laps to earn points. High speed, high stakes.',
    thumbnail: 'https://images.unsplash.com/photo-1676300185292-e23bb3db50ad?q=80&w=2070&auto=format&fit=crop',
    category: 'Racing',
    isBuiltIn: true,
    status: 'playable',
    accentColor: 'purple'
  },
  {
    id: 'space-invaders',
    title: 'Void Invaders',
    description: 'Defend the galaxy from pixelated threats.',
    thumbnail: 'https://picsum.photos/seed/space/600/400',
    category: 'Shooter',
    isBuiltIn: false,
    status: 'coming-soon',
    accentColor: 'orange'
  }
];

export const MOCK_PLAYERS = [
  { rank: 1, username: 'PixelKing', score: 154200, avatar: 'https://i.pravatar.cc/150?u=1' },
  { rank: 2, username: 'CyberGhost', score: 142100, avatar: 'https://i.pravatar.cc/150?u=2' },
  { rank: 3, username: 'NeonRider', score: 128500, avatar: 'https://i.pravatar.cc/150?u=3' },
  { rank: 4, username: 'YaksDev', score: 98000, avatar: 'https://i.pravatar.cc/150?u=4' },
  { rank: 5, username: 'ArcadePro', score: 85000, avatar: 'https://i.pravatar.cc/150?u=5' }
];
