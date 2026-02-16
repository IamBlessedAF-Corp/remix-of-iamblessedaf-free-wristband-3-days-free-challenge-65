// /3300us-Credit — Unified affiliate onboarding hub
// Users choose their role, then get redirected to the specific funnel page
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, Gift, TrendingUp, Star, Brain, Heart, Video, Users,
  Briefcase, Home, Share2, Target, Scissors, UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import logoImg from "@/assets/logo.png";
import InfluencerTestimonials from "@/components/lead-pages/InfluencerTestimonials";
import LeadPageCountdown from "@/components/lead-pages/LeadPageCountdown";

const AFFILIATE_ROLES = [
  {
    id: "expert",
    label: "Expert / Coach / Consultant",
    desc: "Coaches, consultants, speakers, course creators",
    icon: Briefcase,
    route: "/3300us-Credit-Expert",
  },
  {
    id: "realtor",
    label: "Real Estate Agent",
    desc: "Realtors, brokers, real estate teams",
    icon: Home,
    route: "/3300us-Credit-RE-Agent",
  },
  {
    id: "network-marketer",
    label: "Network Marketer",
    desc: "MLM reps, direct sales, social sellers",
    icon: Users,
    route: "/3300us-Credit-N-Marketer",
  },
  {
    id: "affiliate-marketer",
    label: "Affiliate Marketer",
    desc: "Media buyers, content affiliates, digital marketers",
    icon: Target,
    route: "/3300us-Credit-Affiliate-Marketer",
  },
  {
    id: "clipper",
    label: "Content Clipper",
    desc: "Clip & repost gratitude content, earn $2.22–$1,111 per clip",
    icon: Scissors,
    route: "/3300us-Credit-Clipper",
  },
  {
    id: "influencer",
    label: "Influencer / Content Creator",
    desc: "Repost viral clips from our Content Vault with your referral link",
    icon: Video,
    route: "/3300us-Credit-Influencer",
  },
  {
    id: "podcast-host",
    label: "Podcast Host",
    desc: "Monetize episodes with guest segments, show notes & referral links",
    icon: Share2,
    route: "/3300us-Credit-Podcast-Host",
  },
  {
    id: "gym-owner",
    label: "Gym Owner",
    desc: "Boost member retention with gratitude challenges & earn on sales",
    icon: Heart,
    route: "/3300us-Credit-Gym-Owner",
  },
  {
    id: "health-coach",
    label: "Health Coach",
    desc: "Add science-backed gratitude protocols to your coaching programs",
    icon: Brain,
    route: "/3300us-Credit-Health-Coach",
  },
  {
    id: "other",
    label: "Other / Not Sure Yet",
    desc: "Entrepreneurs or just exploring — we'll help you find your path",
    icon: UserPlus,
    route: "/3300us-Credit-Influencer",
  },
];

const STATS = [
  { value: "$3,300", label: "FREE Credit", icon: Gift },
  { value: "2.7x", label: "Lead Capture", icon: TrendingUp },
  { value: "7", label: "Inc 5000 Companies", icon: Star },
];

const WHY_JOIN = [
  "FREE $3,300 marketing credit from Joe Da Vincy",
  "Same system Inc 5000 companies paid $25,000 for",
  "Custom branded funnel — YOUR branding, YOUR offers",
  "Reactivate your list & past clients on autopilot",
  "Earn Blessed Coins + climb the leaderboard",
  "Help donate meals & spread gratitude globally",
];

export default function CreditPortal() {
  const navigate = useNavigate();
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4 pt-10 pb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <img src={logoImg} alt="I am Blessed AF" className="h-10 mx-auto mb-5" />
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-xs font-bold px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1" /> AFFILIATE PROGRAM
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black text-foreground leading-[1.1] mb-4 tracking-tight">
              A Neuroscience-Backed Viral<br />
              <span className="text-primary">Gratitude Challenge</span> That Captures<br />
              2–3x More Emails 🧠
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-4 leading-relaxed">
              Replace tired lead magnets with a <strong className="text-foreground">science-backed gratitude challenge</strong> proven to capture
              <strong className="text-foreground"> 2–3x more emails</strong> than traditional opt-ins.
              Customized for <strong className="text-foreground">YOUR industry</strong> — pick your role and get started in minutes.
            </p>

            {/* FREE $3,300 Bonus Callout */}
            <motion.div
              className="inline-flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-2xl px-5 py-3 mb-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Gift className="w-6 h-6 text-primary shrink-0" />
              <div className="text-left">
                <p className="text-lg md:text-xl font-black text-primary leading-tight">+ FREE $3,300 Marketing Credit</p>
                <p className="text-[11px] text-muted-foreground">Same system Inc 5000 companies paid $25,000 for — yours FREE for 30 days</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="grid grid-cols-3 gap-3 mb-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {STATS.map((s, i) => (
              <div key={i} className="bg-card border border-border/40 rounded-xl p-3 text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-black text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="mt-4 max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <LeadPageCountdown />
          </motion.div>
        </div>
      </section>

      {/* Role Picker */}
      <section className="bg-card border-y border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-14">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
              I Am a <span className="text-primary">_______</span>
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-10">
              Select your role to get a funnel customized for YOUR industry
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {AFFILIATE_ROLES.map((role, i) => (
                <motion.button
                  key={role.id}
                  onClick={() => navigate(role.route)}
                  onMouseEnter={() => setHoveredRole(role.id)}
                  onMouseLeave={() => setHoveredRole(null)}
                  className={`flex items-start gap-4 bg-background border rounded-xl p-5 text-left transition-all duration-200 ${
                    hoveredRole === role.id
                      ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                      : "border-border/40 hover:border-primary/50"
                  }`}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    hoveredRole === role.id ? "bg-primary text-primary-foreground" : "bg-primary/10"
                  }`}>
                    <role.icon className={`w-6 h-6 ${hoveredRole === role.id ? "text-primary-foreground" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-foreground">{role.label}</h3>
                      <ArrowRight className={`w-4 h-4 text-primary shrink-0 transition-transform ${
                        hoveredRole === role.id ? "translate-x-1" : ""
                      }`} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{role.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Join */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
            Why Join the <span className="text-primary">Gratitude Affiliate</span> Program?
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {WHY_JOIN.map((reason, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3 bg-card border border-border/40 rounded-xl p-4"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Heart className="w-5 h-5 text-primary shrink-0 mt-0.5" />
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
            Ready to Get Your FREE <span className="text-primary">$3,300 Credit</span>?
          </h2>
          <p className="text-sm text-background/70 max-w-md mx-auto mb-6">
            Pick your role above and get a custom-branded funnel in 48 hours.
            Same system behind 2.7x lead capture for 7 Inc 5000 companies.
          </p>
          <Button
            size="lg"
            onClick={() => document.querySelector('.bg-card.border-y')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base px-8 py-6 rounded-xl gap-2"
          >
            Choose My Role & Get Started <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/30 bg-card">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center">
          <img src={logoImg} alt="Logo" className="h-6 mx-auto mb-2 opacity-50" />
          <p className="text-[10px] text-muted-foreground">
            © {new Date().getFullYear()} I am Blessed AF™ — All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
