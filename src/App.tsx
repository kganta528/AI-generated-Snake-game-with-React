/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import SnakeGame from './components/SnakeGame.tsx';
import { TrackList, PlayerControls, Visualizer, TRACKS } from './components/MusicPlayer.tsx';
import { motion } from 'motion/react';

export default function App() {
  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Game State
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => { setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length); setProgress(0); };
  const prevTrack = () => { setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length); setProgress(0); };
  
  const onTimeUpdate = () => { if (audioRef.current) setProgress(audioRef.current.currentTime); };
  const onLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
  
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pct * duration;
    }
  };

  const formatScore = (num: number) => num.toString(16).toUpperCase().padStart(8, '0');

  return (
    <div className="h-screen w-screen grid grid-cols-[300px_1fr_300px] grid-rows-[80px_1fr_120px] bg-dark font-mono overflow-hidden relative">
      {/* Glitch Overlay Layers */}
      <div className="noise-bg" />
      <div className="scanline" />
      
      {/* Header */}
      <header className="col-span-3 px-12 border-b-2 border-gray/30 flex justify-between items-center z-20 bg-dark/80 backdrop-blur-sm">
        <div className="glitch-text text-xl font-pixel text-cyan tracking-tighter" data-text="NEURAL_GLITCH_v0.4">
          NEURAL_GLITCH_v0.4
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] text-magenta font-pixel animate-pulse">
            [SYS_MONITOR: ACTIVE]
          </div>
          <div className="text-[10px] text-gray uppercase">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </header>

      {/* Sidebar Left: Library */}
      <aside className="border-r-2 border-gray/30 bg-dark/50 p-8 overflow-y-auto relative z-20">
        <TrackList 
          currentIndex={currentTrackIndex} 
          onSelect={(i) => { setCurrentTrackIndex(i); setProgress(0); setIsPlaying(true); }}
          isPlaying={isPlaying}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent pointer-events-none h-20 bottom-0" />
      </aside>

      {/* Main Stage: Game */}
      <main className="relative flex flex-col items-center justify-center overflow-hidden border-gray/10 border-x">
        <div className="absolute top-8 w-full flex justify-between px-16 z-20">
          <div className="flex flex-col">
            <div className="text-[10px] text-gray font-pixel mb-1 tracking-tighter">DATA_VAL</div>
            <div className="text-3xl text-cyan font-mono leading-none tracking-widest">{formatScore(score)}</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-[10px] text-gray font-pixel mb-1 tracking-tighter">MAX_BUFFER</div>
            <div className="text-3xl text-magenta font-mono leading-none tracking-widest opacity-60">{formatScore(highScore)}</div>
          </div>
        </div>

        <SnakeGame onScoreUpdate={setScore} score={score} highScore={highScore} />
        
        {/* Static Background Grid */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      </main>

      {/* Right Panel: Sessions */}
      <aside className="border-l-2 border-gray/30 bg-dark/50 p-8 flex flex-col relative z-20">
        <div className="text-[10px] text-gray font-pixel mb-10 tracking-tighter border-b border-gray/20 pb-2">PROCESS_LOG</div>
        
        <div className="space-y-8 flex-1">
          <div className="space-y-4 font-mono text-xs uppercase">
            <div className="flex justify-between border-b border-gray/10 pb-1">
              <span className="text-gray">PID:</span>
              <span className="text-cyan">0x{Math.random().toString(16).slice(2, 6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between border-b border-gray/10 pb-1">
              <span className="text-gray">STATUS:</span>
              <span className="text-magenta animate-pulse">EXECUTING</span>
            </div>
            <div className="flex justify-between border-b border-gray/10 pb-1">
              <span className="text-gray">THREADS:</span>
              <span className="text-cyan">00000008</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end">
            <div className="text-[10px] text-gray font-pixel mb-4 tracking-tighter">FREQ_ANALYSIS</div>
            <Visualizer isPlaying={isPlaying} color={currentTrack.color} />
          </div>
        </div>
      </aside>

      {/* Footer: Player Controls */}
      <footer className="col-span-3 border-t-2 border-gray/30 relative z-20">
        <PlayerControls 
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          nextTrack={nextTrack}
          prevTrack={prevTrack}
          progress={progress}
          duration={duration}
          handleProgressBarClick={handleProgressBarClick}
        />
      </footer>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={nextTrack}
      />
    </div>
  );
}
