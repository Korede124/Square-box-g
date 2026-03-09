
export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  isBuiltIn: boolean;
  status: 'playable' | 'coming-soon';
  accentColor: 'blue' | 'purple' | 'green' | 'orange';
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  totalScore: number;
  points: number;
  joinedDate: string;
}

export interface HighScore {
  gameId: string;
  score: number;
  pointsEarned: number;
  date: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  avatar: string;
  gameId: string;
}
