"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Share, UserPlus, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommentModal } from "./comment-modal"
import { ShareModal } from "./share-modal"
import { ProfileModal } from "./profile-modal"

interface Game {
  id: string
  title: string
  username: string
  caption: string
  likes: number
  comments: number
  shares: number
  songName: string
}

interface Comment {
  id: string
  username: string
  text: string
  likes: number
  timestamp: string
  liked: boolean
}

// Mock comments data
const generateMockComments = (gameId: string): Comment[] => {
  const commentTemplates = {
    pong: [
      { username: "$gamer123", text: "Classic! Love the smooth controls 🏓" },
      { username: "$retro_fan", text: "This brings back memories!" },
      { username: "$mobile_player", text: "Perfect for mobile gaming" },
    ],
    tetris: [
      { username: "$puzzle_master", text: "Can't stop playing! So addictive 🧩" },
      { username: "$block_builder", text: "Got to level 15! Anyone beat that?" },
      { username: "$tetris_pro", text: "The line clearing animation is so satisfying" },
    ],
    "space-invaders": [
      { username: "$space_cadet", text: "Defending Earth one alien at a time! 👾" },
      { username: "$arcade_lover", text: "The pixel art is amazing" },
      { username: "$high_scorer", text: "Just hit 5000 points!" },
    ],
  }

  const templates = commentTemplates[gameId as keyof typeof commentTemplates] || []
  return templates.map((template, index) => ({
    id: `${gameId}-comment-${index}`,
    username: template.username,
    text: template.text,
    likes: Math.floor(Math.random() * 50) + 1,
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    liked: Math.random() > 0.7,
  }))
}

const GAMES = [
  {
    id: "pong",
    title: "Pong",
    username: "$retrogamer",
    caption: "Classic paddle vs ball action! 🏓",
    songName: "GoodStages - FICHITA",
    likes: 1234,
    comments: 89,
    shares: 45,
  },
  {
    id: "tetris",
    title: "Tetris",
    username: "$blockmaster",
    caption: "Clear those lines! Perfect your stack 🧩",
    songName: "BANGER - Fichita",
    likes: 2567,
    comments: 156,
    shares: 78,
  },
  {
    id: "space-invaders",
    title: "Base Invaders",
    username: "$spaceshooter",
    caption: "Defend Earth from alien invasion! 👾",
    songName: "Flush - Fichita",
    likes: 3421,
    comments: 234,
    shares: 123,
  },
]

export function UIOverlay() {
  const [currentGameIndex, setCurrentGameIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [likes, setLikes] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentCount, setCommentCount] = useState(0)
  const [shareCount, setShareCount] = useState(0)
  const [currentScore, setCurrentScore] = useState(0)
  const [fichitasEarned, setFichitasEarned] = useState(0)

  // Modal states
  const [showComments, setShowComments] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const currentGame = GAMES[currentGameIndex]

  // Listen for game changes from the GameFeed
  useEffect(() => {
    const handleGameChange = (event: CustomEvent) => {
      const gameIndex = event.detail.gameIndex % GAMES.length
      setCurrentGameIndex(gameIndex)
      const game = GAMES[gameIndex]
      setLikes(game.likes)
      setCommentCount(game.comments)
      setShareCount(game.shares)
      setComments(generateMockComments(game.id))
      setIsLiked(false)
      setIsFollowing(false)
      setCurrentScore(0)
      setFichitasEarned(0)
    }

    window.addEventListener("gameChanged", handleGameChange as EventListener)
    return () => window.removeEventListener("gameChanged", handleGameChange as EventListener)
  }, [])

  // Listen for score updates
  useEffect(() => {
    const handleScoreUpdate = (event: CustomEvent) => {
      setCurrentScore(event.detail.score)
      setFichitasEarned(event.detail.score)
    }

    window.addEventListener("scoreUpdated", handleScoreUpdate as EventListener)
    return () => window.removeEventListener("scoreUpdated", handleScoreUpdate as EventListener)
  }, [])

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  const handleAddComment = (text: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      username: "$you",
      text,
      likes: 0,
      timestamp: new Date().toISOString(),
      liked: false,
    }
    setComments((prev) => [newComment, ...prev])
    setCommentCount((prev) => prev + 1)
  }

  const handleLikeComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              liked: !comment.liked,
              likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment,
      ),
    )
  }

  const handleShare = () => {
    setShowShare(true)
    setShareCount((prev) => prev + 1)
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {/* Top Bar with Profile Button */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
        <div></div>
        <Button
          onClick={() => setShowProfile(true)}
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <span className="text-sm font-bold">$</span>
        </Button>
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6 pointer-events-auto">
        {/* Profile Picture with Follow Button */}
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center border-2 border-white">
            <span className="text-sm font-bold text-accent-foreground">
              {currentGame.username.charAt(1).toUpperCase()}
            </span>
          </div>
          <Button
            onClick={handleFollow}
            size="sm"
            className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-6 w-6 rounded-full p-0 ${
              isFollowing ? "bg-muted text-muted-foreground" : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            <UserPlus className="h-3 w-3" />
          </Button>
        </div>

        {/* Like Button */}
        <div className="flex flex-col items-center space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`h-12 w-12 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isLiked
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 scale-110"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Heart className={`h-6 w-6 transition-all duration-200 ${isLiked ? "fill-current scale-110" : ""}`} />
          </Button>
          <span className="text-xs text-white font-medium text-shadow-soft">{formatCount(likes)}</span>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(true)}
            className="h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-110"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          <span className="text-xs text-white font-medium text-shadow-soft">{formatCount(commentCount)}</span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-110"
          >
            <Share className="h-6 w-6" />
          </Button>
          <span className="text-xs text-white font-medium text-shadow-soft">{formatCount(shareCount)}</span>
        </div>
      </div>

      {/* Bottom Caption */}
      <div className="absolute bottom-4 left-4 right-20 text-white pointer-events-auto">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-xs font-bold text-accent-foreground">
                {currentGame.username.charAt(1).toUpperCase()}
              </span>
            </div>
            <span className="font-semibold text-sm text-shadow-soft">{currentGame.username}</span>
            {!isFollowing && (
              <Button
                onClick={handleFollow}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-6 px-2 text-xs"
              >
                Follow
              </Button>
            )}
          </div>
          <p className="text-sm leading-relaxed max-w-xs text-shadow-soft">{currentGame.caption}</p>
          <div className="text-xs text-white/70 text-shadow-soft">
            <span className="opacity-80">Now playing: </span>
            <span className="font-medium">{currentGame.songName}</span>
          </div>
          {fichitasEarned > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-accent font-semibold text-shadow-soft">+{fichitasEarned} $fichitas</span>
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CommentModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        gameTitle={currentGame.title}
        comments={comments}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
      />

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        gameTitle={currentGame.title}
        username={currentGame.username}
        score={currentScore}
      />

      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  )
}
