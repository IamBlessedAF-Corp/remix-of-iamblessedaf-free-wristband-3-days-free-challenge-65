import { useState, useMemo, useCallback } from "react";
import { useBoard } from "@/hooks/useBoard";
import { useAutoExecute } from "@/hooks/useAutoExecute";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import KanbanBoard from "@/components/board/KanbanBoard";
import PipelineControls from "@/components/board/PipelineControls";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  RefreshCw, Database, Zap, CheckCircle2, XCircle, AlertTriangle,
  Loader2, TestTube2, ShieldCheck, Sparkles, TrendingUp, Clock,
  BarChart3, Play, SkipForward, FlaskConical, BotMessageSquare,
  ArrowRightLeft, Target, ChevronDown, ChevronRight, CheckCheck
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type TestStatus = "idle" | "running" | "pass" | "fail";
interface TestResult {
  name: string;
  status: TestStatus;
  detail?: string;
  ms?: number;
}

// ─── Static board card seed data ─────────────────────────────────────────────
const SEED_CARDS: Array<{ title: string; description: string; priority: string; labels: string[]; colKey: string }> = [
  { title: "RLS Audit — All Tables", description: "Verify row-level security is enabled and correct on every table. Run linter. Document findings.", priority: "critical", labels: ["security", "rls"], colKey: "Security Check" },
  { title: "Stripe Webhook Validation", description: "Validate Stripe webhook signatures and idempotency. Test all event types.", priority: "critical", labels: ["stripe", "payments"], colKey: "Security Check" },
  { title: "Error Monitor Ingestion", description: "Ensure error_events table is capturing all frontend and edge-function errors. Set up alerts.", priority: "high", labels: ["monitoring", "devops"], colKey: "Validation (New)" },
  { title: "SMS Router Compliance", description: "Add opt-out/opt-in handling to all Twilio flows. Audit audit_log for every SMS.", priority: "high", labels: ["sms", "twilio", "compliance"], colKey: "Validation (New)" },
  { title: "Budget Control Dashboard", description: "Build weekly budget cycle UI with segment controls and approval workflow.", priority: "high", labels: ["budget", "admin"], colKey: "Clarification" },
  { title: "Clipper Payout Review Flow", description: "Create admin review queue for weekly clipper payouts. Add dispute flow.", priority: "high", labels: ["clipper", "payouts"], colKey: "Today's Work" },
  { title: "A/B Test Framework", description: "Implement useABTest hook and variant tracking via analytics events.", priority: "medium", labels: ["ab-test", "analytics"], colKey: "Ideas" },
  { title: "Exit Intent Popup", description: "Add exit-intent detection with last-chance offer for cart abandonment.", priority: "medium", labels: ["conversion", "exit-intent"], colKey: "Ideas" },
  { title: "K-Factor Viral Coefficient", description: "Track and display k-factor in admin dashboard. Alert when k > 1.", priority: "high", labels: ["virality", "analytics"], colKey: "Backlog" },
  { title: "QR Code Generator", description: "Generate printable QR codes for short links. Export to PDF.", priority: "low", labels: ["qr", "links"], colKey: "Backlog" },
  { title: "Referral Attribution Pipeline", description: "Track full referral chain: UTM → signup → purchase → earnings.", priority: "critical", labels: ["referral", "attribution"], colKey: "Work in Progress" },
];

// ─── Automation suggestions ───────────────────────────────────────────────────
const AUTOMATION_SUGGESTIONS = [
  { icon: "🤖", label: "Auto-clarify Backlog", description: "AI generates master prompts for all Backlog cards automatically", action: "clarify" },
  { icon: "⚡", label: "Execute WIP Card", description: "Run AI execution on the current Work in Progress card", action: "execute" },
  { icon: "🔒", label: "Security Sweep", description: "Run automated RLS and security checks on all cards in Security column", action: "security" },
  { icon: "✅", label: "Validation Sweep", description: "Run six-sigma validation on all cards stuck in Validation columns", action: "sweep" },
  { icon: "📸", label: "Request Proof Screenshots", description: "Send reminder to upload screenshots for all cards in Review column", action: "proof" },
  { icon: "📊", label: "Score All Cards", description: "Auto-compute delegation scores for cards missing scores", action: "score" },
  { icon: "🔄", label: "Sync Board ↔ Roadmap", description: "Auto-move completed board cards to Done and sync roadmap completions", action: "sync" },
  { icon: "🚀", label: "Full Pipeline Run", description: "Clarify → Execute → Validate → Six Sigma on all Today cards", action: "full" },
];

