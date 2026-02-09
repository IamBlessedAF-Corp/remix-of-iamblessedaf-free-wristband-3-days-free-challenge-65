import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import PortalUnlockStep from "@/components/offer/PortalUnlockStep";
import { useGamificationStats, type OfferTier, TIER_REWARDS } from "@/hooks/useGamificationStats";
import MysteryBox from "@/components/offer/MysteryBox";
import AchievementUnlockToast from "@/components/gamification/AchievementUnlockToast";
import { useAchievements } from "@/hooks/useAchievements";

const VALID_TIERS = Object.keys(TIER_REWARDS) as OfferTier[];

const OfferSuccess = () => {
  const [searchParams] = useSearchParams();
  const tier = searchParams.get("tier") as OfferTier | null;
  const { rewardCheckout } = useGamificationStats();
  const { newlyUnlocked, dismissNewlyUnlocked, recordPurchase } = useAchievements();
  const rewarded = useRef(false);
  const [showMystery, setShowMystery] = useState(false);

  useEffect(() => {
    if (tier && VALID_TIERS.includes(tier) && !rewarded.current) {
      rewarded.current = true;
      rewardCheckout(tier);
      recordPurchase(tier);
      // Show mystery box after a short delay
      setTimeout(() => setShowMystery(true), 2000);
    }
  }, [tier, rewardCheckout, recordPurchase]);

  return (
    <div className="min-h-screen bg-background">
      <GamificationHeader />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto">
          <PortalUnlockStep />
        </div>
      </div>
      <MysteryBox show={showMystery} onClose={() => setShowMystery(false)} />
      <AchievementUnlockToast achievement={newlyUnlocked} onDismiss={dismissNewlyUnlocked} />
    </div>
  );
};

export default OfferSuccess;
