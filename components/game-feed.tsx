"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { GameCard } from "./game-card"

// Placeholder games data - will be replaced with actual games later
const GAMES = [
  {
    id: "pong",
    title: "Pong",
    username: "$retrogamer",
    caption: "Classic paddle vs ball action! 🏓",
    likes: 1234,
    comments: 89,
    shares: 45,
  },
  {
    id: "tetris",
    title: "Tetris",
    username: "$blockmaster",
    caption: "Clear those lines! Perfect your stack 🧩",
    likes: 2567,
    comments: 156,
    shares: 78,
  },
  {
    id: "space-invaders",
    title: "Base Invaders",
    username: "$spaceshooter",
    caption: "Defend Earth from alien invasion! 👾",
    likes: 3421,
    comments: 234,
    shares: 123,
  },
  {
    id: "jewels",
    title: "Jewels",
    username: "$gemmaster",
    caption: "Match 3 gems and create cascading combos! 💎",
    likes: 1890,
    comments: 67,
    shares: 34,
  },
]

export function GameFeed() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)
  const touchEndY = useRef<number>(0)

  const handleScroll = useCallback(
    (direction: "up" | "down") => {
      if (isScrolling) return

      setIsScrolling(true)

      if (direction === "down") {
        setCurrentIndex((prev) => (prev + 1) % GAMES.length)
      } else {
        setCurrentIndex((prev) => (prev - 1 + GAMES.length) % GAMES.length)
      }

      setTimeout(() => setIsScrolling(false), 500)
    },
    [isScrolling],
  )

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndY.current = e.changedTouches[0].clientY
    const deltaY = touchStartY.current - touchEndY.current

    if (Math.abs(deltaY) > 50) {
      // Minimum swipe distance
      if (deltaY > 0) {
        handleScroll("down")
      } else {
        handleScroll("up")
      }
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY > 0) {
      handleScroll("down")
    } else {
      handleScroll("up")
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <div
        className="flex flex-col transition-transform duration-500 ease-out"
        style={{
          transform: `translateY(-${currentIndex * 100}vh)`,
          height: `${GAMES.length * 100}vh`,
        }}
      >
        {GAMES.map((game, index) => (
          <div key={game.id} className="h-screen w-full flex-shrink-0">
            <GameCard game={game} isActive={index === currentIndex} />
          </div>
        ))}
      </div>
    </div>
  )
}
