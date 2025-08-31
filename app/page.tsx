"use client"
import { GameFeed } from "@/components/game-feed"
import { UIOverlay } from "@/components/ui-overlay"

export default function Home() {
  return (
    <main className="h-dvh w-full overflow-hidden bg-background touch-none select-none relative">
      <GameFeed />
      <UIOverlay />
    </main>
  )
}
