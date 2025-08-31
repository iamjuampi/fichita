"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
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

const INFINITE_GAMES = Array.from({ length: GAMES.length * 100 }, (_, index) => ({
  ...GAMES[index % GAMES.length],
  uniqueId: `${GAMES[index % GAMES.length].id}-${Math.floor(index / GAMES.length)}`,
}))

export function GameFeed() {
  const [currentIndex, setCurrentIndex] = useState(GAMES.length * 50)
  const [isScrolling, setIsScrolling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)
  const touchEndY = useRef<number>(0)
  const touchStartX = useRef<number>(0)
  const isInGameArea = useRef<boolean>(false)

  const handleScroll = useCallback(
    (direction: "up" | "down") => {
      if (isScrolling) return

      setIsScrolling(true)

      if (direction === "down") {
        setCurrentIndex((prev) => prev + 1)
      } else {
        setCurrentIndex((prev) => prev - 1)
      }

      setTimeout(() => setIsScrolling(false), 300)
    },
    [isScrolling],
  )

  useEffect(() => {
    if (currentIndex >= INFINITE_GAMES.length - GAMES.length) {
      // Near the end, reset to middle
      setTimeout(() => {
        setCurrentIndex(GAMES.length * 50)
      }, 600)
    } else if (currentIndex < GAMES.length) {
      // Near the beginning, reset to middle
      setTimeout(() => {
        setCurrentIndex(GAMES.length * 50)
      }, 600)
    }
  }, [currentIndex])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    touchStartX.current = e.touches[0].clientX

    // Detect if touch started in game area (center 80% of screen width)
    const screenWidth = window.innerWidth
    const gameAreaStart = screenWidth * 0.1
    const gameAreaEnd = screenWidth * 0.9

    isInGameArea.current = touchStartX.current >= gameAreaStart && touchStartX.current <= gameAreaEnd
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isInGameArea.current) return

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
        className="flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          transform: `translateY(-${currentIndex * 100}vh)`,
          height: `${INFINITE_GAMES.length * 100}vh`,
        }}
      >
        {INFINITE_GAMES.map((game, index) => (
          <div key={game.uniqueId} className="h-screen w-full flex-shrink-0">
            <GameCard game={game} isActive={index === currentIndex} />
          </div>
        ))}
      </div>
    </div>
  )
}
