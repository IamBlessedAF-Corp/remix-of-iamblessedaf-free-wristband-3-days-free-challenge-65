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
import {
  TrendingUp, Users, DollarSign, Eye, Video, ArrowRight, ArrowDown, Zap, Target, BarChart3,
  Settings2, Sparkles, Gift, Brain, Share2, Repeat, MessageSquare, Crown, RefreshCw,
  Info, Calculator, Rocket, Snowflake, Heart, Star, ShoppingBag, Megaphone
} from "lucide-react";
import { motion } from "framer-motion";
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

/* ─── Funnel Stages (Cold → Fidelización → Ascensión) ─── */
const COLD_TRAFFIC_STEPS = [
  { id: 1, route: "/", name: "Free Wristband", sells: "Lead capture (wristband gratis)", defaultConv: 0.65, icon: Gift, vitality: "Auth Gate → 100% capture", kFactor: "K=1.0" },
  { id: 2, route: "Intro", name: "Science Hook", sells: "Educación — Hawkins 27x", defaultConv: 0.85, icon: Brain, vitality: "Science hooks → credibility" },
  { id: 3, route: "Setup", name: "Friend Capture", sells: "Name Your Best Friend", defaultConv: 0.78, icon: Users, vitality: "Friend naming → referral seed", kFactor: "K=3.0" },
  { id: 4, route: "Checkout", name: "Wristband Checkout", sells: "$9.95 ship → 11 meals", defaultConv: 0.35, icon: ShoppingBag, vitality: "Pay It Forward guilt loop", kFactor: "K=1.5" },
];

const FIDELIZATION_STEPS = [
  { id: 5, route: "/challenge/thanks", name: "Viral Activation", sells: "WhatsApp share + BC rewards", defaultConv: 0.42, icon: Share2, vitality: "WhatsApp viral share", kFactor: "K=2.7" },
  { id: 6, route: "TGF Fridays", name: "Weekly Reactivation", sells: "Cron SMS → gratitude msg", defaultConv: 0.60, icon: Repeat, vitality: "Auto friend rotation" },
];

