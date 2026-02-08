import { motion } from "framer-motion";
import { Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import OfferTimer from "@/components/offer/OfferTimer";
import RiskReversalGuarantee from "@/components/offer/RiskReversalGuarantee";
import UrgencyBanner from "@/components/offer/UrgencyBanner";

interface Grok1111CtaBlockProps {
  onCheckout: () => void;
  delay?: number;
  showScarcity?: boolean;
}

const Grok1111CtaBlock = ({
  onCheckout,
  delay = 0,
  showScarcity = false,
}: Grok1111CtaBlockProps) => {
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
            ⚡ Only 11 Kingdom Ambassador Packs available — 11,111 meals waiting to be donated
          </p>
        </div>
      )}

      <OfferTimer />
      <UrgencyBanner variant="shirts" />
      <UrgencyBanner variant="wristbands" />
      <div className="h-3" />

      {/* Price anchor */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground line-through">$2,222</span>
          <span className="text-3xl font-black text-foreground">$1,111</span>
          <span className="text-sm text-muted-foreground">one-time</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Free US Shipping · International $14.95 Flat
        </p>
      </div>

      <Button
        onClick={onCheckout}
        className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl"
      >
        <Crown className="w-5 h-5 mr-2" />
        YES! Feed 11,111 People & Become a Kingdom Ambassador!
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-3">
        One-time secure payment · No subscriptions · Ships within 7–14 days
      </p>

      <div className="mt-4">
        <RiskReversalGuarantee />
      </div>
    </motion.div>
  );
};

export default Grok1111CtaBlock;
