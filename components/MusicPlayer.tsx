import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music2, Disc } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  type: 'local' | 'spotify';
}

const LOCAL_TRACKS: Track[] = [
  { id: 'ambient', title: 'Neon Ambient', artist: 'Arcade Core', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a7351b.mp3', type: 'local' },
  { id: 'afrobeat', title: 'Lagos Vibe', artist: 'Afro Fusion', url: 'https://cdn.pixabay.com/audio/2022/10/14/audio_9939f17c30.mp3', type: 'local' },
  { id: 'sadpop', title: 'Midnight Blue', artist: 'Lana Style', url: 'https://cdn.pixabay.com/audio/2022/01/26/audio_d0c6ff1101.mp3', type: 'local' },
];

interface MusicPlayerProps {
  isMuted: boolean;
  toggleMute: () => void;
  user: any;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isMuted, toggleMute, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(localStorage.getItem('spotify_token'));
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(LOCAL_TRACKS[currentTrackIndex].url);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SPOTIFY_AUTH_SUCCESS') {
        const token = event.data.accessToken;
        setSpotifyToken(token);
        localStorage.setItem('spotify_token', token);
        alert("Spotify Connected! You can now sync your music.");
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    
    audioRef.current.src = LOCAL_TRACKS[currentTrackIndex].url;
    if (isPlaying && !isMuted) {
      audioRef.current.play().catch(err => console.log("Playback failed:", err));
    } else {
      audioRef.current.pause();
    }
  }, [currentTrackIndex, isPlaying, isMuted]);

  const handleSpotifyLogin = async () => {
    try {
      const response = await fetch('/api/auth/spotify/url');
      const { url } = await response.json();
      window.open(url, 'spotify_login', 'width=600,height=800');
    } catch (error) {
      console.error("Failed to get Spotify URL:", error);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % LOCAL_TRACKS.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + LOCAL_TRACKS.length) % LOCAL_TRACKS.length);
  };

  const currentTrack = LOCAL_TRACKS[currentTrackIndex];

  return (
    <div className="fixed bottom-8 right-8 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-panel p-6 rounded-[2rem] mb-4 w-72 border border-white/10 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-orbitron text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Neural Audio</h3>
              <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
                <VolumeX className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 flex items-center justify-center mb-4 relative group overflow-hidden">
                <Disc className={`w-12 h-12 text-cyan-400 ${isPlaying ? 'animate-spin-slow' : ''}`} />
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="font-orbitron font-black text-white text-sm uppercase tracking-tight truncate w-full">{currentTrack.title}</div>
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{currentTrack.artist}</div>
            </div>

            <div className="flex items-center justify-center space-x-6 mb-8">
              <button onClick={prevTrack} className="text-white/40 hover:text-white transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-110 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-1" />}
              </button>
              <button onClick={nextTrack} className="text-white/40 hover:text-white transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button 
                onClick={toggleMute}
                className="w-full py-2 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center space-x-2 text-[10px] font-black text-white/60 hover:text-white transition-all"
              >
                {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                <span>{isMuted ? 'UNMUTE SYSTEM' : 'MUTE SYSTEM'}</span>
              </button>

              {!spotifyToken ? (
                <button 
                  onClick={handleSpotifyLogin}
                  className="w-full py-2 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-xl flex items-center justify-center space-x-2 text-[10px] font-black text-[#1DB954] hover:bg-[#1DB954]/20 transition-all"
                >
                  <Music2 className="w-3 h-3" />
                  <span>CONNECT SPOTIFY</span>
                </button>
              ) : (
                <div className="py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center space-x-2 text-[10px] font-black text-green-400">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span>SPOTIFY LINKED</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-2xl border ${
          isOpen 
          ? 'bg-cyan-500 text-black border-cyan-400' 
          : 'bg-black/80 text-white/60 border-white/10 hover:border-cyan-500/50 hover:text-cyan-400'
        }`}
      >
        <Music className={`w-6 h-6 ${isPlaying && !isMuted ? 'animate-pulse' : ''}`} />
      </button>
    </div>
  );
};

export default MusicPlayer;
