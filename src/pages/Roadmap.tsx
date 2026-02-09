import { useState } from "react";
import { Map, ChevronDown, ChevronRight, CheckCircle2, Clock, AlertTriangle, Zap, Target, Shield, TrendingUp, Users, Gift, Star, Rocket, Crown, Lock, Globe, Sparkles, BarChart3, Megaphone, Cpu, ArrowLeft, Layers, Database, CreditCard, MessageSquare, Paintbrush, Server } from "lucide-react";

/* ─── Types ─── */
interface RoadmapItem {
  title: string;
  status: "done" | "in-progress" | "blocked" | "planned";
  priority?: "critical" | "high" | "medium" | "low";
  labels?: string[];
  detail?: string;
}

interface RoadmapPhase {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  status: "complete" | "active" | "upcoming" | "blocked";
  delegationScore?: number;
  items: RoadmapItem[];
}

/* ─── Status Helpers ─── */
const STATUS_ICON: Record<string, React.ElementType> = {
  done: CheckCircle2,
  "in-progress": Clock,
  blocked: AlertTriangle,
  planned: Target,
};

const STATUS_COLOR: Record<string, string> = {
  done: "text-emerald-500",
  "in-progress": "text-amber-500",
  blocked: "text-red-500",
  planned: "text-muted-foreground",
};

const PRIORITY_BADGE: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  medium: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  low: "bg-muted text-muted-foreground border-border",
};

const PHASE_HEADER: Record<string, string> = {
  complete: "border-l-emerald-500 bg-emerald-500/5",
  active: "border-l-amber-500 bg-amber-500/5",
  upcoming: "border-l-blue-500/50 bg-blue-500/5",
  blocked: "border-l-red-500 bg-red-500/5",
};

