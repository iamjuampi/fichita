"use client"

import { useState } from "react"
import { PlaceholderGame } from "./placeholder-game"

interface Game {
  id: string
  title: string
  username: string
  caption: string
  likes: number
  comments: number
  shares: number
}

interface GameCardProps {
  game: Game
  isActive: boolean
}

export function GameCard({ game, isActive }: GameCardProps) {
  const [currentScore, setCurrentScore] = useState(0)

  const handleScoreUpdate = (score: number) => {
    setCurrentScore(score)
    const scoreUpdateEvent = new CustomEvent("scoreUpdated", {
      detail: { score },
    })
    window.dispatchEvent(scoreUpdateEvent)
  }

  return (
    <div className="relative h-dvh w-full bg-background overflow-hidden">
      {/* Game Area - Full screen background */}
      <div className="absolute inset-0">
        <PlaceholderGame gameId={game.id} isActive={isActive} onPlay={() => {}} onScoreUpdate={handleScoreUpdate} />
      </div>

      {/* Touch zones for navigation - left and right edges */}
      <div className="absolute left-0 top-0 w-[10vw] h-full bg-transparent pointer-events-auto touch-manipulation" />
      <div className="absolute right-0 top-0 w-[10vw] h-full bg-transparent pointer-events-auto touch-manipulation" />
    </div>
  )
}
