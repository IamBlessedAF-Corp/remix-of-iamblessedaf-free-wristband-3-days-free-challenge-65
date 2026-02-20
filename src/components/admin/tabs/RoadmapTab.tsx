import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useBoard } from "@/hooks/useBoard";
import { useRoadmapCompletions } from "@/hooks/useRoadmapCompletions";
import { useRoadmapItems } from "@/hooks/useRoadmapItems";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import RoadmapSearchBar, { type RoadmapFilters } from "@/components/roadmap/RoadmapSearchBar";
import RoadmapItemActions from "@/components/roadmap/RoadmapItemActions";
import BulkSendToBoard from "@/components/roadmap/BulkSendToBoard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ChevronDown, ChevronRight, CheckCircle2, Circle, Trophy,
  RefreshCw, Database, Zap, AlertTriangle, Loader2, XCircle,
  FileText, KanbanSquare, Clock, ExternalLink, Sparkles
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ── Proof of Work types ──
interface ProofEntry {
  source: "changelog" | "board";
  title: string;
  detail: string;
  timestamp: string | null;
}

interface ProofData {
  entries: ProofEntry[];
  loading: boolean;
}


const PHASE_LABELS: Record<string, string> = {
  foundation: "🏗️ Foundation & Security",
  funnel: "🔄 Funnel & Revenue",
  virality: "🚀 Virality & Referrals",
  gamification: "🎮 Gamification & Retention",
  ops: "⚙️ Operations & DevOps",
  analytics: "📊 Analytics & Intelligence",
  comms: "📬 Communications & Messaging",
  conversion: "🎯 Conversion Optimization",
  impact: "🌍 Impact & Community",
};

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10 border border-red-500/30",
  high: "text-orange-400 bg-orange-500/10",
  medium: "text-yellow-400 bg-yellow-500/10",
  low: "text-emerald-400 bg-emerald-500/10",
};

// Keywords in changelog/board titles that map to roadmap titles (fuzzy match)
const DONE_KEYWORDS: Record<string, string[]> = {
  "error monitor": ["error", "monitor", "ingest-error", "error_events"],
  "rls": ["rls", "row level security", "policy"],
  "audit log": ["audit", "audit_log"],
  "stripe webhook": ["stripe", "webhook"],
  "sms router": ["sms-router", "sms router", "twilio"],
  "short link": ["short-link", "short link", "go redirect"],
  "budget control": ["budget", "budget_cycles", "budget_segments"],
  "clipper": ["clipper", "clip_submissions", "clip-approved"],
  "gamification": ["gamification", "bc_wallet", "bc_coins"],
  "realtime sync": ["realtime", "userealtimesync"],
  "expert scripts": ["expert-scripts", "expert_scripts"],
  "backup verification": ["verify-backup", "backup_verifications"],
  "referral": ["referral", "referral_code", "blessings", "referred_by"],
  "challenge": ["challenge", "gratitude", "challenge_participants"],
  // Virality & analytics
  "k-factor": ["k-factor", "kfactor", "kfactordashboard", "viral coefficient", "virality"],
  "viral coefficient": ["k-factor", "kfactor", "kfactordashboard", "viral coefficient", "virality"],
  "virality": ["k-factor", "kfactor", "virality", "viral", "kfactordashboard"],
  "sankey": ["sankey", "funnel visualization", "conversion funnel", "sankeydiagram"],
  "funnel": ["funnel", "sankey", "conversion", "funnelmap", "abandoned_carts", "cart"],
  "dashboard": ["dashboard", "adminhub", "admin tab", "kpi"],
  "referral attribution": ["referral", "referral_code", "referred_by_code", "attribution"],
  "tiered referral": ["tiered", "referral reward", "bc coin", "blessedcoins"],
  "utm": ["utm", "utmtag", "utm_source", "utm_medium", "utm_campaign"],
  "qr code": ["qr", "qrcode", "qr-code", "printable"],
  "wristband": ["wristband", "smart_wristband", "neuro", "wristband_waitlist"],
  "leaderboard": ["leaderboard", "ranking", "top clipper", "top referr"],
  "waitlist": ["waitlist", "smart_wristband_waitlist"],
  "affiliate": ["affiliate", "affiliate_tiers", "affiliate-dashboard"],
  "onboarding": ["onboarding", "creator_profiles", "profile creation"],
  // Cart abandonment — multiple aliases to maximise match coverage
  "cart": ["abandoned_cart", "abandoned_carts", "cart", "recover", "abandonment", "recover-abandoned"],
  "abandonment": ["abandoned_cart", "abandoned_carts", "abandonment", "recover-abandoned", "cart recovery"],
  "recover": ["recover-abandoned", "abandoned_carts", "recovery", "abandonment"],
  // Checkout & payments
  "checkout": ["checkout", "create-checkout", "stripe_session", "payment", "stripe"],
  "order bump": ["order bump", "upsell", "add-on", "pre-checked"],
  "upsell": ["upsell", "post-purchase", "order bump", "ascending offer"],
  "payment plan": ["payment plan", "installment", "3x", "split pay"],
  "scarcity": ["scarcity", "inventory", "stock", "urgency"],
  "heatmap": ["heatmap", "click coordinates", "scroll depth", "session recording"],
  "dynamic pricing": ["dynamic pricing", "engagement score", "time spent", "price adjust"],
  // Conversion & CRO
  "a/b test": ["ab test", "a/b", "variant", "split test", "useabtest"],
  "exit intent": ["exit intent", "exit_intent", "useexitintent"],
  "social proof": ["social proof", "testimonial", "live count", "proof"],
  // Ops
  "backup": ["backup", "verify-backup", "backup_verifications"],
  "rate limit": ["rate limit", "throttle", "sliding window"],
  "cron": ["cron", "scheduled", "pg_cron"],
  // Comms
  "digest": ["digest", "weekly digest", "send-weekly-digest"],
  "sms": ["sms", "twilio", "sms-router", "send-sms"],
};

