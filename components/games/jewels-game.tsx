"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface JewelsGameProps {
  isActive: boolean
  onPlay: () => void
  onScoreUpdate: (score: number) => void
}

const GRID_SIZE = 8
const JEWEL_TYPES = 6
const JEWEL_COLORS = [
  "bg-yellow-400", // Bright yellow variant
  "bg-lime-400", // Lime green variant
  "bg-amber-500", // Amber/orange variant
  "bg-green-600", // Darker green variant
  "bg-yellow-600", // Darker yellow variant
  "bg-emerald-500", // Emerald variant
]

type Grid = number[][]
type Position = { row: number; col: number }

export function JewelsGame({ isActive, onPlay, onScoreUpdate }: JewelsGameProps) {
  const [grid, setGrid] = useState<Grid>([])
  const [score, setScore] = useState(0)
  const [selectedCell, setSelectedCell] = useState<Position | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const initAudio = async () => {
      try {
        audioRef.current = new Audio("https://audio.jukehost.co.uk/xEtMgwOsbAfBCbnwfUTLwaxKje3BgeMN")
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

  // Initialize grid with random jewels
  const initializeGrid = useCallback(() => {
    const newGrid: Grid = []
    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = []
      for (let col = 0; col < GRID_SIZE; col++) {
        newGrid[row][col] = Math.floor(Math.random() * JEWEL_TYPES)
      }
    }
    return newGrid
  }, [])

  // Check for matches of 3 or more
  const findMatches = useCallback((grid: Grid) => {
    const matches: Position[] = []

    // Check horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
      let count = 1
      let current = grid[row][0]
      for (let col = 1; col < GRID_SIZE; col++) {
        if (grid[row][col] === current) {
          count++
        } else {
          if (count >= 3) {
            for (let i = col - count; i < col; i++) {
              matches.push({ row, col: i })
            }
          }
          count = 1
          current = grid[row][col]
        }
      }
      if (count >= 3) {
        for (let i = GRID_SIZE - count; i < GRID_SIZE; i++) {
          matches.push({ row, col: i })
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < GRID_SIZE; col++) {
      let count = 1
      let current = grid[0][col]
      for (let row = 1; row < GRID_SIZE; row++) {
        if (grid[row][col] === current) {
          count++
        } else {
          if (count >= 3) {
            for (let i = row - count; i < row; i++) {
              matches.push({ row: i, col })
            }
          }
          count = 1
          current = grid[row][col]
        }
      }
      if (count >= 3) {
        for (let i = GRID_SIZE - count; i < GRID_SIZE; i++) {
          matches.push({ row: i, col })
        }
      }
    }

    return matches
  }, [])

  // Remove matches and drop jewels
  const processMatches = useCallback((grid: Grid, matches: Position[]) => {
    const newGrid = grid.map((row) => [...row])

    // Remove matched jewels
    matches.forEach(({ row, col }) => {
      newGrid[row][col] = -1
    })

    // Drop jewels down
    for (let col = 0; col < GRID_SIZE; col++) {
      let writePos = GRID_SIZE - 1
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (newGrid[row][col] !== -1) {
          newGrid[writePos][col] = newGrid[row][col]
          if (writePos !== row) {
            newGrid[row][col] = -1
          }
          writePos--
        }
      }

      // Fill empty spaces with new jewels
      for (let row = writePos; row >= 0; row--) {
        newGrid[row][col] = Math.floor(Math.random() * JEWEL_TYPES)
      }
    }

    return newGrid
  }, [])

  // Handle cell selection and swapping
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (isAnimating) return

      if (!selectedCell) {
        setSelectedCell({ row, col })
      } else {
        const { row: selectedRow, col: selectedCol } = selectedCell

        // Check if cells are adjacent
        const isAdjacent =
          (Math.abs(row - selectedRow) === 1 && col === selectedCol) ||
          (Math.abs(col - selectedCol) === 1 && row === selectedRow)

        if (isAdjacent) {
          // Swap jewels
          const newGrid = grid.map((r) => [...r])
          const temp = newGrid[row][col]
          newGrid[row][col] = newGrid[selectedRow][selectedCol]
          newGrid[selectedRow][selectedCol] = temp

          // Check if swap creates matches
          const matches = findMatches(newGrid)
          if (matches.length > 0) {
            setGrid(newGrid)
            setIsAnimating(true)

            setTimeout(() => {
              let currentGrid = newGrid
              let totalMatches = matches.length

              // Process cascading matches
              const processCascade = () => {
                const newMatches = findMatches(currentGrid)
                if (newMatches.length > 0) {
                  currentGrid = processMatches(currentGrid, newMatches)
                  totalMatches += newMatches.length
                  setGrid([...currentGrid])
                  setTimeout(processCascade, 300)
                } else {
                  const newScore = score + totalMatches * 10
                  setScore(newScore)
                  onScoreUpdate(newScore)
                  setIsAnimating(false)
                }
              }

              currentGrid = processMatches(currentGrid, matches)
              setGrid([...currentGrid])
              setTimeout(processCascade, 300)
            }, 200)
          } else {
            // Swap back if no matches
            setTimeout(() => {
              setGrid(grid)
            }, 200)
          }
        }

        setSelectedCell(null)
      }
    },
    [selectedCell, grid, isAnimating, score, findMatches, processMatches, onScoreUpdate],
  )

  // Initialize game when active
  useEffect(() => {
    if (isActive) {
      const newGrid = initializeGrid()
      setGrid(newGrid)
      setScore(0)
      setSelectedCell(null)
      onPlay()
    }
  }, [isActive, initializeGrid, onPlay])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-green-900 to-yellow-900 p-4">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-lime-300 text-shadow-medium">Jewels</h2>
        <p className="text-lg text-yellow-300 text-shadow-medium">{score} $fichitas</p>
      </div>

      <div className="grid grid-cols-8 gap-1 rounded-lg bg-black/20 p-2">
        {grid.map((row, rowIndex) =>
          row.map((jewel, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`
                h-10 w-10 rounded-md border-2 transition-all duration-200
                ${JEWEL_COLORS[jewel] || "bg-gray-500"}
                ${
                  selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                    ? "border-white scale-110"
                    : "border-white/30"
                }
                hover:scale-105 active:scale-95
              `}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              disabled={isAnimating}
            />
          )),
        )}
      </div>

      <div className="mt-4 text-center text-lime-200">
        <p className="text-sm text-shadow-soft">Tap adjacent jewels to swap</p>
        <p className="text-xs text-shadow-soft">Match 3+ to score!</p>
      </div>
    </div>
  )
}
