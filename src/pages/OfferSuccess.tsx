import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import PortalUnlockStep from "@/components/offer/PortalUnlockStep";
import { useGamificationStats, type OfferTier, TIER_REWARDS } from "@/hooks/useGamificationStats";

const VALID_TIERS = Object.keys(TIER_REWARDS) as OfferTier[];

const OfferSuccess = () => {
  const [searchParams] = useSearchParams();
  const tier = searchParams.get("tier") as OfferTier | null;
  const { rewardCheckout } = useGamificationStats();
  const rewarded = useRef(false);

  useEffect(() => {
    if (tier && VALID_TIERS.includes(tier) && !rewarded.current) {
      rewarded.current = true;
      rewardCheckout(tier);
    }
  }, [tier, rewardCheckout]);

  return (
    <div className="min-h-screen bg-background">
      <GamificationHeader />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          <PortalUnlockStep />
        </div>
      </div>
    </div>
  );
};

export default OfferSuccess;
