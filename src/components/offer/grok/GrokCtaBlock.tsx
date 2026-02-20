import { motion } from "framer-motion";
import { Crown, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import OfferTimer from "@/components/offer/OfferTimer";
import RiskReversalGuarantee from "@/components/offer/RiskReversalGuarantee";
import { useUtmCta } from "@/hooks/useUtmCta";

interface GrokCtaBlockProps {
  onCheckout: () => void;
  delay?: number;
  showScarcity?: boolean;
  loading?: boolean;
}

const GrokCtaBlock = ({
  onCheckout,
  delay = 0,
  showScarcity = false,
  loading = false,
}: GrokCtaBlockProps) => {
  const utmCta = useUtmCta();

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {showScarcity && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-3 text-center">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider font-mono">
            ⚡ 99 custom units remaining — protocol window closing
          </p>
        </div>
      )}

      <OfferTimer />
      <div className="h-3" />

      {/* Price anchor — ROI framing */}
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground line-through font-mono">$333</span>
          <span className="text-3xl font-black text-foreground font-mono">$111</span>
          <span className="text-sm text-muted-foreground">one-time</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          $111 ÷ 365 = $0.30/day · ROI: 27× happiness multiplier
        </p>
        <p className="text-xs text-muted-foreground">
          Free US Shipping · International Flat Rate
        </p>
      </div>

      <Button
        onClick={onCheckout}
        disabled={loading}
        className="w-full min-h-[64px] h-auto py-3 px-4 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground btn-glow animate-pulse-glow transition-all duration-300 rounded-xl disabled:opacity-70 disabled:animate-none text-center leading-tight"
      >
        {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Crown className="w-5 h-5 mr-2" />}
        {loading ? "Creating checkout…" : utmCta.primary}
        {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-3 font-mono">
        {utmCta.sub}
      </p>

      <div className="mt-4">
        <RiskReversalGuarantee />
      </div>
    </motion.div>
  );
};

export default GrokCtaBlock;
