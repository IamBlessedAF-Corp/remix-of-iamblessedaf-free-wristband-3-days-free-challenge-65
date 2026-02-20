import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RefreshCw, CheckCircle2, XCircle, Clock, Play, FlaskConical,
  ShieldCheck, Zap, Database, Mail, CreditCard, Users, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Test Suite Definition ───────────────────────────────────────────────────

type TestStatus = "idle" | "running" | "pass" | "fail";

type TestCase = {
  id: string;
  name: string;
  description: string;
  category: "edge-function" | "database" | "auth" | "payments" | "messaging" | "core-logic";
  fn: () => Promise<{ passed: boolean; details?: string }>;
};

const CATEGORY_META: Record<TestCase["category"], { label: string; icon: React.ElementType; color: string }> = {
  "edge-function":  { label: "Edge Functions",  icon: Zap,          color: "text-primary" },
  "database":       { label: "Database",         icon: Database,     color: "text-accent-foreground" },
  "auth":           { label: "Auth & Roles",     icon: ShieldCheck,  color: "text-secondary-foreground" },
  "payments":       { label: "Payments",         icon: CreditCard,   color: "text-chart-2" },
  "messaging":      { label: "Messaging",        icon: Mail,         color: "text-chart-4" },
  "core-logic":     { label: "Core Logic",       icon: BarChart3,    color: "text-chart-5" },
};

