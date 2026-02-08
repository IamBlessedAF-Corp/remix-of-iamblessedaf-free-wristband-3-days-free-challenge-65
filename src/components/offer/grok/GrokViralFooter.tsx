import { motion } from "framer-motion";
import { Share2, MessageCircle } from "lucide-react";

interface GrokViralFooterProps {
  delay?: number;
  onSkip?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const GrokViralFooter = ({ delay = 0, onSkip }: GrokViralFooterProps) => {
  return (
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
        <p className="text-sm text-muted-foreground mb-1">
          Someone you're grateful for gets a <span className="font-bold text-primary">FREE 'I Am Blessed AF' Wristband</span> — 
          just <span className="font-bold text-foreground">$9.95 shipping</span>.
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Or upgrade: all 3 colors for <span className="font-bold text-foreground">$22 with FREE shipping</span> 🇺🇸
        </p>
        <div className="flex items-center justify-center gap-3">
          <button className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full hover:bg-primary/20 transition-colors">
            <MessageCircle className="w-3.5 h-3.5" />
            Send FREE Gift via SMS
          </button>
          <button className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full hover:bg-primary/20 transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            Share Gift Link
          </button>
        </div>
      </div>

      <a
        href="/challenge/thanks"
        onClick={onSkip}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Maybe later? → (We'll send a reminder email)
      </a>
    </motion.div>
  );
};

export default GrokViralFooter;
