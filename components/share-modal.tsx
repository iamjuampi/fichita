"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Copy, Check } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
  username: string;
  score: number;
}

export function ShareModal({
  isOpen,
  onClose,
  gameTitle,
  username,
  score,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `Just scored ${score} points in ${gameTitle}! Check out this awesome minigame feed 🎮`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    let shareLink = "";

    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case "telegram":
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-card w-full max-w-md rounded-t-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">
            Share Game
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Share Preview */}
        <div className="bg-muted rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
              <span className="text-sm font-bold text-accent-foreground">
                {username.charAt(1).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm text-card-foreground">
                {username}
              </p>
              <p className="text-xs text-muted-foreground">
                scored {score} in {gameTitle}
              </p>
            </div>
          </div>
          <p className="text-sm text-card-foreground">{shareText}</p>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full justify-start bg-transparent"
          >
            {copied ? (
              <Check className="h-4 w-4 mr-3" />
            ) : (
              <Copy className="h-4 w-4 mr-3" />
            )}
            {copied ? "Link Copied!" : "Copy Link"}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleShare("twitter")}
              variant="outline"
              className="justify-center"
            >
              Twitter
            </Button>
            <Button
              onClick={() => handleShare("facebook")}
              variant="outline"
              className="justify-center"
            >
              Facebook
            </Button>
            <Button
              onClick={() => handleShare("whatsapp")}
              variant="outline"
              className="justify-center"
            >
              WhatsApp
            </Button>
            <Button
              onClick={() => handleShare("telegram")}
              variant="outline"
              className="justify-center"
            >
              Telegram
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
