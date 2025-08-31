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
]

const INFINITE_GAMES = Array.from({ length: GAMES.length * 100 }, (_, index) => ({
  ...GAMES[index % GAMES.length],
  uniqueId: `${GAMES[index % GAMES.length].id}-${Math.floor(index / GAMES.length)}`,
}))

export function GameFeed() {
  const [currentIndex, setCurrentIndex] = useState(GAMES.length * 50)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(GAMES.length * 50 * 100)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef<number>(0)
  const touchEndY = useRef<number>(0)
  const touchStartX = useRef<number>(0)
  const isInGameArea = useRef<boolean>(false)

  useEffect(() => {
    const gameChangeEvent = new CustomEvent("gameChanged", {
      detail: { gameIndex: currentIndex },
    })
    window.dispatchEvent(gameChangeEvent)
  }, [currentIndex])

  const handleScroll = useCallback(
    (direction: "up" | "down") => {
      if (isScrolling) return

      setIsScrolling(true)

      if (direction === "down") {
        setCurrentIndex((prev) => prev + 1)
        setScrollPosition((prev) => prev + 100)
      } else {
        setCurrentIndex((prev) => prev - 1)
        setScrollPosition((prev) => prev - 100)
      }

      setTimeout(() => setIsScrolling(false), 150)
    },
    [isScrolling],
  )

  useEffect(() => {
    if (currentIndex >= INFINITE_GAMES.length - GAMES.length) {
      setTimeout(() => {
        setCurrentIndex(GAMES.length * 50)
        setScrollPosition(GAMES.length * 50 * 100)
      }, 300)
    } else if (currentIndex < GAMES.length) {
      setTimeout(() => {
        setCurrentIndex(GAMES.length * 50)
        setScrollPosition(GAMES.length * 50 * 100)
      }, 300)
    }
  }, [currentIndex])

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    touchStartY.current = e.touches[0].clientY
    touchStartX.current = e.touches[0].clientX

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const gameAreaStart = screenWidth * 0.1
    const gameAreaEnd = screenWidth * 0.9
    const gameAreaTop = screenHeight * 0.1
    const gameAreaBottom = screenHeight * 0.9

    isInGameArea.current =
      touchStartX.current >= gameAreaStart &&
      touchStartX.current <= gameAreaEnd &&
      e.touches[0].clientY >= gameAreaTop &&
      e.touches[0].clientY <= gameAreaBottom
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isInGameArea.current) return

    touchEndY.current = e.changedTouches[0].clientY
    const deltaY = touchStartY.current - touchEndY.current

    if (Math.abs(deltaY) > 20) {
      if (deltaY > 0) {
        handleScroll("down")
      } else {
        handleScroll("up")
      }
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.deltaY > 0) {
      handleScroll("down")
    } else {
      handleScroll("up")
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative h-dvh w-full overflow-hidden touch-none select-none"
      style={{ touchAction: "none" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <div
        className="flex flex-col transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `translateY(-${scrollPosition}dvh)`,
          height: `${INFINITE_GAMES.length * 100}dvh`,
        }}
      >
        {INFINITE_GAMES.map((game, index) => (
          <div key={game.uniqueId} className="h-dvh w-full flex-shrink-0 relative">
            <GameCard game={game} isActive={index === currentIndex} />
          </div>
        ))}
      </div>
    </div>
  )
}
