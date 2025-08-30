"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Star, Users, Gamepad2 } from "lucide-react"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

// Mock user data
const userData = {
  username: "$player",
  totalFichitas: 15420,
  gamesFollowed: [
    { name: "Pong", username: "$retrogamer", fichitas: 2340 },
    { name: "Tetris", username: "$blockmaster", fichitas: 8950 },
    { name: "Base Invaders", username: "$spaceshooter", fichitas: 4130 },
  ],
  achievements: [
    { name: "First Victory", description: "Win your first game", earned: true },
    { name: "High Scorer", description: "Score over 1000 points", earned: true },
    { name: "Game Master", description: "Follow 3 games", earned: true },
    { name: "Fichitas Collector", description: "Earn 10,000 $fichitas", earned: true },
    { name: "Perfect Player", description: "Score over 5000 points", earned: false },
  ],
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"games" | "achievements">("games")

  const formatFichitas = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`
    }
    return amount.toString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-accent/20 max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-accent">{userData.username}</DialogTitle>
        </DialogHeader>

        {/* Profile Stats */}
        <div className="text-center py-4 border-b border-accent/20">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Star className="h-6 w-6 text-yellow-500" />
            <span className="text-2xl font-bold text-accent">{formatFichitas(userData.totalFichitas)}</span>
            <span className="text-sm text-muted-foreground">$fichitas</span>
          </div>
          <p className="text-xs text-muted-foreground">Total tokens earned</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted/20 rounded-lg p-1">
          <Button
            variant={activeTab === "games" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("games")}
            className="flex-1 text-xs"
          >
            <Gamepad2 className="h-4 w-4 mr-1" />
            Games
          </Button>
          <Button
            variant={activeTab === "achievements" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("achievements")}
            className="flex-1 text-xs"
          >
            <Trophy className="h-4 w-4 mr-1" />
            Achievements
          </Button>
        </div>

        <ScrollArea className="h-64">
          {activeTab === "games" ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Following ({userData.gamesFollowed.length})
              </h3>
              {userData.gamesFollowed.map((game, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-sm font-bold text-accent-foreground">
                        {game.username.charAt(1).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{game.name}</p>
                      <p className="text-xs text-muted-foreground">{game.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">{formatFichitas(game.fichitas)}</p>
                    <p className="text-xs text-muted-foreground">$fichitas</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center">
                <Trophy className="h-4 w-4 mr-2" />
                Achievements
              </h3>
              {userData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    achievement.earned ? "bg-accent/10 border border-accent/20" : "bg-muted/10 opacity-60"
                  }`}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      achievement.earned ? "bg-accent text-accent-foreground" : "bg-muted"
                    }`}
                  >
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.earned && (
                    <div className="text-accent">
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