/* ─── Roadmap Data ─── */
const PHASES: RoadmapPhase[] = [
  {
    id: "foundation",
    icon: Shield,
    title: "Phase 1 — Foundation & Core Engine",
    subtitle: "Gratitude Challenge MVP, Authentication, Database Architecture",
    status: "complete",
    delegationScore: 92,
    items: [
      { title: "3-Day Gratitude Challenge landing page (/challenge)", status: "done", priority: "critical", detail: "Hero section, dual signup (Google OAuth + Email/Phone), micro-trust badges, mobile-first layout" },
      { title: "Thank You page (/challenge/thanks)", status: "done", priority: "high", detail: "Success animation, Day 1 preview, share-to-invite buttons" },
      { title: "Blessing Confirmation system (/confirm/:token)", status: "done", priority: "critical", detail: "Token-based confirmation, expiry logic, global counter integration" },
      { title: "Supabase database schema & RLS policies", status: "done", priority: "critical", detail: "12+ tables with row-level security: blessings, challenge_participants, orders, short_links, link_clicks, creator_profiles, bc_wallets, bc_transactions, board_cards, board_columns, portal_activity, sms_deliveries" },
      { title: "User authentication (email + admin roles)", status: "done", priority: "critical", detail: "user_roles table, has_role() function, admin gating on /board and /admin/links" },
      { title: "SMS notification system (Twilio)", status: "done", priority: "critical", labels: ["credentials-blocked"], detail: "Scheduled gratitude messages, reminder system, delivery tracking, webhook status updates" },
      { title: "Global meal counter & impact tracking", status: "done", priority: "high", detail: "get_total_meals_donated() function with tier-based calculation + 11,247 seed donations" },
    ],
  },
  {
    id: "funnel",
    icon: TrendingUp,
    title: "Phase 2 — Revenue Funnel (Hormozi $100M Framework)",
    subtitle: "Tiered offer stack, Stripe integration, Hook-Story-Stack architecture",
    status: "complete",
    delegationScore: 88,
    items: [
      { title: "$22 Starter Gift Pack (/offer/22)", status: "done", priority: "high", detail: "Free wristband step → upsell wristband pack, Stripe checkout, product gallery with zoom" },
      { title: "$111 Gratitude Pack (/offer/111)", status: "done", priority: "critical", detail: "Friend Shirt customizer, custom message module, epiphany bridge storytelling, risk reversal guarantee" },
      { title: "$111 A/B Variants (Grok vs GPT)", status: "done", priority: "high", detail: "Two distinct page designs for split testing — /offer/111/grok and /offer/111/gpt" },
      { title: "$444 Habit Lock Pack (/offer/444)", status: "done", priority: "high", detail: "Extended value stack, urgency timers, social proof, downsell to $11/mo" },
      { title: "$1,111 Kingdom Ambassador (/offer/1111)", status: "done", priority: "high", detail: "Global mission positioning, custom art/NFT promise, $11/mo downsell" },
      { title: "$4,444 Gratitude Patron (/offer/4444)", status: "done", priority: "high", detail: "Ultra-premium tier, DAO Superfriends access, custom art + NFTs, $11/mo downsell" },
      { title: "$44,444 Blessed Residency concept", status: "done", priority: "high", detail: "IamBlessedAF Mansion + DAO, ultra-exclusive tier for whale supporters" },
      { title: "$11/mo Monthly Membership (/offer/11mo)", status: "done", priority: "medium", detail: "Recurring subscription, premium prompts, private challenges, early drops" },
      { title: "Stripe Checkout edge function", status: "done", priority: "critical", detail: "create-checkout edge function, order tracking in orders table" },
      { title: "Offer Success page (/offer/success)", status: "done", priority: "medium", detail: "Post-purchase confirmation, viral share prompt, next steps" },
      { title: "Brunson Hook-Story-Stack optimization", status: "done", priority: "high", labels: ["Brunson"], detail: "Applied Russell Brunson's framework across all offer pages — headline hooks, epiphany bridge, value stacking" },
      { title: "Add urgency timers to ALL offer pages", status: "done", priority: "high", detail: "Countdown timers, stock urgency, limited-time positioning on every tier" },
      { title: "$444 → $11/mo downsell flow", status: "done", priority: "medium", detail: "Downsell modal on page exit/decline for $444, $1,111, and $4,444 pages" },
      { title: "Reference $22 Pack in $111 upsell", status: "done", priority: "medium", detail: "Funnel continuity — ties back to starter pack purchase" },
    ],
  },
  {
    id: "virality",
    icon: Megaphone,
    title: "Phase 3 — Viral Growth Engine",
    subtitle: "K-Factor optimization, referral loops, UGC prompts, link shortener",
    status: "active",
    delegationScore: 76,
    items: [
      { title: "Custom link shortener (iamblessedaf.com/go/)", status: "done", priority: "critical", detail: "Bitly-style system with find-or-create deduplication, campaign tagging, UTM pass-through" },
      { title: "Link analytics dashboard (/admin/links)", status: "done", priority: "critical", detail: "Per-link traffic chart, UTM breakdown panels, date range filtering, daily stacked view, CSV export" },
      { title: "UTM builder tool", status: "done", priority: "medium", detail: "Admin tool to generate tagged short links with campaign/source/medium" },
      { title: "Viral share referral module (post-purchase)", status: "done", priority: "high", detail: "SMS + WhatsApp share buttons, referral link copy, nudge UI" },
      { title: "AI Video Contest page (/make-2500-with-1-ai-clip)", status: "done", priority: "medium", detail: "Creator signup, contest rules, social proof for UGC generation" },
      { title: "Creator profiles & referral codes", status: "done", priority: "high", detail: "Unique BLESSED**** referral codes, /r/:code redirect, blessing confirmation tracking" },
      { title: "Boost viral K-factor via share loops", status: "in-progress", priority: "critical", detail: "Cross-funnel share prompts, incentivized referrals, gamified sharing milestones" },
      { title: "#IamBlessedAF UGC prompts", status: "planned", priority: "medium", detail: "Viral share hooks — photo/video prompts with branded hashtag for social amplification" },
      { title: "Social share & referral rewards (gamification)", status: "planned", priority: "medium", labels: ["temu-ux"], detail: "BC coin rewards for sharing, tiered referral bonuses" },
    ],
  },
  {
    id: "gamification",
    icon: Sparkles,
    title: "Phase 4 — Gamification & Retention (Temu-Style UX)",
    subtitle: "BC Coin economy, achievement system, portal dashboard, mystery boxes",
    status: "active",
    delegationScore: 71,
    items: [
      { title: "BC Coin wallet system", status: "done", priority: "critical", detail: "bc_wallets + bc_transactions tables, earn/spend mechanics, streak tracking" },
      { title: "BC Rewards Store", status: "done", priority: "high", detail: "bc_store_items table, redemption flow, admin management" },
      { title: "Portal dashboard (/portal)", status: "done", priority: "high", detail: "Activity feed, leaderboard, missions, referral hub, quick actions, social share" },
      { title: "Daily login bonus", status: "done", priority: "medium", detail: "portal-daily-login edge function, streak multiplier, last_login_bonus_at tracking" },
      { title: "Achievement badges & trophy case", status: "planned", priority: "medium", labels: ["temu-ux"], detail: "Visual badge system, trophy case display, achievement unlock toasts" },
      { title: "Cross-funnel progress bar & XP", status: "in-progress", priority: "high", labels: ["temu-ux"], detail: "Gamification header showing XP progress across all funnel stages" },
      { title: "Post-purchase mystery box reveal", status: "planned", priority: "medium", labels: ["temu-ux"], detail: "Temu-style surprise reveal mechanic after purchase completion" },
      { title: "Spin wheel rewards", status: "done", priority: "medium", detail: "SpinWheel component with weighted probability, BC coin prizes" },
    ],
  },
  {
    id: "ops",
    icon: Cpu,
    title: "Phase 5 — Operations & Project Management",
    subtitle: "Kanban board, Six Sigma pipeline, AI automation, decision matrix",
    status: "complete",
    delegationScore: 85,
    items: [
      { title: "Kanban board (/board)", status: "done", priority: "critical", detail: "13-column pipeline: Outcomes → Ideas → Backlog → Clarify → Today → WIP → Security → Credentials → Validation → System → Errors → Review → Done" },
      { title: "Decision Matrix scoring (delegation formula)", status: "done", priority: "high", detail: "VS/CC/HU/R/AD scores → weighted delegation_score auto-computed via DB trigger" },
      { title: "Six Sigma validation pipeline", status: "done", priority: "high", detail: "Automated quality gates, sigma scoring (64-82), pass/block/warn status labels" },
      { title: "Publish Gate evidence system", status: "done", priority: "high", detail: "Manual screenshot upload + clipboard paste, required proof-of-work for Done column" },
      { title: "Card AI chat (GPT integration)", status: "done", priority: "medium", detail: "card-ai-chat edge function, contextual AI assistance per task card" },
      { title: "Staging flag system", status: "done", priority: "medium", detail: "staging_status field on cards — staging vs live, modular feature testing" },
      { title: "Priority-based visual pulsing", status: "done", priority: "medium", detail: "Critical = red glow, high = orange in Review/Errors, credentials column = fast red blink" },
      { title: "Auto-documentation card", status: "done", priority: "medium", detail: "📚 System Architecture & Operations Manual — auto-updating change log in first column" },
      { title: "WIP limit enforcement", status: "done", priority: "medium", detail: "Per-column work-in-progress limits with toast notifications" },
    ],
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Phase 6 — Analytics & Optimization",
    subtitle: "Link tracking, A/B testing infrastructure, conversion optimization",
    status: "active",
    delegationScore: 68,
    items: [
      { title: "Link click tracking (device, browser, OS, UTM, referrer)", status: "done", priority: "critical", detail: "link_clicks table with full attribution: device_type, browser, os, utm_source/medium/campaign, referrer, geo (country/city)" },
      { title: "Per-link traffic chart with expandable UTM panels", status: "done", priority: "high", detail: "Horizontal bar chart, click-to-expand detail panel, breakdown mini-charts for UTM source/medium/campaign + referrer" },
      { title: "Date range filtering (quick + custom)", status: "done", priority: "high", detail: "7d/14d/30d quick ranges + custom date pickers, filtered click counts" },
      { title: "CSV export (clicks + links)", status: "done", priority: "medium", detail: "Two-file download: clicks with full attribution, links with metadata" },
      { title: "Funnel event tracking", status: "done", priority: "high", detail: "Events: upsell2_view, message_started/saved, friend_gender_selected, size_selected, upsell2_accept/decline, share_sms/whatsapp_clicked, referral_link_copied" },
      { title: "A/B test headline tracking system", status: "in-progress", priority: "medium", detail: "Infrastructure for tracking headline variant performance" },
      { title: "Build A/B testing infrastructure (headlines & CTAs)", status: "planned", priority: "medium", detail: "Full split-testing framework with statistical significance tracking" },
      { title: "Increase OTO conversion 30-50%", status: "planned", priority: "critical", labels: ["KPI"], detail: "Key performance target — optimize one-time-offer conversion across all tiers" },
      { title: "Reduce drop-off to <25%", status: "planned", priority: "critical", labels: ["KPI"], detail: "Key performance target — reduce funnel abandonment at each stage" },
    ],
  },
  {
    id: "comms",
    icon: Globe,
    title: "Phase 7 — Communications & Lifecycle",
    subtitle: "Email sequences, SMS automation, Soap Opera framework",
    status: "blocked",
    delegationScore: 55,
    items: [
      { title: "SMS/Email notification system (Hormozi + Brunson)", status: "blocked", priority: "critical", labels: ["credentials-blocked"], detail: "Full lifecycle messaging — requires Twilio + Resend credentials validation" },
      { title: "Post-purchase email sequence (Soap Opera framework)", status: "blocked", priority: "critical", labels: ["credentials-blocked"], detail: "Multi-day drip sequence following Brunson's Soap Opera framework — needs Resend API" },
      { title: "Email follow-up: custom message ready", status: "blocked", priority: "critical", labels: ["credentials-blocked"], detail: "Triggered email when recipient's custom message is ready" },
      { title: "Communications copy list — all touchpoints", status: "planned", priority: "high", detail: "Complete Hormozi $100M framework copy for every customer touchpoint" },
      { title: "Fix headline & hero hook (benefit-driven 3-sec grab)", status: "blocked", priority: "critical", detail: "Requires A/B test infrastructure to validate — benefit-driven above-fold hook" },
    ],
  },
  {
    id: "conversion",
    icon: Rocket,
    title: "Phase 8 — Conversion Optimization",
    subtitle: "Social proof, CTA optimization, copy refinement, mobile scroll",
    status: "active",
    delegationScore: 62,
    items: [
      { title: "Mobile optimization audit", status: "done", priority: "high", detail: "Full mobile UX pass — thumb-friendly CTAs, scroll optimization, fast-loading assets" },
      { title: "Shorten copy 30% across all pages", status: "done", priority: "medium", detail: "Scannable, mobile-first copy reduction while preserving conversion elements" },
      { title: "Add social proof — testimonials + live metrics", status: "in-progress", priority: "high", detail: "Real testimonials, live-updating metrics, trust signals across offer pages" },
      { title: "Optimize CTA buttons — specific action copy", status: "in-progress", priority: "high", detail: "Replace generic CTAs with benefit-driven, action-specific button copy" },
      { title: "Add epiphany bridge storytelling section", status: "planned", priority: "high", detail: "Brunson-style origin story connecting visitor's problem to the gratitude solution" },
      { title: "Mobile scroll optimization — reduce abandonment", status: "planned", priority: "high", detail: "Progressive content reveal, sticky CTAs, scroll-depth analytics" },
      { title: "Build live impact counter — animated meals donated", status: "planned", priority: "medium", detail: "Real-time animated counter showing cumulative meals funded" },
      { title: "Redesign quotes section — punchy with headshots", status: "planned", priority: "medium", detail: "Author avatars (Huberman, Dispenza, Robbins) with short-form quotes" },
      { title: "One-click flow tie-back to challenge", status: "planned", priority: "medium", detail: "Seamless navigation from any funnel step back to core challenge" },
    ],
  },
  {
    id: "impact",
    icon: Crown,
    title: "Phase 9 — Impact & Community",
    subtitle: "Donation map, milestone timeline, impact metrics, community portal",
    status: "active",
    delegationScore: 58,
    items: [
      { title: "Impact page (/impact)", status: "done", priority: "high", detail: "Donation map, impact CTA, meal hero section, milestone timeline" },
      { title: "Portal leaderboard", status: "done", priority: "medium", detail: "Community leaderboard showing top contributors" },
      { title: "Portal missions system", status: "done", priority: "medium", detail: "Daily/weekly missions for BC coin earning" },
      { title: "Send blessing form", status: "done", priority: "medium", detail: "In-portal form to send blessings to friends" },
      { title: "Budget & API cost tracking dashboard", status: "blocked", priority: "critical", labels: ["credentials-blocked"], detail: "Real-time cost monitoring for API usage — needs credential setup" },
    ],
  },
];

