import { motion } from "framer-motion";
import { Crown, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import OfferTimer from "@/components/offer/OfferTimer";
import RiskReversalGuarantee from "@/components/offer/RiskReversalGuarantee";
import UrgencyBanner from "@/components/offer/UrgencyBanner";

interface Grok4444CtaBlockProps {
  onCheckout: () => void;
  delay?: number;
  showScarcity?: boolean;
  loading?: boolean;
}

const Grok4444CtaBlock = ({
  onCheckout,
  delay = 0,
  showScarcity = false,
  loading = false,
}: Grok4444CtaBlockProps) => {
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
            ⚡ Only 4 Patron Packs available — each funds an artist + 44,444 meals
          </p>
        </div>
      )}

      <OfferTimer />
      <UrgencyBanner variant="shirts" />
      <UrgencyBanner variant="wristbands" />
      <div className="h-3" />

      {/* Price anchor */}
      <div className="text-center mb-3" data-price-anchor>
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground line-through">$8,888</span>
          <span className="text-3xl font-black text-foreground">$4,444</span>
          <span className="text-sm text-muted-foreground">one-time</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Free Worldwide Shipping · 77% goes directly to your chosen artist
        </p>
      </div>

      <Button
        onClick={onCheckout}
        disabled={loading}
        className="w-full min-h-[64px] h-auto py-3 px-4 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl disabled:opacity-70 disabled:animate-none text-center leading-tight"
      >
        {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Crown className="w-5 h-5 mr-2" />}
        {loading ? "Creating checkout…" : "YES! Fund an Artist & Own My Legacy Pieces!"}
        {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-3">
        One-time secure payment · Artist receives 77% within 48hrs · NFTs minted within 14 days
      </p>

      <div className="mt-4">
        <RiskReversalGuarantee />
      </div>
    </motion.div>
  );
};

export default Grok4444CtaBlock;
