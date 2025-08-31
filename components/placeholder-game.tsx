"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PongGame } from "./games/pong-game"
import { TetrisGame } from "./games/tetris-game"
import { SpaceInvadersGame } from "./games/space-invaders-game"

interface PlaceholderGameProps {
  gameId: string
  isActive: boolean
  onPlay: () => void
}

export function PlaceholderGame({ gameId, isActive, onPlay }: PlaceholderGameProps) {
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setScore(0)
      return
    }

    if (gameId !== "pong" && gameId !== "tetris" && gameId !== "space-invaders") {
      const interval = setInterval(() => {
        setScore((prev) => prev + Math.floor(Math.random() * 10) + 1)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isActive, gameId])

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore)
  }

  if (gameId === "pong") {
    return <PongGame isActive={isActive} onPlay={onPlay} onScoreUpdate={handleScoreUpdate} />
  }

  if (gameId === "tetris") {
    return <TetrisGame isActive={isActive} onPlay={onPlay} onScoreUpdate={handleScoreUpdate} />
  }

  if (gameId === "space-invaders") {
    return <SpaceInvadersGame isActive={isActive} onPlay={onPlay} onScoreUpdate={handleScoreUpdate} />
  }

  const getGameContent = () => {
    switch (gameId) {
      case "pong":
        return {
          title: "Pong",
          description: "Classic paddle vs ball",
          color: "from-blue-500 to-cyan-500",
          emoji: "🏓",
        }
      case "tetris":
        return {
          title: "Tetris",
          description: "Clear the lines",
          color: "from-purple-500 to-pink-500",
          emoji: "🧩",
        }
      case "space-invaders":
        return {
          title: "Space Invaders",
          description: "Defend Earth",
          color: "from-green-500 to-emerald-500",
          emoji: "👾",
        }
      default:
        return {
          title: "Game",
          description: "Play now",
          color: "from-gray-500 to-slate-500",
          emoji: "🎮",
        }
    }
  }

  const gameContent = getGameContent()

  if (!isActive) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${gameContent.color} flex items-center justify-center`}>
        <div className="text-center text-white">
          <div className="text-8xl mb-4">{gameContent.emoji}</div>
          <h2 className="text-4xl font-bold mb-2">{gameContent.title}</h2>
          <p className="text-xl opacity-80">{gameContent.description}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${gameContent.color} flex flex-col items-center justify-center relative overflow-hidden`}
    >
      <div className="absolute top-8 left-4 right-4 flex justify-between items-center text-white">
        <div className="text-lg font-bold">Score: {score}</div>
        <Button onClick={onPlay} variant="ghost" size="sm" className="text-white hover:bg-white/20">
          ✕
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4 animate-bounce">{gameContent.emoji}</div>
          <h2 className="text-2xl font-bold mb-2">{gameContent.title}</h2>
          <p className="text-lg opacity-80 mb-4">Playing...</p>
          <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${score % 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
