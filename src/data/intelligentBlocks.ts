import {
  ScrollText, Brain, Flame, Zap, Award, Users, Settings, DollarSign, Eye, Target,
  BarChart3, ShieldAlert, Clock, AlertTriangle, AlertCircle, TrendingUp, Gauge, Trophy, CreditCard,
} from "lucide-react";

export type BlockDef = {
  name: string;
  category: string;
  component: string;
  usedIn: string[];
  desc: string;
  icon: any;
  liveValue?: string | number;
};

export type BlockLiveData = {
  activatedClips: number;
  totalClips: number;
  clippersCount: number;
  earnersCount: number;
  throttledSegs: number;
  totalSegs: number;
  pendingClips: number;
  cycleStatus: string;
  segmentCyclesCount: number;
  approvedSegCycles: number;
  activityCount: number;
  orderCount: number;
};

export function getBlocks(live: BlockLiveData): BlockDef[] {
  return [
    // ─── Content Blocks ───
    { name: "Expert Quotes", category: "Content", component: "GrokQuotesSection / GptQuotesSection", usedIn: ["/offer/111", "/offer/111-grok", "/offer/111-gpt"], desc: "Huberman, Tony Robbins & Joe Dispenza quotes with author avatars. Grok=clinical tone, GPT=warm tone.", icon: ScrollText, liveValue: "3 quotes × 3 variants" },
    { name: "Hawkins Scale", category: "Content", component: "Inline <img> hawkins-scale.jpg", usedIn: ["/offer/111", "/offer/111-grok", "/offer/111-gpt"], desc: "Dr. Hawkins' Consciousness Scale image (20Hz→540Hz). Anchors the '27× happier' claim.", icon: Brain, liveValue: "27× multiplier" },
    { name: "Research List", category: "Content", component: "ResearchList", usedIn: ["/offer/111", "/offer/111-grok", "/offer/111-gpt"], desc: "'Backed by Science' section with peer-reviewed study citations.", icon: ScrollText },
    { name: "Epiphany Bridge", category: "Content", component: "EpiphanyBridge", usedIn: ["/offer/111"], desc: "Brunson-style storytelling bridge from problem to solution.", icon: Brain },
    { name: "Gratitude Engine Loop™", category: "Content", component: "GratitudeEngineLoop", usedIn: ["/", "/challenge"], desc: "Locked Huberman video + mPFC tooltip. Core neuroscience trigger.", icon: Flame },
    { name: "I AM Branding", category: "Content", component: "Inline section + logo", usedIn: ["/offer/111", "/offer/111-grok", "/offer/111-gpt", "/"], desc: "'I AM' identity encoding section with Tony Robbins quote and brand logo.", icon: Zap },

    // ─── Product Blocks ───
    { name: "Wristband Product Card", category: "Product", component: "ProductSections (wristband)", usedIn: ["/offer/111", "/offer/111-grok", "/offer/111-gpt", "/offer/22", "/"], desc: "Neuro-Hacker Wristband showcase: waterproof nylon, debossed, FREE badge + $11 strikethrough.", icon: Award, liveValue: `${live.orderCount} orders` },
    { name: "Friend Shirt Section", category: "Product", component: "FriendShirtSection", usedIn: ["/offer/111", "/offer/111-grok", "/offer/111-gpt"], desc: "Custom shirt preview with friend name personalization, model gallery, and video.", icon: Users },
    { name: "Shirt Customizer", category: "Product", component: "ShirtCustomizer", usedIn: ["/offer/111", "/offer/111-grok", "/offer/111-gpt"], desc: "Interactive shirt message editor — saves friendShirtName + friendShirtMessage to localStorage.", icon: Settings },
    { name: "Shopify Cart", category: "Product", component: "ShopifyStyleCart", usedIn: ["/offer/111", "/offer/111-grok", "/offer/111-gpt"], desc: "TEMU/Shopify-style itemized cart with FREE badges, coupon breakdown, and savings summary.", icon: DollarSign },
    { name: "Product Sections", category: "Product", component: "ProductSections", usedIn: ["/offer/111", "/offer/111-grok", "/offer/111-gpt"], desc: "Full product grid: shirts + wristbands with gallery, zoom modals, and afterWristband CTA slot.", icon: Eye },

    // ─── CTA & Conversion Blocks ───
    { name: "CTA Block (Grok)", category: "CTA", component: "GrokCtaBlock", usedIn: ["/offer/111-grok"], desc: "ROI-math CTA with scarcity counter. Data-driven copy.", icon: Target },
    { name: "CTA Block (GPT)", category: "CTA", component: "GptCtaBlock", usedIn: ["/offer/111-gpt"], desc: "Warm emotional CTA with heart-centered copy.", icon: Target },
    { name: "CTA Block ($444)", category: "CTA", component: "Grok444CtaBlock", usedIn: ["/offer/444"], desc: "Habit-lock tier CTA — 1,111 meals.", icon: Target },
    { name: "CTA Block ($1111)", category: "CTA", component: "Grok1111CtaBlock", usedIn: ["/offer/1111"], desc: "Kingdom Ambassador CTA — 11,111 meals.", icon: Target },
    { name: "CTA Block ($4444)", category: "CTA", component: "Grok4444CtaBlock", usedIn: ["/offer/4444"], desc: "Terminal Ambassador CTA — custom leather jacket + NFT.", icon: Target },
    { name: "Discount Banner", category: "CTA", component: "DiscountBanner", usedIn: ["/offer/111", "/offer/111-grok", "/offer/111-gpt"], desc: "'77% OFF TODAY' red badge with strikethrough pricing.", icon: DollarSign },

    // ─── Hero Blocks ───
    { name: "Hero (Grok $111)", category: "Hero", component: "GrokHeroSection", usedIn: ["/offer/111-grok"], desc: "$111 ÷ 365 = $0.30/day ROI math headline + Harvard 85-year study bridge.", icon: BarChart3 },
    { name: "Hero (GPT $111)", category: "Hero", component: "GptHeroSection", usedIn: ["/offer/111-gpt"], desc: "Warm storytelling hero — 'custom shirt for your best friend'.", icon: BarChart3 },
    { name: "Hero ($444)", category: "Hero", component: "Grok444HeroSection", usedIn: ["/offer/444"], desc: "$444 ÷ 365 = $1.22/day. 5 shirts + 14 wristbands.", icon: BarChart3 },
    { name: "Hero ($1111)", category: "Hero", component: "Grok1111HeroSection", usedIn: ["/offer/1111"], desc: "Kingdom Ambassador — 7 black shirts + 11 friend shirts + 111 wristbands.", icon: BarChart3 },
    { name: "Hero ($4444)", category: "Hero", component: "Grok4444HeroSection", usedIn: ["/offer/4444"], desc: "Custom leather jacket + artist patronage + NFT ownership.", icon: BarChart3 },
    { name: "Landing Hero", category: "Hero", component: "Index page inline", usedIn: ["/"], desc: "'Feel Up to 27× Happier in 3 Days' — auth gate CTA with wristband visual.", icon: BarChart3 },

    // ─── Trust & Social Proof ───
    { name: "Social Proof", category: "Trust", component: "SocialProofSection", usedIn: ["/offer/111", "/offer/111-grok", "/offer/111-gpt"], desc: "Testimonial cards + live metrics. Two variants: 'story' (warm) and 'data' (clinical).", icon: Users },
    { name: "Risk Reversal (Grok)", category: "Trust", component: "GrokRiskReversal", usedIn: ["/offer/111-grok"], desc: "Green checkmarks: 11 meals donated, SSL, free US shipping.", icon: ShieldAlert },
    { name: "Risk Reversal (GPT)", category: "Trust", component: "GptRiskReversal", usedIn: ["/offer/111-gpt"], desc: "Heart emojis: 'Our Promise to You' warm guarantee.", icon: ShieldAlert },
    { name: "Gratitude Guarantee", category: "Trust", component: "RiskReversalGuarantee", usedIn: ["/offer/111"], desc: "'Gratitude Guarantee' badge — 11 meals in honor of neuroscience.", icon: ShieldAlert },
    { name: "Author Avatar", category: "Trust", component: "AuthorAvatar", usedIn: ["/offer/111", "/offer/111-grok", "/offer/111-gpt"], desc: "Huberman, Tony Robbins, Joe Dispenza photo + credentials badge.", icon: Users },

    // ─── Urgency & Scarcity ───
    { name: "Offer Timer", category: "Urgency", component: "OfferTimer", usedIn: ["/offer/111"], desc: "Countdown timer for checkout urgency.", icon: Clock },
    { name: "Urgency Banner", category: "Urgency", component: "UrgencyBanner", usedIn: ["/offer/111"], desc: "Exit-intent triggered stock decay + viewer count.", icon: AlertTriangle },
    { name: "Mystery Box Badge", category: "Urgency", component: "Inline badge", usedIn: ["/offer/111", "/offer/111-grok", "/offer/111-gpt"], desc: "'🎉 You Won a FREE Custom Shirt From the Mystery Box!' unlock badge.", icon: Award },
    { name: "Downsell Modal", category: "Urgency", component: "DownsellModal", usedIn: ["/offer/111", "/offer/111-grok", "/offer/111-gpt"], desc: "Exit-intent modal: $11/mo alternative offer.", icon: AlertCircle },

    // ─── Viral & Gamification ───
    { name: "Viral Footer", category: "Viral", component: "GrokViralFooter", usedIn: ["/offer/111-grok"], desc: "Post-offer viral share + skip link.", icon: TrendingUp },
    { name: "Viral Share Nudge", category: "Viral", component: "ViralShareNudge", usedIn: ["/offer/111"], desc: "Cross-funnel WhatsApp/SMS share prompt.", icon: TrendingUp },
    { name: "Impact Counter", category: "Viral", component: "ImpactCounter", usedIn: ["/offer/111"], desc: "Global meals donated counter with animation.", icon: Gauge },
    { name: "Gamification Header", category: "Viral", component: "GamificationHeader", usedIn: ["/", "/offer/111", "/offer/111-grok", "/offer/111-gpt", "/offer/444", "/offer/1111", "/offer/4444"], desc: "Top bar with BC coins, streak, and progress. Present on all funnel pages.", icon: Trophy },

    // ─── Value Stacks ───
    { name: "Value Stack (Grok)", category: "Value Stack", component: "GrokValueStack", usedIn: ["/offer/111-grok"], desc: "Benefits-first bullet list — data-driven, ROI focus.", icon: Zap },
    { name: "Value Stack (GPT)", category: "Value Stack", component: "GptValueStack", usedIn: ["/offer/111-gpt"], desc: "Emotion-first benefit list — warm, story-driven.", icon: Zap },
    { name: "Value Stack ($444)", category: "Value Stack", component: "Grok444ValueStack", usedIn: ["/offer/444"], desc: "5 shirts + 14 wristbands + 1,111 meals stack.", icon: Zap },
    { name: "Value Stack ($1111)", category: "Value Stack", component: "Grok1111ValueStack", usedIn: ["/offer/1111"], desc: "7+11 shirts + 111 wristbands + 11,111 meals.", icon: Zap },
    { name: "Value Stack ($4444)", category: "Value Stack", component: "Grok4444ValueStack", usedIn: ["/offer/4444"], desc: "Leather jacket + NFT + artist patronage.", icon: Zap },

    // ─── System Blocks (live DB) ───
    { name: "Activation Badge", category: "System", component: "ClipActivationGate", usedIn: ["/clipper-dashboard"], desc: `${live.activatedClips} clips verified / ${live.totalClips} total`, icon: Zap, liveValue: live.activatedClips },
    { name: "Bonus Card", category: "System", component: "ClipperBonusLadder", usedIn: ["/clipper-dashboard", "/Gratitude-Clips-Challenge"], desc: `${live.clippersCount} clippers tracked`, icon: Trophy, liveValue: live.earnersCount },
    { name: "Risk Banner", category: "System", component: "RiskThrottleIndicator", usedIn: ["/clipper-dashboard", "/admin"], desc: `${live.throttledSegs} segments throttled/killed of ${live.totalSegs}`, icon: ShieldAlert, liveValue: live.throttledSegs },
    { name: "Pending Queue", category: "System", component: "ClipperMyClips", usedIn: ["/clipper-dashboard", "/admin"], desc: `${live.pendingClips} clips awaiting review`, icon: Clock, liveValue: live.pendingClips },
    { name: "Payment Timeline", category: "System", component: "ClipperPayoutHistory", usedIn: ["/clipper-dashboard", "/admin"], desc: `Cycle: ${live.cycleStatus} · ${live.segmentCyclesCount} segment cycles`, icon: CreditCard, liveValue: live.approvedSegCycles },
    { name: "Activity Feed", category: "System", component: "PortalActivityFeed", usedIn: ["/portal", "/admin"], desc: "Portal activity events (live stream)", icon: AlertCircle, liveValue: live.activityCount },
  ];
}

export const BLOCK_CATEGORY_COLORS: Record<string, string> = {
  Content: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Product: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  CTA: "bg-primary/10 text-primary border-primary/20",
  Hero: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Trust: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Urgency: "bg-red-500/10 text-red-500 border-red-500/20",
  Viral: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  "Value Stack": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  System: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
};
