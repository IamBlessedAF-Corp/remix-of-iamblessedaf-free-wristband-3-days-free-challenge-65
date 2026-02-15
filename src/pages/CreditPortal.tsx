// /3300us-Credit — Portal affiliate conversion page
// Converts portal users into affiliates by reposting gratitude & neuroscience clips
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle, Gift, Sparkles, Star, TrendingUp, Zap, Share2, Brain, Heart, Video, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import logoImg from "@/assets/logo.png";
import InfluencerTestimonials from "@/components/lead-pages/InfluencerTestimonials";
import LeadPageCountdown from "@/components/lead-pages/LeadPageCountdown";

const MISSION_STEPS = [
  { icon: Video, title: "Pick a Clip from the Vault", desc: "Choose from viral gratitude & neuroscience clips featuring Tony Robbins, Huberman, Joe Dispenza & more." },
  { icon: Share2, title: "Repost With Your Referral Link", desc: "Post on TikTok, Reels, or Shorts with #IamBlessedAF and your unique referral link in bio." },
  { icon: Brain, title: "Hack Everyone's Brain With Gratitude", desc: "Every view activates the mPFC — the brain region that releases serotonin & dopamine. You're literally making people happier." },
  { icon: Heart, title: "Help the Mission & Earn", desc: "Every clip drives free wristband claims, challenge signups & donations. You earn $2.22–$1,111 per clip + Blessed Coins." },
];

const WHY_JOIN = [
  "You already believe in the mission — now amplify it",
  "Get paid $2.22+ for every clip, even at 1K views",
  "FREE $3,300 marketing credit from Joe Da Vincy",
  "Access the Content Vault — no original content needed",
  "Earn Blessed Coins for the Rewards Store",
  "Help donate meals & spread gratitude globally",
];

export default function CreditPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate("/clipper-dashboard");
    } else {
      navigate("/3300us-Credit-Clipper");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4 pt-10 pb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <img src={logoImg} alt="I am Blessed AF" className="h-10 mx-auto mb-5" />
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-xs font-bold px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" /> AMBASSADOR OPPORTUNITY
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black text-foreground leading-[1.1] mb-4 tracking-tight">
              Become a <span className="text-primary">Gratitude Affiliate</span>
              <br />
              Help the Mission. Get Paid. 🧠
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-4 leading-relaxed">
              Repost <strong className="text-foreground">viral gratitude & neuroscience clips</strong> from our Content Vault.
              Every clip you post <strong className="text-foreground">hacks viewers' brains with gratitude</strong> — activating the mPFC
              and releasing happiness chemicals. You earn <strong className="text-primary">$2.22–$1,111 per clip</strong> while helping the mission.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Plus: <strong className="text-primary">FREE $3,300 marketing credit</strong> from Joe Da Vincy — the same system Inc 5000 companies paid $25,000 for.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-3 gap-3 mb-8" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            {[
              { value: "$3,300", label: "FREE Credit", icon: Gift },
              { value: "$2.22+", label: "Per Clip", icon: TrendingUp },
              { value: "🧠", label: "Hack Brains", icon: Brain },
            ].map((s, i) => (
              <div key={i} className="bg-card border border-border/40 rounded-xl p-3 text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-black text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Button size="lg" onClick={handleGetStarted} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 py-6 rounded-xl gap-2 btn-glow">
              {user ? "Open Clipper Dashboard" : "Start Clipping & Earning"} <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-xs text-muted-foreground mt-2">100% free · No followers required · We give you everything you need</p>
          </motion.div>

          <motion.div className="mt-8 max-w-md mx-auto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <LeadPageCountdown />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
              How You <span className="text-primary">Help & Earn</span>
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-10">
              4 steps to spread gratitude, hack brains & get paid
            </p>
            <div className="space-y-4">
              {MISSION_STEPS.map((step, i) => (
                <motion.div key={i} className="flex items-start gap-4 bg-background border border-border/40 rounded-xl p-5" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">STEP {i + 1}</span>
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Join */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
            Why Become a <span className="text-primary">Gratitude Affiliate</span>?
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {WHY_JOIN.map((reason, i) => (
              <motion.div key={i} className="flex items-start gap-3 bg-card border border-border/40 rounded-xl p-4" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{reason}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Joe Da Vincy + Influencer Testimonials */}
      <InfluencerTestimonials />

      {/* Final CTA */}
      <section className="bg-foreground">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-background mb-3">
            Help the Mission. <span className="text-primary">Get Paid.</span>
          </h2>
          <p className="text-sm text-background/70 max-w-md mx-auto mb-6">
            Every clip you post spreads gratitude, activates happiness chemicals in viewers' brains,
            and earns you money. It's the ultimate win-win-win.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 py-6 rounded-xl gap-2">
            {user ? "Open Clipper Dashboard" : "Start Clipping & Earning"} <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/30 bg-card">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center">
          <img src={logoImg} alt="Logo" className="h-6 mx-auto mb-2 opacity-50" />
          <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} I am Blessed AF™ — All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
