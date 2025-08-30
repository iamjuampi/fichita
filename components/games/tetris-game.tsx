"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { RotateCw, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

interface TetrisGameProps {
  isActive: boolean
  onPlay: () => void
  onScoreUpdate: (score: number) => void
}

// Tetromino shapes
const TETROMINOES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
}

const COLORS = {
  I: "#00f5ff",
  O: "#ffff00",
  T: "#a000ff",
  S: "#00ff00",
  Z: "#ff0000",
  J: "#0000ff",
  L: "#ff8000",
}

type TetrominoType = keyof typeof TETROMINOES

interface GameState {
  grid: number[][]
  currentPiece: {
    shape: number[][]
    x: number
    y: number
    type: TetrominoType
  } | null
  nextPiece: TetrominoType
  score: number
  lines: number
  level: number
  gameOver: boolean
}

const GRID_WIDTH = 10
const GRID_HEIGHT = 20
const CELL_SIZE = 16

export function TetrisGame({ isActive, onPlay, onScoreUpdate }: TetrisGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameStateRef = useRef<GameState>({
    grid: Array(GRID_HEIGHT)
      .fill(null)
      .map(() => Array(GRID_WIDTH).fill(0)),
    currentPiece: null,
    nextPiece: "T" as TetrominoType,
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
  })
  const animationRef = useRef<number>()
  const lastDropTime = useRef<number>(0)

  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const getRandomTetromino = (): TetrominoType => {
    const types = Object.keys(TETROMINOES) as TetrominoType[]
    return types[Math.floor(Math.random() * types.length)]
  }

  const createPiece = (type: TetrominoType) => ({
    shape: TETROMINOES[type],
    x: Math.floor(GRID_WIDTH / 2) - Math.floor(TETROMINOES[type][0].length / 2),
    y: 0,
    type,
  })

  const isValidMove = (piece: typeof gameStateRef.current.currentPiece, dx = 0, dy = 0, newShape?: number[][]) => {
    if (!piece) return false

    const shape = newShape || piece.shape
    const newX = piece.x + dx
    const newY = piece.y + dy

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x
          const boardY = newY + y

          if (boardX < 0 || boardX >= GRID_WIDTH || boardY >= GRID_HEIGHT) {
            return false
          }
          if (boardY >= 0 && gameStateRef.current.grid[boardY][boardX]) {
            return false
          }
        }
      }
    }
    return true
  }

  const rotatePiece = (shape: number[][]) => {
    const rotated = shape[0].map((_, index) => shape.map((row) => row[index]).reverse())
    return rotated
  }

  const placePiece = () => {
    const state = gameStateRef.current
    if (!state.currentPiece) return

    const { shape, x, y, type } = state.currentPiece

    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const boardY = y + py
          const boardX = x + px
          if (boardY >= 0) {
            state.grid[boardY][boardX] = Object.keys(TETROMINOES).indexOf(type) + 1
          }
        }
      }
    }

    // Check for completed lines
    const completedLines = []
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
      if (state.grid[y].every((cell) => cell !== 0)) {
        completedLines.push(y)
      }
    }

    // Remove completed lines
    completedLines.forEach((lineY) => {
      state.grid.splice(lineY, 1)
      state.grid.unshift(Array(GRID_WIDTH).fill(0))
    })

    // Update score and lines
    if (completedLines.length > 0) {
      const linePoints = [0, 40, 100, 300, 1200]
      state.lines += completedLines.length
      state.score += linePoints[completedLines.length] * state.level
      state.level = Math.floor(state.lines / 10) + 1

      setLines(state.lines)
      setScore(state.score)
      onScoreUpdate(state.score)
    }

    // Spawn new piece
    state.currentPiece = createPiece(state.nextPiece)
    state.nextPiece = getRandomTetromino()

    // Check game over
    if (!isValidMove(state.currentPiece)) {
      state.gameOver = true
      setGameOver(true)
    }
  }

  const movePiece = (dx: number, dy: number) => {
    const state = gameStateRef.current
    if (!state.currentPiece || state.gameOver) return false

    if (isValidMove(state.currentPiece, dx, dy)) {
      state.currentPiece.x += dx
      state.currentPiece.y += dy
      return true
    }

    if (dy > 0) {
      placePiece()
    }
    return false
  }

  const rotatePieceAction = () => {
    const state = gameStateRef.current
    if (!state.currentPiece || state.gameOver) return

    const rotatedShape = rotatePiece(state.currentPiece.shape)
    if (isValidMove(state.currentPiece, 0, 0, rotatedShape)) {
      state.currentPiece.shape = rotatedShape
    }
  }

  const dropPiece = () => {
    while (movePiece(0, 1)) {
      // Keep dropping until it can't move down
    }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const state = gameStateRef.current

    // Clear canvas
    ctx.fillStyle = "#1e293b"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#475569"
    ctx.lineWidth = 1
    for (let x = 0; x <= GRID_WIDTH; x++) {
      ctx.beginPath()
      ctx.moveTo(x * CELL_SIZE, 0)
      ctx.lineTo(x * CELL_SIZE, GRID_HEIGHT * CELL_SIZE)
      ctx.stroke()
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * CELL_SIZE)
      ctx.lineTo(GRID_WIDTH * CELL_SIZE, y * CELL_SIZE)
      ctx.stroke()
    }

    // Draw placed pieces
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (state.grid[y][x]) {
          const colorIndex = state.grid[y][x] - 1
          const colors = Object.values(COLORS)
          ctx.fillStyle = colors[colorIndex] || "#ffffff"
          ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
        }
      }
    }

    // Draw current piece
    if (state.currentPiece) {
      ctx.fillStyle = COLORS[state.currentPiece.type]
      const { shape, x, y } = state.currentPiece
      for (let py = 0; py < shape.length; py++) {
        for (let px = 0; px < shape[py].length; px++) {
          if (shape[py][px]) {
            const drawX = (x + px) * CELL_SIZE
            const drawY = (y + py) * CELL_SIZE
            if (drawY >= 0) {
              ctx.fillRect(drawX + 1, drawY + 1, CELL_SIZE - 2, CELL_SIZE - 2)
            }
          }
        }
      }
    }
  }, [])

  const gameLoop = useCallback(
    (currentTime: number) => {
      const state = gameStateRef.current
      if (!isActive || state.gameOver) return

      const dropInterval = Math.max(50, 500 - (state.level - 1) * 50)

      if (currentTime - lastDropTime.current > dropInterval) {
        movePiece(0, 1)
        lastDropTime.current = currentTime
      }

      draw()
      animationRef.current = requestAnimationFrame(gameLoop)
    },
    [draw, isActive],
  )

  const resetGame = useCallback(() => {
    const state = gameStateRef.current
    state.grid = Array(GRID_HEIGHT)
      .fill(null)
      .map(() => Array(GRID_WIDTH).fill(0))
    state.currentPiece = createPiece(getRandomTetromino())
    state.nextPiece = getRandomTetromino()
    state.score = 0
    state.lines = 0
    state.level = 1
    state.gameOver = false

    setScore(0)
    setLines(0)
    setGameOver(false)
    lastDropTime.current = 0
  }, [])

  useEffect(() => {
    if (isActive && !gameOver) {
      if (gameStateRef.current.currentPiece === null) {
        resetGame()
      }
      animationRef.current = requestAnimationFrame(gameLoop)
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
  }, [isActive, gameOver, gameLoop, resetGame])

  if (!isActive) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-8xl mb-4">🧩</div>
          <h2 className="text-4xl font-bold mb-2">Tetris</h2>
          <p className="text-xl opacity-80">Clear the lines</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-yellow-400 to-amber-500 flex flex-col items-center justify-center relative">
      {/* Game UI */}
      <div className="absolute top-8 left-4 right-4 flex justify-between items-center text-white z-10">
        <div className="text-sm font-bold text-shadow-medium">
          <div>Score: {score}</div>
          <div>Lines: {lines}</div>
        </div>
        <Button onClick={onPlay} variant="ghost" size="sm" className="text-white hover:bg-white/20">
          ✕
        </Button>
      </div>

      {/* Game Canvas */}
      <div className="flex-1 flex items-center justify-center">
        {gameOver ? (
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🧩</div>
            <h2 className="text-2xl font-bold mb-4 text-shadow-strong">Game Over!</h2>
            <p className="text-lg mb-2 text-shadow-medium">Final Score: {score}</p>
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
            width={GRID_WIDTH * CELL_SIZE}
            height={GRID_HEIGHT * CELL_SIZE}
            className="border-2 border-white/20 rounded-lg bg-background/20 backdrop-blur-sm"
            style={{ touchAction: "none" }}
          />
        )}
      </div>

      {/* Controls */}
      {!gameOver && (
        <div className="absolute bottom-20 left-4 right-20 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="grid grid-cols-4 gap-2 mb-2">
            <Button
              onTouchStart={() => movePiece(-1, 0)}
              onClick={() => movePiece(-1, 0)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-12"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              onTouchStart={() => rotatePieceAction()}
              onClick={() => rotatePieceAction()}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-12"
            >
              <RotateCw className="h-6 w-6" />
            </Button>
            <Button
              onTouchStart={() => movePiece(1, 0)}
              onClick={() => movePiece(1, 0)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-12"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <Button
              onTouchStart={() => dropPiece()}
              onClick={() => dropPiece()}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-12"
            >
              <ChevronDown className="h-6 w-6" />
            </Button>
          </div>
          <p className="text-white/80 text-center text-xs text-shadow-soft">Left/Right • Rotate • Drop</p>
        </div>
      )}
    </div>
  )
}
