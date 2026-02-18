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
import SpinWheel from "@/components/challenge/SpinWheel";
import { useSpinLogic } from "@/hooks/useSpinLogic";

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
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const isWristband22 = tier === "wristband-22";
  
  // Get friend name from localStorage (preloaded from gratitude challenge)
  const friendName = typeof window !== "undefined" 
    ? JSON.parse(localStorage.getItem("gratitude_challenge_setup") || "{}")?.friend_1_name || ""
    : "";
  
  const spinLogic = useSpinLogic(isWristband22 ? 2 : 1, friendName);


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
      if (isWristband22) {
        // Skip mystery box and spinner — go straight to next upsell
        setTimeout(() => proceedAfterMystery(), 1500);
      } else {
        setTimeout(() => setShowMystery(true), 2000);
      }
    }
  }, [tier, rewardCheckout, recordPurchase]);

  const handleMysteryClose = () => {
    setShowMystery(false);

    if (isWristband22 && !spinLogic.alreadyClaimed) {
      setShowSpinWheel(true);
      return;
    }

    proceedAfterMystery();
  };

  const proceedAfterMystery = () => {
    const nextUrl = tier ? NEXT_UPSELL[tier] : undefined;
    // Skip share prompt — keep users in funnel
    if (nextUrl) {
      navigate(nextUrl);
    } else {
      navigate("/portal");
    }
  };

  const handleSpinWheelClose = () => {
    // Only close if all spins used
    if (spinLogic.allSpinsUsed) {
      setShowSpinWheel(false);
      proceedAfterMystery();
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
          {isWristband22 && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mt-4">
              <p className="text-sm font-semibold text-primary">
                🎰 Because you gave Neuro-Hacker Wristbands to 2 of your friends, you earned a bonus spin!
              </p>
            </div>
          )}
        </div>
      </div>
      <MysteryBox show={showMystery} onClose={handleMysteryClose} />
      {showSpinWheel && (
        <SpinWheel
          segments={spinLogic.segments}
          isSpinning={spinLogic.isSpinning}
          hasWon={spinLogic.hasWon}
          showWheel={showSpinWheel}
          rotation={spinLogic.rotation}
          onSpin={spinLogic.spin}
          onClose={handleSpinWheelClose}
          spinsRemaining={spinLogic.spinsRemaining}
          spinCount={spinLogic.spinCount}
          maxSpins={spinLogic.maxSpins}
          allSpinsUsed={spinLogic.allSpinsUsed}
        />
      )}
      {/* Share prompt removed — keep users in funnel */}
      <AchievementUnlockToast achievement={newlyUnlocked} onDismiss={dismissNewlyUnlocked} />
    </div>
  );
};

export default OfferSuccess;