/* ─── Collapsible Section Component ─── */
function PhaseSection({ phase }: { phase: RoadmapPhase }) {
  const [open, setOpen] = useState(phase.status === "active" || phase.status === "blocked");
  const Icon = phase.icon;
  const doneCount = phase.items.filter((i) => i.status === "done").length;
  const pct = Math.round((doneCount / phase.items.length) * 100);

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-card">
      {/* Phase Header */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-5 py-4 text-left border-l-4 transition-colors hover:bg-secondary/30 ${PHASE_HEADER[phase.status]}`}
      >
        <Icon className="w-5 h-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-foreground">{phase.title}</h2>
            <PhaseStatusBadge status={phase.status} />
            {phase.delegationScore && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono font-bold">
                DS: {phase.delegationScore}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{phase.subtitle}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Progress ring */}
          <div className="flex items-center gap-1.5">
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="12" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                <circle
                  cx="16" cy="16" r="12" fill="none"
                  stroke={pct === 100 ? "hsl(142 76% 36%)" : "hsl(var(--primary))"}
                  strokeWidth="3"
                  strokeDasharray={`${(pct / 100) * 75.4} 75.4`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-foreground">
                {pct}%
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              {doneCount}/{phase.items.length}
            </span>
          </div>
          {open ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Items */}
      {open && (
        <div className="border-t border-border/30 divide-y divide-border/20">
          {phase.items.map((item, idx) => (
            <RoadmapItemRow key={idx} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoadmapItemRow({ item }: { item: RoadmapItem }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = STATUS_ICON[item.status];

  return (
    <div className="px-5 py-2.5 hover:bg-secondary/20 transition-colors">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-start gap-2.5 text-left">
        <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${STATUS_COLOR[item.status]}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-medium ${item.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>
              {item.title}
            </span>
            {item.priority && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${PRIORITY_BADGE[item.priority]}`}>
                {item.priority}
              </span>
            )}
            {item.labels?.map((l) => (
              <span key={l} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-medium">
                {l}
              </span>
            ))}
          </div>
          {expanded && item.detail && (
            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-150">
              {item.detail}
            </p>
          )}
        </div>
        {item.detail && (
          <span className="text-[9px] text-muted-foreground mt-1 shrink-0">
            {expanded ? "▾" : "▸"}
          </span>
        )}
      </button>
    </div>
  );
}

function PhaseStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    complete: { label: "Complete", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    active: { label: "In Progress", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    upcoming: { label: "Upcoming", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    blocked: { label: "Blocked", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
  };
  const { label, cls } = map[status] || map.upcoming;
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${cls}`}>
      {label}
    </span>
  );
}

/* ─── Decision Matrix Legend ─── */
function MatrixLegend() {
  const [open, setOpen] = useState(false);

  const dimensions = [
    { code: "VS", name: "Strategic Value", weight: "30%", desc: "Revenue impact, user growth, brand alignment" },
    { code: "CC", name: "Cognitive Cost", weight: "25%", desc: "Complexity to implement, mental overhead required" },
    { code: "HU", name: "Human Uniqueness", weight: "30%", desc: "Inverse — lower score = more delegatable to AI" },
    { code: "R", name: "Repeatability", weight: "15%", desc: "How often this pattern recurs across the system" },
    { code: "AD", name: "Automation Depth", weight: "30%", desc: "Potential for full automation via triggers/AI" },
  ];

  return (
    <div className="border border-border/50 rounded-xl bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <Zap className="w-5 h-5 text-primary shrink-0" />
        <div className="flex-1">
          <h2 className="text-sm font-bold text-foreground">Decision Matrix — Delegation Score Formula</h2>
          <p className="text-[11px] text-muted-foreground">5-dimension weighted scoring system for task prioritization & AI delegation</p>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="border-t border-border/30 p-5 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="text-[11px] text-muted-foreground bg-secondary/50 rounded-lg p-3 font-mono leading-relaxed">
            <span className="text-foreground font-bold">DS</span> = ROUND((<span className="text-primary">VS</span>×0.3 + <span className="text-primary">CC</span>×0.25 + (5−<span className="text-primary">HU</span>)×0.3 + <span className="text-primary">R</span>×0.15 + <span className="text-primary">AD</span>×0.3) × 100 / (5 × 1.3), 1)
          </div>
          <div className="grid gap-2">
            {dimensions.map((d) => (
              <div key={d.code} className="flex items-center gap-3 text-[11px]">
                <span className="w-6 text-center font-bold text-primary font-mono">{d.code}</span>
                <span className="font-semibold text-foreground w-32">{d.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono font-bold">{d.weight}</span>
                <span className="text-muted-foreground">{d.desc}</span>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground pt-2 border-t border-border/30">
            <strong className="text-foreground">Score ranges:</strong> 0-40 = Manual only · 40-70 = Assisted · 70-85 = Mostly AI · 85+ = Fully delegatable
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Pipeline Legend ─── */
function PipelineLegend() {
  const [open, setOpen] = useState(false);

  const columns = [
    { name: "🎯 3 Outcomes", desc: "North-star objectives for current sprint" },
    { name: "💡 Ideas", desc: "Raw feature ideas, opportunities, and explorations" },
    { name: "📦 Backlog", desc: "Prioritized and scored tasks ready for scheduling" },
    { name: "❓ Clarification", desc: "Tasks needing requirements or scope definition" },
    { name: "📅 Today's Work", desc: "Committed tasks for current work session" },
    { name: "🔨 Work in Progress", desc: "Actively being developed (WIP limited)" },
    { name: "🔒 Security Check", desc: "RLS policies, auth validation, data protection review" },
    { name: "🔑 Needed Credentials", desc: "Blocked on API keys/secrets — red blink animation" },
    { name: "✅ Validation (New)", desc: "New features awaiting functional verification" },
    { name: "🔗 Validation (System)", desc: "System integration testing — end-to-end flows" },
    { name: "🚨 Errors (Review)", desc: "Failed validation — needs debugging and fix" },
    { name: "👀 Review", desc: "Human review required — Six Sigma quality gate" },
    { name: "✅ Done", desc: "Completed, validated, and evidence-verified" },
  ];

  return (
    <div className="border border-border/50 rounded-xl bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <Lock className="w-5 h-5 text-primary shrink-0" />
        <div className="flex-1">
          <h2 className="text-sm font-bold text-foreground">13-Column Pipeline Architecture</h2>
          <p className="text-[11px] text-muted-foreground">Six Sigma–inspired quality gates with evidence-based validation</p>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="border-t border-border/30 divide-y divide-border/20 animate-in fade-in slide-in-from-top-1 duration-150">
          {columns.map((col, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-2.5">
              <span className="text-[11px] font-mono text-primary font-bold w-5 text-right">{i + 1}</span>
              <span className="text-xs font-semibold text-foreground w-48">{col.name}</span>
              <span className="text-[11px] text-muted-foreground">{col.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Summary Stats ─── */
function SummaryStats() {
  const allItems = PHASES.flatMap((p) => p.items);
  const done = allItems.filter((i) => i.status === "done").length;
  const inProgress = allItems.filter((i) => i.status === "in-progress").length;
  const blocked = allItems.filter((i) => i.status === "blocked").length;
  const planned = allItems.filter((i) => i.status === "planned").length;
  const total = allItems.length;
  const pct = Math.round((done / total) * 100);

  const stats = [
    { label: "Total Items", value: total, icon: Target, color: "text-foreground" },
    { label: "Completed", value: done, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "In Progress", value: inProgress, icon: Clock, color: "text-amber-500" },
    { label: "Blocked", value: blocked, icon: AlertTriangle, color: "text-red-500" },
    { label: "Planned", value: planned, icon: Star, color: "text-blue-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-card border border-border/50 rounded-xl p-4 text-center">
          <s.icon className={`w-5 h-5 mx-auto mb-1.5 ${s.color}`} />
          <div className="text-lg font-bold text-foreground">{s.value}</div>
          <div className="text-[10px] text-muted-foreground font-medium">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Tech Stack Section ─── */
interface TechItem {
  name: string;
  desc: string;
  version?: string;
}

interface TechCategory {
  icon: React.ElementType;
  title: string;
  items: TechItem[];
}

const TECH_STACK: TechCategory[] = [
  {
    icon: Layers,
    title: "Frontend Framework",
    items: [
      { name: "React", version: "18.3", desc: "Component-based UI library" },
      { name: "TypeScript", desc: "Type-safe JavaScript superset" },
      { name: "Vite", desc: "Lightning-fast build tool & dev server" },
      { name: "React Router", version: "6.30", desc: "Client-side routing with lazy loading" },
    ],
  },
  {
    icon: Paintbrush,
    title: "Styling & UI",
    items: [
      { name: "Tailwind CSS", desc: "Utility-first CSS with custom design tokens" },
      { name: "shadcn/ui", desc: "Radix-based accessible component library" },
      { name: "Framer Motion", version: "12.x", desc: "Declarative animations & transitions" },
      { name: "Lucide React", desc: "Modern icon set (~460 icons)" },
      { name: "Recharts", version: "2.15", desc: "Composable chart library for analytics" },
      { name: "Embla Carousel", desc: "Lightweight carousel/slider engine" },
    ],
  },
  {
    icon: Database,
    title: "Backend & Database",
    items: [
      { name: "Lovable Cloud (Supabase)", desc: "Postgres DB, Auth, Edge Functions, Storage" },
      { name: "Row-Level Security", desc: "Per-user data isolation on 12+ tables" },
      { name: "Edge Functions (Deno)", desc: "Serverless functions: checkout, AI chat, SMS, short-link redirect" },
      { name: "Realtime Subscriptions", desc: "Live data sync for portal activity feed" },
      { name: "Database Functions", desc: "confirm_blessing, increment_click_count, get_total_meals_donated, has_role" },
      { name: "Database Triggers", desc: "Auto-compute delegation_score, update timestamps" },
    ],
  },
  {
    icon: CreditCard,
    title: "Payments & Commerce",
    items: [
      { name: "Stripe Checkout", desc: "Hosted payment pages for all tiers ($22–$4,444)" },
      { name: "Stripe Subscriptions", desc: "$11/mo recurring membership" },
      { name: "Order Tracking", desc: "orders table with status, tier, stripe_session_id" },
    ],
  },
  {
    icon: MessageSquare,
    title: "Communications",
    items: [
      { name: "Twilio SMS", desc: "Scheduled gratitude messages, delivery tracking, status webhooks" },
      { name: "SMS Delivery Tracking", desc: "sms_deliveries table with twilio_sid, status, error logging" },
      { name: "Gift SMS Dialog", desc: "In-app SMS sending with recipient name/phone" },
    ],
  },
  {
    icon: Server,
    title: "Data & State Management",
    items: [
      { name: "TanStack React Query", version: "5.83", desc: "Server state caching, auto-refetch, optimistic updates" },
      { name: "React Hook Form", version: "7.61", desc: "Performant form handling with Zod validation" },
      { name: "Zod", version: "3.25", desc: "Schema validation for forms and API payloads" },
      { name: "Custom Hooks (15+)", desc: "useAuth, useBcWallet, useLinkAnalytics, useCountdown, useSpinLogic, etc." },
    ],
  },
  {
    icon: Globe,
    title: "Infrastructure & Integrations",
    items: [
      { name: "Custom Link Shortener", desc: "iamblessedaf.com/go/ — Bitly-style with UTM pass-through & deduplication" },
      { name: "CSV Export Engine", desc: "Client-side click & link data export with full attribution" },
      { name: "Kanban Board (13 columns)", desc: "Six Sigma pipeline with decision matrix scoring" },
      { name: "BC Coin Economy", desc: "Wallet system, store, transactions, daily login streaks" },
      { name: "Hello Pangea DnD", desc: "Drag-and-drop for Kanban board cards" },
      { name: "Canvas Confetti", desc: "Celebration animations on achievements & purchases" },
    ],
  },
];

function TechStackSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border/50 rounded-xl bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
      >
        <Layers className="w-5 h-5 text-primary shrink-0" />
        <div className="flex-1">
          <h2 className="text-sm font-bold text-foreground">Tech Stack & Integrations</h2>
          <p className="text-[11px] text-muted-foreground">
            {TECH_STACK.reduce((sum, c) => sum + c.items.length, 0)} technologies across {TECH_STACK.length} categories
          </p>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/30 font-semibold">
          Full Stack
        </span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="border-t border-border/30 animate-in fade-in slide-in-from-top-1 duration-150">
          {TECH_STACK.map((cat) => (
            <TechCategoryRow key={cat.title} category={cat} />
          ))}
        </div>
      )}
    </div>
  );
}

function TechCategoryRow({ category }: { category: TechCategory }) {
  const [open, setOpen] = useState(false);
  const Icon = category.icon;

  return (
    <div className="border-b border-border/20 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-secondary/20 transition-colors"
      >
        <Icon className="w-4 h-4 text-primary/70 shrink-0" />
        <span className="text-xs font-semibold text-foreground flex-1">{category.title}</span>
        <span className="text-[9px] text-muted-foreground font-mono">{category.items.length} items</span>
        {open ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-5 pb-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-100">
          {category.items.map((item) => (
            <div key={item.name} className="flex items-center gap-2 pl-7">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
              <span className="text-[11px] font-semibold text-foreground">{item.name}</span>
              {item.version && (
                <span className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                  v{item.version}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground">— {item.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function Roadmap() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </a>
          <Map className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-base font-bold text-foreground">IamBlessedAF — Project Roadmap</h1>
            <p className="text-[10px] text-muted-foreground">The Gratitude Engine™ · Deep Matrix Architecture · All Stages</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Overview Stats */}
        <SummaryStats />

        {/* Architecture Legends */}
        <MatrixLegend />
        <PipelineLegend />
        <TechStackSection />

        {/* Phase Sections */}
        <div className="space-y-3">
          {PHASES.map((phase) => (
            <PhaseSection key={phase.id} phase={phase} />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-[10px] text-muted-foreground">
            Built with ❤️ by the Ethereum Master Developer Agent · Last updated: Feb 9, 2026
          </p>
        </div>
      </main>
    </div>
  );
}
