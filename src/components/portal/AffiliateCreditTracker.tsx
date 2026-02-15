import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Gift, Trophy, Lock, Unlock, TrendingUp, Star, Crown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { toast } from "sonner";

interface Tier {
  id: string;
  name: string;
  wristbands: number;
  credit: number;
  icon: any;
  color: string;
  bgGradient: string;
}

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    wristbands: 0,
    credit: 3300,
    icon: Gift,
    color: "text-emerald-500",
    bgGradient: "from-emerald-500/10 to-emerald-600/5",
  },
  {
    id: "silver",
    name: "Silver Ambassador",
    wristbands: 25,
    credit: 8250,
    icon: Star,
    color: "text-slate-400",
    bgGradient: "from-slate-400/10 to-slate-500/5",
  },
  {
    id: "gold",
    name: "Gold Ambassador",
    wristbands: 100,
    credit: 33000,
    icon: Trophy,
    color: "text-amber-500",
    bgGradient: "from-amber-500/10 to-amber-600/5",
  },
  {
    id: "diamond",
    name: "Diamond Ambassador",
    wristbands: 1000,
    credit: 330000,
    icon: Crown,
    color: "text-purple-500",
    bgGradient: "from-purple-500/10 to-purple-600/5",
  },
];

interface AffiliateCreditTrackerProps {
  referralCode?: string;
  userId?: string;
  userEmail?: string;
  displayName?: string;
}

