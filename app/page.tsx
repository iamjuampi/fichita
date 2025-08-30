"use client"
import { GameFeed } from "@/components/game-feed"

export default function Home() {
  return (
    <main className="h-screen w-full overflow-hidden bg-background">
      <GameFeed />
    </main>
  )
}