const ASCENSION_STEPS = [
  { id: 7, route: "/offer/22", name: "$22 Starter Pack", sells: "3 wristbands ($22)", defaultConv: 0.18, icon: Gift, vitality: "Stock decay FOMO", price: 22 },
  { id: 8, route: "/offer/111", name: "$111 Identity Pack", sells: "Shirt + wristbands ($111)", defaultConv: 0.08, icon: Star, vitality: "Mystery Box framing", price: 111 },
  { id: 9, route: "/offer/444", name: "$444 Habit Lock", sells: "1,111 meals ($444)", defaultConv: 0.035, icon: Heart, vitality: "Chained transition", price: 444 },
  { id: 10, route: "/offer/1111", name: "$1,111 Kingdom", sells: "11,111 meals ($1,111)", defaultConv: 0.012, icon: Crown, vitality: "ROI math + mission", price: 1111 },
  { id: 11, route: "/offer/4444", name: "$4,444 Ambassador", sells: "44,444 meals ($4,444)", defaultConv: 0.004, icon: Crown, vitality: "Portal unlock celebration", price: 4444 },
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

/* ─── Step Card ─── */
const FunnelStepCard = ({ step, index, baseStep, getConv }: { step: any; index: number; baseStep: any; getConv: (s: any) => number }) => {
  const isRevenue = !!step.price;
  const StepIcon = step.icon;
  return (
    <motion.div
      className={`relative flex items-stretch gap-3 rounded-xl p-3 md:p-4 transition-colors ${
        isRevenue ? "bg-primary/[0.04] border border-primary/15" : "bg-card border border-border/40"
      }`}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      {/* Step number */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border-2 ${
          isRevenue ? "border-primary bg-primary text-primary-foreground" : "border-primary/30 bg-primary/10 text-primary"
        }`}>
          <StepIcon className="w-4 h-4" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground">{step.name}</h3>
              {step.price && (
                <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20 px-1.5 py-0">
                  ${step.price}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{step.sells}</p>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-xs font-bold ${getConv(step) >= 0.5 ? "text-primary" : getConv(step) >= 0.1 ? "text-foreground" : "text-muted-foreground"}`}>
              {Math.round(getConv(step) * 100)}%
            </span>
            {baseStep && (
              <p className="text-[9px] text-muted-foreground">
                {baseStep.entering.toLocaleString()} → {baseStep.converted.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Vitality pill */}
        {step.vitality && (
          <div className="flex items-center gap-1.5 mt-1.5">
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
    </motion.div>
  );
};

export default function FunnelMap() {
  /* ─── Clipper Campaign Inputs (Andrew Tate Formula) ─── */
  const [clippers, setClippers] = useState(50);
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
      {/* ─── Header with Logo ─── */}
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="IamBlessedAF" className="h-7" />
            <div>
              <h1 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Funnel Command Center
              </h1>
              <p className="text-[10px] text-muted-foreground">Gratitude Engine™ — Executive Dashboard</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">Board-Ready</Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* ═══ EXECUTIVE SUMMARY ═══ */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.03] via-card to-card overflow-hidden">
            <CardContent className="p-5 md:p-7">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-black text-foreground leading-tight">
                    The Neuro-Hackers Movement
                  </h2>
                  <p className="text-xs text-primary font-bold mt-0.5">You're 3 minutes away per day to feel up to 27x happier</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                <strong className="text-foreground">IamBlessedAF</strong> is a <strong className="text-foreground">pay-it-forward gratitude movement</strong> backed by 
                top neuroscience PhDs. We help people feel up to <strong className="text-primary">27x happier</strong> (Dr. Hawkins PhD) by installing advanced neuro-hack triggers 
                to spark gratitude conversations. Backed by <strong className="text-foreground">Harvard's Grant Study (84+ years)</strong>, we scale the quality of your relationships.
              </p>
              
              {/* Growth Hacking Identity */}
              <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="w-4 h-4 text-primary" />
                  <span className="text-xs font-black text-foreground uppercase tracking-wider">Growth Hacking Campaign</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mixing <strong className="text-foreground">Dropbox's viral referral engine</strong> × <strong className="text-foreground">Ice Bucket Challenge's emotional virality</strong> × <strong className="text-foreground">Supreme's scarcity model</strong> — powered by the <strong className="text-primary">Andrew Tate Clippers Formula</strong>. 
                  Pay creators per clip, each clip drives traffic, each visitor enters a conversion funnel with built-in K-factor loops.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "Hawkins Scale", value: "27x", sub: "Happiness multiplier" },
                  { label: "Daily Habit", value: "3 min", sub: "Neuro-rewiring trigger" },
                  { label: "Harvard Study", value: "84 yrs", sub: "Longest research ever" },
                  { label: "Viral K-Factor", value: `K=${avgKFactor}`, sub: "Built-in friend loop" },
                ].map((m, i) => (
                  <div key={i} className="bg-background border border-border/40 rounded-lg p-3 text-center">
                    <p className="text-lg font-black text-primary">{m.value}</p>
                    <p className="text-[10px] font-bold text-foreground uppercase tracking-wider">{m.label}</p>
                    <p className="text-[9px] text-muted-foreground">{m.sub}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ═══ CLIPPERS CAMPAIGN CALCULATOR (Andrew Tate Formula) ═══ */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="border-primary/20">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" /> Clippers Campaign Calculator</CardTitle>
                  <CardDescription>Andrew Tate Formula — Editable inputs. Preset: $3/clip, $3K budget, 3K views/clip</CardDescription>
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

              {/* Total Clips Card (like the reference screenshot) */}
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
                  { label: "RPM", value: `$${rpm.toFixed(2)}`, tip: "Revenue Per Mille — revenue generated per 1,000 views. Higher RPM = more efficient content monetization." },
                  { label: "LTV", value: `$${ltv.toFixed(2)}`, tip: "Lifetime Value — average revenue per funnel visitor. Includes all tiers + downsell. Goal: LTV > CAC." },
                  { label: "CAC", value: `$${cac.toFixed(2)}`, tip: "Customer Acquisition Cost — how much you spend (clipper payouts) to get one visitor into the funnel." },
                  { label: "K-Factor", value: avgKFactor.toFixed(1), tip: "Viral coefficient — how many new users each user brings. K>1 means organic growth. We average K=2.1 across all loops." },
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
        </motion.section>

        {/* ═══ VISUAL FUNNEL FLOW (Cold → Fidelización → Ascensión) ═══ */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Funnel Flow & Vitality Engine</CardTitle>
                  <CardDescription>3-stage architecture: Cold Traffic → Fidelización → Ascensión</CardDescription>
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

              {/* ── Stage 1: Cold Traffic ── */}
              <StageLabel icon={Snowflake} label="Stage 1 — Cold Traffic Acquisition" color="border-blue-500/30 bg-blue-500/5 text-blue-400" />
              <div className="space-y-2 mb-2">
                {COLD_TRAFFIC_STEPS.map((step, i) => (
                  <div key={step.id}>
                    <FunnelStepCard step={step} index={i} baseStep={base.steps[i]} getConv={getConv} />
                    {i < COLD_TRAFFIC_STEPS.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <ArrowDown className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-center py-1">
                <div className="w-0.5 h-6 bg-gradient-to-b from-blue-500/30 to-amber-500/30" />
              </div>

              {/* ── Stage 2: Fidelización ── */}
              <StageLabel icon={Heart} label="Stage 2 — Fidelización & Viral Loops" color="border-amber-500/30 bg-amber-500/5 text-amber-400" />
              <div className="space-y-2 mb-2">
                {FIDELIZATION_STEPS.map((step, i) => {
                  const idx = COLD_TRAFFIC_STEPS.length + i;
                  return (
                    <div key={step.id}>
                      <FunnelStepCard step={step} index={idx} baseStep={base.steps[idx]} getConv={getConv} />
                      {i < FIDELIZATION_STEPS.length - 1 && (
                        <div className="flex justify-center py-0.5">
                          <ArrowDown className="w-4 h-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center py-1">
                <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500/30 to-primary/30" />
              </div>

              {/* ── Stage 3: Ascensión ── */}
              <StageLabel icon={Rocket} label="Stage 3 — Ascensión & Revenue" color="border-primary/30 bg-primary/5 text-primary" />
              <div className="space-y-2">
                {ASCENSION_STEPS.map((step, i) => {
                  const idx = COLD_TRAFFIC_STEPS.length + FIDELIZATION_STEPS.length + i;
                  return (
                    <div key={step.id}>
                      <FunnelStepCard step={step} index={idx} baseStep={base.steps[idx]} getConv={getConv} />
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">3-Scenario Projections</CardTitle>
              </CardHeader>
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

            {/* Editable Conversion Rates per Step */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Conversion Rates by Step</CardTitle>
                <CardDescription className="text-xs">Edit to model custom scenarios</CardDescription>
              </CardHeader>
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
                      <TableRow key={step.id}>
                        <TableCell className="text-xs text-muted-foreground">{step.id}</TableCell>
                        <TableCell className="text-xs font-medium">{step.name}</TableCell>
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
