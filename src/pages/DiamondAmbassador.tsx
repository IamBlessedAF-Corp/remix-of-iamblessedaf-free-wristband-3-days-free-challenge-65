import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crown, Lock, Star, TrendingUp, Gift, Users, Zap,
  BarChart3, Target, Shield, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { usePortalData } from "@/hooks/usePortalData";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import logoImg from "@/assets/logo.png";

const DIAMOND_PERKS = [
  { icon: TrendingUp, title: "50% Commission Rate", desc: "Highest tier commission on all referred sales" },
  { icon: Gift, title: "$330,000 Marketing Credit", desc: "Unlimited access to premium funnel tools" },
  { icon: Users, title: "Private Mastermind Access", desc: "Weekly calls with top ambassadors & Joe Da Vincy" },
  { icon: BarChart3, title: "Advanced Analytics", desc: "Deep funnel analytics, conversion tracking & heatmaps" },
  { icon: Target, title: "Priority Lead Routing", desc: "Your referral links get priority in the algorithm" },
  { icon: Shield, title: "White-Label Funnels", desc: "Fully branded funnels with your own domain" },
  { icon: Zap, title: "AI Content Assistant", desc: "Personalized AI that creates content in your voice" },
  { icon: Star, title: "Diamond Badge", desc: "Exclusive profile badge visible across the community" },
];

export default function DiamondAmbassador() {
  const { user, loading: authLoading } = useAuth();
  const portalData = usePortalData();
  const navigate = useNavigate();
  const [wristbandCount, setWristbandCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const referralCode = portalData.profile?.referral_code;
  const isUnlocked = wristbandCount >= 1000;
  const progress = Math.min(100, (wristbandCount / 1000) * 100);

  useEffect(() => {
    if (!referralCode) { setLoading(false); return; }
    const fetchCount = async () => {
      const { data } = await supabase.rpc("get_affiliate_wristband_count", {
        p_referral_code: referralCode,
      });
      setWristbandCount((data as number) ?? 0);
      setLoading(false);
    };
    fetchCount();
  }, [referralCode]);

  if (authLoading || portalData.loading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/affiliate-dashboard")} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Portal
          </Button>
          <img src={logoImg} alt="Logo" className="h-7" />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4 pt-12 pb-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center mx-auto mb-5">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <Badge className="mb-4 bg-purple-500/10 text-purple-500 border-purple-500/20 text-xs font-bold px-3 py-1">
              💎 EXCLUSIVE TIER
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight mb-3">
              Diamond Ambassador
            </h1>
            <p className="text-base text-muted-foreground max-w-lg mx-auto">
              The highest tier in our affiliate program. Unlock premium tools,
              50% commission, and $330,000 in marketing credit.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Progress / Lock Gate */}
      <section className="max-w-3xl mx-auto px-4 pb-8">
        <motion.div
          className={`border rounded-2xl p-6 ${
            isUnlocked
              ? "border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-amber-500/5"
              : "border-border/40 bg-card"
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-4">
            {isUnlocked ? (
              <Star className="w-6 h-6 text-amber-500" />
            ) : (
              <Lock className="w-6 h-6 text-muted-foreground" />
            )}
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {isUnlocked ? "🎉 Diamond Unlocked!" : "Unlock Diamond Status"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isUnlocked
                  ? "You have full access to all Diamond Ambassador perks"
                  : `Distribute 1,000 wristbands to unlock (${wristbandCount}/1,000)`}
              </p>
            </div>
          </div>

          {!isUnlocked && (
            <div className="space-y-2">
              <Progress value={progress} className="h-4" />
              <p className="text-xs text-muted-foreground text-center">
                <strong className="text-primary">{1000 - wristbandCount}</strong> more wristbands to go
              </p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Perks grid */}
      <section className="max-w-3xl mx-auto px-4 pb-14">
        <h2 className="text-xl font-bold text-foreground text-center mb-6">
          Diamond Exclusive Perks
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {DIAMOND_PERKS.map((perk, i) => (
            <motion.div
              key={i}
              className={`relative border rounded-xl p-4 transition-all ${
                isUnlocked
                  ? "border-border/40 bg-card hover:border-purple-500/30"
                  : "border-border/20 bg-muted/20"
              }`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              {!isUnlocked && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <perk.icon className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{perk.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{perk.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {!isUnlocked && (
          <div className="text-center mt-8">
            <Button
              onClick={() => navigate("/affiliate-dashboard")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-8 gap-2"
            >
              Go to Dashboard & Start Distributing <TrendingUp className="w-4 h-4" />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
