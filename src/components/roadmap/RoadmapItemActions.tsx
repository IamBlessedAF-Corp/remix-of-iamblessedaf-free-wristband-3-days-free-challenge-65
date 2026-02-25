import { useState } from "react";
import { Cpu, Send, Loader2, Check, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Column IDs are fetched dynamically — no hardcoded UUIDs

interface RoadmapItemActionsProps {
  title: string;
  detail?: string;
  phaseName: string;
}

const from = (table: string) => supabase.from(table as never);

/* ═══════════════════════════════════════════════════════
   LIVE SYSTEM SNAPSHOT — injected into every prompt
   ═══════════════════════════════════════════════════════ */

const LIVE_ROUTES = [
  "/", "/challenge", "/challenge/thanks", "/r/:code", "/go/:code", "/confirm/:token",
  "/offer/111", "/offer/111/grok", "/offer/111/gpt", "/offer/444", "/offer/11mo",
  "/offer/1111", "/offer/4444", "/offer/success",
  "/make-2500-with-1-ai-clip", "/2us-Clippers-Campaign",
  "/admin", "/admin/*",
  "/portal", "/impact", "/clipper-dashboard", "/experts", "/scripts-review",
  "/Gratitude-Clips-Challenge", "/Traffic-Funnel",
  "/privacy", "/terms",
  "/Reserve-your-Neuro-Hack-Wristband-SMART", "/Reserve-a-SMART-wristband",
  "/neuro-hacker-waitlist", "/FREE-neuro-hacker-wristband",
  "/3300us-Credit", "/3300us-Credit-Expert", "/3300us-Credit-N-Marketer",
  "/3300us-Credit-RE-Agent", "/3300us-Credit-Affiliate-Marketer",
  "/3300us-Credit-Clipper", "/3300us-Credit-Influencer",
  "/3300us-Credit-Podcast-Host", "/3300us-Credit-Gym-Owner",
  "/3300us-Credit-Health-Coach", "/3300us-Credit-Portal",
  "/affiliate-dashboard", "/affiliate-portal", "/diamond-ambassador",
  "/Congrats-Neuro-Hacker", "/unsubscribe-digest", "/block-preview",
];

const LIVE_EDGE_FUNCTIONS = [
  "auto-assign-segments", "budget-alerts", "card-ai-chat", "card-blocker-notify",
  "clip-approved-notification", "confirm-blessing", "create-checkout",
  "elevenlabs-conversation-token", "expert-scripts", "ingest-error",
  "invite-user", "manage-user", "portal-daily-login", "process-board-task",
  "process-voice-transcript", "process-weekly-payout",
  "schedule-challenge-messages", "send-email-otp", "send-expert-welcome",
  "send-followup-sequences", "send-network-marketer-welcome", "send-otp",
  "send-scheduled-messages", "send-sms", "send-tier-milestone-email",
  "send-weekly-digest", "send-welcome-email", "send-whatsapp-invite",
  "send-wristband-welcome", "short-link", "sms-router", "sms-status-webhook",
  "stripe-webhook", "tgf-friday", "upload-board-screenshot", "verify-backup",
  "verify-clip", "verify-youtube-views",
];

const LIVE_HOOKS = [
  "useABTest", "useAchievements", "useAdminAuth", "useAuth", "useAutoExecute",
  "useBcWallet", "useBoard", "useBudgetControl", "useCampaignConfig",
  "useClipperAdmin", "useClipperDashboard", "useClipperEconomy",
  "useClipperLeaderboard", "useClipperSocialProof", "useCopyValue",
  "useCountdown", "useExitIntent", "useExitIntentTracking", "useExpertScripts",
  "useFunnelProgress", "useGamificationStats", "useGlobalMeals",
  "useLinkAnalytics", "useLiveImpactMetrics", "useMovementCount", "usePageMeta",
  "usePaginatedQuery", "usePortalData", "useRealtimeSync", "useReservationCount",
  "useRoadmapCompletions", "useShortLinks", "useSimulatedStats",
  "useSmsAuditLog", "useSmsDeliveries", "useSpinLogic", "useStripeCheckout",
  "useTrafficAnalytics", "useUrgencyStock", "useVoiceScriptGeneration",
  "useWristbandWaitlist",
];

const LIVE_DB_TABLES = [
  "affiliate_tiers", "audit_log", "backup_verifications", "bc_redemptions",
  "bc_store_items", "bc_transactions", "bc_wallets", "blessings", "board_cards",
  "board_columns", "budget_cycles", "budget_events_log", "budget_segment_cycles",
  "budget_segments", "campaign_config", "challenge_participants",
  "changelog_entries", "clip_submissions", "clipper_monthly_bonuses",
  "clipper_payouts", "clipper_risk_throttle", "clipper_segment_membership",
  "creator_profiles", "error_events", "exit_intent_events", "expert_leads",
  "expert_scripts", "followup_sequences", "link_clicks", "orders", "otp_codes",
  "portal_activity", "query_performance_logs", "repost_logs",
  "roadmap_completions", "role_permissions", "scheduled_gratitude_messages",
  "short_links", "smart_wristband_waitlist", "user_roles",
];

const ADMIN_TABS = [
  "Dashboard", "Clippers", "Links", "Traffic", "Payments", "Budget Control",
  "Affiliates", "Leaderboard", "Messaging", "Challenge", "Blessings",
  "Gamification", "Orders", "Abandoned Carts", "Experts", "Congrats", "Copy Manager", "Board",
  "Roadmap", "Roles", "Database", "Integrations", "Intelligent Blocks",
  "Alerts", "Error Monitor", "Risk Engine", "Fraud Monitor", "Forecast",
  "Changelog", "User Management", "Waitlist", "SMS",
];

/**
 * Generates a system-aware master prompt with safety guards.
 * Injects the LIVE snapshot of routes, edge functions, hooks, DB tables,
 * and admin sections so the AI agent never duplicates or disconnects work.
 */
function generateMasterPrompt(title: string, detail: string, phaseName: string): string {
  const timestamp = new Date().toISOString();

  return `🧠 ETHEREUM MASTER DEVELOPER — EXECUTION PROMPT
Generated: ${timestamp}

📌 TASK: ${title}
📂 PHASE: ${phaseName}
📝 CONTEXT: ${detail}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 SAFETY PROTOCOL — MANDATORY BEFORE ANY CHANGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ⛔ DO NOT create files, routes, hooks, or edge functions that already exist (see snapshot below)
2. ⛔ DO NOT modify supabase/config.toml, .env, client.ts, or types.ts — they are auto-generated
3. ⛔ DO NOT add CHECK constraints with now() — use validation triggers instead
4. ⛔ DO NOT touch auth, storage, realtime, or vault schemas
5. ⛔ DO NOT use \`any\` types — strict TypeScript only
6. ✅ ALWAYS add RLS policies for new tables
7. ✅ ALWAYS use semantic Tailwind tokens (--primary, --foreground, etc.), never raw colors
8. ✅ ALWAYS wrap new DB calls in try/catch with user-facing toast errors
9. ✅ ALWAYS add CORS headers to edge functions
10. ✅ ALWAYS test on mobile viewport before marking done
11. ✅ ALWAYS invalidate relevant React Query caches after mutations
12. ✅ ALWAYS add new tables to useRealtimeSync if they need live updates
13. ✅ IF creating a new admin section, add it to AdminHub sidebar + GlobalSearchModal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 LIVE SYSTEM SNAPSHOT (${timestamp})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🗺️ ROUTES (${LIVE_ROUTES.length}):
${LIVE_ROUTES.map(r => `  • ${r}`).join("\n")}

⚡ EDGE FUNCTIONS (${LIVE_EDGE_FUNCTIONS.length}):
${LIVE_EDGE_FUNCTIONS.map(f => `  • ${f}`).join("\n")}

🪝 HOOKS (${LIVE_HOOKS.length}):
${LIVE_HOOKS.map(h => `  • ${h}`).join("\n")}

🗄️ DB TABLES (${LIVE_DB_TABLES.length}):
${LIVE_DB_TABLES.map(t => `  • ${t}`).join("\n")}

🛠️ ADMIN TABS (${ADMIN_TABS.length}):
${ADMIN_TABS.map(t => `  • ${t}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━━
🎯 EXECUTION PROTOCOL
━━━━━━━━━━━━━━━━━━━━━━

1. ANALYZE — Cross-reference the task against the snapshot above.
   - Which existing hooks/components/functions relate to this task?
   - Will this modify existing tables or need new ones?
   - Does a route already exist for this? An admin tab?

2. IDENTIFY CONFLICTS — Before writing code:
   - Search for existing implementations that overlap
   - Check if the feature partially exists (avoid duplication)
   - Map all affected files

3. IMPLEMENT with safety:
   - Use existing patterns: AdminSectionDashboard, usePaginatedQuery, ExportCsvButton
   - Import from @/integrations/supabase/client (never create new clients)
   - Use supabase.functions.invoke() for edge function calls
   - Add ErrorBoundary wrapping for new page-level components
   - Use captureError() from @/lib/errorCapture for async error reporting

4. DATABASE SAFETY:
   - New tables: RLS ON + policies for owner + admin access
   - Migrations only for schema changes; use insert tool for data
   - Add indexes for columns used in WHERE/ORDER BY on large tables
   - Never use raw SQL from user input — always parameterized

5. EDGE FUNCTION SAFETY:
   - Rate limit: sliding window per IP (configurable)
   - Zod validation on all inputs
   - CORS headers on every response (including errors)
   - Generic error messages to client (log details server-side)
   - verify_jwt = false in config.toml, validate in code

6. VALIDATE:
   - Run existing Vitest suite: ensure 0 regressions
   - Run Deno tests for affected edge functions
   - Test mobile viewport (390×844)
   - Verify RLS with both authenticated and anonymous requests

7. CONNECT THE DOTS:
   - Add to useRealtimeSync if table needs live updates
   - Add to GlobalSearchModal index if new admin section
   - Update roadmap_completions when done
   - Log to changelog_entries via admin

━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 HORMOZI GROWTH LENS
━━━━━━━━━━━━━━━━━━━━━━━━━━
- How does this increase LTV?
- How does this reduce CAC?
- How does this improve K-factor?
- Does this create a moat or competitive advantage?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 ROLLBACK PLAN (if things break)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- All DB changes via migrations = reversible
- Edge functions auto-deploy = redeploy previous version
- React components lazy-loaded = isolate failures
- ErrorBoundary catches render crashes
- captureError() logs to error_events table

Execute with conviction. Ship fast, ship right.`;
}

export default function RoadmapItemActions({ title, detail, phaseName }: RoadmapItemActionsProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const openPromptModal = () => {
    setEditablePrompt(generateMasterPrompt(title, detail || "", phaseName));
    setSent(null);
    setShowPrompt(true);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(editablePrompt);
      setCopied(true);
      toast.success("Master prompt copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleSendToBoard = async (columnName: string, displayName: string) => {
    setSending(true);
    try {
      // Look up column ID by name
      const { data: col, error: colErr } = await supabase
        .from("board_columns")
        .select("id")
        .eq("name", columnName)
        .maybeSingle();
      if (colErr) throw colErr;
      if (!col) throw new Error(`Column "${columnName}" not found`);

      const { error } = await (from("board_cards") as ReturnType<typeof from>).insert({
        column_id: col.id,
        title: title.length > 100 ? title.slice(0, 97) + "..." : title,
        description: detail || null,
        master_prompt: editablePrompt,
        priority: "medium",
        position: 999,
        labels: ["roadmap-generated"],
      } as never);
      if (error) throw error;
      setSent(displayName);
      toast.success(`✅ Sent to ${displayName}!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed: ${message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <button
        onClick={(e) => { e.stopPropagation(); openPromptModal(); }}
        className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-semibold rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 transition-colors"
        title="Generate System-Aware Master Prompt"
      >
        <Cpu className="w-3 h-3" />
        Generate Master Prompt
      </button>

      {showPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowPrompt(false)}
        >
          <div
            className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">System-Aware Master Prompt</h3>
                  <p className="text-[9px] text-muted-foreground">
                    Live snapshot: {LIVE_ROUTES.length} routes • {LIVE_EDGE_FUNCTIONS.length} functions • {LIVE_DB_TABLES.length} tables • {LIVE_HOOKS.length} hooks
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopyPrompt}
                className={`px-3 py-1.5 text-[10px] font-semibold rounded-md transition-colors ${
                  copied
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                }`}
              >
                {copied ? (
                  <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Copied!</span>
                ) : (
                  <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</span>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <textarea
                value={editablePrompt}
                onChange={(e) => setEditablePrompt(e.target.value)}
                className="w-full h-full min-h-[340px] text-[11px] text-foreground bg-secondary/30 border border-border/50 rounded-lg p-4 font-mono leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-primary/40"
                spellCheck={false}
              />
            </div>

            <div className="px-5 py-3 border-t border-border/50 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {sent ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <Check className="w-3 h-3" />
                    Sent to {sent}
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => handleSendToBoard("To Do", "💡 Ideas")}
                      disabled={sending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      💡 Send to Ideas
                    </button>
                    <button
                      onClick={() => handleSendToBoard("Backlog", "📦 Backlog")}
                      disabled={sending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      📦 Send to Backlog
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-md bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
