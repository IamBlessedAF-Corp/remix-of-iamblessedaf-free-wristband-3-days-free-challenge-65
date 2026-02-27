import { useState } from "react";
import {
  TrendingUp, Users, Share2, Gift, Zap,
  ArrowUpRight, ArrowDownRight, Target, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───
type FunnelStep = { label: string; value: number; rate?: string };
type KeyMetric = { key: string; label: string; unlockRate: number; avgTime: string; bcCost: number };

// ─── Mock Data (replace with Supabase queries) ───
const KFACTOR_SUMMARY = {
  current: 3.82,
  target: 4.0,
  trend: +0.14,
  period: "Last 7 days",
};

const VIRAL_FUNNEL: FunnelStep[] = [
  { label: "Invites Sent", value: 4_820 },
  { label: "Links Clicked", value: 2_174, rate: "45.1%" },
  { label: "Sign-ups", value: 891, rate: "41.0%" },
  { label: "Keys Started", value: 612, rate: "68.7%" },
  { label: "Master Key ✨", value: 287, rate: "46.9%" },
];

const KEY_METRICS: KeyMetric[] = [
  { key: "key0", label: "Key 0 — Activate", unlockRate: 94.2, avgTime: "2m", bcCost: 50 },
  { key: "key1", label: "Key 1 — Refer", unlockRate: 71.8, avgTime: "4h", bcCost: 100 },
  { key: "key2", label: "Key 2 — Story", unlockRate: 58.3, avgTime: "1d", bcCost: 150 },
  { key: "key3", label: "Key 3 — 3 Friends", unlockRate: 38.6, avgTime: "3d", bcCost: 200 },
];

const BC_ECONOMY = {
  totalMinted: 248_500,
  totalBurned: 41_200,
  avgPerUser: 312,
  redeemRate: 16.6,
};

const WEEKLY_KFACTOR = [
  { week: "W1", value: 3.21 },
  { week: "W2", value: 3.45 },
  { week: "W3", value: 3.68 },
  { week: "W4", value: 3.82 },
];

// ─── Stat Card ───
function StatCard({ label, value, sub, icon: Icon, trend, color = "text-primary" }: {
  label: string; value: string; sub?: string; icon: any; trend?: number; color?: string;
}) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 flex items-start gap-3">
      <div className={cn("p-2 rounded-lg bg-secondary/50", color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-xl font-bold text-foreground">{value}</span>
          {trend !== undefined && (
            <span className={cn("text-xs font-medium flex items-center gap-0.5",
              trend >= 0 ? "text-emerald-500" : "text-red-400"
            )}>
              {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {trend >= 0 ? "+" : ""}{trend}
            </span>
          )}
        </div>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Funnel Bar ───
function FunnelBar({ steps }: { steps: FunnelStep[] }) {
  const max = steps[0].value;
  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        const pct = (step.value / max) * 100;
        return (
          <div key={step.label} className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground w-28 text-right shrink-0">{step.label}</span>
            <div className="flex-1 h-7 bg-secondary/30 rounded-md overflow-hidden relative">
              <div
                className="h-full rounded-md transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, hsl(${260 - i * 30}, 70%, 55%), hsl(${260 - i * 30}, 60%, 45%))`,
                }}
              />
              <span className="absolute inset-0 flex items-center px-2 text-[11px] font-semibold text-white mix-blend-difference">
                {step.value.toLocaleString()}
              </span>
            </div>
            {step.rate && (
              <span className="text-[10px] font-medium text-muted-foreground w-12 text-right">{step.rate}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Mini Sparkline (CSS bars) ───
function Sparkline({ data, target }: { data: { week: string; value: number }[]; target: number }) {
  const max = Math.max(...data.map(d => d.value), target) * 1.1;
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d) => (
        <div key={d.week} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-secondary/30 rounded-t relative" style={{ height: 80 }}>
            <div
              className={cn(
                "absolute bottom-0 w-full rounded-t transition-all duration-500",
                d.value >= target ? "bg-emerald-500/80" : "bg-amber-500/80"
              )}
              style={{ height: `${(d.value / max) * 100}%` }}
            />
            {/* target line */}
            <div
              className="absolute w-full border-t border-dashed border-primary/50"
              style={{ bottom: `${(target / max) * 100}%` }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground">{d.week}</span>
          <span className="text-[10px] font-bold text-foreground">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════
// K-FACTOR TAB
// ═══════════════════════════════════════════════
export default function KFactorTab() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("7d");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            K-Factor Viral Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Joy Keys viral engine • Target K ≥ 4.0
          </p>
        </div>
        <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5">
          {(["7d", "30d", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={cn(
                "px-3 py-1 text-[11px] font-medium rounded-md transition-colors",
                timeRange === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r === "all" ? "All" : r}
            </button>
          ))}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="K-Factor"
          value={KFACTOR_SUMMARY.current.toFixed(2)}
          sub={KFACTOR_SUMMARY.period}
          icon={TrendingUp}
          trend={KFACTOR_SUMMARY.trend}
          color="text-amber-400"
        />
        <StatCard
          label="Total Referrals"
          value={VIRAL_FUNNEL[2].value.toLocaleString()}
          sub="From invite links"
          icon={Users}
          color="text-purple-400"
        />
        <StatCard
          label="Master Keys"
          value={VIRAL_FUNNEL[4].value.toLocaleString()}
          sub={`${((VIRAL_FUNNEL[4].value / VIRAL_FUNNEL[0].value) * 100).toFixed(1)}% full conversion`}
          icon={Gift}
          color="text-emerald-400"
        />
        <StatCard
          label="BC Minted"
          value={`${(BC_ECONOMY.totalMinted / 1000).toFixed(0)}K`}
          sub={`${BC_ECONOMY.redeemRate}% redeem rate`}
          icon={Activity}
          color="text-blue-400"
        />
      </div>

      {/* Two-column: Funnel + K-trend */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Funnel */}
        <div className="lg:col-span-3 bg-card border border-border/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-purple-400" />
            Referral Funnel
          </h3>
          <FunnelBar steps={VIRAL_FUNNEL} />
        </div>

        {/* K-Factor Trend */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            Weekly K-Factor
          </h3>
          <Sparkline data={WEEKLY_KFACTOR} target={KFACTOR_SUMMARY.target} />
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Dashed line = target ({KFACTOR_SUMMARY.target})
          </p>
        </div>
      </div>

      {/* Key-by-Key Breakdown */}
      <div className="bg-card border border-border/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Key Performance Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-2 px-2 text-muted-foreground font-medium">Key</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Unlock Rate</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Avg Time</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">BC Cost</th>
                <th className="text-left py-2 px-2 text-muted-foreground font-medium w-40">Progress</th>
              </tr>
            </thead>
            <tbody>
              {KEY_METRICS.map((k) => (
                <tr key={k.key} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                  <td className="py-2.5 px-2 font-medium text-foreground">{k.label}</td>
                  <td className="py-2.5 px-2 text-right">
                    <span className={cn(
                      "font-semibold",
                      k.unlockRate >= 70 ? "text-emerald-400" :
                      k.unlockRate >= 50 ? "text-amber-400" : "text-red-400"
                    )}>
                      {k.unlockRate}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right text-muted-foreground">{k.avgTime}</td>
                  <td className="py-2.5 px-2 text-right text-muted-foreground">{k.bcCost} BC</td>
                  <td className="py-2.5 px-2">
                    <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          k.unlockRate >= 70 ? "bg-emerald-500" :
                          k.unlockRate >= 50 ? "bg-amber-500" : "bg-red-500"
                        )}
                        style={{ width: `${k.unlockRate}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BC Economy */}
      <div className="bg-card border border-border/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Blessed Coins Economy</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Minted", value: BC_ECONOMY.totalMinted.toLocaleString(), color: "text-emerald-400" },
            { label: "Total Burned", value: BC_ECONOMY.totalBurned.toLocaleString(), color: "text-red-400" },
            { label: "Avg / User", value: `${BC_ECONOMY.avgPerUser} BC`, color: "text-blue-400" },
            { label: "Redeem Rate", value: `${BC_ECONOMY.redeemRate}%`, color: "text-amber-400" },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 bg-secondary/20 rounded-lg">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</p>
              <p className={cn("text-lg font-bold mt-1", item.color)}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formula Explanation */}
      <div className="bg-secondary/20 border border-border/30 rounded-xl p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">K-Factor Formula</p>
        <p>
          K = (avg invites per user) × (conversion rate per invite) × (key completion multiplier)
        </p>
        <p className="mt-1">
          Current: {KFACTOR_SUMMARY.current} = ~5.4 invites × 41% conversion × 1.72 multiplier
        </p>
      </div>
    </div>
  );
}