export default function AffiliateCreditTracker({ referralCode, userId, userEmail, displayName }: AffiliateCreditTrackerProps) {
  const [wristbandCount, setWristbandCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const prevTierRef = useRef<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!referralCode) { setLoading(false); return; }
    const fetchData = async () => {
      const { data } = await supabase.rpc("get_affiliate_wristband_count", {
        p_referral_code: referralCode,
      });
      setWristbandCount((data as number) ?? 0);
      setLoading(false);
    };
    fetchData();
  }, [referralCode]);

  // Detect tier changes and celebrate
  useEffect(() => {
    const currentTierIdx = TIERS.reduce(
      (acc, tier, i) => (wristbandCount >= tier.wristbands ? i : acc), 0
    );
    const currentTier = TIERS[currentTierIdx];
    const savedTier = localStorage.getItem("affiliate-last-tier");

    if (savedTier && savedTier !== currentTier.id && currentTierIdx > 0) {
      // Tier upgraded! Fire celebration
      const tierColors: Record<string, string[]> = {
        silver: ["#94a3b8", "#cbd5e1", "#64748b"],
        gold: ["#f59e0b", "#fbbf24", "#d97706"],
        diamond: ["#a855f7", "#7c3aed", "#c084fc", "#f59e0b"],
      };
      const colors = tierColors[currentTier.id] || ["#f59e0b"];
      
      confetti({
        particleCount: currentTier.id === "diamond" ? 150 : currentTier.id === "gold" ? 100 : 60,
        spread: 80,
        origin: { y: 0.6 },
        colors,
      });

      toast.success(`🎉 ${currentTier.name} Unlocked!`, {
        description: `You've earned $${currentTier.credit.toLocaleString()} in marketing credit!`,
        duration: 6000,
      });

      // Send milestone email notification
      if (userEmail) {
        supabase.functions.invoke("send-tier-milestone-email", {
          body: {
            email: userEmail,
            name: displayName || undefined,
            tier: currentTier.id,
            credit: currentTier.credit,
            wristbands: currentTier.wristbands,
          },
        }).then(({ error }) => {
          if (error) console.error("Tier email failed:", error);
          else console.log("Tier milestone email sent for:", currentTier.id);
        });
      }
    }

    localStorage.setItem("affiliate-last-tier", currentTier.id);
    prevTierRef.current = currentTier.id;
  }, [wristbandCount]);

  // Determine current tier and next tier
  const currentTierIdx = TIERS.reduce(
    (acc, tier, i) => (wristbandCount >= tier.wristbands ? i : acc),
    0
  );
  const currentTier = TIERS[currentTierIdx];
  const nextTier = TIERS[currentTierIdx + 1];

  const progressToNext = nextTier
    ? Math.min(
        100,
        ((wristbandCount - currentTier.wristbands) /
          (nextTier.wristbands - currentTier.wristbands)) *
          100
      )
    : 100;

  const wristbandsToNext = nextTier
    ? nextTier.wristbands - wristbandCount
    : 0;

  return (
    <div className="space-y-4">
      {/* Current credit display */}
      <motion.div
        className={`bg-gradient-to-r ${currentTier.bgGradient} border border-border/40 rounded-2xl p-5`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl bg-background flex items-center justify-center ${currentTier.color}`}>
            <currentTier.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Your Credit Level
            </p>
            <h3 className="text-lg font-black text-foreground">{currentTier.name}</h3>
          </div>
          <Badge className={`ml-auto ${currentTier.color} bg-background border-border/40 text-xs font-bold`}>
            ${currentTier.credit.toLocaleString()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-background/60 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-foreground">{loading ? "…" : wristbandCount}</p>
            <p className="text-[10px] text-muted-foreground">Wristbands Distributed</p>
          </div>
          <div className="bg-background/60 rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-primary">
              ${currentTier.credit.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">Marketing Credit</p>
          </div>
        </div>

        {nextTier && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Progress to <strong className="text-foreground">{nextTier.name}</strong>
              </span>
              <span className="text-primary font-bold">
                {wristbandsToNext} more to unlock
              </span>
            </div>
            <Progress value={progressToNext} className="h-3 bg-background/60" />
            <p className="text-[10px] text-muted-foreground text-center">
              {wristbandCount} / {nextTier.wristbands} wristbands → unlocks{" "}
              <strong className="text-primary">${nextTier.credit.toLocaleString()} credit</strong>
            </p>
          </div>
        )}
      </motion.div>

      {/* Tier ladder */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TIERS.map((tier, i) => {
          const isUnlocked = wristbandCount >= tier.wristbands;
          const isCurrent = i === currentTierIdx;
          return (
            <motion.div
              key={tier.id}
              className={`relative border rounded-xl p-3 text-center transition-all ${
                isCurrent
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : isUnlocked
                  ? "border-border/40 bg-card"
                  : "border-border/20 bg-muted/30 opacity-60"
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
            >
              {isCurrent && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] px-2 py-0">
                  CURRENT
                </Badge>
              )}
              <div className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                isUnlocked ? tier.color + " bg-background" : "text-muted-foreground bg-muted"
              }`}>
                {isUnlocked ? (
                  <tier.icon className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>
              <p className="text-[10px] font-bold text-foreground leading-tight">{tier.name}</p>
              <p className="text-[9px] text-muted-foreground">{tier.wristbands} wristbands</p>
              <p className={`text-xs font-black mt-0.5 ${isUnlocked ? "text-primary" : "text-muted-foreground"}`}>
                ${tier.credit.toLocaleString()}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Next unlock teaser */}
      {nextTier && (
        <div className="bg-card border border-border/40 rounded-xl p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 ${nextTier.color}`}>
            <Unlock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">
              Unlock {nextTier.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Distribute {wristbandsToNext} more wristbands to unlock{" "}
              <strong className="text-primary">${nextTier.credit.toLocaleString()}</strong> credit
              {nextTier.id === "gold" && " + higher commission rates"}
              {nextTier.id === "diamond" && " + Diamond Ambassador badge + exclusive tools"}
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-primary shrink-0" />
        </div>
      )}

      {/* Diamond Ambassador link */}
      <Button
        variant="outline"
        onClick={() => navigate("/diamond-ambassador")}
        className="w-full gap-2 border-border/40 text-muted-foreground hover:text-foreground"
      >
        <Crown className="w-4 h-4" /> View Diamond Ambassador Perks
      </Button>
    </div>
  );
}
