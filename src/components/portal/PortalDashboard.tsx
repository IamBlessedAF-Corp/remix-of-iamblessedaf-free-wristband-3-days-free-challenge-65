import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Heart, Flame, Users, Utensils, Gift, Trophy, Zap } from "lucide-react";
import UserLinkStats from "./UserLinkStats";
import PortalQuickActions from "./PortalQuickActions";
import PortalEarnOverview from "./PortalEarnOverview";
import PortalSocialShare from "./PortalSocialShare";
import GlobalMealCounter from "@/components/GlobalMealCounter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { PortalProfile, PortalWallet, BlessingRow } from "@/hooks/usePortalData";
import { getTier, TIERS } from "@/hooks/usePortalData";

interface Props {
  profile: PortalProfile;
  wallet: PortalWallet | null;
  blessings: BlessingRow[];
  userId: string;
  onClaimDaily: () => Promise<any>;
}

/** Animated counter */
const Counter = ({ value, prefix = "" }: { value: number; prefix?: string }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const from = display;
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(from + (value - from) * t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span>{prefix}{display.toLocaleString()}</span>;
};

const StatCard = ({ icon: Icon, label, value, prefix, accent }: {
  icon: any; label: string; value: number; prefix?: string; accent: string;
}) => (
  <motion.div
    className="bg-card border border-border/60 rounded-xl p-4 space-y-1"
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-2xl font-bold text-foreground">
      <Counter value={value} prefix={prefix} />
    </p>
  </motion.div>
);

export default function PortalDashboard({ profile, wallet, blessings, userId, onClaimDaily }: Props) {
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [dailyBonus, setDailyBonus] = useState<number | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);

  const balance = wallet?.balance ?? 0;
  const lifetime = wallet?.lifetime_earned ?? 0;
  const streak = wallet?.streak_days ?? 0;
  const tier = getTier(lifetime);
  const confirmed = blessings.filter((b) => b.confirmed_at).length;

  useEffect(() => {
    if (wallet?.last_login_bonus_at) {
      const today = new Date().toISOString().split("T")[0];
      setDailyClaimed(wallet.last_login_bonus_at === today);
    }
  }, [wallet]);

  const handleClaim = async () => {
    setClaiming(true);
    const result = await onClaimDaily();
    if (result) {
      if (result.already_claimed) {
        setDailyClaimed(true);
      } else {
        setDailyBonus(result.bonus);
        setDailyClaimed(true);
        setTimeout(() => setDailyBonus(null), 3000);
      }
    }
    setClaiming(false);
  };

  return (
    <div className="space-y-6">
      {/* Welcome + Daily Login */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Welcome back, {profile.display_name || profile.email.split("@")[0]} {tier.current.emoji}
          </h2>
          <p className="text-sm text-muted-foreground">
            {tier.current.name} Ambassador · {streak > 0 ? `🔥 ${streak}-day streak` : "Start your streak!"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!dailyClaimed ? (
            <motion.div key="claim" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <Button
                onClick={handleClaim}
                disabled={claiming}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 h-11 rounded-xl btn-glow"
              >
                <Gift className="w-4 h-4 mr-2" />
                {claiming ? "Claiming..." : `Claim Daily Bonus (+${Math.min((streak + 1) * 5 + 5, 50)} BC)`}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="claimed"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-primary/10 text-primary border border-primary/20 font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              ✅ Daily bonus claimed{dailyBonus ? ` (+${dailyBonus} BC)` : ""}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Coins} label="BC Balance" value={balance} accent="bg-primary/10 text-primary" />
        <StatCard icon={Heart} label="Hearts" value={lifetime} accent="bg-accent text-accent-foreground" />
        <StatCard icon={Flame} label="Streak" value={streak} accent="bg-primary/10 text-primary" />
        <StatCard icon={Users} label="Confirmed" value={confirmed} accent="bg-secondary text-secondary-foreground" />
        <StatCard icon={Utensils} label="Meals" value={profile.blessings_confirmed * 11} accent="bg-secondary text-secondary-foreground" />
        <StatCard icon={Trophy} label="Rank" value={0} prefix="#" accent="bg-primary/10 text-primary" />
      </div>
      {/* 🍽️ Global Meal Counter — MrBeast-style */}
      <GlobalMealCounter variant="banner" />

      {/* 🔥 AGGRESSIVE: Quick Actions — FREE earning opportunities */}
      <PortalQuickActions
        referralCode={profile.referral_code}
        onOpenSocial={() => setSocialOpen(true)}
      />

      {/* Tier Progress */}
      <div className="bg-card border border-border/60 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Ambassador Tier
          </h3>
          <span className="text-xs text-muted-foreground">
            {lifetime.toLocaleString()} / {tier.next ? tier.next.minBC.toLocaleString() : "MAX"} BC
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          {TIERS.map((t, i) => (
            <div key={t.name} className="flex flex-col items-center gap-1">
              <span className={`text-lg ${i <= tier.index ? "" : "grayscale opacity-40"}`}>
                {t.emoji}
              </span>
              <span className={`text-[10px] font-semibold ${i <= tier.index ? "text-foreground" : "text-muted-foreground/50"}`}>
                {t.name}
              </span>
            </div>
          ))}
        </div>

        <Progress value={tier.progress} className="h-2.5" />

        {tier.next && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Zap className="w-3 h-3 text-primary" />
            Earn {(tier.next.minBC - lifetime).toLocaleString()} more BC to reach {tier.next.emoji} {tier.next.name}
          </p>
        )}
      </div>

      {/* All ways to earn BC */}
      <PortalEarnOverview />

      {/* Recent Blessings */}
      <div className="bg-card border border-border/60 rounded-xl p-5">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">
          Recent Blessings
        </h3>
        {blessings.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No blessings yet — share your link to start! 🚀
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {blessings.slice(0, 10).map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${b.confirmed_at ? "bg-primary" : "bg-muted-foreground/30"}`} />
                  <span className="text-sm text-foreground">{b.recipient_name || "Anonymous"}</span>
                </div>
                <span className={`text-xs font-medium ${b.confirmed_at ? "text-primary" : "text-muted-foreground"}`}>
                  {b.confirmed_at ? "✅ Confirmed" : "⏳ Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link Analytics */}
      <UserLinkStats userId={userId} />

      {/* Social Share Fullscreen Overlay */}
      <PortalSocialShare
        referralCode={profile.referral_code}
        displayName={profile.display_name}
        open={socialOpen}
        onClose={() => setSocialOpen(false)}
      />
    </div>
  );
}
