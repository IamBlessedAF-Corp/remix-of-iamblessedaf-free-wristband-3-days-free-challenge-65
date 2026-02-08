import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import OfferTimer from "@/components/offer/OfferTimer";
import RiskReversalGuarantee from "@/components/offer/RiskReversalGuarantee";

interface GptCtaBlockProps {
  onCheckout: () => void;
  delay?: number;
  showScarcity?: boolean;
}

const GptCtaBlock = ({
  onCheckout,
  delay = 0,
  showScarcity = false,
}: GptCtaBlockProps) => {
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
            💌 Only 99 custom shirts available — make yours before they're gone
          </p>
        </div>
      )}

      <OfferTimer />
      <div className="h-3" />

      {/* Price anchor — warm framing */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground line-through">$333</span>
          <span className="text-3xl font-black text-foreground">$111</span>
          <span className="text-sm text-muted-foreground">one-time</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          That's less than a dinner out — but the feeling lasts all year
        </p>
        <p className="text-xs text-muted-foreground">
          Free US Shipping · International $14.95 Flat
        </p>
      </div>

      <Button
        onClick={onCheckout}
        className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl"
      >
        <Heart className="w-5 h-5 mr-2" />
        YES! Send Love to My Best Friend 💌
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-3">
        One beautiful act of gratitude · Secure payment · Instant access
      </p>

      <div className="mt-4">
        <RiskReversalGuarantee />
      </div>
    </motion.div>
  );
};

export default GptCtaBlock;
