"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface SpaceInvadersGameProps {
  isActive: boolean;
  onPlay: () => void;
  onScoreUpdate: (score: number) => void;
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Bullet extends GameObject {
  dy: number;
}

interface Alien extends GameObject {
  type: number;
  alive: boolean;
}

interface GameState {
  player: GameObject;
  bullets: Bullet[];
  aliens: Alien[];
  alienBullets: Bullet[];
  score: number;
  lives: number;
  gameOver: boolean;
  alienDirection: number;
  alienSpeed: number;
  lastAlienMoveTime: number;
  lastAlienShootTime: number;
}

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 480;
const PLAYER_WIDTH = 24;
const PLAYER_HEIGHT = 16;
const ALIEN_WIDTH = 16;
const ALIEN_HEIGHT = 12;
const BULLET_WIDTH = 2;
const BULLET_HEIGHT = 8;

export function SpaceInvadersGame({
  isActive,
  onPlay,
  onScoreUpdate,
}: SpaceInvadersGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    player: {
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: CANVAS_HEIGHT - PLAYER_HEIGHT - 20,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
    },
    bullets: [],
    aliens: [],
    alienBullets: [],
    score: 0,
    lives: 3,
    gameOver: false,
    alienDirection: 1,
    alienSpeed: 30,
    lastAlienMoveTime: 0,
    lastAlienShootTime: 0,
  });
  const animationRef = useRef<number>();
  const keysRef = useRef({ left: false, right: false, shoot: false });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastTouchX = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);
  const lastMouseX = useRef<number>(0);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const initAudio = async () => {
      try {
        audioRef.current = new Audio(
          "https://audio.jukehost.co.uk/R4hBA1oRwkoCEa7b5kL0auyywI2ClcQc"
        );
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
        audioRef.current.preload = "metadata";
      } catch (error) {
        console.warn("Audio initialization failed:", error);
      }
    };

    initAudio();

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = "";
          audioRef.current.load();
        } catch (error) {
          // Ignore cleanup errors
        }
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleAudio = async () => {
      if (!audioRef.current) return;

      try {
        if (isActive) {
          await audioRef.current.play();
        } else {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("Audio operation failed:", error);
        }
        // Silently ignore AbortError as it's expected during rapid scrolling
      }
    };

    handleAudio();
  }, [isActive]);

  const createAliens = () => {
    const aliens: Alien[] = [];
    const rows = 5;
    const cols = 8;
    const startX = 40;
    const startY = 60;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        aliens.push({
          x: startX + col * (ALIEN_WIDTH + 8),
          y: startY + row * (ALIEN_HEIGHT + 8),
          width: ALIEN_WIDTH,
          height: ALIEN_HEIGHT,
          type: row < 2 ? 2 : row < 4 ? 1 : 0, // Different alien types
          alive: true,
        });
      }
    }
    return aliens;
  };

  const checkCollision = (obj1: GameObject, obj2: GameObject) => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  };

  const shoot = () => {
    const state = gameStateRef.current;
    if (state.bullets.length < 3) {
      // Limit bullets
      state.bullets.push({
        x: state.player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
        y: state.player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        dy: -5,
      });
    }
  };

  const updateGame = useCallback(
    (currentTime: number) => {
      const state = gameStateRef.current;
      if (!isActive || state.gameOver) return;

      // Update bullets
      state.bullets = state.bullets.filter((bullet) => {
        bullet.y += bullet.dy;
        return bullet.y > -BULLET_HEIGHT;
      });

      // Update alien bullets
      state.alienBullets = state.alienBullets.filter((bullet) => {
        bullet.y += bullet.dy;
        return bullet.y < CANVAS_HEIGHT + BULLET_HEIGHT;
      });

      // Move aliens
      if (currentTime - state.lastAlienMoveTime > state.alienSpeed) {
        const aliveAliens = state.aliens.filter((alien) => alien.alive);
        let shouldDropDown = false;

        // Check if aliens hit the edge
        const leftmostAlien = aliveAliens.reduce(
          (min, alien) => (alien.x < min.x ? alien : min),
          aliveAliens[0]
        );
        const rightmostAlien = aliveAliens.reduce(
          (max, alien) => (alien.x > max.x ? alien : max),
          aliveAliens[0]
        );

        if (
          (state.alienDirection > 0 &&
            rightmostAlien &&
            rightmostAlien.x + ALIEN_WIDTH >= CANVAS_WIDTH) ||
          (state.alienDirection < 0 && leftmostAlien && leftmostAlien.x <= 0)
        ) {
          state.alienDirection *= -1;
          shouldDropDown = true;
        }

        // Move aliens
        state.aliens.forEach((alien) => {
          if (alien.alive) {
            if (shouldDropDown) {
              alien.y += 20;
            } else {
              alien.x += state.alienDirection * 10;
            }
          }
        });

        state.lastAlienMoveTime = currentTime;
        state.alienSpeed = Math.max(10, state.alienSpeed - 0.1); // Gradually increase speed
      }

      // Alien shooting
      if (
        currentTime - state.lastAlienShootTime >
        1000 + Math.random() * 2000
      ) {
        const aliveAliens = state.aliens.filter((alien) => alien.alive);
        if (aliveAliens.length > 0) {
          const shootingAlien =
            aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
          state.alienBullets.push({
            x: shootingAlien.x + ALIEN_WIDTH / 2 - BULLET_WIDTH / 2,
            y: shootingAlien.y + ALIEN_HEIGHT,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            dy: 3,
          });
        }
        state.lastAlienShootTime = currentTime;
      }

      // Check bullet-alien collisions
      state.bullets.forEach((bullet, bulletIndex) => {
        state.aliens.forEach((alien, alienIndex) => {
          if (alien.alive && checkCollision(bullet, alien)) {
            alien.alive = false;
            state.bullets.splice(bulletIndex, 1);
            state.score += (alien.type + 1) * 10;
            setScore(state.score);
            onScoreUpdate(state.score);
          }
        });
      });

      // Check alien bullet-player collisions
      state.alienBullets.forEach((bullet, bulletIndex) => {
        if (checkCollision(bullet, state.player)) {
          state.alienBullets.splice(bulletIndex, 1);
          state.lives--;
          setLives(state.lives);
          if (state.lives <= 0) {
            state.gameOver = true;
            setGameOver(true);
          }
        }
      });

      // Check if aliens reached the bottom or player
      const aliveAliens = state.aliens.filter((alien) => alien.alive);
      const alienReachedBottom = aliveAliens.some(
        (alien) => alien.y + ALIEN_HEIGHT >= state.player.y
      );
      if (alienReachedBottom) {
        state.gameOver = true;
        setGameOver(true);
      }

      // Check win condition
      if (aliveAliens.length === 0) {
        // Respawn aliens with increased difficulty
        state.aliens = createAliens();
        state.alienSpeed = Math.max(10, state.alienSpeed - 5);
      }
    },
    [onScoreUpdate, isActive]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;

    // Clear canvas
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars background
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % CANVAS_WIDTH;
      const y = (i * 73) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw player
    ctx.fillStyle = "#10b981";
    ctx.fillRect(state.player.x, state.player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    // Player ship details
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(state.player.x + 8, state.player.y + 2, 8, 4);
    ctx.fillRect(state.player.x + 10, state.player.y - 2, 4, 6);

    // Draw aliens
    state.aliens.forEach((alien) => {
      if (alien.alive) {
        const colors = ["#ff0000", "#ffff00", "#ff8000"];
        ctx.fillStyle = colors[alien.type];
        ctx.fillRect(alien.x, alien.y, ALIEN_WIDTH, ALIEN_HEIGHT);
        // Alien details
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(alien.x + 2, alien.y + 2, 2, 2);
        ctx.fillRect(alien.x + 12, alien.y + 2, 2, 2);
      }
    });

    // Draw bullets
    ctx.fillStyle = "#ffffff";
    state.bullets.forEach((bullet) => {
      ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
    });

    // Draw alien bullets
    ctx.fillStyle = "#ff0000";
    state.alienBullets.forEach((bullet) => {
      ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
    });

    // Draw UI
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px monospace";
    ctx.fillText(`Score: ${state.score}`, 10, 20);
    ctx.fillText(`Lives: ${state.lives}`, 10, 35);
  }, []);

  const gameLoop = useCallback(
    (currentTime: number) => {
      updateGame(currentTime);
      draw();
      if (isActive && !gameStateRef.current.gameOver) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    },
    [updateGame, draw, isActive]
  );

  const resetGame = useCallback(() => {
    const state = gameStateRef.current;
    state.player.x = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
    state.bullets = [];
    state.alienBullets = [];
    state.aliens = createAliens();
    state.score = 0;
    state.lives = 3;
    state.gameOver = false;
    state.alienDirection = 1;
    state.alienSpeed = 30;
    state.lastAlienMoveTime = 0;
    state.lastAlienShootTime = 0;

    setScore(0);
    setLives(3);
    setGameOver(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;

    touchStartRef.current = { x: touchX, y: touchY };
    lastTouchX.current = touchX;

    if (touchY < CANVAS_HEIGHT * 0.7) {
      shoot();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!touchStartRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;

    const deltaX = touchX - lastTouchX.current;
    const state = gameStateRef.current;
    const newX = state.player.x + deltaX * 2; // Multiply for more responsive movement

    if (newX >= 0 && newX <= CANVAS_WIDTH - PLAYER_WIDTH) {
      state.player.x = newX;
    }

    lastTouchX.current = touchX;
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    isMouseDown.current = true;
    lastMouseX.current = mouseX;

    if (mouseY < CANVAS_HEIGHT * 0.7) {
      shoot();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    if (isMouseDown.current) {
      const deltaX = mouseX - lastMouseX.current;
      const state = gameStateRef.current;
      const newX = state.player.x + deltaX * 2;

      if (newX >= 0 && newX <= CANVAS_WIDTH - PLAYER_WIDTH) {
        state.player.x = newX;
      }
    }

    lastMouseX.current = mouseX;
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
  };

  const handleMouseLeave = () => {
    isMouseDown.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;

    if (mouseY < CANVAS_HEIGHT * 0.7) {
      shoot();
    }
  };

  useEffect(() => {
    if (isActive && !gameOver) {
      if (gameStateRef.current.aliens.length === 0) {
        resetGame();
      }
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, gameOver, gameLoop, resetGame]);

  if (!isActive) {
    return (
      <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-green-600 to-lime-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-8xl mb-4">👾</div>
          <h2 className="text-4xl font-bold mb-2">Base Invaders</h2>
          <p className="text-xl opacity-80">Defend Earth</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 h-screen w-screen bg-gradient-to-b from-green-600 to-lime-500 flex flex-col items-center justify-center relative">
      {/* Game UI */}
      <div className="absolute top-8 left-4 right-4 flex justify-between items-center text-white z-10">
        <div className="text-sm font-bold text-shadow-medium">
          <div>Score: {score}</div>
          <div>Lives: {lives}</div>
        </div>
        {/* <Button onClick={onPlay} variant="ghost" size="sm" className="text-white hover:bg-white/20">
          ✕
        </Button> */}
      </div>

      {/* Game Canvas */}
      <div className="flex-1 flex items-center justify-center">
        {gameOver ? (
          <div className="text-center text-white">
            <div className="text-6xl mb-4">👾</div>
            <h2 className="text-2xl font-bold mb-4 text-shadow-strong">
              Game Over!
            </h2>
            <p className="text-lg mb-2 text-shadow-medium">
              Final Score: {score}
            </p>
            <Button
              onClick={resetGame}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 text-lg"
            >
              Play Again
            </Button>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-white/20 rounded-lg bg-background/20 backdrop-blur-sm"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{ touchAction: "none" }}
          />
        )}
      </div>
    </div>
  );
}