// Stopwords to ignore in word-overlap matching
const STOPWORDS = new Set([
  "add", "build", "create", "implement", "with", "and", "the", "for",
  "real", "time", "live", "new", "all", "via", "use", "using", "based",
  "page", "item", "list", "from", "into", "that", "this", "when", "then",
]);

function fuzzyMatchTitle(roadmapTitle: string, changelogText: string): boolean {
  const lower = roadmapTitle.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();
  const cl = changelogText.toLowerCase();

  // 1. Direct full-title substring match
  if (lower.length >= 10 && cl.includes(lower.slice(0, Math.min(25, lower.length)))) return true;

  // 2. Keyword synonym map match — check every key that appears in the roadmap title
  for (const [key, synonyms] of Object.entries(DONE_KEYWORDS)) {
    if (lower.includes(key)) {
      if (synonyms.some(s => cl.includes(s))) return true;
    }
  }

  // 3. Word-overlap scoring: meaningful words from the title vs changelog text
  const titleWords = lower.split(/\s+/).filter(w => w.length > 3 && !STOPWORDS.has(w));
  if (titleWords.length === 0) return false;

  const matchCount = titleWords.filter(w => cl.includes(w)).length;
  // For long titles (4+ meaningful words) require 2 matches; shorter titles need 1
  const needed = titleWords.length >= 4 ? 2 : 1;
  if (matchCount >= needed) return true;

  // 4. Partial-word match: check if any title word is a prefix/suffix of a changelog word
  // e.g. "abandon" matches "abandoned_carts" or "abandonment"
  const clWords = cl.split(/[\s_\-./]+/);
  const partialHits = titleWords.filter(tw =>
    clWords.some(cw => cw.startsWith(tw) || tw.startsWith(cw))
  ).length;
  if (partialHits >= needed) return true;

  return false;
}

// Per-item states for the smart verify flow
type VerifyState = "idle" | "verifying" | "verified" | "failed";

