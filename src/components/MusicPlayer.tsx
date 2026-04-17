import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TRACKS = [
  {
    id: 1,
    title: "Neon Dreams",
    artist: "AI UNIT_01 • 128 BPM",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "var(--color-neon-cyan)"
  },
  {
    id: 2,
    title: "Cyber City Drift",
    artist: "AI UNIT_04 • 140 BPM",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "var(--color-neon-magenta)"
  },
  {
    id: 3,
    title: "Data Stream",
    artist: "NEURAL CORE • 115 BPM",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "var(--color-neon-magenta)"
  }
];

export function TrackList({ currentIndex, onSelect, isPlaying }: { currentIndex: number, onSelect: (i: number) => void, isPlaying: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-4 text-[12px] uppercase tracking-tighter text-gray font-pixel">
        <Disc size={12} className={isPlaying ? 'animate-spin-slow text-cyan' : ''} />
        DB_QUERY_MEDIA
      </div>
      {TRACKS.map((track, i) => (
        <div 
          key={track.id}
          onClick={() => onSelect(i)}
          className={`p-3 cursor-pointer transition-all duration-100 border-l-4 ${
            currentIndex === i ? 'bg-cyan/10 border-cyan text-cyan scale-105' : 'border-transparent hover:bg-white/5 opacity-60'
          }`}
        >
          <div className="text-xs font-pixel mb-1 truncate">{track.id}. {track.title}</div>
          <div className="text-[10px] text-gray uppercase font-mono tracking-widest">{track.artist}</div>
        </div>
      ))}
    </div>
  );
}

export function PlayerControls({ 
  currentTrack, 
  isPlaying, 
  togglePlay, 
  nextTrack, 
  prevTrack,
  progress,
  duration,
  handleProgressBarClick
}: any) {
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-[1.5fr_1fr_1.5fr] items-center px-12 h-full w-full bg-dark">
      <div className="flex flex-col border-r border-gray/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTrack.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <div className="text-[10px] text-gray uppercase font-pixel mb-1">SRC_IDENT</div>
            <div className="text-lg font-mono text-cyan truncate">{currentTrack.title}</div>
            <div className="text-[10px] uppercase font-mono text-magenta">@{currentTrack.artist.split(' • ')[0]}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-8 px-8">
        <button onClick={prevTrack} className="text-gray hover:text-cyan transition-colors cursor-pointer">
          <SkipBack size={20} />
        </button>
        <button 
          onClick={togglePlay} 
          className="w-12 h-12 bg-dark border-4 border-cyan flex items-center justify-center text-cyan hover:bg-cyan hover:text-dark transition-all scale-110"
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
        <button onClick={nextTrack} className="text-gray hover:text-cyan transition-colors cursor-pointer">
          <SkipForward size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4 pl-8 border-l border-gray/20">
        <span className="text-[12px] font-mono text-magenta">{formatTime(progress)}</span>
        <div 
          className="flex-1 h-3 bg-gray/20 cursor-pointer relative border border-gray/40 overflow-hidden"
          onClick={handleProgressBarClick}
        >
          <motion.div 
            className="absolute top-0 left-0 h-full bg-cyan shadow-[0_0_10px_#00ffff]"
            style={{ width: `${(progress / duration) * 100}%` }}
          />
          {/* Static Effect inside bar */}
          <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uWUicG6M8/giphy.gif')] opacity-20 pointer-events-none" />
        </div>
        <span className="text-[12px] font-mono text-gray">{formatTime(duration)}</span>
      </div>
    </div>
  );
}

export function Visualizer({ isPlaying, color }: { isPlaying: boolean, color: string }) {
  return (
    <div className="flex items-end gap-1 h-20 border-b border-gray/20 mb-4 px-2">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-full"
          style={{ backgroundColor: i % 2 === 0 ? 'var(--color-cyan)' : 'var(--color-magenta)' }}
          animate={{
            height: isPlaying ? [10, Math.random() * 60 + 10, 10] : 10,
            opacity: isPlaying ? [0.3, 0.8, 0.3] : 0.2
          }}
          transition={{
            repeat: Infinity,
            duration: 0.1, // Jittery
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}

export default function MusicPlayer() {
  // Maintaining the original component for compatibility if needed, 
  // though App.tsx will likely use the sub-components now.
  return null;
}
