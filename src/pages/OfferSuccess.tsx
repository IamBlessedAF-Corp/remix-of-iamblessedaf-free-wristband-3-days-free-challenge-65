import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import GamificationHeader from "@/components/funnel/GamificationHeader";
import PortalUnlockStep from "@/components/offer/PortalUnlockStep";
import { useGamificationStats, type OfferTier, TIER_REWARDS } from "@/hooks/useGamificationStats";
import MysteryBox from "@/components/offer/MysteryBox";
import AchievementUnlockToast from "@/components/gamification/AchievementUnlockToast";
import { useAchievements } from "@/hooks/useAchievements";
import PostPurchaseSharePrompt from "@/components/viral/PostPurchaseSharePrompt";
import { supabase } from "@/integrations/supabase/client";

const VALID_TIERS = Object.keys(TIER_REWARDS) as OfferTier[];

const TIER_LABELS: Record<string, string> = {
  "free-wristband": "FREE Wristband",
  "wristband-22": "Wristband Pack",
  "pack-111": "Gratitude Pack",
  "pack-444": "Habit Pack",
  "pack-1111": "Kingdom Ambassador",
  "pack-4444": "Artist Fund",
  "monthly-11": "Monthly Gratitude",
};

const NEXT_UPSELL: Record<string, string> = {
  "free-wristband": "/offer/111",
  "wristband-22": "/offer/111",
  "pack-111": "/offer/444",
  "pack-444": "/offer/1111",
  "pack-1111": "/offer/4444",
  "pack-4444": "",
  "monthly-11": "/offer/111",
};

const OfferSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tier = searchParams.get("tier") as OfferTier | null;
  const { rewardCheckout } = useGamificationStats();
  const { newlyUnlocked, dismissNewlyUnlocked, recordPurchase } = useAchievements();
  const rewarded = useRef(false);
  const [showMystery, setShowMystery] = useState(false);
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [referralUrl, setReferralUrl] = useState("");
  const pendingNextUrl = useRef<string | undefined>(undefined);

  // Fetch user's referral URL
  useEffect(() => {
    const fetchRef = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("creator_profiles")
            .select("referral_code")
            .eq("user_id", user.id)
            .maybeSingle();
          if (data?.referral_code) {
            setReferralUrl(`https://iamblessedaf.com/r/${data.referral_code}`);
          }
        }
      } catch {}
    };
    fetchRef();
  }, []);

  useEffect(() => {
    if (tier && VALID_TIERS.includes(tier) && !rewarded.current) {
      rewarded.current = true;
      rewardCheckout(tier);
      recordPurchase(tier);
      setTimeout(() => setShowMystery(true), 2000);
    }
  }, [tier, rewardCheckout, recordPurchase]);

  const handleMysteryClose = () => {
    setShowMystery(false);
    const nextUrl = tier ? NEXT_UPSELL[tier] : undefined;
    pendingNextUrl.current = nextUrl;

    // Show share prompt if user has a referral URL
    if (referralUrl) {
      setShowSharePrompt(true);
    } else {
      // No referral URL → proceed immediately
      if (nextUrl) {
        navigate(nextUrl);
      } else {
        navigate("/portal");
      }
    }
  };

  const handleShareDismiss = () => {
    setShowSharePrompt(false);
    const nextUrl = pendingNextUrl.current;
    if (nextUrl) {
      navigate(nextUrl);
    } else {
      navigate("/portal");
    }
  };

  if (showPortal) {
    return (
      <div className="min-h-screen bg-background">
        <GamificationHeader />
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-2xl mx-auto">
            <PortalUnlockStep />
          </div>
        </div>
        <AchievementUnlockToast achievement={newlyUnlocked} onDismiss={dismissNewlyUnlocked} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GamificationHeader />
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="text-6xl animate-bounce">🎉</div>
          <h1 className="text-3xl font-bold text-foreground">Payment Confirmed!</h1>
          <p className="text-muted-foreground">Your order is being processed. Open your mystery reward!</p>
        </div>
      </div>
      <MysteryBox show={showMystery} onClose={handleMysteryClose} />
      {showSharePrompt && (
        <PostPurchaseSharePrompt
          referralUrl={referralUrl}
          tierName={tier ? TIER_LABELS[tier] || tier : "purchase"}
          onDismiss={handleShareDismiss}
        />
      )}
      <AchievementUnlockToast achievement={newlyUnlocked} onDismiss={dismissNewlyUnlocked} />
    </div>
  );
};

export default OfferSuccess;