export default function RoadmapTab() {
  const qc = useQueryClient();
  const board = useBoard();
  const { isCompleted, markDone, unmarkDone, completions } = useRoadmapCompletions();
  const { items: roadmapItems, byPhase, isLoading, isFromDb, seedFromStatic, addItem } = useRoadmapItems();
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<RoadmapFilters>({ keyword: "", status: "", priority: "" });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  // Track per-item verify state: itemId → VerifyState
  const [verifyStates, setVerifyStates] = useState<Record<string, VerifyState>>({});

  const totalRoadmapItems = roadmapItems.length;
  const totalCompleted = completions.length;
  const overallPct = totalRoadmapItems > 0 ? Math.min(100, Math.round((totalCompleted / totalRoadmapItems) * 100)) : 0;

  // ── Priority-specific stats ──
  const criticalTotal = roadmapItems.filter(i => i.priority === "critical").length;
  const criticalDone = roadmapItems.filter(i => i.priority === "critical" && isCompleted(i.phase, i.title)).length;
  const criticalPct = criticalTotal > 0 ? Math.min(100, Math.round((criticalDone / criticalTotal) * 100)) : 100;

  const highTotal = roadmapItems.filter(i => i.priority === "high").length;
  const highDone = roadmapItems.filter(i => i.priority === "high" && isCompleted(i.phase, i.title)).length;
  const highPct = highTotal > 0 ? Math.min(100, Math.round((highDone / highTotal) * 100)) : 100;

  // ── Proof of Work: which item is expanded + cached proof data ──
  const [expandedProofId, setExpandedProofId] = useState<string | null>(null);
  const [proofCache, setProofCache] = useState<Record<string, ProofData>>({});

  const loadProof = useCallback(async (itemId: string, title: string) => {
    // Toggle off if already open
    if (expandedProofId === itemId) {
      setExpandedProofId(null);
      return;
    }
    setExpandedProofId(itemId);

    // Return cached data if already loaded
    if (proofCache[itemId] && !proofCache[itemId].loading) return;

    setProofCache(prev => ({ ...prev, [itemId]: { entries: [], loading: true } }));

    try {
      const [{ data: changelog }, { data: boardCards }] = await Promise.all([
        supabase
          .from("changelog_entries")
          .select("prompt_summary, change_details, affected_areas, created_at")
          .order("created_at", { ascending: false })
          .limit(300),
        supabase
          .from("board_cards")
          .select("title, description, completed_at, stage")
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false }),
      ]);

      const entries: ProofEntry[] = [];

      // Match changelog entries
      for (const c of changelog ?? []) {
        const signal = `${c.prompt_summary} ${c.change_details ?? ""} ${(c.affected_areas ?? []).join(" ")}`;
        if (fuzzyMatchTitle(title, signal)) {
          entries.push({
            source: "changelog",
            title: c.prompt_summary ?? "Changelog entry",
            detail: c.change_details ?? (c.affected_areas ?? []).join(", "),
            timestamp: c.created_at ?? null,
          });
        }
      }

      // Match board cards
      for (const card of boardCards ?? []) {
        const signal = `${card.title} ${card.description ?? ""}`;
        if (fuzzyMatchTitle(title, signal)) {
          entries.push({
            source: "board",
            title: card.title,
            detail: card.description ?? `Stage: ${card.stage ?? "completed"}`,
            timestamp: card.completed_at ?? null,
          });
        }
      }

      setProofCache(prev => ({ ...prev, [itemId]: { entries, loading: false } }));
    } catch {
      setProofCache(prev => ({ ...prev, [itemId]: { entries: [], loading: false } }));
    }
  }, [expandedProofId, proofCache]);

  // Sort items within each phase by priority
  const sortedByPhase = useMemo(() => {
    const sorted: Record<string, typeof roadmapItems> = {};
    for (const [phase, items] of Object.entries(byPhase)) {
      sorted[phase] = [...items].sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] ?? 99;
        const pb = PRIORITY_ORDER[b.priority] ?? 99;
        return pa - pb;
      });
    }
    return sorted;
  }, [byPhase]);

  const phaseStats = useMemo(() => {
    const stats: Record<string, { total: number; done: number; pct: number }> = {};
    for (const [phase, items] of Object.entries(sortedByPhase)) {
      const done = items.filter(i => isCompleted(phase, i.title)).length;
      stats[phase] = { total: items.length, done, pct: items.length > 0 ? Math.round((done / items.length) * 100) : 0 };
    }
    return stats;
  }, [sortedByPhase, isCompleted, completions]);

  const allItemsWithPhase = roadmapItems.map(item => ({ ...item, phase: item.phase }));

  const filtered = useMemo(() => {
    return allItemsWithPhase.filter(item => {
      if (filters.keyword && !`${item.title} ${item.detail}`.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
      if (filters.priority && item.priority !== filters.priority) return false;
      if (filters.status === "done" && !isCompleted(item.phase, item.title)) return false;
      if (filters.status === "pending" && isCompleted(item.phase, item.title)) return false;
      return true;
    });
  }, [allItemsWithPhase, filters, isCompleted]);

  const criticalRemaining = allItemsWithPhase.filter(i => i.priority === "critical" && !isCompleted(i.phase, i.title)).length;
  const highRemaining = allItemsWithPhase.filter(i => i.priority === "high" && !isCompleted(i.phase, i.title)).length;

  const togglePhase = (phase: string) => setOpenPhases(prev => ({ ...prev, [phase]: !prev[phase] }));

  // ── Smart Verify & Mark ──
  // When the user clicks the completion circle manually on a pending item,
  // we run a verification scan (same logic as Smart Update) to confirm the
  // prompt was actually executed. If confirmed → mark done. If not found →
  // ask user to confirm manually. If already done → unmark.
  const verifyAndMark = useCallback(async (itemId: string, title: string, phase: string, done: boolean) => {
    if (done) {
      // Already done → just unmark
      unmarkDone.mutate({ title, phase });
      return;
    }

    // Start verifying
    setVerifyStates(prev => ({ ...prev, [itemId]: "verifying" }));
    toast.info(`🔍 Verifying "${title}"…`, { duration: 2500 });

    try {
      const [{ data: changelog }, { data: doneCards }] = await Promise.all([
        supabase
          .from("changelog_entries")
          .select("prompt_summary, change_details, affected_areas")
          .order("created_at", { ascending: false })
          .limit(300),
        supabase
          .from("board_cards")
          .select("title, description")
          .not("completed_at", "is", null),
      ]);

      const doneSignals: string[] = [
        ...(changelog || []).map(c => `${c.prompt_summary} ${c.change_details || ""} ${(c.affected_areas || []).join(" ")}`),
        ...(doneCards || []).map(c => `${c.title} ${c.description || ""}`),
      ];

      const verified = doneSignals.some(signal => fuzzyMatchTitle(title, signal));

      if (verified) {
        // Verified via project data → mark as done
        setVerifyStates(prev => ({ ...prev, [itemId]: "verified" }));
        markDone.mutate({ title, phase });
        toast.success(`✅ Verified! "${title}" confirmed complete via changelog/board.`);
      } else {
        // Not found in signals → prompt user for manual confirmation
        setVerifyStates(prev => ({ ...prev, [itemId]: "failed" }));
        toast.warning(
          `⚠️ Could not auto-verify "${title}". Mark manually?`,
          {
            duration: 8000,
            action: {
              label: "Yes, mark done",
              onClick: () => {
                markDone.mutate({ title, phase });
                setVerifyStates(prev => ({ ...prev, [itemId]: "verified" }));
              },
            },
          }
        );
        // Reset failed state after a few seconds so icon doesn't stay red
        setTimeout(() => setVerifyStates(prev => ({ ...prev, [itemId]: "idle" })), 8000);
      }
    } catch (err) {
      console.error("Verify error:", err);
      setVerifyStates(prev => ({ ...prev, [itemId]: "failed" }));
      toast.error(`Verification failed for "${title}". Try again.`);
      setTimeout(() => setVerifyStates(prev => ({ ...prev, [itemId]: "idle" })), 5000);
    }
  }, [markDone, unmarkDone]);

  const colGroups = board.columns.map(col => ({
    name: col.name.slice(0, 14),
    value: board.cards.filter(c => c.column_id === col.id).length,
  }));

  // ── Smart Roadmap Update ──
  const handleSmartUpdate = useCallback(async () => {
    setIsSyncing(true);
    toast.info("🔍 Scanning all project changes...", { duration: 3000 });

    try {
      // 1. Pull all changelog entries
      const { data: changelog } = await supabase
        .from("changelog_entries")
        .select("prompt_summary, change_details, affected_areas, created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      // 2. Pull completed board cards
      const { data: doneCards } = await supabase
        .from("board_cards")
        .select("title, description, completed_at")
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false });

      // 3. Pull recent error_events to flag critical issues
      const { data: criticalErrors } = await supabase
        .from("error_events")
        .select("message, level, component")
        .eq("level", "fatal")
        .is("resolved_at", null)
        .limit(20);

      // Build a corpus of all "done" signals
      const doneSignals: string[] = [
        ...(changelog || []).map(c => `${c.prompt_summary} ${c.change_details || ""} ${(c.affected_areas || []).join(" ")}`),
        ...(doneCards || []).map(c => `${c.title} ${c.description || ""}`),
      ];

      // 4. For each roadmap item not yet completed, check if it appears in done signals
      let autoMarked = 0;
      const pendingItems = allItemsWithPhase.filter(i => !isCompleted(i.phase, i.title));

      for (const item of pendingItems) {
        const matchFound = doneSignals.some(signal => fuzzyMatchTitle(item.title, signal));
        if (matchFound) {
          await supabase
            .from("roadmap_completions")
            .insert({ item_title: item.title, phase: item.phase })
            .then(({ error }) => {
              if (!error) autoMarked++;
            });
        }
      }

      // 5. Warn about unresolved critical errors blocking roadmap items
      if (criticalErrors && criticalErrors.length > 0) {
        toast.warning(
          `⚠️ ${criticalErrors.length} unresolved fatal error(s) detected — check Error Monitor tab`,
          { duration: 6000 }
        );
      }

      const now = new Date().toLocaleTimeString();
      setLastSynced(now);

      if (autoMarked > 0) {
        toast.success(`✅ Roadmap updated! Auto-marked ${autoMarked} item(s) as done.`);
        // Properly invalidate the React Query cache so UI re-renders
        await qc.invalidateQueries({ queryKey: ["roadmap-completions"] });
      } else {
        toast.info(`✅ Sync complete — no new completions detected. Last synced: ${now}`);
      }
    } catch (err) {
      console.error("Roadmap sync error:", err);
      toast.error("Sync failed — check console for details");
    } finally {
      setIsSyncing(false);
    }
  }, [allItemsWithPhase, isCompleted, qc]);

  // ── Generate 11 Smart Suggestions ──
  const handleGenerateSuggestions = useCallback(async () => {
    if (!isFromDb) {
      toast.warning("Seed to DB first before generating suggestions");
      return;
    }
    setIsGenerating(true);
    toast.info("🧠 Analysing gaps and generating 11 smart suggestions...", { duration: 4000 });

    try {
      const phaseStats = Object.entries(byPhase).map(([phase, items]) => {
        const done = items.filter(i => isCompleted(i.phase, i.title)).length;
        const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 100;
        return { phase, pct };
      }).sort((a, b) => a.pct - b.pct);
      const weakPhases = phaseStats.slice(0, 3).map(p => p.phase);

      const POOL: Array<{ phase: string; title: string; detail: string; priority: string; prompt: string }> = [
        { phase: "funnel", title: "Add OTO upsell modal after free wristband checkout", detail: "Trigger a one-time-offer modal immediately post-checkout to capture impulse buyers at peak engagement.", priority: "critical", prompt: "Implement a post-checkout OTO modal after free wristband confirmation, offering the $22 3-pack with a 10-minute countdown timer." },
        { phase: "funnel", title: "Implement checkout abandonment SMS within 15 min", detail: "Fire a Twilio SMS to users who start checkout but don't complete within 15 minutes using the abandoned_carts table.", priority: "critical", prompt: "Use abandoned_carts table and a scheduled edge function to detect incomplete checkouts, then trigger a personalised SMS via Twilio within 15 minutes." },
        { phase: "funnel", title: "Add exit-intent downsell to $11/mo subscription", detail: "Show a modal when user exits any offer page, presenting the $11/mo subscription as a fallback.", priority: "high", prompt: "Create an exit-intent modal on /offer/* routes that presents the monthly subscription as a downsell, tracked in exit_intent_events." },
        { phase: "funnel", title: "Add live social proof counter to all offer pages", detail: "Show real-time 'X people viewing this now' using portal_activity data and simulated stats for FOMO.", priority: "high", prompt: "Integrate useSimulatedStats and portal_activity to display a live viewer counter on each /offer/* page." },
        { phase: "retention", title: "Build 7-day onboarding email sequence post-purchase", detail: "Use Resend to fire a daily educational email sequence for the first 7 days after wristband purchase.", priority: "critical", prompt: "Create a 7-step Resend email sequence triggered on order completion, teaching the 21-day gratitude habit loop." },
        { phase: "retention", title: "Add gratitude streak countdown banner to portal", detail: "Show a daily banner in /portal counting down to the next TGF Friday SMS and celebrating streaks.", priority: "medium", prompt: "Add a portal banner component that reads from scheduled_gratitude_messages and bc_wallets streak_days to display personalised encouragement." },
        { phase: "retention", title: "Implement re-engagement SMS for 7-day inactive users", detail: "Detect users with no portal_activity in 7+ days and trigger a personalised win-back SMS.", priority: "high", prompt: "Write an edge function that queries portal_activity for inactive users then fires a win-back SMS via Twilio." },
        { phase: "virality", title: "Add friend-tagging mechanic on streak milestones", detail: "When a user hits 7, 14, or 30-day streak, prompt them to tag 3 friends in a shareable canvas image.", priority: "high", prompt: "Create a ShareMilestoneModal that triggers on streak milestones, generates a branded canvas image, and provides WhatsApp/Instagram share links." },
        { phase: "virality", title: "Launch referral leaderboard on /portal home", detail: "Display a live top-10 referral leaderboard using affiliate_tiers and creator_profiles to drive competition.", priority: "medium", prompt: "Add a live leaderboard widget to /portal querying affiliate_tiers ordered by wristbands_distributed, showing top 10 with rank badges." },
        { phase: "operations", title: "Add automated daily DB backup alert email", detail: "Run verify-backup edge function daily and send an email alert if anomalies exceed threshold.", priority: "critical", prompt: "Schedule the verify-backup edge function via pg_cron at 3 AM UTC daily and send a Resend email to admin if status is not 'success'." },
        { phase: "operations", title: "Build A/B test framework for offer page headlines", detail: "Use useABTest hook to test 2 headline variants on /offer/22 and measure conversion via orders table.", priority: "medium", prompt: "Integrate useABTest into /offer/22 to A/B test 2 headline variants, tracking conversions in orders table with variant metadata." },
      ];

      const sorted = [
        ...POOL.filter(s => weakPhases.includes(s.phase)),
        ...POOL.filter(s => !weakPhases.includes(s.phase)),
      ];

      const existingTitles = new Set(roadmapItems.map(i => i.title.toLowerCase().trim()));
      const fresh = sorted.filter(s => !existingTitles.has(s.title.toLowerCase().trim()));
      const toInsert = fresh.slice(0, 11);

      if (toInsert.length === 0) {
        toast.info("✅ All known improvements are already in your roadmap!");
        return;
      }

      const maxOrder = roadmapItems.reduce((max, i) => Math.max(max, i.sort_order ?? 0), 0);
      let inserted = 0;
      for (let idx = 0; idx < toInsert.length; idx++) {
        const s = toInsert[idx];
        await addItem.mutateAsync({
          phase: s.phase,
          title: s.title,
          detail: s.detail,
          priority: s.priority,
          prompt: s.prompt,
          sort_order: maxOrder + idx + 1,
          is_active: true,
        });
        inserted++;
      }

      toast.success(`🚀 ${inserted} smart suggestions added to your roadmap!`);
    } catch (err) {
      console.error("[GenerateSuggestions]", err);
      toast.error("Failed to generate suggestions — try again");
    } finally {
      setIsGenerating(false);
    }
  }, [isFromDb, byPhase, isCompleted, roadmapItems, addItem]);

  if (isLoading) {
    return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  }


  return (
    <div className="space-y-6">

      {/* ── Top Action Bar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Project Roadmap</h2>
          {lastSynced && (
            <span className="text-[10px] text-muted-foreground">Last synced: {lastSynced}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleGenerateSuggestions}
            disabled={isGenerating || isSyncing}
            variant="outline"
            className="gap-2 font-semibold"
            size="sm"
          >
            {isGenerating ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating…</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5" /> Generate 11</>
            )}
          </Button>
          <Button
            onClick={handleSmartUpdate}
            disabled={isSyncing || isGenerating}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            size="sm"
          >
            {isSyncing ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Scanning Changes...</>
            ) : (
              <><Zap className="w-3.5 h-3.5" /> Update Roadmap</>
            )}
          </Button>
        </div>
      </div>

      {/* Critical alert banner */}
      {criticalRemaining > 0 && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-400 font-semibold">
            🚨 {criticalRemaining} CRITICAL item{criticalRemaining > 1 ? "s" : ""} need immediate attention — click "Update Roadmap" to auto-detect what's done
          </p>
        </div>
      )}

      {/* Seed banner */}
      {!isFromDb && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Database className="w-4 h-4 text-amber-500 shrink-0" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-amber-500 font-medium cursor-help underline decoration-dotted decoration-amber-500/50">
                    Roadmap is using static file. Seed to database for full CRUD.
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-xs" sideOffset={6}>
                  <p className="font-semibold mb-1">Why seed to database?</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Enable <strong className="text-foreground">edit / delete / reorder</strong> of roadmap items</li>
                    <li>Persist <strong className="text-foreground">completions</strong> across sessions</li>
                    <li>Allow <strong className="text-foreground">adding new tasks</strong> from the admin panel</li>
                    <li>Enable <strong className="text-foreground">Smart Update</strong> auto-verification against changelog</li>
                  </ul>
                  <p className="mt-2 text-amber-400">One-time action — safe to run anytime.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/10 shrink-0"
            onClick={() => seedFromStatic.mutate()}
            disabled={seedFromStatic.isPending}
          >
            {seedFromStatic.isPending
              ? <><RefreshCw className="w-3 h-3 animate-spin mr-1" /> Seeding…</>
              : <><Database className="w-3 h-3 mr-1" /> Seed to DB</>
            }
          </Button>
        </div>
      )}

      {isFromDb && (
        <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-500">
          ✅ Live from database
        </Badge>
      )}

      {/* Overall Progress Header */}
      <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
        {/* Overall bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Overall Progress</span>
            <span className="text-[10px] font-bold text-foreground">{overallPct}%</span>
          </div>
          <Progress value={overallPct} className="h-2.5" />
        </div>

        {/* Critical bar */}
        {criticalTotal > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 text-red-400">
                <AlertTriangle className="w-3 h-3" /> Critical Tasks
                <span className="text-muted-foreground font-normal">({criticalDone}/{criticalTotal})</span>
              </span>
              <span className={`text-[10px] font-bold ${criticalPct === 100 ? "text-emerald-400" : "text-red-400"} ${criticalRemaining > 0 ? "animate-pulse" : ""}`}>
                {criticalPct}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${criticalPct === 100 ? "bg-emerald-500" : "bg-red-500"}`}
                style={{ width: `${criticalPct}%` }}
              />
            </div>
          </div>
        )}

        {/* High bar */}
        {highTotal > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 text-orange-400">
                ⚡ High Priority
                <span className="text-muted-foreground font-normal">({highDone}/{highTotal})</span>
              </span>
              <span className={`text-[10px] font-bold ${highPct === 100 ? "text-emerald-400" : "text-orange-400"}`}>
                {highPct}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${highPct === 100 ? "bg-emerald-500" : "bg-orange-500"}`}
                style={{ width: `${highPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Stat pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-foreground">{totalCompleted}/{totalRoadmapItems}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
            <p className={`text-lg font-bold text-red-400 ${criticalRemaining > 0 ? "animate-pulse" : ""}`}>{criticalRemaining}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Critical Left</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-orange-400">{highRemaining}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">High Left</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-foreground">{overallPct}%</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Overall</p>
          </div>
        </div>
      </div>

      {/* Phase Completion Overview Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
        {Object.entries(sortedByPhase).map(([phase]) => {
          const s = phaseStats[phase];
          if (!s) return null;
          const emoji = PHASE_LABELS[phase]?.split(" ")[0] || "📋";
          return (
            <button
              key={phase}
              onClick={() => setOpenPhases(prev => ({ ...prev, [phase]: true }))}
              className="bg-card border border-border/30 rounded-lg p-2.5 text-center hover:bg-secondary/30 transition-colors"
            >
              <span className="text-lg">{emoji}</span>
              <div className="mt-1">
                <Progress value={s.pct} className="h-1.5 mb-1" />
                <p className="text-[10px] font-bold text-foreground">{s.pct}%</p>
                <p className="text-[8px] text-muted-foreground">{s.done}/{s.total}</p>
              </div>
            </button>
          );
        })}
      </div>

      <AdminSectionDashboard
        title="Board Sync"
        description="Live from board cards — milestone tracking"
        defaultCollapsed={true}
        kpis={[
          { label: "Board Cards", value: board.cards.length },
          { label: "Board Done", value: board.cards.filter(c => c.completed_at).length },
          { label: "In Progress", value: board.cards.filter(c => !c.completed_at).length },
          { label: "Columns", value: board.columns.length },
        ]}
        charts={[{ type: "bar", title: "Items per Stage", data: colGroups }]}
      />

      <RoadmapSearchBar filters={filters} onChange={setFilters} matchCount={filtered.length} totalCount={allItemsWithPhase.length} />

      <div className="space-y-2">
        {Object.entries(sortedByPhase).map(([phase, phaseItemsSorted]) => {
          const phaseItems = phaseItemsSorted.filter(i => filtered.some(f => f.id === i.id || f.title === i.title));
          if (phaseItems.length === 0) return null;
          const isOpen = openPhases[phase] ?? false;
          const s = phaseStats[phase];
          if (!s) return null;

          // Count criticals in this phase
          const phaseCriticals = phaseItems.filter(i => i.priority === "critical" && !isCompleted(phase, i.title)).length;

          return (
            <div key={phase} className={`border rounded-lg overflow-hidden ${phaseCriticals > 0 ? "border-red-500/30" : "border-border/40"}`}>
              <button onClick={() => togglePhase(phase)} className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground">{PHASE_LABELS[phase] || phase}</span>
                  <div className="hidden sm:flex items-center gap-2 flex-1 max-w-[200px]">
                    <Progress value={s.pct} className="h-1.5 flex-1" />
                    <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{s.done}/{s.total}</span>
                  </div>
                  {phaseCriticals > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse shrink-0">
                      🚨 {phaseCriticals} CRITICAL
                    </span>
                  )}
                  <span className="text-muted-foreground text-xs font-normal">({phaseItems.length})</span>
                </div>
                <div className="flex items-center gap-2">
                  {s.pct === 100 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  <BulkSendToBoard sectionLabel={PHASE_LABELS[phase] || phase} items={phaseItems} />
                  {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {isOpen && (
                <div className="divide-y divide-border/30">
                  {phaseItems.map((item, idx) => {
                    const done = isCompleted(item.phase, item.title);
                    const isCritical = item.priority === "critical" && !done;
                    const itemId = item.id || `${item.phase}-${idx}`;
                    const vState = verifyStates[itemId] ?? "idle";

                    const circleIcon = done
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      : vState === "verifying"
                        ? <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        : vState === "failed"
                          ? <XCircle className="w-4 h-4 text-destructive" />
                          : <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />;

                    const tooltipLabel = done
                      ? "Unmark as done"
                      : vState === "verifying"
                        ? "Verifying…"
                        : "Mark as Completed";

                    const isProofOpen = expandedProofId === itemId;
                    const proof = proofCache[itemId];

                    return (
                      <div key={itemId} className="border-b border-border/20 last:border-0">
                        {/* ── Main Item Row ── */}
                        <div
                          className={`px-4 py-2.5 flex items-start gap-3 transition-colors
                            ${done ? "bg-emerald-500/3 hover:bg-emerald-500/8 cursor-pointer" : "hover:bg-secondary/20"}
                            ${isCritical ? "bg-red-500/5 border-l-2 border-red-500/50" : ""}
                          `}
                          onClick={done ? () => loadProof(itemId, item.title) : undefined}
                        >
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={(e) => { e.stopPropagation(); verifyAndMark(itemId, item.title, item.phase, done); }}
                                  disabled={vState === "verifying"}
                                  className="mt-0.5 shrink-0 disabled:cursor-wait"
                                  aria-label={tooltipLabel}
                                >
                                  {circleIcon}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="text-xs">
                                {tooltipLabel}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${PRIORITY_COLORS[item.priority]} ${isCritical ? "animate-pulse" : ""}`}>
                            {isCritical && "🔴 "}{item.priority.toUpperCase()}
                          </span>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className={`text-xs font-medium ${done ? "line-through text-muted-foreground" : isCritical ? "text-red-300" : "text-foreground"}`}>
                                {item.title}
                              </p>
                              {done && (
                                <span className="text-[9px] text-emerald-500 font-semibold flex items-center gap-0.5">
                                  {isProofOpen ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                                  proof
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{item.detail}</p>
                          </div>

                          <RoadmapItemActions title={item.title} detail={item.detail} phaseName={phase} />
                        </div>

                        {/* ── Proof of Work Panel ── */}
                        {done && isProofOpen && (
                          <div className="mx-4 mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-emerald-500/15 bg-emerald-500/10">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[11px] font-semibold text-emerald-400">Proof of Work</span>
                              <span className="text-[10px] text-muted-foreground ml-auto">Evidence found in changelog & board</span>
                            </div>

                            {proof?.loading ? (
                              <div className="flex items-center gap-2 px-3 py-4 text-muted-foreground">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span className="text-[11px]">Scanning project history…</span>
                              </div>
                            ) : proof?.entries.length === 0 ? (
                              <div className="px-3 py-4 text-center">
                                <p className="text-[11px] text-muted-foreground">No matching changelog or board entries found.</p>
                                <p className="text-[10px] text-muted-foreground/60 mt-1">Manually verified — no automated proof available.</p>
                              </div>
                            ) : (
                              <div className="divide-y divide-border/20">
                                {proof.entries.map((entry, ei) => (
                                  <div key={ei} className="px-3 py-2.5 flex items-start gap-2.5">
                                    <div className="mt-0.5 shrink-0">
                                      {entry.source === "changelog"
                                        ? <FileText className="w-3 h-3 text-primary/70" />
                                        : <KanbanSquare className="w-3 h-3 text-violet-400/70" />
                                      }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[11px] font-medium text-foreground truncate">{entry.title}</p>
                                      {entry.detail && (
                                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{entry.detail}</p>
                                      )}
                                      {entry.timestamp && (
                                        <p className="text-[9px] text-muted-foreground/50 mt-1 flex items-center gap-1">
                                          <Clock className="w-2.5 h-2.5" />
                                          {new Date(entry.timestamp).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                    <Badge variant="outline" className={`text-[8px] shrink-0 ${entry.source === "changelog" ? "border-primary/30 text-primary" : "border-violet-400/30 text-violet-400"}`}>
                                      {entry.source === "changelog" ? "changelog" : "board card"}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
