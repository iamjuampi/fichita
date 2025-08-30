"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"

interface PongGameProps {
  isActive: boolean
  onPlay: () => void
  onScoreUpdate: (score: number) => void
}

interface GameState {
  ball: { x: number; y: number; dx: number; dy: number }
  playerPaddle: { y: number }
  aiPaddle: { y: number }
  score: { player: number; ai: number }
}

export function PongGame({ isActive, onPlay, onScoreUpdate }: PongGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameStateRef = useRef<GameState>({
    ball: { x: 160, y: 240, dx: 4, dy: 3 },
    playerPaddle: { y: 200 },
    aiPaddle: { y: 200 },
    score: { player: 0, ai: 0 },
  })
  const animationRef = useRef<number>()
  const touchStartY = useRef<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [score, setScore] = useState(0)

  const CANVAS_WIDTH = 320
  const CANVAS_HEIGHT = 480
  const PADDLE_WIDTH = 8
  const PADDLE_HEIGHT = 80
  const BALL_SIZE = 8

  useEffect(() => {
    // Initialize audio
    const initAudio = async () => {
      try {
        audioRef.current = new Audio("https://audio.jukehost.co.uk/PZNJCVLCvrQvU8R0SBOvnBAxtZxLtQqI")
        audioRef.current.loop = true
        audioRef.current.volume = 0.3
        audioRef.current.preload = "metadata"
      } catch (error) {
        console.warn("Audio initialization failed:", error)
      }
    }

    initAudio()

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause()
          audioRef.current.src = ""
          audioRef.current.load()
        } catch (error) {
          // Ignore cleanup errors
        }
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const handleAudio = async () => {
      if (!audioRef.current) return

      try {
        if (isActive) {
          await audioRef.current.play()
        } else {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("Audio operation failed:", error)
        }
        // Silently ignore AbortError as it's expected during rapid scrolling
      }
    }

    handleAudio()
  }, [isActive])

  const resetBall = useCallback(() => {
    const state = gameStateRef.current
    state.ball = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: (Math.random() > 0.5 ? 1 : -1) * 4,
      dy: (Math.random() - 0.5) * 6,
    }
  }, [])

  const updateGame = useCallback(() => {
    const state = gameStateRef.current
    const canvas = canvasRef.current
    if (!canvas || !isActive) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Update ball position
    state.ball.x += state.ball.dx
    state.ball.y += state.ball.dy

    // Ball collision with top/bottom walls
    if (state.ball.y <= BALL_SIZE / 2 || state.ball.y >= CANVAS_HEIGHT - BALL_SIZE / 2) {
      state.ball.dy = -state.ball.dy
    }

    // Ball collision with paddles
    const ballLeft = state.ball.x - BALL_SIZE / 2
    const ballRight = state.ball.x + BALL_SIZE / 2
    const ballTop = state.ball.y - BALL_SIZE / 2
    const ballBottom = state.ball.y + BALL_SIZE / 2

    // Player paddle collision (left side)
    if (
      ballLeft <= PADDLE_WIDTH &&
      ballBottom >= state.playerPaddle.y &&
      ballTop <= state.playerPaddle.y + PADDLE_HEIGHT &&
      state.ball.dx < 0
    ) {
      state.ball.dx = -state.ball.dx
      const hitPos = (state.ball.y - (state.playerPaddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2)
      state.ball.dy = hitPos * 5
    }

    // AI paddle collision (right side)
    if (
      ballRight >= CANVAS_WIDTH - PADDLE_WIDTH &&
      ballBottom >= state.aiPaddle.y &&
      ballTop <= state.aiPaddle.y + PADDLE_HEIGHT &&
      state.ball.dx > 0
    ) {
      state.ball.dx = -state.ball.dx
      const hitPos = (state.ball.y - (state.aiPaddle.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2)
      state.ball.dy = hitPos * 5
    }

    // Ball out of bounds
    if (state.ball.x < 0) {
      state.score.ai++
      resetBall()
    } else if (state.ball.x > CANVAS_WIDTH) {
      state.score.player++
      setScore(state.score.player)
      onScoreUpdate(state.score.player)
      resetBall()
    }

    // AI paddle movement (simple AI)
    const aiCenter = state.aiPaddle.y + PADDLE_HEIGHT / 2
    const ballCenter = state.ball.y
    const aiSpeed = 3

    if (aiCenter < ballCenter - 10) {
      state.aiPaddle.y = Math.min(state.aiPaddle.y + aiSpeed, CANVAS_HEIGHT - PADDLE_HEIGHT)
    } else if (aiCenter > ballCenter + 10) {
      state.aiPaddle.y = Math.max(state.aiPaddle.y - aiSpeed, 0)
    }

    // Clear canvas
    ctx.fillStyle = "#0f172a"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw center line
    ctx.strokeStyle = "#475569"
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(CANVAS_WIDTH / 2, 0)
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw paddles
    ctx.fillStyle = "#10b981"
    ctx.fillRect(0, state.playerPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT)
    ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, state.aiPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT)

    // Draw ball
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(state.ball.x, state.ball.y, BALL_SIZE / 2, 0, Math.PI * 2)
    ctx.fill()

    // Draw scores
    ctx.fillStyle = "#ffffff"
    ctx.font = "24px monospace"
    ctx.textAlign = "center"
    ctx.fillText(state.score.player.toString(), CANVAS_WIDTH / 4, 40)
    ctx.fillText(state.score.ai.toString(), (3 * CANVAS_WIDTH) / 4, 40)
  }, [resetBall, onScoreUpdate, isActive])

  const gameLoop = useCallback(() => {
    updateGame()
    if (isActive) {
      animationRef.current = requestAnimationFrame(gameLoop)
    }
  }, [updateGame, isActive])

  const resetGame = useCallback(() => {
    gameStateRef.current.score = { player: 0, ai: 0 }
    setScore(0)
    resetBall()
  }, [resetBall])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const touchY = e.touches[0].clientY - rect.top
    const canvasY = (touchY / rect.height) * CANVAS_HEIGHT

    gameStateRef.current.playerPaddle.y = Math.max(
      0,
      Math.min(canvasY - PADDLE_HEIGHT / 2, CANVAS_HEIGHT - PADDLE_HEIGHT),
    )
  }

  useEffect(() => {
    if (isActive) {
      resetGame()
      gameLoop()
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, gameLoop, resetGame])

  if (!isActive) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-lime-400 to-yellow-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-8xl mb-4">🏓</div>
          <h2 className="text-4xl font-bold mb-2">Pong</h2>
          <p className="text-xl opacity-80">Classic paddle vs ball</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-lime-400 to-yellow-500 flex flex-col items-center justify-center relative">
      {/* Game UI */}
      <div className="absolute top-8 left-4 right-4 flex justify-between items-center text-white z-10">
        <div className="text-lg font-bold text-shadow-medium">Score: {score}</div>
        <Button onClick={onPlay} variant="ghost" size="sm" className="text-white hover:bg-white/20">
          ✕
        </Button>
      </div>

      {/* Game Canvas */}
      <div className="flex-1 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-white/20 rounded-lg bg-background/20 backdrop-blur-sm"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{ touchAction: "none" }}
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-20 left-4 right-20 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
        <p className="text-white/80 text-center text-sm text-shadow-soft">
          Touch and drag to move your paddle
          <br />
          <span className="text-xs opacity-60">First to score wins!</span>
        </p>
      </div>
    </div>
  )
}
