import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Instagram, Copy, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { recordShare } from "./ShareMilestoneTracker";

interface StoryShareTemplateProps {
  referralCode: string;
  displayName: string;
  nominationsCount?: number;
  mealsCount?: number;
}

/**
 * StoryShareTemplate — Pre-made Instagram Story template for post-nomination sharing.
 * Phase 1: Creates the PUBLIC visibility loop (Ice Bucket's video = our story).
 * +100 BC bonus for posting.
 */
export default function StoryShareTemplate({
  referralCode,
  displayName,
  nominationsCount = 3,
  mealsCount = 22,
}: StoryShareTemplateProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://iamblessedaf.com/r/${referralCode}`;

  const storyCaption = `🙏 Just nominated ${nominationsCount} friends for the 11:11 Gratitude Challenge!\n\n✅ ${mealsCount} meals donated\n✅ FREE wristband earned\n\nWho are YOU grateful for?\n\nJoin: ${shareUrl}\n\n#1111GratitudeChallenge #IABAF_${referralCode} #IamBlessedAF #grateful`;

  const handleCopyCaption = async () => {
    await navigator.clipboard.writeText(storyCaption);
    setCopied(true);
    recordShare();
    toast.success("Caption copied! +100 BC for posting 🪙");
    setTimeout(() => setCopied(false), 2000);

    // Award BC
    window.dispatchEvent(
      new CustomEvent("gamification-earn", {
        detail: { type: "coins", amount: 100, reason: "story-share" },
      })
    );
  };

  const handleShareInstagram = () => {
    handleCopyCaption();
    window.open("https://www.instagram.com/create/story", "_blank");
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">
          Share your moment +100 BC
        </h3>
      </div>

      {/* Story preview */}
      <div className="bg-background/80 rounded-lg p-3 mb-3 border border-border/30">
        <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
          {storyCaption.substring(0, 200)}...
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handleShareInstagram}
          size="sm"
          className="h-9 text-xs font-bold gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <Instagram className="w-3.5 h-3.5" />
          Instagram Story
        </Button>
        <Button
          onClick={handleCopyCaption}
          variant="outline"
          size="sm"
          className="h-9 text-xs font-bold gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy Caption
            </>
          )}
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center mt-2">
        📸 Post with your wristband to earn +100 BC
      </p>
    </motion.div>
  );
}
