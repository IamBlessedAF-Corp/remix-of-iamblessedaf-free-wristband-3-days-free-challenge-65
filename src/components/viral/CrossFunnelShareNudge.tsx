import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordShare } from "./ShareMilestoneTracker";
import { toast } from "sonner";

/**
 * Cross-Funnel Share Nudge — contextual mini-prompt that slides in
 * on every offer page after 20s if the user hasn't shared yet today.
 * 
 * K-factor: Catches users who are deep in the funnel but haven't
 * shared yet. Uses FOMO (limited wristbands) + reciprocity (gift framing).
 */

const DISMISSED_KEY = "share-nudge-dismissed";

interface Props {
  referralUrl?: string;
}

export default function CrossFunnelShareNudge({ referralUrl }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed today
    const lastDismissed = localStorage.getItem(DISMISSED_KEY);
    if (lastDismissed) {
      const dismissedDate = new Date(lastDismissed).toDateString();
      if (dismissedDate === new Date().toDateString()) return;
    }

    // Show after 20s on page
    const timer = setTimeout(() => setVisible(true), 20000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
  };

  const handleShare = async () => {
    const url = referralUrl || "https://iamblessedaf.com/challenge";
    const text = `🎁 I'm gifting FREE "I Am Blessed AF" wristbands!\n\nClaim yours: ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "FREE Wristband Gift", text, url });
        recordShare();
        toast.success("Shared! +15 BC earned 🪙");
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      recordShare();
      toast.success("Link copied! +15 BC earned 🪙");
    }
    dismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto"
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25 }}
        >
          <div className="bg-card border border-primary/20 rounded-2xl shadow-xl p-4 relative">
            <button
              onClick={dismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">
                  Gift a FREE wristband 🎁
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Share with someone you're grateful for & earn BC coins
                </p>
                <Button
                  onClick={handleShare}
                  size="sm"
                  className="mt-2 h-8 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                >
                  Share Now
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