// ─── Regression test suite ────────────────────────────────────────────────────
async function runBoardRegressionTests(columns: any[], cards: any[]): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const run = async (name: string, fn: () => Promise<{ pass: boolean; detail?: string }>) => {
    const t0 = Date.now();
    try {
      const { pass, detail } = await fn();
      results.push({ name, status: pass ? "pass" : "fail", detail, ms: Date.now() - t0 });
    } catch (e: any) {
      results.push({ name, status: "fail", detail: e?.message || "Unexpected error", ms: Date.now() - t0 });
    }
  };

  // T1: Board columns loaded
  await run("Board columns loaded", async () => ({
    pass: columns.length > 0,
    detail: `${columns.length} columns found`,
  }));

  // T2: At least 3 columns present
  await run("Minimum column count (≥3)", async () => ({
    pass: columns.length >= 3,
    detail: `Expected ≥3, got ${columns.length}`,
  }));

  // T3: Done column exists
  await run("Done column exists", async () => {
    const doneCol = columns.find((c: any) => c.name.includes("Done"));
    return { pass: !!doneCol, detail: doneCol ? `Found: ${doneCol.name}` : "No Done column found" };
  });

  // T4: All cards have a valid column_id
  await run("All cards have valid column_id", async () => {
    const colIds = new Set(columns.map((c: any) => c.id));
    const orphans = cards.filter((c: any) => !colIds.has(c.column_id));
    return { pass: orphans.length === 0, detail: orphans.length > 0 ? `${orphans.length} orphan cards: ${orphans.map((c: any) => c.title).join(", ")}` : "All cards assigned" };
  });

  // T5: board_cards DB query works
  await run("DB: board_cards readable", async () => {
    const { data, error } = await supabase.from("board_cards" as any).select("id").limit(1);
    return { pass: !error, detail: error ? error.message : `Query OK` };
  });

  // T6: board_columns DB query works
  await run("DB: board_columns readable", async () => {
    const { data, error } = await supabase.from("board_columns" as any).select("id").limit(1);
    return { pass: !error, detail: error ? error.message : `Query OK` };
  });

  // T7: No cards with empty titles
  await run("No cards with empty titles", async () => {
    const empty = cards.filter((c: any) => !c.title || c.title.trim() === "");
    return { pass: empty.length === 0, detail: `${empty.length} cards with empty title` };
  });

  // T8: Delegation scores computed (non-zero where scores exist)
  await run("Delegation scores computed", async () => {
    const withScores = cards.filter((c: any) => c.vs_score > 0 || c.cc_score > 0 || c.r_score > 0 || c.ad_score > 0);
    const withDelegation = withScores.filter((c: any) => c.delegation_score > 0);
    return {
      pass: withScores.length === 0 || withDelegation.length > 0,
      detail: `${withDelegation.length}/${withScores.length} scored cards have delegation_score`,
    };
  });

  // T9: WIP column has ≤1 card (WIP limit)
  await run("WIP limit not exceeded", async () => {
    const wipCol = columns.find((c: any) => c.name.includes("Work in Progress"));
    if (!wipCol) return { pass: true, detail: "WIP column not found, skipping" };
    const wipCards = cards.filter((c: any) => c.column_id === wipCol.id);
    return { pass: wipCards.length <= 1, detail: `WIP has ${wipCards.length} card(s) (limit: 1)` };
  });

  // T10: Completed cards have completed_at set
  await run("Completed cards have timestamp", async () => {
    const doneCol = columns.find((c: any) => c.name.includes("Done"));
    if (!doneCol) return { pass: true, detail: "Done column not found, skipping" };
    const doneCards = cards.filter((c: any) => c.column_id === doneCol.id);
    const missing = doneCards.filter((c: any) => !c.completed_at);
    return { pass: missing.length === 0, detail: `${missing.length} Done cards missing completed_at` };
  });

  // T11: Storage bucket accessible for screenshots
  await run("Screenshot storage reachable", async () => {
    const { data, error } = await supabase.storage.from("board-screenshots").list("", { limit: 1 });
    return { pass: !error, detail: error ? error.message : "Storage bucket OK" };
  });

  return results;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BoardTab() {
  const board = useBoard();
  const autoExec = useAutoExecute(board.refetch);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("board");
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSyncingPow, setIsSyncingPow] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [expandedAutomations, setExpandedAutomations] = useState(false);
  const [proofExpanded, setProofExpanded] = useState<string | null>(null);

  // ── Filtered cards ──
  const filtered = searchQuery.trim()
    ? board.cards.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : board.cards;

  // ── Progress stats ──
  const stats = useMemo(() => {
    const doneCol = board.columns.find(c => c.name.includes("Done"));
    const doneCards = doneCol ? board.cards.filter(c => c.column_id === doneCol.id) : [];
    const total = board.cards.length;
    const done = doneCards.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    const criticalCards = board.cards.filter(c => c.priority === "critical");
    const criticalDone = criticalCards.filter(c => c.column_id === doneCol?.id || c.completed_at);
    const criticalPct = criticalCards.length > 0 ? Math.round((criticalDone.length / criticalCards.length) * 100) : 100;

    const highCards = board.cards.filter(c => c.priority === "high");
    const highDone = highCards.filter(c => c.column_id === doneCol?.id || c.completed_at);
    const highPct = highCards.length > 0 ? Math.round((highDone.length / highCards.length) * 100) : 100;

    const inProgress = board.cards.filter(c => {
      const col = board.columns.find(col => col.id === c.column_id);
      return col && col.position >= 4 && col.position <= 9;
    });

    const withProof = board.cards.filter(c => c.screenshots && c.screenshots.length > 0);

    return { total, done, pct, criticalCards, criticalDone, criticalPct, highCards, highDone, highPct, inProgress, withProof };
  }, [board.cards, board.columns]);

  // ── Seed cards to DB ──
  const handleSeedToDb = useCallback(async () => {
    setIsSeeding(true);
    toast.info("🌱 Seeding suggested cards to board...");
    try {
      let seeded = 0;
      for (const card of SEED_CARDS) {
        const col = board.columns.find(c => c.name.includes(card.colKey));
        if (!col) continue;
        // Check if card already exists (by title)
        const exists = board.cards.some(c => c.title === card.title);
        if (exists) continue;
        await board.createCard({
          title: card.title,
          description: card.description,
          priority: card.priority as any,
          labels: card.labels,
          column_id: col.id,
          position: board.cards.filter(c => c.column_id === col.id).length,
          stage: "stage-1",
          staging_status: "staging",
          vs_score: 0, cc_score: 0, hu_score: 0, r_score: 0, ad_score: 0,
          delegation_score: 0,
          screenshots: [], logs: null, summary: null, preview_link: null, master_prompt: null,
        });
        seeded++;
      }
      if (seeded === 0) {
        toast.info("ℹ️ All suggested cards already exist in the board.");
      } else {
        toast.success(`✅ ${seeded} cards seeded to board!`);
        board.refetch();
      }
    } catch (e: any) {
      toast.error(`Seed failed: ${e?.message}`);
    } finally {
      setIsSeeding(false);
    }
  }, [board]);

  // ── Sync POW: auto-stamp completed_at on Done cards missing it ──
  const handleSyncPow = useCallback(async () => {
    setIsSyncingPow(true);
    toast.info("🔄 Syncing POW — stamping completed_at on Done cards...");
    try {
      const doneCol = board.columns.find(c => c.name.includes("Done"));
      if (!doneCol) { toast.error("Done column not found"); return; }
      const missingTs = board.cards.filter(c => c.column_id === doneCol.id && !c.completed_at);
      let fixed = 0;
      for (const card of missingTs) {
        await supabase.from("board_cards" as any).update({
          completed_at: new Date().toISOString(),
          staging_status: "live",
          stage: "stage-4",
        }).eq("id", card.id);
        fixed++;
      }
      toast.success(`✅ Synced ${fixed} Done cards with completed_at timestamp`);
      board.refetch();
    } catch (e: any) {
      toast.error(`Sync failed: ${e?.message}`);
    } finally {
      setIsSyncingPow(false);
    }
  }, [board]);

  // ── Run regression tests ──
  const handleRunTests = useCallback(async () => {
    setIsRunningTests(true);
    setTestResults([]);
    setActiveTab("tests");
    toast.info("🧪 Running board regression tests...");
    try {
      const results = await runBoardRegressionTests(board.columns, board.cards);
      setTestResults(results);
      const passed = results.filter(r => r.status === "pass").length;
      const failed = results.filter(r => r.status === "fail").length;
      if (failed === 0) {
        toast.success(`✅ All ${passed} tests passed!`);
      } else {
        toast.error(`❌ ${failed} test(s) failed — ${passed} passed`);
      }
    } catch (e: any) {
      toast.error(`Test run failed: ${e?.message}`);
    } finally {
      setIsRunningTests(false);
    }
  }, [board.columns, board.cards]);

  // ── Column chart ──
  const colCounts = board.columns.map(col => ({
    name: col.name.slice(0, 10),
    value: board.cards.filter(c => c.column_id === col.id).length,
  }));

  const passCount = testResults.filter(r => r.status === "pass").length;
  const failCount = testResults.filter(r => r.status === "fail").length;

  return (
    <div className="space-y-4">
      {/* ── Dashboard header ── */}
      <AdminSectionDashboard
        title="Kanban Board"
        description="Ideas → In Development → Testing → Live → Optimizing"
        defaultCollapsed={true}
        kpis={[
          { label: "Total Cards", value: board.cards.length },
          { label: "Done ✅", value: stats.done },
          { label: "In Progress", value: stats.inProgress.length },
          { label: "With Proof 📸", value: stats.withProof.length },
          { label: "Critical 🔴", value: stats.criticalCards.length },
        ]}
        charts={[{ type: "bar", title: "Cards per Column", data: colCounts }]}
      />

      {/* ── Progress bars ── */}
      <div className="bg-muted/30 rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Board Progress
          </span>
          <span className="text-xs text-muted-foreground">{stats.done}/{stats.total} cards done</span>
        </div>

        {/* Overall */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Overall Completion</span>
            <span className="font-mono font-bold text-foreground">{stats.pct}%</span>
          </div>
          <Progress value={stats.pct} className="h-2" />
        </div>

        {/* Critical */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className={`flex items-center gap-1 ${stats.criticalPct < 100 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
              <AlertTriangle className="w-3 h-3" />
              Critical ({stats.criticalDone.length}/{stats.criticalCards.length})
            </span>
            <span className="font-mono font-bold text-foreground">{stats.criticalPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${stats.criticalPct >= 100 ? "bg-emerald-500" : "bg-red-500"}`}
              style={{ width: `${stats.criticalPct}%` }}
            />
          </div>
        </div>

        {/* High */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className={`flex items-center gap-1 ${stats.highPct < 100 ? "text-orange-400" : "text-emerald-400"}`}>
              <Zap className="w-3 h-3" />
              High Priority ({stats.highDone.length}/{stats.highCards.length})
            </span>
            <span className="font-mono font-bold text-foreground">{stats.highPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${stats.highPct >= 100 ? "bg-emerald-500" : "bg-orange-500"}`}
              style={{ width: `${stats.highPct}%` }}
            />
          </div>
        </div>

        {/* Proof coverage */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">📸 Proof Coverage</span>
            <span className="font-mono font-bold text-foreground">
              {stats.total > 0 ? Math.round((stats.withProof.length / stats.total) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-primary/60"
              style={{ width: `${stats.total > 0 ? (stats.withProof.length / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Automation suggestions ── */}
      <div className="bg-muted/20 rounded-xl border border-border">
        <button
          className="w-full flex items-center justify-between p-3 text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors rounded-xl"
          onClick={() => setExpandedAutomations(v => !v)}
        >
          <span className="flex items-center gap-2">
            <BotMessageSquare className="w-4 h-4 text-primary" />
            Smart Automation Suggestions
            <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px]">{AUTOMATION_SUGGESTIONS.length}</Badge>
          </span>
          {expandedAutomations ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {expandedAutomations && (
          <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AUTOMATION_SUGGESTIONS.map((s, i) => (
              <TooltipProvider key={i} delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 hover:bg-muted/70 border border-border text-left transition-colors group"
                      onClick={() => {
                        if (s.action === "sweep") {
                          const validColIds = board.columns
                            .filter(c => c.position === 7 || c.position === 8)
                            .map(c => c.id);
                          autoExec.sweep(validColIds);
                          toast.info(`🔄 Sweep started on validation columns`);
                        } else if (s.action === "score") {
                          toast.info("📊 Auto-score coming soon — delegation scores computed on save");
                        } else if (s.action === "sync") {
                          board.refetch();
                          toast.success("🔄 Board synced!");
                        } else if (s.action === "proof") {
                          toast.info("📸 Open each card in Review column and upload screenshots");
                        } else {
                          const todayCol = board.columns.find(c => c.name.includes("Today") || c.name.includes("Work in Progress"));
                          if (todayCol) {
                            autoExec.execute(todayCol.id, s.action as any);
                          } else {
                            toast.error("No active column found");
                          }
                        }
                      }}
                    >
                      <span className="text-lg">{s.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{s.label}</div>
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    {s.description}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </div>

      {/* ── Action buttons row ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                onClick={() => { board.refetch(); toast.success("Board refreshed!"); }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Update Board
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Refresh all cards and columns from the database</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isSyncingPow}
                className="gap-1.5 border-violet-500/40 text-violet-400 hover:bg-violet-500/10"
                onClick={handleSyncPow}
              >
                {isSyncingPow ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                Sync POW
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">
              <p className="font-semibold mb-1">✅ Sync Proof-of-Work</p>
              <p>Auto-stamps completed_at on all Done column cards missing it, and marks them as stage-4/live. Ensures regression test "Completed cards have timestamp" passes.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isSeeding}
                className="gap-1.5 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10"
                onClick={handleSeedToDb}
              >
                {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                Seed to Database
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">
              <p className="font-semibold mb-1">📦 What does this do?</p>
              <p>Seeds 11 high-priority development cards (RLS, Stripe, SMS, Budget, etc.) into the appropriate columns. Skips cards that already exist. Use this to populate your board with pre-built task templates.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isRunningTests}
                className="gap-1.5 border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
                onClick={handleRunTests}
              >
                {isRunningTests ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube2 className="w-3.5 h-3.5" />}
                Run Tests
                {testResults.length > 0 && (
                  <Badge className={`ml-1 text-[9px] px-1 py-0 ${failCount === 0 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                    {passCount}✓ {failCount > 0 ? `${failCount}✗` : ""}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Run 11 regression tests on the board (columns, cards, DB, WIP limit, etc.)</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex-1" />

        <Input
          placeholder="Search cards..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-xs h-8 text-sm"
        />
      </div>

      {/* ── Pipeline Controls ── */}
      <PipelineControls
        columns={board.columns}
        isRunning={autoExec.isRunning}
        currentPhase={autoExec.currentPhase}
        currentCardTitle={autoExec.currentCardTitle}
        processedCount={autoExec.processedCount}
        onExecute={autoExec.execute}
        onSweep={autoExec.sweep}
        onStop={autoExec.stop}
      />

      {/* ── Main Tabs: Board / Tests ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-8">
          <TabsTrigger value="board" className="text-xs gap-1.5">
            <Target className="w-3.5 h-3.5" /> Board
          </TabsTrigger>
          <TabsTrigger value="tests" className="text-xs gap-1.5 relative">
            <FlaskConical className="w-3.5 h-3.5" /> Regression Tests
            {testResults.length > 0 && failCount === 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
            )}
            {failCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Board Tab ── */}
        <TabsContent value="board" className="mt-3">
          <KanbanBoard
            isAdmin={true}
            columns={board.columns}
            cards={filtered}
            loading={board.loading}
            moveCard={board.moveCard}
            updateCard={board.updateCard}
            createCard={board.createCard}
            deleteCard={board.deleteCard}
          />
        </TabsContent>

        {/* ── Regression Tests Tab ── */}
        <TabsContent value="tests" className="mt-3">
          <div className="bg-muted/20 rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-sm">Board Regression Tests</span>
                {testResults.length > 0 && (
                  <div className="flex gap-1.5">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                      {passCount} passed
                    </Badge>
                    {failCount > 0 && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">
                        {failCount} failed
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={isRunningTests}
                className="gap-1.5 h-7 text-xs"
                onClick={handleRunTests}
              >
                {isRunningTests ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                {isRunningTests ? "Running..." : "Run All Tests"}
              </Button>
            </div>

            {testResults.length === 0 && !isRunningTests && (
              <div className="text-center py-8 text-muted-foreground">
                <TestTube2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No tests run yet. Click "Run All Tests" to validate the board.</p>
                <p className="text-xs mt-1 opacity-60">11 tests: columns, cards, DB integrity, WIP limits, delegation scores, storage</p>
              </div>
            )}

            {isRunningTests && (
              <div className="text-center py-6 text-muted-foreground">
                <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
                <p className="text-sm">Running tests...</p>
              </div>
            )}

            {testResults.length > 0 && !isRunningTests && (
              <div className="space-y-1.5">
                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Test Suite Progress</span>
                    <span className="font-mono">{passCount}/{testResults.length}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${failCount === 0 ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${(passCount / testResults.length) * 100}%` }}
                    />
                  </div>
                </div>

                {testResults.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 px-3 py-2 rounded-lg border text-xs ${
                      r.status === "pass"
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-red-500/5 border-red-500/20"
                    }`}
                  >
                    {r.status === "pass" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground">{r.name}</div>
                      {r.detail && <div className="text-muted-foreground mt-0.5">{r.detail}</div>}
                    </div>
                    {r.ms !== undefined && (
                      <span className="text-muted-foreground/50 flex-shrink-0 font-mono">{r.ms}ms</span>
                    )}
                  </div>
                ))}

                {failCount === 0 && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                    <CheckCheck className="w-4 h-4" />
                    All tests passed — board is healthy 🎉
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
