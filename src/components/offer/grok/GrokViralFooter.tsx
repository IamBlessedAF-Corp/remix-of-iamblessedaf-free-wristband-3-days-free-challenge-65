import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share2, MessageCircle, Loader2, Check, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGamificationStats } from "@/hooks/useGamificationStats";
import { useShortLinks } from "@/hooks/useShortLinks";
import GiftSmsDialog from "@/components/offer/GiftSmsDialog";

interface GrokViralFooterProps {
  delay?: number;
  onSkip?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  skipUrl?: string;
}

const GrokViralFooter = ({ delay = 0, onSkip, skipUrl = "/challenge/thanks" }: GrokViralFooterProps) => {
  const { rewardShare } = useGamificationStats();
  const { getShareUrl } = useShortLinks();
  const [smsOpen, setSmsOpen] = useState(false);
  const [shortUrl, setShortUrl] = useState("https://iamblessedaf.com/offer/111/grok");

  useEffect(() => {
    getShareUrl(
      "https://iamblessedaf.com/offer/111/grok",
      "grok-viral-footer",
      "/offer/111/grok"
    ).then(setShortUrl);
  }, [getShareUrl]);

  const handleShareLink = async () => {
    const shareText = "🎁 I'm gifting you a FREE 'I Am Blessed AF' Wristband — just cover shipping!";

    if (navigator.share) {
      try {
        await navigator.share({ title: "Free Gift for You!", text: shareText, url: shortUrl });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(`${shareText} ${shortUrl}`);
      toast.success("Link copied! +5 BC 🪙");
      rewardShare("link");
    }
  };

  return (
    <>
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
      >
        <div className="bg-card border border-border/50 rounded-xl p-5 max-w-lg mx-auto shadow-soft mb-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Share2 className="w-4 h-4 text-primary" />
            <p className="text-sm font-bold text-foreground">
              🎁 Gift a FREE Wristband (Valued at $11)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Someone you're grateful for gets a <span className="font-bold text-primary">FREE 'I Am Blessed AF' Wristband</span> — 
            spread the gratitude 🙏
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setSmsOpen(true)}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full hover:bg-primary/20 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Send FREE Gift
            </button>
            <button
              onClick={handleShareLink}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full hover:bg-primary/20 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Gift Link
            </button>
          </div>
        </div>

        <a
          href={skipUrl}
          onClick={onSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Maybe later? → (We'll send a reminder email)
        </a>
      </motion.div>

      <GiftSmsDialog
        open={smsOpen}
        onOpenChange={setSmsOpen}
        shortUrl={shortUrl}
        sourcePage="/offer/111/grok"
        onSuccess={() => rewardShare("sms")}
      />
    </>
  );
};

export default GrokViralFooter;
