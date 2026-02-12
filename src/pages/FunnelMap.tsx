import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  TrendingUp, Users, DollarSign, Eye, Video, ArrowRight, ArrowDown, Zap, Target, BarChart3,
  Settings2, Sparkles, Gift, Brain, Share2, Repeat, MessageSquare, Crown, RefreshCw,
  Info, Calculator, Rocket, Snowflake, Heart, Star, ShoppingBag, Megaphone, ChevronDown,
  ExternalLink, Mail, Phone, Smartphone, Trophy, Gauge, UserPlus, BookOpen, Flame, Radio, Shield, FlaskConical
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logoImg from "@/assets/logo-iamblessedaf.png";

/* ─── Metric Tooltip Component ─── */
const MetricLabel = ({ label, tip }: { label: string; tip: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 cursor-help underline decoration-dotted decoration-muted-foreground/40 underline-offset-2">
        {label} <Info className="w-3 h-3" />
      </span>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[240px] text-xs">{tip}</TooltipContent>
  </Tooltip>
);

/* ─── Pre-Funnel: Viral Lead Gen Strategies ─── */
const PRE_FUNNEL_STEPS = [
  {
    id: 0.1, route: "/experts-leads", name: "Expert Enrollment", sells: "Lead capture for coaches & consultants", defaultConv: 0.45, icon: BookOpen,
    vitality: "Neuroscience hooks → authority positioning", kFactor: "K=1.8",
    subtitle: "Captures coaches/consultants via Hawkins, Huberman, Dispenza authority hooks. Automated branded welcome email triggers on signup.",
    emotional: "🧠 Identity shift: 'I'm a certified gratitude expert'",
    touchpoints: ["✉️ Auto welcome email (Resend)", "📊 Admin dashboard /admin/experts", "🎯 Status tracking: New → Contacted → Converted"],
    dashboard: "Admin sees all leads at /admin/experts with search, filter by status, and CSV export."
  },
  {
    id: 0.2, route: "/Gratitude-Clippers", name: "Clipper Campaign", sells: "Creator recruitment — $2.22–$1,111/clip", defaultConv: 0.38, icon: Video,
    vitality: "Andrew Tate Formula → paid viral content engine", kFactor: "K=4.2",
    subtitle: "Recruits content creators via earnings psychology. 3-step workflow: Pick clip → Add CTA → Post. Redirects to /clipper-dashboard on signup.",
    emotional: "💰 Greed + purpose: 'Get paid to spread gratitude'",
    touchpoints: ["📱 Sticky CTA bar with confetti on first referral copy", "🏆 4-tier identity badges (New → Super Clipper)", "📊 Personal analytics tab on /clipper-dashboard", "🪙 BC rewards: 100 BC/clip"],
    dashboard: "Each clipper gets /clipper-dashboard with Weekly Snapshot, My Clips milestones, Analytics tab, and direct access to Rewards Store."
  },
];

/* ─── Funnel Stages (Cold → Fidelización → Ascensión) ─── */
const COLD_TRAFFIC_STEPS = [
  {
    id: 1, route: "/", name: "Free Wristband", sells: "Lead capture (wristband gratis)", defaultConv: 0.65, icon: Gift,
    vitality: "Auth Gate → 100% capture", kFactor: "K=1.0",
    subtitle: "Hormozi-style 'Congratulations — You're About to Become a Neuro-Hacker 🧠'. 100% FREE, no credit card. Mandatory auth gate captures every email.",
    emotional: "🎁 Reciprocity trigger: free gift = obligation to engage",
    touchpoints: ["🔐 Auth gate (email capture)", "📧 Welcome email sequence", "🧠 Neuro-hacker identity framing"],
    dashboard: "User sees their wristband order status and referral link in /portal."
  },
  {
    id: 2, route: "intro", name: "Science Hook", sells: "Educación — Hawkins 27x", defaultConv: 0.85, icon: Brain,
    vitality: "Science hooks → credibility",
    subtitle: "Hawkins Scale (27x happier) + Huberman neuroscience + Harvard Grant Study (84 years). Establishes scientific authority before any purchase.",
    emotional: "🔬 'This isn't woo-woo — this is peer-reviewed science'",
    touchpoints: ["📖 3 expert avatars with credentials", "📊 Hawkins Scale visual"],
    dashboard: "N/A — education step, no user dashboard."
  },
  {
    id: 3, route: "setup", name: "Friend Capture", sells: "Name Your Best Friend", defaultConv: 0.78, icon: Users,
    vitality: "Friend naming → referral seed", kFactor: "K=3.0",
    subtitle: "User names 1-3 best friends. Seeds referral list from Day 0. Phone input with international country selector for SMS opt-in.",
    emotional: "❤️ 'Who deserves to feel this way too?' — guilt + love",
    touchpoints: ["📱 SMS opt-in with country selector", "👥 Friend names stored for TGF Fridays", "⏭️ 'Maybe later' → /challenge/thanks (stays in ecosystem)"],
    dashboard: "Friends rotate weekly in TGF Friday auto-SMS. User can see challenge streak in /portal."
  },
  {
    id: 4, route: "checkout", name: "Wristband Checkout", sells: "$9.95 ship → 11 meals", defaultConv: 0.35, icon: ShoppingBag,
    vitality: "Pay It Forward guilt loop", kFactor: "K=1.5",
    subtitle: "1 wristband ($9.95 shipping) or 3 for $22. Each wristband = 11 meals via Feeding America. 'Pay It Forward' guilt-trip framing.",
    emotional: "🙏 'Your shipping fee feeds 11 people today'",
    touchpoints: ["💳 Stripe Checkout", "🍽️ Meal counter updates globally", "📦 Order confirmation email"],
    dashboard: "Order tracked in /portal. Global meal counter updates on /impact page."
  },
];

const FIDELIZATION_STEPS = [
  {
    id: 5, route: "/challenge/thanks", name: "Viral Activation", sells: "WhatsApp share + BC rewards", defaultConv: 0.42, icon: Share2,
    vitality: "WhatsApp viral share", kFactor: "K=2.7",
    subtitle: "Post-signup viral activation page. WhatsApp-first sharing (higher conversion than SMS). Gamified ShareMilestoneTracker awards BC at 1, 3, 5, 10, 25 shares.",
    emotional: "🚀 'You just changed 11 lives — now tell your friends'",
    touchpoints: ["📲 WhatsApp share (primary)", "📱 SMS/Copy link (fallback)", "🪙 BC rewards at share milestones", "🏆 Achievement badges unlock"],
    dashboard: "User sees share count + BC earned in /portal. ShareMilestoneTracker shows progress to next reward tier."
  },
  {
    id: 6, route: "cron", name: "TGF Fridays", sells: "Weekly SMS → gratitude msg to rotating friend", defaultConv: 0.60, icon: Repeat,
    vitality: "Auto friend rotation",
    subtitle: "Automated weekly cron job sends gratitude SMS to a different friend each Friday. Each SMS includes the user's referral link. Keeps users engaged without manual effort.",
    emotional: "💌 'Your friend just got a surprise gratitude message from you'",
    touchpoints: ["📱 Auto SMS every Friday (Twilio)", "🔄 Friend name rotation from setup", "🔗 Referral link embedded in each SMS", "📊 SMS delivery tracked in sms_audit_log"],
    dashboard: "User sees upcoming messages + delivery status in /portal. Admin tracks in SMS Compliance Dashboard."
  },
];

const ASCENSION_STEPS = [
  {
    id: 7, route: "/", name: "$22 Starter Pack", sells: "3 wristbands ($22)", defaultConv: 0.18, icon: Gift,
    vitality: "Stock decay FOMO", price: 22,
    subtitle: "3 wristbands for $22. Stock decay counter + 'X people viewing now' FOMO. Positioned after initial free wristband to upgrade to gifting pack.",
    emotional: "⏳ 'Only 47 packs left — 12 people viewing right now'",
    touchpoints: ["🔥 UrgencyBanner with live stock count", "👀 Simulated viewer count", "💳 Stripe Checkout → /offer/111"],
    dashboard: "Order appears in /portal with meal impact counter (22 meals = 3×wristbands)."
  },
  {
    id: 8, route: "/offer/111", name: "$111 Identity Pack", sells: "Custom shirt + wristbands ($111)", defaultConv: 0.08, icon: Star,
    vitality: "Mystery Box framing", price: 111,
    subtitle: "Custom 'I am Blessed AF' shirt with friend's name + wristbands. Mystery Box animation reveals the 'FREE shirt win'. Price deferred until 2nd CTA block.",
    emotional: "🎁 'You WON a Mystery Box! Your FREE Custom Shirt awaits'",
    touchpoints: ["🎰 MysteryBox animation", "👕 ShirtCustomizer with friend name", "📸 Friend name personalization banner", "💳 Stripe → /offer/444", "❌ Skip → $11/mo downsell modal"],
    dashboard: "Shirt customization preview saved. User sees order + 111 meals donated in /portal."
  },
  {
    id: 9, route: "/offer/444", name: "$444 Habit Lock", sells: "1,111 meals ($444)", defaultConv: 0.035, icon: Heart,
    vitality: "Chained transition", price: 444,
    subtitle: "1,111 meals via Feeding America. Chained MysteryBox transition from $111. Urgency: only 111 shirts available. 'Lock in your gratitude habit for life.'",
    emotional: "🔒 'Lock your gratitude habit — feed 1,111 people'",
    touchpoints: ["🎰 Chained MysteryBox from $111", "📉 Stock decay: 111 shirts left", "💳 Stripe → /offer/1111", "❌ Skip → $11/mo downsell"],
    dashboard: "Major milestone in /portal: 1,111 meals badge + BC bonus."
  },
  {
    id: 10, route: "/offer/1111", name: "$1,111 Kingdom", sells: "11,111 meals ($1,111)", defaultConv: 0.012, icon: Crown,
    vitality: "ROI math + mission", price: 1111,
    subtitle: "Kingdom Ambassador tier. ROI math showing cost-per-life-changed. Biblical mission framing: 'Feed 11,111 people.' Part of path to $44,444 Blessed Residency.",
    emotional: "👑 'You're not buying a product — you're funding a kingdom'",
    touchpoints: ["📊 ROI calculator embedded", "🙏 Biblical mission framing", "💳 Stripe → /offer/4444", "❌ Skip → $11/mo downsell"],
    dashboard: "Kingdom Ambassador badge in /portal. Access to exclusive missions + higher BC earn rates."
  },
  {
    id: 11, route: "/offer/4444", name: "$4,444 Ambassador", sells: "44,444 meals ($4,444)", defaultConv: 0.004, icon: Crown,
    vitality: "Portal unlock celebration", price: 4444,
    subtitle: "Terminal tier. Full Ambassador status. 44,444 meals. Portal unlock with confetti + 2,000 XP celebration. Access to all 12 earning methods.",
    emotional: "💎 'Welcome to the inner circle — you ARE the movement'",
    touchpoints: ["🎉 Confetti celebration + 2,000 XP", "🏛️ Full Portal access unlock", "🪙 BC wallet + leaderboard", "📱 12-method earn hierarchy"],
    dashboard: "Full /portal dashboard: BC wallet, missions, leaderboard, referral hub, rewards store, social share templates, activity feed."
  },
];

const ALL_STEPS = [...COLD_TRAFFIC_STEPS, ...FIDELIZATION_STEPS, ...ASCENSION_STEPS];
const TIER_PRICES: Record<number, number> = { 4: 16, 7: 22, 8: 111, 9: 444, 10: 1111, 11: 4444 };
const DOWNSELL_PRICE = 11;
const DOWNSELL_RATE = 0.06;

const SCENARIOS = [
  { key: "conservative", label: "Conservative", color: "hsl(var(--muted-foreground))", multiplier: 0.7 },
  { key: "base", label: "Base Case", color: "hsl(var(--primary))", multiplier: 1.0 },
  { key: "optimistic", label: "Optimistic", color: "hsl(142 71% 45%)", multiplier: 1.4 },
] as const;

/* ─── Stage Label Component ─── */
const StageLabel = ({ icon: Icon, label, color }: { icon: any; label: string; color: string }) => (
  <div className={`flex items-center gap-2 py-3 px-4 rounded-xl border-2 ${color} mb-2 mt-6 first:mt-0`}>
    <Icon className="w-5 h-5" />
    <span className="text-sm font-black uppercase tracking-wider">{label}</span>
  </div>
);

/* ─── Step Card (Clickable + Collapsible with subtitle/touchpoints) ─── */
const FunnelStepCard = ({ step, index, baseStep, getConv, navigate, stepNumber }: { step: any; index: number; baseStep: any; getConv: (s: any) => number; navigate: any; stepNumber: string }) => {
  const [open, setOpen] = useState(false);
  const isRevenue = !!step.price;
  const StepIcon = step.icon;
  const isClickable = step.route && !["intro", "setup", "checkout", "cron"].includes(step.route);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <motion.div
        className={`relative rounded-xl transition-colors ${
          isRevenue ? "bg-primary/[0.04] border border-primary/15" : "bg-card border border-border/40"
        }`}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
      >
        <CollapsibleTrigger className="w-full text-left">
          <div className="flex items-stretch gap-3 p-3 md:p-4">
            {/* Step number */}
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border-2 ${
                isRevenue ? "border-primary bg-primary text-primary-foreground" : "border-primary/30 bg-primary/10 text-primary"
              }`}>
                {stepNumber}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StepIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                    <h3 className="text-sm font-bold text-foreground">{step.name}</h3>
                    {step.price && (
                      <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20 px-1.5 py-0">
                        ${step.price}
                      </Badge>
                    )}
                    {[9, 10, 11].includes(step.id) && (
                      <Badge variant="outline" className="text-[8px] py-0 px-1 border-amber-500/40 text-amber-500">🚧 Under Construction</Badge>
                    )}
                    {isClickable && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(step.route); }}
                        className="text-[9px] text-primary hover:underline flex items-center gap-0.5"
                      >
                        <ExternalLink className="w-2.5 h-2.5" /> Visit
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{step.sells}</p>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <span className={`text-xs font-bold ${getConv(step) >= 0.5 ? "text-primary" : getConv(step) >= 0.1 ? "text-foreground" : "text-muted-foreground"}`}>
                      {Math.round(getConv(step) * 100)}%
                    </span>
                    {baseStep && (
                      <p className="text-[9px] text-muted-foreground">
                        {baseStep.entering.toLocaleString()} → {baseStep.converted.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                </div>
              </div>

              {/* Vitality pill - summary preview */}
              {step.vitality && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex items-center gap-1 bg-accent border border-primary/10 rounded-full px-2 py-0.5">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-medium text-accent-foreground">{step.vitality}</span>
                  </div>
                  {step.kFactor && (
                    <span className="text-[9px] font-black text-primary bg-primary/10 rounded-full px-1.5 py-0.5">
                      {step.kFactor}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Expanded details */}
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0 ml-[52px] space-y-3 border-t border-border/30 mt-0 pt-3">
            {/* Strategy subtitle */}
            {step.subtitle && (
              <p className="text-xs text-muted-foreground leading-relaxed">{step.subtitle}</p>
            )}

            {/* Emotional connection */}
            {step.emotional && (
              <div className="bg-primary/5 border border-primary/10 rounded-lg px-3 py-2">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">Emotional Hook</p>
                <p className="text-xs text-foreground">{step.emotional}</p>
              </div>
            )}

            {/* Touchpoints */}
            {step.touchpoints && step.touchpoints.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Follow-up Touchpoints</p>
                <div className="space-y-1">
                  {step.touchpoints.map((tp: string, i: number) => (
                    <p key={i} className="text-[11px] text-foreground/80">{tp}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Dashboard info */}
            {step.dashboard && (
              <div className="bg-accent/50 border border-border/40 rounded-lg px-3 py-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">📊 User Dashboard</p>
                <p className="text-[11px] text-foreground/80">{step.dashboard}</p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </motion.div>
    </Collapsible>
  );
};

export default function FunnelMap() {
  const navigate = useNavigate();
  /* ─── Clipper Campaign Inputs (Andrew Tate Formula) ─── */
  const [clippers, setClippers] = useState(250);
  const [videosPerClipper, setVideosPerClipper] = useState(4);
  const [viewsPerClip, setViewsPerClip] = useState(3000);
  const [pricePerClip, setPricePerClip] = useState(3);
  const [campaignBudget, setCampaignBudget] = useState(3000);

  /* ─── Funnel Conversion Overrides ─── */
  const [convOverrides, setConvOverrides] = useState<Record<number, number>>({});
  const getConv = (step: any) => convOverrides[step.id] ?? step.defaultConv;

  /* ─── Projections Engine ─── */
  const projections = useMemo(() => {
    const totalClips = clippers * videosPerClipper;
    const totalViews = totalClips * viewsPerClip;
    const clipperCost = totalClips * pricePerClip;
    const maxClips = campaignBudget / pricePerClip;

    return SCENARIOS.map((s) => {
      let visitors = Math.round(totalViews * 0.012 * s.multiplier);
      const stepResults = ALL_STEPS.map((step, i) => {
        const conv = getConv(step) * s.multiplier;
        const entering = visitors;
        const converted = Math.round(entering * Math.min(conv, 1));
        const skipped = entering - converted;
        const downsellConverted = (TIER_PRICES[step.id] ?? 0) > 0 ? Math.round(skipped * DOWNSELL_RATE * s.multiplier) : 0;
        const revenue = converted * (TIER_PRICES[step.id] ?? 0) + downsellConverted * DOWNSELL_PRICE;
        visitors = converted;
        return { ...step, entering, converted, skipped, downsellConverted, revenue, convRate: conv };
      });
      const totalRevenue = stepResults.reduce((sum, r) => sum + r.revenue, 0);
      const downsellRevenue = stepResults.reduce((sum, r) => sum + r.downsellConverted * DOWNSELL_PRICE, 0);
      return {
        ...s,
        totalClips,
        totalViews,
        clipperCost,
        maxClips: Math.floor(maxClips),
        visitors: Math.round(totalViews * 0.012 * s.multiplier),
        steps: stepResults,
        totalRevenue,
        downsellRevenue,
        roi: totalRevenue / (clipperCost || 1),
        day1: Math.round(totalRevenue * 0.15),
        day7: Math.round(totalRevenue * 0.45),
        day30: totalRevenue,
      };
    });
  }, [clippers, videosPerClipper, viewsPerClip, pricePerClip, campaignBudget, convOverrides]);

  const base = projections[1];

  /* ─── Advanced Metrics ─── */
  const rpm = base.totalViews > 0 ? ((base.totalRevenue / base.totalViews) * 1000) : 0;
  const ltv = base.visitors > 0 ? (base.totalRevenue / base.visitors) : 0;
  const cac = base.visitors > 0 ? (base.clipperCost / base.visitors) : 0;
  const avgKFactor = 2.1; // Weighted average across all vitality loops

  /* ─── Chart Data ─── */
  const funnelChartData = base.steps.map((s) => ({
    name: s.name,
    value: s.entering,
    fill: s.entering > 100 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
  }));

  const revenueByTier = base.steps.filter((s) => s.revenue > 0).map((s) => ({
    name: s.name,
    revenue: s.revenue,
  }));

  const convChartData = base.steps.map((s) => ({
    name: s.name.replace("$", "").substring(0, 12),
    "Conv %": Math.round(s.convRate * 100),
    "Skip %": Math.round((1 - s.convRate) * 100),
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ THE GRATITUDE ENGINE LOOP™ (Top Section) ═══ */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }}>
        <div className="relative rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/5 overflow-hidden m-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.08),transparent_60%)]" />
          <div className="relative text-center py-10 px-6">
            <img src={logoImg} alt="IamBlessedAF" className="h-10 mx-auto mb-3" />
            <h2 className="text-2xl md:text-4xl font-black text-foreground tracking-tight mb-2">
              THE <span className="text-primary">GRATITUDE ENGINE</span> LOOP™
            </h2>



            {/* Huberman Clip */}
            <div className="max-w-lg mx-auto rounded-2xl overflow-hidden border border-border/50 shadow-sm">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/ph1BuMRFJ88"
                  title="Huberman on Gratitude"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>

            {/* Bridge headline */}
            <motion.div
              className="mt-8 mb-6 max-w-xl mx-auto text-center space-y-4"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl md:text-2xl font-extrabold leading-tight text-foreground">
                The Practical Implementation of{" "}
                <span className="text-primary">The Biggest Andrew Huberman Discovery</span>{" "}
                in the Last 18 Months.
              </h3>
              <p className="text-base md:text-lg font-semibold text-foreground/90 leading-snug">
                Dr. Hawkins' (PhD) Research affirms it could make you up to{" "}
                <motion.span
                  className="text-primary inline-block"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  27× Happier
                </motion.span>
                .
              </p>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                The <strong className="text-foreground">Neuro-Hack</strong> to spike{" "}
                <strong className="text-primary">Dopamine & Serotonin</strong> (Overall Well-Being) — pre-built into a{" "}
                <strong className="text-foreground">trigger</strong>,{" "}
                <strong className="text-foreground">habit-forming system</strong> &{" "}
                <strong className="text-primary">brand</strong>.
              </p>
            </motion.div>

            {/* Science of Gratitude — collapsible */}
            <Collapsible>
              <CollapsibleTrigger className="w-full mt-5">
                <div className="flex items-center justify-center gap-2 bg-card border border-border/50 rounded-xl px-5 py-3 mx-auto max-w-md shadow-sm hover:shadow-md transition-shadow">
                  <FlaskConical className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Science of Gratitude</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">8 peer-reviewed studies · Huberman Lab</p>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 max-w-lg mx-auto space-y-3 text-left">
                  {[
                    { title: "Receiving gratitude > giving gratitude", source: "Huberman Lab Podcast #47", detail: "Observing or receiving genuine thanks activates prefrontal cortex circuits tied to prosocial behavior more powerfully than expressing thanks yourself." },
                    { title: "Gratitude spikes serotonin & dopamine", source: "Zahn et al., 2009 — NeuroImage", detail: "fMRI scans show gratitude activates the ventral tegmental area (VTA) and nucleus accumbens — the brain's core reward circuit." },
                    { title: "3 minutes is the effective threshold", source: "Emmons & McCullough, 2003", detail: "Subjects who spent just 3 minutes on gratitude journaling reported 25% higher well-being scores over 10 weeks vs. control." },
                    { title: "#1 predictor of lifelong happiness", source: "Harvard Grant Study (75+ years)", detail: "The longest-running study on human development found that the quality of close relationships — not wealth — is the strongest predictor of life satisfaction." },
                    { title: "Gratitude rewires neural pathways", source: "Kini et al., 2016 — NeuroImage", detail: "Gratitude practice produces lasting changes in medial prefrontal cortex activity, even months after the intervention ends." },
                    { title: "Up to 27x consciousness elevation", source: "Dr. David Hawkins — Power vs. Force", detail: "Gratitude calibrates at 540 on the Hawkins Scale (Love), compared to apathy at 50 and fear at 100 — a measurable 27x elevation in emotional frequency." },
                    { title: "Reduces cortisol by 23%", source: "McCraty et al., 1998 — American Journal of Cardiology", detail: "Heart-focused gratitude practice lowered cortisol (stress hormone) by 23% and increased DHEA (vitality hormone) by 100%." },
                    { title: "Habit formation in 21 days", source: "Lally et al., 2010 — European Journal of Social Psychology", detail: "Simple daily behaviors become automatic habits in as few as 18-21 days, with a visual trigger accelerating the process." },
                  ].map((study, i) => (
                    <div key={i} className="bg-card/80 border border-border/40 rounded-xl p-3.5">
                      <p className="text-sm font-bold text-foreground">{study.title}</p>
                      <p className="text-[10px] text-primary font-semibold mt-0.5">{study.source}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{study.detail}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </motion.section>

      {/* ─── Hero Header (Experts-style) ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-10 text-center">
          <img src={logoImg} alt="IamBlessedAF" className="h-8 mx-auto mb-4" />

          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-xs font-bold px-3 py-1">
            Traffic → Funnel → Conversiones
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black text-foreground leading-[1.1] mb-4 tracking-tight">
            How the <span className="text-primary">Gratitude Engine</span> Turns<br />
            Clips Into <span className="text-primary">Cash & Impact</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
            <strong className="text-foreground">250 Clippers × 3,000 Views/Clip</strong> = 3M Impressions → <strong className="text-foreground">{base.visitors.toLocaleString()} Visitors</strong> → <strong className="text-primary">${base.totalRevenue.toLocaleString()} Revenue</strong> ({base.roi.toFixed(1)}x ROI)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {[
              { icon: TrendingUp, value: "27x", label: "HAPPINESS MULTIPLIER" },
              { icon: Users, value: `K=${avgKFactor}`, label: "VIRAL K-FACTOR" },
              { icon: DollarSign, value: `${base.roi.toFixed(1)}x`, label: "PROJECTED ROI" },
              { icon: Heart, value: "84 yrs", label: "HARVARD STUDY" },
            ].map((s, i) => (
              <div key={i} className="bg-card border border-border/40 rounded-xl p-3 text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-black text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Growth Hacking Identity */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20">
            <CardContent className="p-5 md:p-7">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                <strong className="text-foreground">IamBlessedAF</strong> is a <strong className="text-foreground">pay-it-forward gratitude movement</strong> backed by 
                top neuroscience PhDs. We help people feel up to <strong className="text-primary">27x happier</strong> (Dr. Hawkins PhD) by installing advanced neuro-hack triggers 
                to spark gratitude conversations. Backed by <strong className="text-foreground">Harvard's Grant Study (84+ years)</strong>, we scale the quality of your relationships.
              </p>
              <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="w-4 h-4 text-primary" />
                  <span className="text-xs font-black text-foreground uppercase tracking-wider">Growth Hacking Campaign</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mixing <strong className="text-foreground">Dropbox's viral referral engine</strong> × <strong className="text-foreground">Ice Bucket Challenge's emotional virality</strong> × <strong className="text-foreground">Supreme's scarcity model</strong> — powered by the <strong className="text-primary">Andrew Tate Clippers Formula</strong>. 
                  Pay creators per clip, each clip drives traffic, each visitor enters a conversion funnel with built-in K-factor loops.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>




        {/* ═══ VIRAL LOOPS INSTALLED (Pre-collapsed) ═══ */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <Card className="cursor-pointer hover:border-primary/20 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">Viral Loops Installed</CardTitle>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px]">7 Active</Badge>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <CardDescription className="text-xs text-left">Every touchpoint in the funnel has a built-in K-factor multiplier</CardDescription>
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mt-1 border-t-0 rounded-t-none">
                <CardContent className="p-4 md:p-6">
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      { name: "Friend Name Capture", where: "Setup Flow (Step 3)", kFactor: "K=3.0", desc: "Users name 1-3 best friends at Day 0. Seeds referral list before any purchase.", icon: Users },
                      { name: "WhatsApp-First Share", where: "Challenge Thanks (Step 5)", kFactor: "K=2.7", desc: "Post-signup viral activation. WhatsApp preferred for higher conversion vs SMS.", icon: Share2 },
                      { name: "TGF Friday Auto-SMS", where: "Weekly Cron (Step 6)", kFactor: "K=1.5", desc: "Automated gratitude SMS to rotating friend each Friday with embedded referral link.", icon: MessageSquare },
                      { name: "ShareMilestoneTracker", where: "Portal + Post-Purchase", kFactor: "K=2.1", desc: "Gamified BC rewards at 1, 3, 5, 10, 25 shares. Escalating incentive.", icon: Trophy },
                      { name: "Pay It Forward Guilt", where: "Checkout (Step 4)", kFactor: "K=1.5", desc: "Each wristband = 11 meals. 'Your shipping fee feeds 11 people today.'", icon: Heart },
                      { name: "Post-Purchase Share Prompt", where: "Success Page", kFactor: "K=1.8", desc: "Triggers immediately after confetti celebration. Rides dopamine peak.", icon: Sparkles },
                      { name: "Clipper Creator Flywheel", where: "Pre-Funnel", kFactor: "K=4.2", desc: "Creators paid per clip → clips drive traffic → traffic feeds funnel → revenue funds more clips.", icon: Video },
                    ].map((loop, i) => (
                      <div key={i} className="bg-card border border-border/40 rounded-xl p-3 flex gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <loop.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <h4 className="text-xs font-bold text-foreground">{loop.name}</h4>
                            <span className="text-[9px] font-black text-primary bg-primary/10 rounded-full px-1.5 py-0.5">{loop.kFactor}</span>
                          </div>
                          <p className="text-[10px] text-primary/70 font-medium mb-0.5">{loop.where}</p>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{loop.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </motion.section>

        {/* Calculator moved inside Pre-Funnel Clipper Campaign step */}

        {/* ═══ VISUAL FUNNEL FLOW ═══ */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Funnel Flow & Vitality Engine</CardTitle>
                  <CardDescription>Pre-Funnel Lead Gen → Cold Traffic → Fidelización → Ascensión · Click any step to expand details</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                  <RefreshCw className="w-3 h-3 mr-1" /> K-Factor Enabled
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {/* Logo top */}
              <div className="flex justify-center mb-4">
                <img src={logoImg} alt="IamBlessedAF" className="h-8 opacity-60" />
              </div>

              {/* ── Engine Ignition: Authority + Retargeting ── */}
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between gap-2 py-3 px-4 rounded-xl border-2 border-orange-500/30 bg-orange-500/5 mb-2">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-400" />
                      <span className="text-sm font-black uppercase tracking-wider text-orange-400">Engine Ignition — Paid Amplification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">$9K total budget</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 mb-2">
                    {/* Authority Hack */}
                    <div className="relative rounded-xl bg-card border border-border/40 p-3 md:p-4">
                      <div className="flex items-stretch gap-3">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border-2 border-orange-500/30 bg-orange-500/10 text-orange-500">
                            🔥1
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Shield className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            <h3 className="text-sm font-bold text-foreground">Authority-Hack</h3>
                            <Badge className="text-[9px] bg-orange-500/10 text-orange-500 border-orange-500/20 px-1.5 py-0">$3,000</Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mb-2">
                            1 Gratitude Influencer with <strong className="text-foreground">300K+ followers</strong>. Single collaboration creates instant credibility + organic reach spike.
                          </p>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1 bg-accent border border-primary/10 rounded-full px-2 py-0.5">
                              <Zap className="w-3 h-3 text-orange-500" />
                              <span className="text-[10px] font-medium text-accent-foreground">Authority positioning → trust shortcut</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center py-0.5">
                      <ArrowDown className="w-4 h-4 text-muted-foreground/40" />
                    </div>

                    {/* Retargeting Ads */}
                    <div className="relative rounded-xl bg-card border border-border/40 p-3 md:p-4">
                      <div className="flex items-stretch gap-3">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border-2 border-orange-500/30 bg-orange-500/10 text-orange-500">
                            🔥2
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Radio className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            <h3 className="text-sm font-bold text-foreground">Retargeting Ads</h3>
                            <Badge className="text-[9px] bg-orange-500/10 text-orange-500 border-orange-500/20 px-1.5 py-0">$6,000</Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mb-2">
                            Re-engage <strong className="text-foreground">warm visitors</strong> who saw clips but didn't convert. Meta + TikTok retargeting pixels on all funnel pages.
                          </p>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1 bg-accent border border-primary/10 rounded-full px-2 py-0.5">
                              <Zap className="w-3 h-3 text-orange-500" />
                              <span className="text-[10px] font-medium text-accent-foreground">2nd-touch conversion → 3-5x ROAS</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex justify-center py-1">
                <div className="w-0.5 h-6 bg-gradient-to-b from-orange-500/30 to-emerald-500/30" />
              </div>

              {/* ── Pre-Funnel: Viral Lead Gen ── */}
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between gap-2 py-3 px-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 mb-2">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-black uppercase tracking-wider text-emerald-400">Pre-Funnel — Viral Lead Gen Strategies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">2 strategies · K=1.8–4.2</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 mb-2">
                    {PRE_FUNNEL_STEPS.map((step, i) => (
                      <div key={step.id}>
                        <FunnelStepCard step={step} index={i} baseStep={null} getConv={getConv} navigate={navigate} stepNumber={`0${i + 1}`} />

                        {/* ═══ Embed Calculator after Clipper Campaign step (id 0.2) ═══ */}
                        {step.id === 0.2 && (
                          <div className="mt-3 mb-3">
                            <Card className="border-primary/20">
                              <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-base flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" /> Clippers Campaign Calculator</CardTitle>
                                    <CardDescription>Andrew Tate Formula — Editable inputs. Preset: $3/clip, $3K budget fully deployed, 3K views/clip</CardDescription>
                                  </div>
                                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                                    <Video className="w-3 h-3 mr-1" /> Live Model
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 md:p-6 space-y-5">
                                {/* Editable Inputs */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                  {[
                                    { label: "# Clippers", value: clippers, set: setClippers, icon: Users, tip: "Number of content creators posting clips for your campaign" },
                                    { label: "Videos / Clipper", value: videosPerClipper, set: setVideosPerClipper, icon: Video, tip: "Average number of videos each clipper posts" },
                                    { label: "Avg Views / Clip", value: viewsPerClip, set: setViewsPerClip, icon: Eye, tip: "Average views per clip. Industry avg for short-form is 2K-10K" },
                                    { label: "$ per Clip", value: pricePerClip, set: setPricePerClip, icon: DollarSign, step: 0.01, tip: "Cost you pay per clip submitted. Higher = more creators attracted" },
                                    { label: "Campaign Budget", value: campaignBudget, set: setCampaignBudget, icon: DollarSign, tip: "Total budget for the test campaign. Determines max clips you can afford" },
                                  ].map((inp) => (
                                    <div key={inp.label}>
                                      <MetricLabel label={inp.label} tip={inp.tip} />
                                      <Input
                                        type="number"
                                        value={inp.value}
                                        step={(inp as any).step ?? 1}
                                        min={0}
                                        onChange={(e) => inp.set(Number(e.target.value))}
                                        className="h-9 text-sm font-medium mt-1"
                                      />
                                    </div>
                                  ))}
                                </div>

                                {/* Total Clips Card */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                  <Card className="border bg-card">
                                    <CardContent className="p-3">
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <Video className="h-3.5 w-3.5 text-primary" />
                                        <MetricLabel label="Total Clips" tip="Total videos produced: Clippers × Videos per Clipper" />
                                      </div>
                                      <p className="text-2xl font-black text-foreground">{base.totalClips.toLocaleString()}</p>
                                      <p className="text-[10px] text-muted-foreground">{clippers} clippers × {videosPerClipper} vids</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="border bg-card">
                                    <CardContent className="p-3">
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <Eye className="h-3.5 w-3.5 text-primary" />
                                        <MetricLabel label="Total Views" tip="Total impressions: Clips × Avg Views per Clip" />
                                      </div>
                                      <p className="text-2xl font-black text-foreground">{(base.totalViews / 1000).toFixed(0)}K</p>
                                      <p className="text-[10px] text-muted-foreground">{(viewsPerClip / 1000).toFixed(0)}K avg/clip</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="border bg-card">
                                    <CardContent className="p-3">
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <DollarSign className="h-3.5 w-3.5 text-primary" />
                                        <MetricLabel label="Clipper Cost" tip="Total spend on clips: Total Clips × Price per Clip" />
                                      </div>
                                      <p className="text-2xl font-black text-foreground">${base.clipperCost.toLocaleString()}</p>
                                      <p className="text-[10px] text-muted-foreground">Budget: ${campaignBudget.toLocaleString()}</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="border bg-card">
                                    <CardContent className="p-3">
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <Users className="h-3.5 w-3.5 text-primary" />
                                        <MetricLabel label="Funnel Visitors" tip="People who click through from clips to your site. Assumes 1.2% CTR" />
                                      </div>
                                      <p className="text-2xl font-black text-foreground">{base.visitors.toLocaleString()}</p>
                                      <p className="text-[10px] text-muted-foreground">1.2% clip→site CTR</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="border bg-card">
                                    <CardContent className="p-3">
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                                        <MetricLabel label="Projected Revenue" tip="Total revenue generated from all funnel tiers + downsell conversions" />
                                      </div>
                                      <p className="text-2xl font-black text-primary">${base.totalRevenue.toLocaleString()}</p>
                                      <p className="text-[10px] text-muted-foreground">{base.roi.toFixed(1)}x ROI</p>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* RPM / LTV / CAC / K-Factor */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {[
                                    { label: "RPM", value: `$${rpm.toFixed(2)}`, tip: "Revenue Per Mille — revenue generated per 1,000 views." },
                                    { label: "LTV", value: `$${ltv.toFixed(2)}`, tip: "Lifetime Value — average revenue per funnel visitor." },
                                    { label: "CAC", value: `$${cac.toFixed(2)}`, tip: "Customer Acquisition Cost — clipper payouts per visitor." },
                                    { label: "K-Factor", value: avgKFactor.toFixed(1), tip: "Viral coefficient — K>1 means organic growth. We average K=2.1." },
                                  ].map((m, i) => (
                                    <Card key={i} className={`border ${m.label === "K-Factor" ? "border-primary/30 bg-primary/[0.03]" : "bg-card"}`}>
                                      <CardContent className="p-3 text-center">
                                        <MetricLabel label={m.label} tip={m.tip} />
                                        <p className={`text-xl font-black mt-1 ${m.label === "K-Factor" ? "text-primary" : cac > 0 && m.label === "LTV" && ltv > cac ? "text-primary" : "text-foreground"}`}>
                                          {m.value}
                                        </p>
                                        {m.label === "LTV" && cac > 0 && (
                                          <p className={`text-[9px] font-bold ${ltv > cac ? "text-primary" : "text-destructive"}`}>
                                            {ltv > cac ? `✅ LTV > CAC (${(ltv / cac).toFixed(1)}x)` : "⚠️ LTV < CAC"}
                                          </p>
                                        )}
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {i < PRE_FUNNEL_STEPS.length - 1 && (
                          <div className="flex justify-center py-0.5">
                            <ArrowDown className="w-4 h-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex justify-center py-1">
                <div className="w-0.5 h-6 bg-gradient-to-b from-emerald-500/30 to-blue-500/30" />
              </div>

              {/* ── Stage 1: Cold Traffic ── */}
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between gap-2 py-3 px-4 rounded-xl border-2 border-blue-500/30 bg-blue-500/5 mb-2">
                    <div className="flex items-center gap-2">
                      <Snowflake className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-black uppercase tracking-wider text-blue-400">Stage 1 — Cold Traffic Acquisition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">4 steps · Auth gate + science hooks</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 mb-2">
                    {COLD_TRAFFIC_STEPS.map((step, i) => (
                      <div key={step.id}>
                        <FunnelStepCard step={step} index={i} baseStep={base.steps[i]} getConv={getConv} navigate={navigate} stepNumber={`${step.id}`} />
                        {i < COLD_TRAFFIC_STEPS.length - 1 && (
                          <div className="flex justify-center py-0.5">
                            <ArrowDown className="w-4 h-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex justify-center py-1">
                <div className="w-0.5 h-6 bg-gradient-to-b from-blue-500/30 to-amber-500/30" />
              </div>

              {/* ── Stage 2: Fidelización ── */}
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between gap-2 py-3 px-4 rounded-xl border-2 border-amber-500/30 bg-amber-500/5 mb-2">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-amber-400" />
                      <span className="text-sm font-black uppercase tracking-wider text-amber-400">Stage 2 — Fidelización & Viral Loops</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">2 steps · WhatsApp + weekly SMS</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 mb-2">
                    {FIDELIZATION_STEPS.map((step, i) => {
                      const idx = COLD_TRAFFIC_STEPS.length + i;
                      return (
                        <div key={step.id}>
                          <FunnelStepCard step={step} index={idx} baseStep={base.steps[idx]} getConv={getConv} navigate={navigate} stepNumber={`${step.id}`} />
                          {i < FIDELIZATION_STEPS.length - 1 && (
                            <div className="flex justify-center py-0.5">
                              <ArrowDown className="w-4 h-4 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="flex justify-center py-1">
                <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500/30 to-primary/30" />
              </div>

              {/* ── Stage 3: Ascensión ── */}
              <Collapsible defaultOpen>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between gap-2 py-3 px-4 rounded-xl border-2 border-primary/30 bg-primary/5 mb-2">
                    <div className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-primary" />
                      <span className="text-sm font-black uppercase tracking-wider text-primary">Stage 3 — Ascensión & Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">5 tiers · $22 → $4,444</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2">
                    {ASCENSION_STEPS.map((step, i) => {
                      const idx = COLD_TRAFFIC_STEPS.length + FIDELIZATION_STEPS.length + i;
                      return (
                        <div key={step.id}>
                          <FunnelStepCard step={step} index={idx} baseStep={base.steps[idx]} getConv={getConv} navigate={navigate} stepNumber={`${step.id}`} />
                          {i < ASCENSION_STEPS.length - 1 && (
                            <div className="flex items-center gap-3 ml-5 pl-[14px] border-l-2 border-dashed border-muted-foreground/20 py-1">
                              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                <ArrowDown className="w-3 h-3" />
                                <span>Skip → $11/mo downsell ({Math.round(DOWNSELL_RATE * 100)}%)</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Summary footer */}
              <div className="mt-5 pt-4 border-t border-border/40 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-lg font-black text-primary">{base.visitors.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Funnel Entry</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-foreground">{base.steps[base.steps.length - 1]?.converted || 0}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Ambassadors</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-primary">${base.totalRevenue.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Projected Revenue</p>
                </div>
              </div>

              {/* Logo bottom */}
              <div className="flex justify-center mt-5">
                <img src={logoImg} alt="IamBlessedAF" className="h-7 opacity-40" />
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ═══ GAMIFICATION & K-FACTOR BOOST ═══ */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-primary/20">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> Gamification & K-Factor Boost</CardTitle>
                  <CardDescription>Retention engines that multiply viral loops and lifetime value</CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                  <Zap className="w-3 h-3 mr-1" /> Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4">
              {/* Portal */}
              <div className="bg-card border border-border/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Ambassador Portal</h3>
                      <p className="text-[11px] text-muted-foreground">/portal — Retention & engagement hub</p>
                    </div>
                  </div>
                  <button onClick={() => navigate("/portal")} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                    <ExternalLink className="w-3 h-3" /> Visit
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: "BC Wallet", desc: "Virtual currency + daily streak bonuses", icon: "🪙" },
                    { label: "Leaderboard", desc: "Global rankings drive competition", icon: "🏆" },
                    { label: "Missions", desc: "Daily/weekly tasks for BC rewards", icon: "🎯" },
                    { label: "Rewards Store", desc: "8 items: wristbands, shoutouts, credits", icon: "🛒" },
                  ].map((m, i) => (
                    <div key={i} className="bg-accent/50 border border-border/30 rounded-lg p-2.5">
                      <p className="text-sm mb-0.5">{m.icon}</p>
                      <p className="text-[11px] font-bold text-foreground">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">K-Factor Impact:</strong> Portal's 12-method earn hierarchy + social sharing templates drive K=2.1 average. 
                    ShareMilestoneTracker awards BC at 1, 3, 5, 10, 25 shares. Activity feed pads real events with simulated actions for social momentum.
                  </p>
                </div>
              </div>

              {/* Clipper Dashboard */}
              <div className="bg-card border border-border/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Video className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Clipper Dashboard</h3>
                      <p className="text-[11px] text-muted-foreground">/clipper-dashboard — Creator retention engine</p>
                    </div>
                  </div>
                  <button onClick={() => navigate("/clipper-dashboard")} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                    <ExternalLink className="w-3 h-3" /> Visit
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: "Identity Badges", desc: "New → Verified → Proven → Super Clipper", icon: "🏅" },
                    { label: "Weekly Snapshot", desc: "Progress bars with 'Perceived Acceleration'", icon: "📊" },
                    { label: "Analytics Tab", desc: "Personal views, earnings, performance", icon: "📈" },
                    { label: "Milestone Track", desc: "Starter → Consistent → Machine → Legend", icon: "🎮" },
                  ].map((m, i) => (
                    <div key={i} className="bg-accent/50 border border-border/30 rounded-lg p-2.5">
                      <p className="text-sm mb-0.5">{m.icon}</p>
                      <p className="text-[11px] font-bold text-foreground">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Retention Strategy:</strong> Mobile-first layout prioritizes momentum over data density. 
                    Dopamine-based activation triggers for first-time clippers + urgency prompts for low daily output. 
                    100 BC/clip earned links directly to Portal Rewards Store.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ═══ TABS: Projections · Conversions · Revenue ═══ */}
        <Tabs defaultValue="projections" className="space-y-4">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="projections" className="gap-1"><Settings2 className="h-3.5 w-3.5" /> Projections</TabsTrigger>
            <TabsTrigger value="conversions" className="gap-1"><Target className="h-3.5 w-3.5" /> Conversions</TabsTrigger>
            <TabsTrigger value="revenue" className="gap-1"><TrendingUp className="h-3.5 w-3.5" /> Revenue</TabsTrigger>
          </TabsList>

          {/* ─── TAB: Projections ─── */}
          <TabsContent value="projections" className="space-y-4">
            {/* 3-Scenario Comparison Table */}
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <Card className="cursor-pointer hover:border-primary/20 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">3-Scenario Projections</CardTitle>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
              <Card className="mt-1 border-t-0 rounded-t-none">
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Metric</TableHead>
                      {SCENARIOS.map((s) => (
                        <TableHead key={s.key} className="text-xs text-center">{s.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { label: "Funnel Visitors", key: "visitors" },
                      { label: "Clipper Cost", key: "clipperCost", fmt: "$" },
                      { label: "Total Revenue", key: "totalRevenue", fmt: "$" },
                      { label: "Downsell Revenue", key: "downsellRevenue", fmt: "$" },
                      { label: "ROI", key: "roi", fmt: "x" },
                      { label: "Day 1 Sales", key: "day1", fmt: "$" },
                      { label: "Day 7 Sales", key: "day7", fmt: "$" },
                      { label: "Day 30 Sales", key: "day30", fmt: "$" },
                    ].map((row) => (
                      <TableRow key={row.key}>
                        <TableCell className="text-xs font-medium">{row.label}</TableCell>
                        {projections.map((p, i) => (
                          <TableCell key={i} className="text-center text-sm font-semibold" style={{ color: SCENARIOS[i].color }}>
                            {row.fmt === "$" ? `$${(p as any)[row.key].toLocaleString()}` : row.fmt === "x" ? `${(p as any)[row.key].toFixed(1)}x` : (p as any)[row.key].toLocaleString()}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Editable Conversion Rates per Step */}
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <Card className="cursor-pointer hover:border-primary/20 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg md:text-xl font-black text-foreground mb-1">Think this is too Optimistic? 🤔</h3>
                        <CardTitle className="text-sm text-primary">Play with the Numbers here...</CardTitle>
                        <CardDescription className="text-xs">Edit conversion rates to model custom scenarios · Click to expand</CardDescription>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="mt-1 border-t-0 rounded-t-none">
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs w-8">#</TableHead>
                      <TableHead className="text-xs">Step</TableHead>
                      <TableHead className="text-xs">Sells</TableHead>
                      <TableHead className="text-xs text-center w-24">Conv %</TableHead>
                      <TableHead className="text-xs text-right">Entering</TableHead>
                      <TableHead className="text-xs text-right">Converted</TableHead>
                      <TableHead className="text-xs text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {base.steps.map((step) => (
                      <TableRow key={step.id} className={[9, 10, 11].includes(step.id) ? "opacity-60" : ""}>
                        <TableCell className="text-xs text-muted-foreground">
                          {step.id}
                          {[9, 10, 11].includes(step.id) && <span className="ml-1">🚧</span>}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {step.name}
                          {[9, 10, 11].includes(step.id) && (
                            <Badge variant="outline" className="ml-1.5 text-[8px] py-0 px-1 border-amber-500/40 text-amber-500">Under Construction</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-[11px] text-muted-foreground max-w-[160px] truncate">{step.sells}</TableCell>
                        <TableCell className="text-center p-1">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={Math.round(getConv(step) * 100)}
                            onChange={(e) => setConvOverrides((prev) => ({ ...prev, [step.id]: Number(e.target.value) / 100 }))}
                            className="h-7 w-16 text-xs text-center mx-auto"
                          />
                        </TableCell>
                        <TableCell className="text-xs text-right">{step.entering.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-right font-medium">{step.converted.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-right font-semibold text-primary">{step.revenue > 0 ? `$${step.revenue.toLocaleString()}` : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>

          {/* ─── TAB: Conversions ─── */}
          <TabsContent value="conversions" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Conversion vs Skip Rate</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={{ "Conv %": { label: "Converted", color: "hsl(var(--primary))" }, "Skip %": { label: "Skipped", color: "hsl(var(--muted))" } }} className="h-[280px]">
                    <BarChart data={convChartData} layout="vertical" margin={{ left: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="Conv %" stackId="a" fill="hsl(var(--primary))" />
                      <Bar dataKey="Skip %" stackId="a" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Funnel Drop-off (Visitors)</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={{ value: { label: "Visitors", color: "hsl(var(--primary))" } }} className="h-[280px]">
                    <BarChart data={funnelChartData} margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Downsell Performance ($11/mo)</CardTitle></CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Stage</TableHead>
                      <TableHead className="text-xs text-right">Skipped</TableHead>
                      <TableHead className="text-xs text-right">Downsell Accepted</TableHead>
                      <TableHead className="text-xs text-right">Downsell Rev</TableHead>
                      <TableHead className="text-xs text-right">Accept Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {base.steps.filter((s) => (TIER_PRICES[s.id] ?? 0) > 0).map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs font-medium">{s.name}</TableCell>
                        <TableCell className="text-xs text-right">{s.skipped.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-right">{s.downsellConverted}</TableCell>
                        <TableCell className="text-xs text-right font-medium">${(s.downsellConverted * DOWNSELL_PRICE).toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-right">{s.skipped > 0 ? `${((s.downsellConverted / s.skipped) * 100).toFixed(1)}%` : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── TAB: Revenue ─── */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue by Tier (Base Case)</CardTitle></CardHeader>
                <CardContent>
                  <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--primary))" } }} className="h-[280px]">
                    <BarChart data={revenueByTier}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Sales Timeline — 3 Scenarios</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {SCENARIOS.map((s, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-24" style={{ color: s.color }}>{s.label}</span>
                        <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                          {(["day1", "day7", "day30"] as const).map((d) => (
                            <div key={d}>
                              <p className="text-[10px] text-muted-foreground">{d === "day1" ? "Day 1" : d === "day7" ? "Day 7" : "Day 30"}</p>
                              <p className="text-sm font-bold" style={{ color: s.color }}>${(projections[i] as any)[d].toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Split: Funnel vs Downsell</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-foreground">${(base.totalRevenue - base.downsellRevenue).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Funnel Tiers</p>
                </div>
                <Separator orientation="vertical" className="h-12 hidden md:block" />
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary">${base.downsellRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">$11/mo Downsell</p>
                </div>
                <Separator orientation="vertical" className="h-12 hidden md:block" />
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-foreground">${base.clipperCost.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Clipper Cost</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer with Logo */}
        <div className="flex flex-col items-center gap-2 py-6">
          <img src={logoImg} alt="IamBlessedAF" className="h-8 opacity-40" />
          <p className="text-center text-[10px] text-muted-foreground">
            Gratitude Engine™ · Funnel Command Center · Projections are estimates based on editable inputs
          </p>
        </div>
      </main>
    </div>
  );
}
