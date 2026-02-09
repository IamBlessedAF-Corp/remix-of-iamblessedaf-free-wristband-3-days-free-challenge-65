import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

/**
 * Viral Share Nudge — footer-level component encouraging UGC sharing.
 * Placed above the page footer on all offer & confirm pages.
 * Tracks shares for the Achievement system.
 */
const ViralShareNudge = () => {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.origin;
  const shareText = "I just started my gratitude journey with #IamBlessedAF — feeling 27× happier already! 🙏✨";
  const hashtag = "#IamBlessedAF";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${hashtag} ${shareUrl}`);
      setCopied(true);
      toast.success("Copied to clipboard! 📋");

      // Track share for achievements
      const count = parseInt(localStorage.getItem("achievements-shares") || "0", 10) + 1;
      localStorage.setItem("achievements-shares", JSON.stringify(count));

      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Couldn't copy — try manually!");
    }
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&hashtags=IamBlessedAF&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    trackShare();
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "IamBlessedAF", text: shareText, url: shareUrl });
        trackShare();
      } catch {}
    }
  };

  const trackShare = () => {
    const count = parseInt(localStorage.getItem("achievements-shares") || "0", 10) + 1;
    localStorage.setItem("achievements-shares", JSON.stringify(count));
  };

  return (
    <motion.div
      className="mt-10 mb-6 border border-border/50 rounded-2xl p-5 bg-card shadow-soft text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <p className="text-sm font-bold text-foreground mb-1">
        Share your journey with {hashtag}
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        Tag us for a feature & bonus hearts! 💛
      </p>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        {/* X/Twitter */}
        <button
          onClick={handleShareTwitter}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </button>

        {/* Native Share (mobile) */}
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            onClick={handleShareNative}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-foreground text-xs font-bold hover:bg-muted transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        )}

        {/* Copy Hashtag */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-foreground text-xs font-bold hover:bg-muted transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : `Copy ${hashtag}`}
        </button>
      </div>
    </motion.div>
  );
};

export default ViralShareNudge;
