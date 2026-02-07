import { motion } from "framer-motion";
import { Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import OfferTimer from "@/components/offer/OfferTimer";

interface GrokCtaBlockProps {
  onCheckout: () => void;
  delay?: number;
  showScarcity?: boolean;
}

const GrokCtaBlock = ({
  onCheckout,
  delay = 0,
  showScarcity = false,
}: GrokCtaBlockProps) => {
  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {showScarcity && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-3 text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            ⚡ Limited to the first 99 custom shirts
          </p>
        </div>
      )}

      <OfferTimer />
      <div className="h-3" />

      <Button
        onClick={onCheckout}
        className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl"
      >
        <Crown className="w-5 h-5 mr-2" />
        YES! Feed 11 People & Claim My $111 Pack Now!
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-3">
        One-time secure payment · Instant access + custom message guide
      </p>
    </motion.div>
  );
};

export default GrokCtaBlock;
