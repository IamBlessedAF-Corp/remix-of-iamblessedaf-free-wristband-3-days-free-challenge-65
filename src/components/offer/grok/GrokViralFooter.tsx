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
            Share & Earn Bonus Hearts
          </p>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Share your custom message with{" "}
          <span className="font-bold text-primary">#IamBlessedAF</span> — tag us for a feature & bonus hearts!
        </p>
        <div className="flex items-center justify-center gap-3">
          <button className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full hover:bg-primary/20 transition-colors">
            <MessageCircle className="w-3.5 h-3.5" />
            Share via SMS
          </button>
          <button className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full hover:bg-primary/20 transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            Share on Social
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