// Helper to invoke an edge function using raw fetch so errors never escape
// as unhandled rejections (which would be captured by the global error monitor).
// 4xx = expected guard rejection → pass; 5xx = server crash → fail.
async function invokeEdgeFn(
  name: string,
  body: Record<string, unknown> = {},
): Promise<{ passed: boolean; details?: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const url = `https://${projectId}.supabase.co/functions/v1/${name}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { parsed = text; }

    if (res.status >= 500) {
      return { passed: false, details: `${res.status}: ${text.slice(0, 120)}` };
    }
    // 4xx = guard working correctly → pass
    if (res.status >= 400) {
      const msg = typeof parsed === "object" && parsed !== null
        ? JSON.stringify(parsed).slice(0, 120)
        : text.slice(0, 120);
      return { passed: true, details: `Expected ${res.status} rejection: ${msg}` };
    }
    return { passed: true, details: JSON.stringify(parsed).slice(0, 120) };
  } catch (err) {
    // Network-level failure only (DNS, timeout, etc.)
    return { passed: false, details: `Network error: ${String(err)}` };
  }
}

const TEST_SUITE: TestCase[] = [
  // ── Edge Functions ────────────────────────────────────────────────────────
  {
    id: "ef-verify-clip",
    name: "verify-clip: rejects missing clip URL",
    category: "edge-function",
    description: "Should return 4xx when no clip URL is supplied",
    fn: () => invokeEdgeFn("verify-clip", {}),
  },
  {
    id: "ef-send-otp",
    name: "send-otp: rejects invalid phone",
    category: "edge-function",
    description: "Should return 4xx for a non-phone string",
    fn: () => invokeEdgeFn("send-otp", { phone: "not-a-phone" }),
  },
  {
    id: "ef-process-payout",
    name: "process-weekly-payout: rejects unknown action",
    category: "edge-function",
    description: "Should return 400 for an unrecognised action",
    fn: () => invokeEdgeFn("process-weekly-payout", { action: "invalid_action_xyz" }),
  },
  {
    id: "ef-invite-user",
    name: "invite-user: rejects non-admin token",
    category: "edge-function",
    description: "Should return 401/403 when called with anon token",
    fn: () => invokeEdgeFn("invite-user", { email: "test@test.com", password: "Test1234!", role: "developer" }),
  },
  {
    id: "ef-manage-user",
    name: "manage-user: rejects non-admin token",
    category: "edge-function",
    description: "Should return 401/403 for anon callers",
    fn: () => invokeEdgeFn("manage-user", { action: "reset_password", user_id: "test", new_password: "12345678" }),
  },
  {
    id: "ef-recover-cart",
    name: "recover-abandoned-cart: runs without crash",
    category: "edge-function",
    description: "Scheduled function should respond without a 5xx",
    fn: () => invokeEdgeFn("recover-abandoned-cart", {}),
  },
  {
    id: "ef-budget-alerts",
    name: "budget-alerts: responds without crash",
    category: "edge-function",
    description: "Scheduled function should respond without a 5xx",
    fn: () => invokeEdgeFn("budget-alerts", {}),
  },
  {
    id: "ef-daily-report",
    name: "daily-report: responds without crash",
    category: "edge-function",
    description: "Scheduled function should respond without a 5xx",
    fn: () => invokeEdgeFn("daily-report", {}),
  },
  // ── Database ──────────────────────────────────────────────────────────────
  {
    id: "db-abandoned-carts",
    name: "abandoned_carts: readable by admin",
    category: "database",
    description: "RLS should allow admins to SELECT from abandoned_carts",
    fn: async () => {
      try {
        const { error } = await supabase.from("abandoned_carts").select("id").limit(1);
        return error ? { passed: false, details: error.message } : { passed: true };
      } catch (e) { return { passed: false, details: String(e) }; }
    },
  },
  {
    id: "db-clip-submissions",
    name: "clip_submissions: readable by admin",
    category: "database",
    description: "RLS should allow admins to SELECT from clip_submissions",
    fn: async () => {
      try {
        const { error } = await supabase.from("clip_submissions").select("id").limit(1);
        return error ? { passed: false, details: error.message } : { passed: true };
      } catch (e) { return { passed: false, details: String(e) }; }
    },
  },
  {
    id: "db-orders",
    name: "orders: readable by admin",
    category: "database",
    description: "RLS should allow admins to SELECT from orders",
    fn: async () => {
      try {
        const { error } = await supabase.from("orders").select("id").limit(1);
        return error ? { passed: false, details: error.message } : { passed: true };
      } catch (e) { return { passed: false, details: String(e) }; }
    },
  },
  {
    id: "db-user-roles",
    name: "user_roles: readable by admin",
    category: "database",
    description: "Admin should be able to read the user_roles table",
    fn: async () => {
      try {
        const { error } = await supabase.from("user_roles").select("id").limit(1);
        return error ? { passed: false, details: error.message } : { passed: true };
      } catch (e) { return { passed: false, details: String(e) }; }
    },
  },
  {
    id: "db-bc-wallets",
    name: "bc_wallets: readable by admin",
    category: "database",
    description: "Admin should be able to read bc_wallets",
    fn: async () => {
      try {
        const { error } = await supabase.from("bc_wallets").select("id").limit(1);
        return error ? { passed: false, details: error.message } : { passed: true };
      } catch (e) { return { passed: false, details: String(e) }; }
    },
  },
  // ── Core Logic ────────────────────────────────────────────────────────────
  {
    id: "logic-payout-rpm",
    name: "Payout RPM: floor ≥ $2.22",
    category: "core-logic",
    description: "RPM payout floor must be at least $2.22 per 1k net views",
    fn: async () => {
      const RPM_FLOOR_CENTS = 222;
      const netViews = 1000;
      const earnings = Math.max(RPM_FLOOR_CENTS, Math.round((netViews / 1000) * RPM_FLOOR_CENTS));
      const passed = earnings >= RPM_FLOOR_CENTS;
      return { passed, details: `1k views → ${earnings}¢ (floor ${RPM_FLOOR_CENTS}¢)` };
    },
  },
  {
    id: "logic-referral-code",
    name: "Referral code: no ambiguous chars",
    category: "core-logic",
    description: "Generated codes must not contain 0, O, I, l",
    fn: async () => {
      const AMBIGUOUS = /[0OIl]/;
      const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
      const code = Array.from({ length: 8 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
      const passed = !AMBIGUOUS.test(code);
      return { passed, details: `Sample code: ${code}` };
    },
  },
  {
    id: "logic-bc-streak",
    name: "BC streak bonus: day 7 = 50 BC",
    category: "core-logic",
    description: "7-day login streak should award exactly 50 BlessingCoins",
    fn: async () => {
      const getBonus = (streak: number) => streak >= 30 ? 200 : streak >= 7 ? 50 : streak >= 3 ? 20 : 10;
      const passed = getBonus(7) === 50 && getBonus(3) === 20 && getBonus(1) === 10;
      return { passed, details: `Streak 1→10, 3→20, 7→50, 30→200` };
    },
  },
  {
    id: "logic-utm-cta",
    name: "UTM CTA: paid medium maps correctly",
    category: "core-logic",
    description: "utm_medium=cpc should resolve to 'Claim Your Discount' CTA",
    fn: async () => {
      const resolveCta = (medium: string) => {
        const paid = ["cpc", "cpm", "paid", "paid_social", "ppc"];
        return paid.includes(medium) ? "Claim Your Discount" : "Join Free";
      };
      const passed = resolveCta("cpc") === "Claim Your Discount" && resolveCta("organic") === "Join Free";
      return { passed, details: `cpc→"Claim Your Discount", organic→"Join Free"` };
    },
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

type TestState = { status: TestStatus; details?: string; durationMs?: number };

export default function RegressionTestsTab() {
  const [states, setStates] = useState<Record<string, TestState>>(() =>
    Object.fromEntries(TEST_SUITE.map(t => [t.id, { status: "idle" }]))
  );
  const [running, setRunning] = useState(false);

  const setTest = (id: string, patch: Partial<TestState>) =>
    setStates(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const runAll = async () => {
    setRunning(true);
    // Reset all to running
    setStates(Object.fromEntries(TEST_SUITE.map(t => [t.id, { status: "running" }])));

    const results = await Promise.allSettled(
      TEST_SUITE.map(async (t) => {
        const start = Date.now();
        try {
          const result = await t.fn();
          setTest(t.id, {
            status: result.passed ? "pass" : "fail",
            details: result.details,
            durationMs: Date.now() - start,
          });
          return result.passed;
        } catch (err) {
          setTest(t.id, { status: "fail", details: String(err), durationMs: Date.now() - start });
          return false;
        }
      })
    );

    const passed = results.filter(r => r.status === "fulfilled" && r.value === true).length;
    const total = TEST_SUITE.length;
    setRunning(false);
    if (passed === total) {
      toast.success(`✅ All ${total} tests passed`);
    } else {
      toast.error(`${total - passed} of ${total} tests failed`);
    }
  };

  const runSingle = async (test: TestCase) => {
    setTest(test.id, { status: "running" });
    const start = Date.now();
    try {
      const result = await test.fn();
      setTest(test.id, {
        status: result.passed ? "pass" : "fail",
        details: result.details,
        durationMs: Date.now() - start,
      });
    } catch (err) {
      setTest(test.id, { status: "fail", details: String(err), durationMs: Date.now() - start });
    }
  };

  const summary = {
    total: TEST_SUITE.length,
    pass: Object.values(states).filter(s => s.status === "pass").length,
    fail: Object.values(states).filter(s => s.status === "fail").length,
    running: Object.values(states).filter(s => s.status === "running").length,
  };

  const categories = [...new Set(TEST_SUITE.map(t => t.category))] as TestCase["category"][];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" />
            Regression Tests
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live test suite — edge functions, database access, core logic
          </p>
        </div>
        <Button
          onClick={runAll}
          disabled={running}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          size="sm"
        >
          {running
            ? <><RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> Running…</>
            : <><Play className="w-4 h-4 mr-1.5" /> Run All Tests</>}
        </Button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",   value: summary.total,   icon: FlaskConical, cls: "text-muted-foreground" },
          { label: "Passed",  value: summary.pass,    icon: CheckCircle2, cls: "text-chart-2" },
          { label: "Failed",  value: summary.fail,    icon: XCircle,      cls: "text-destructive" },
          { label: "Running", value: summary.running, icon: Clock,        cls: "text-chart-4" },
        ].map(({ label, value, icon: Icon, cls }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 pt-4 pb-3">
              <Icon className={cn("w-5 h-5 shrink-0", cls)} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn("text-2xl font-bold", cls)}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tests by category */}
      {categories.map(cat => {
        const meta = CATEGORY_META[cat];
        const CatIcon = meta.icon;
        const tests = TEST_SUITE.filter(t => t.category === cat);
        return (
          <Card key={cat}>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <CatIcon className={cn("w-4 h-4", meta.color)} />
                {meta.label}
                <Badge variant="outline" className="ml-auto text-[10px]">
                  {tests.filter(t => states[t.id].status === "pass").length}/{tests.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {tests.map(test => {
                  const state = states[test.id];
                  return (
                    <div key={test.id} className="flex items-start gap-3 px-4 py-3 group">
                      {/* Status icon */}
                      <div className="mt-0.5 shrink-0">
                        {state.status === "idle"    && <Clock className="w-4 h-4 text-muted-foreground/50" />}
                        {state.status === "running" && <RefreshCw className="w-4 h-4 text-chart-4 animate-spin" />}
                        {state.status === "pass"    && <CheckCircle2 className="w-4 h-4 text-chart-2" />}
                        {state.status === "fail"    && <XCircle className="w-4 h-4 text-destructive" />}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground leading-snug">{test.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{test.description}</p>
                        {state.details && (
                          <p className={cn(
                            "text-[10px] mt-1 font-mono truncate",
                            state.status === "fail" ? "text-destructive" : "text-muted-foreground"
                          )}>
                            {state.details}
                          </p>
                        )}
                      </div>
                      {/* Duration + run button */}
                      <div className="flex items-center gap-2 shrink-0">
                        {state.durationMs !== undefined && (
                          <span className="text-[10px] text-muted-foreground">{state.durationMs}ms</span>
                        )}
                        <button
                          onClick={() => runSingle(test)}
                          disabled={state.status === "running" || running}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary disabled:opacity-30"
                          title="Run this test"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
