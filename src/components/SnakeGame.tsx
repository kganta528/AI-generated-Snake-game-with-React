import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

export default function SnakeGame({ onScoreUpdate, score, highScore }: any) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const speed = 150; // ms

  const generateFood = useCallback((currentSnake: {x: number, y: number}[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    onScoreUpdate(0);
    setIsGameOver(false);
    setIsPaused(false);
    setFood(generateFood(INITIAL_SNAKE));
  };

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      // Check collision with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        onScoreUpdate((s: number) => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPaused, generateFood, onScoreUpdate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          setIsPaused(p => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  const gameLoop = useCallback((timestamp: number) => {
    if (timestamp - lastUpdateRef.current >= speed) {
      moveSnake();
      lastUpdateRef.current = timestamp;
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [moveSnake]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameLoop]);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative border-8 border-gray p-2 bg-dark crt-frame">
        {/* Inner Glitch Border */}
        <div className="absolute inset-0 border-2 border-magenta/30 animate-pulse pointer-events-none" />
        
        <div 
          className="grid gap-px bg-black"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            width: '400px',
            height: '400px'
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isSnake = snake.some(s => s.x === x && s.y === y);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isFood = food.x === x && food.y === y;

            return (
              <div 
                key={i}
                className={`w-full h-full ${
                  isHead ? 'bg-cyan shadow-[0_0_10px_#00ffff]' :
                  isSnake ? 'bg-cyan/50' :
                  isFood ? 'bg-magenta shadow-[0_0_15px_#ff00ff] animate-bounce' :
                  'bg-gray/10'
                }`}
              />
            );
          })}
        </div>

        {/* Overlay for Game Over / Pause */}
        {(isGameOver || isPaused) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm tearing">
            {isGameOver ? (
              <div className="text-center p-6 border-4 border-magenta">
                <h2 className="text-xl font-pixel text-magenta mb-6 leading-relaxed" data-text="CORE_DUMPED">CORE_DUMPED</h2>
                <button 
                  onClick={resetGame}
                  className="pixel-btn-magenta"
                >
                  REBOOT_SEQUENCE
                </button>
                <div className="mt-4 text-[8px] font-mono text-magenta/50 uppercase">0x80040111_UNEXPECTED_TERM</div>
              </div>
            ) : (
              <div className="text-center p-6 border-4 border-cyan">
                <h2 className="text-xl font-pixel text-cyan mb-6" data-text="OS_HALTED">OS_HALTED</h2>
                <button 
                  onClick={() => setIsPaused(false)}
                  className="pixel-btn"
                >
                  RESUME_PROCESS
                </button>
                <p className="mt-6 text-[10px] text-cyan/50 uppercase font-mono tracking-widest">INPUT_BUFFER_WAITING...</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-12 mt-8">
        <div className="flex flex-col text-left">
          <div className="text-[10px] text-gray uppercase font-pixel mb-1">DATA_STREAM</div>
          <div className="text-xl text-cyan font-mono tracking-widest leading-none">0101_MOVE</div>
        </div>
        <div className="flex flex-col text-left">
          <div className="text-[10px] text-gray uppercase font-pixel mb-1">CMD_HALT</div>
          <div className="text-xl text-magenta font-mono tracking-widest leading-none">SPACE_INT</div>
        </div>
      </div>
    </div>
  );
}
