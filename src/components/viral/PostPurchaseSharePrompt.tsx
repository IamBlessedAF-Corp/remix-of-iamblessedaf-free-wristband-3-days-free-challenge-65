import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Check, Gift, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { recordShare } from "./ShareMilestoneTracker";

/**
 * Post-Purchase Share Prompt — appears after mystery box on offer success.
 * 
 * Hormozi: "The best time to ask for a referral is when someone is happiest."
 * This catches users at peak dopamine (right after mystery box win) and channels
 * that emotion into a share action.
 * 
 * K-factor impact: Converts 100% of purchasers into potential referrers.
 */

interface Props {
  referralUrl: string;
  tierName: string;
  onDismiss: () => void;
}

export default function PostPurchaseSharePrompt({ referralUrl, tierName, onDismiss }: Props) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const shareText = `🙏 I just joined the gratitude movement and donated meals to families in need!\n\nGet your FREE "I Am Blessed AF" wristband too 👇\n${referralUrl}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    recordShare();
    toast.success("Link copied! Share it with someone you're grateful for 🙏");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "I Am Blessed AF — FREE Gratitude Wristband",
          text: shareText,
          url: referralUrl,
        });
        recordShare();
        setShared(true);
      } catch {}
    }
  };

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
    recordShare();
    setShared(true);
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
    recordShare();
    setShared(true);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onDismiss} />

      {/* Card */}
      <motion.div
        className="relative w-full max-w-md mx-4 bg-card border border-border/60 rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Close */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-secondary transition-colors z-10"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="bg-primary/5 border-b border-primary/10 p-5 text-center">
          <motion.div
            className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          >
            <Gift className="w-7 h-7 text-primary" />
          </motion.div>
          <h3 className="text-lg font-bold text-foreground">
            Share the Blessing 🙏
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Gift a <strong className="text-foreground">FREE wristband</strong> to someone you're grateful for
          </p>
        </div>

        {/* Share actions */}
        <div className="p-5 space-y-3">
          {/* Primary: Copy link */}
          <Button
            onClick={handleCopy}
            variant="outline"
            className="w-full h-12 text-sm font-bold gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-primary" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy My Gift Link
              </>
            )}
          </Button>

          {/* Platform row */}
          <div className="grid grid-cols-3 gap-2">
            {typeof navigator !== "undefined" && "share" in navigator && (
              <Button
                onClick={handleNativeShare}
                size="sm"
                className="h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </Button>
            )}
            <Button
              onClick={handleWhatsApp}
              size="sm"
              variant="outline"
              className="h-10 text-xs font-bold gap-1.5"
            >
              💬 WhatsApp
            </Button>
            <Button
              onClick={handleTwitterShare}
              size="sm"
              variant="outline"
              className="h-10 text-xs font-bold gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              X
            </Button>
          </div>

          {/* Reward hint */}
          <p className="text-[11px] text-center text-muted-foreground">
            🪙 Every share earns you <strong className="text-primary">BC coins</strong> toward milestone rewards
          </p>

          {/* Skip */}
          <button
            onClick={onDismiss}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Maybe later
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
