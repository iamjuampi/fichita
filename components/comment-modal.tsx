"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Heart, Send } from "lucide-react"

interface Comment {
  id: string
  username: string
  text: string
  likes: number
  timestamp: string
  liked: boolean
}

interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  gameTitle: string
  comments: Comment[]
  onAddComment: (text: string) => void
  onLikeComment: (commentId: string) => void
}

export function CommentModal({ isOpen, onClose, gameTitle, comments, onAddComment, onLikeComment }: CommentModalProps) {
  const [newComment, setNewComment] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onAddComment(newComment.trim())
      setNewComment("")
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const commentTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - commentTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "now"
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-card w-full max-w-md h-[70vh] rounded-t-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">Comments</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Comments List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No comments yet</p>
                <p className="text-sm text-muted-foreground mt-1">Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-accent-foreground">
                      {comment.username.charAt(1).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-card-foreground">{comment.username}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm text-card-foreground mt-1">{comment.text}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onLikeComment(comment.id)}
                        className={`h-6 px-2 ${
                          comment.liked
                            ? "text-red-500 hover:text-red-600"
                            : "text-muted-foreground hover:text-card-foreground"
                        }`}
                      >
                        <Heart className={`h-3 w-3 mr-1 ${comment.liked ? "fill-current" : ""}`} />
                        <span className="text-xs">{comment.likes}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Comment Input */}
        <div className="p-4 border-t border-border">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1"
              maxLength={200}
            />
            <Button type="submit" size="sm" disabled={!newComment.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
