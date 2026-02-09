import { useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Zap, Trophy, Share2, Target, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import logoImg from "@/assets/logo.png";

const PERKS = [
  { icon: Trophy, label: "Global Leaderboard", desc: "See your rank & compete with top ambassadors" },
  { icon: Target, label: "Daily Missions", desc: "Earn up to 90 BC/day completing challenges" },
  { icon: Share2, label: "Referral Hub", desc: "Track your blessings & conversion analytics" },
  { icon: ShoppingBag, label: "Rewards Store", desc: "Redeem BC for exclusive merch & perks" },
];

export default function PortalUnlockStep() {
  const navigate = useNavigate();

  useEffect(() => {
    // Initial burst
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    // Side cannons after a short delay
    const timer = setTimeout(() => {
      confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="space-y-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Celebration header */}
      <div className="space-y-4">
        <motion.div
          className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <Crown className="w-10 h-10 text-primary" />
        </motion.div>

        <motion.h2
          className="text-2xl sm:text-3xl font-bold text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          You've Unlocked Your
          <br />
          <span className="text-primary">Ambassador Portal</span> 🏛️
        </motion.h2>

        <motion.p
          className="text-muted-foreground text-sm max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Track your impact, climb the leaderboard, earn Blessed Coins, and unlock exclusive rewards.
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-2 text-xs font-bold text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Zap className="w-4 h-4" />
          +2,000 XP for entering the Portal
        </motion.div>
      </div>

      {/* Perks grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {PERKS.map((perk, i) => (
          <motion.div
            key={perk.label}
            className="flex items-start gap-3 bg-card border border-border/60 rounded-xl p-4"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <perk.icon className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{perk.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{perk.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          onClick={() => navigate("/portal")}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base rounded-xl btn-glow gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Enter Your Portal
          <ArrowRight className="w-5 h-5" />
        </Button>

        <p className="text-[11px] text-muted-foreground">
          Free forever · No credit card required · Earn rewards daily
        </p>
      </motion.div>

      {/* Logo */}
      <img src={logoImg} alt="Logo" className="h-8 mx-auto opacity-40" />
    </motion.div>
  );
}
