import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, DollarSign, AlertTriangle, CheckCircle, Clock,
  Plus, Trash2, Edit, Lock, Unlock, Zap, Download,
  TrendingUp, BarChart3, Target, Activity, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useBudgetControl, type BudgetSegment } from "@/hooks/useBudgetControl";
import { downloadCsv } from "@/utils/csvExport";

const fmt$ = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const statusColors: Record<string, string> = {
  pending_approval: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  locked: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  killed: "bg-red-500/15 text-red-400 border-red-500/30",
  throttled: "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

const statusIcons: Record<string, any> = {
  pending_approval: Clock,
  pending: Clock,
  approved: CheckCircle,
  locked: Lock,
  killed: XCircle,
  throttled: AlertTriangle,
};

// ─── Section 1: Global Budgets ───
const GlobalBudgets = ({ budget }: { budget: ReturnType<typeof useBudgetControl> }) => {
  const { cycle, updateCycleLimits, updateCycleStatus } = budget;
  const [editing, setEditing] = useState(false);
  const [limits, setLimits] = useState({
    weekly: cycle?.global_weekly_limit_cents || 500000,
    monthly: cycle?.global_monthly_limit_cents || 2000000,
    reserve: cycle?.emergency_reserve_cents || 50000,
    maxClip: cycle?.max_payout_per_clip_cents || 50000,
    maxClipper: cycle?.max_payout_per_clipper_week_cents || 100000,
  });

  if (!cycle) return null;

  const handleSave = async () => {
    await updateCycleLimits({
      global_weekly_limit_cents: limits.weekly,
      global_monthly_limit_cents: limits.monthly,
      emergency_reserve_cents: limits.reserve,
      max_payout_per_clip_cents: limits.maxClip,
      max_payout_per_clipper_week_cents: limits.maxClipper,
    });
    setEditing(false);
    toast.success("Global limits updated");
  };

  const StatusIcon = statusIcons[cycle.status] || Clock;

  return (
    <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Global Budget Controls</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[cycle.status]}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {cycle.status.replace(/_/g, " ")}
          </Badge>
          {cycle.status === "pending_approval" && (
            <Button size="sm" onClick={() => updateCycleStatus("approved")} className="gap-1">
              <CheckCircle className="w-3 h-3" /> Approve Cycle
            </Button>
          )}
          {cycle.status === "approved" && (
            <Button size="sm" variant="destructive" onClick={() => updateCycleStatus("killed")} className="gap-1">
              <XCircle className="w-3 h-3" /> Kill Switch
            </Button>
          )}
          {cycle.status === "killed" && (
            <Button size="sm" onClick={() => updateCycleStatus("approved")} className="gap-1">
              <Unlock className="w-3 h-3" /> Reactivate
            </Button>
          )}
        </div>
      </div>

      <div className="text-[11px] text-muted-foreground">
        Cycle: {new Date(cycle.start_date).toLocaleDateString()} → {new Date(cycle.end_date).toLocaleDateString()}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Weekly Limit", key: "weekly" as const, value: limits.weekly },
          { label: "Monthly Limit", key: "monthly" as const, value: limits.monthly },
          { label: "Emergency Reserve", key: "reserve" as const, value: limits.reserve },
          { label: "Max / Clip", key: "maxClip" as const, value: limits.maxClip },
          { label: "Max / Clipper / Week", key: "maxClipper" as const, value: limits.maxClipper },
        ].map((item) => (
          <div key={item.key} className="bg-secondary/30 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
            {editing ? (
              <Input
                type="number"
                value={item.value / 100}
                onChange={(e) => setLimits((prev) => ({ ...prev, [item.key]: Math.round(Number(e.target.value) * 100) }))}
                className="h-7 text-sm"
              />
            ) : (
              <p className="text-lg font-bold text-foreground">{fmt$(item.value)}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        {editing ? (
          <>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave}>Save Limits</Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1">
            <Edit className="w-3 h-3" /> Edit Limits
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── Section 2: Segment Budgets ───
const SegmentBudgets = ({ budget }: { budget: ReturnType<typeof useBudgetControl> }) => {
  const { segments, segmentCycles, createSegment, updateSegment, deleteSegment, updateSegmentCycleStatus } = budget;
  const [showCreate, setShowCreate] = useState(false);
  const [newSeg, setNewSeg] = useState({ name: "", weekly: 100000, monthly: 400000, priority: 1 });

  const handleCreate = async () => {
    if (!newSeg.name.trim()) return toast.error("Name required");
    await createSegment({
      name: newSeg.name,
      weekly_limit_cents: newSeg.weekly,
      monthly_limit_cents: newSeg.monthly,
      priority: newSeg.priority,
      rules: {},
    });
    setShowCreate(false);
    setNewSeg({ name: "", weekly: 100000, monthly: 400000, priority: 1 });
    toast.success("Segment created");
  };

  return (
    <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Segment Budgets</h3>
        </div>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)} className="gap-1">
          <Plus className="w-3 h-3" /> Add Segment
        </Button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Name</label>
                  <Input value={newSeg.name} onChange={(e) => setNewSeg((p) => ({ ...p, name: e.target.value }))} className="h-8 text-sm" placeholder="Tier 1 Clippers" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Weekly Limit ($)</label>
                  <Input type="number" value={newSeg.weekly / 100} onChange={(e) => setNewSeg((p) => ({ ...p, weekly: Math.round(Number(e.target.value) * 100) }))} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Monthly Limit ($)</label>
                  <Input type="number" value={newSeg.monthly / 100} onChange={(e) => setNewSeg((p) => ({ ...p, monthly: Math.round(Number(e.target.value) * 100) }))} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase">Priority</label>
                  <Input type="number" value={newSeg.priority} onChange={(e) => setNewSeg((p) => ({ ...p, priority: Number(e.target.value) }))} className="h-8 text-sm" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate}>Create</Button>
                <Button size="sm" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {segments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No segments created yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20">
                <th className="text-left py-2 px-2">Segment</th>
                <th className="text-right py-2 px-2">Weekly</th>
                <th className="text-right py-2 px-2">Monthly</th>
                <th className="text-right py-2 px-2">Spent</th>
                <th className="text-right py-2 px-2">Projected</th>
                <th className="text-right py-2 px-2">Remaining</th>
                <th className="text-center py-2 px-2">Status</th>
                <th className="text-center py-2 px-2">Priority</th>
                <th className="text-right py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {segments.map((seg) => {
                const sc = segmentCycles.find((s) => s.segment_id === seg.id);
                const spentPct = sc ? Math.round((sc.spent_cents / seg.weekly_limit_cents) * 100) : 0;
                const scStatus = sc?.status || "pending";
                const ScIcon = statusIcons[scStatus] || Clock;

                return (
                  <tr key={seg.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2 px-2">
                      <p className="font-semibold text-foreground">{seg.name}</p>
                      <p className="text-[10px] text-muted-foreground">{Object.keys(seg.rules).length > 0 ? JSON.stringify(seg.rules) : "No rules"}</p>
                    </td>
                    <td className="text-right py-2 px-2 font-medium">{fmt$(seg.weekly_limit_cents)}</td>
                    <td className="text-right py-2 px-2">{fmt$(seg.monthly_limit_cents)}</td>
                    <td className="text-right py-2 px-2">
                      <div className="space-y-1">
                        <span>{fmt$(sc?.spent_cents || 0)}</span>
                        <Progress value={spentPct} className="h-1" />
                      </div>
                    </td>
                    <td className="text-right py-2 px-2">{fmt$(sc?.projected_cents || 0)}</td>
                    <td className="text-right py-2 px-2 font-medium">{fmt$(sc?.remaining_cents || seg.weekly_limit_cents)}</td>
                    <td className="text-center py-2 px-2">
                      <Badge className={`text-[10px] ${statusColors[scStatus]}`}>
                        <ScIcon className="w-3 h-3 mr-0.5" />
                        {scStatus}
                      </Badge>
                    </td>
                    <td className="text-center py-2 px-2">
                      <span className="text-xs font-bold">{seg.priority}</span>
                    </td>
                    <td className="text-right py-2 px-2">
                      <div className="flex gap-1 justify-end">
                        {sc && scStatus === "pending" && (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => updateSegmentCycleStatus(sc.id, "approved")}>
                            Approve
                          </Button>
                        )}
                        {sc && scStatus === "approved" && (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-orange-400" onClick={() => updateSegmentCycleStatus(sc.id, "throttled")}>
                            Throttle
                          </Button>
                        )}
                        {sc && (scStatus === "throttled" || scStatus === "killed") && (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-emerald-400" onClick={() => updateSegmentCycleStatus(sc.id, "approved")}>
                            Reopen
                          </Button>
                        )}
                        {sc && scStatus !== "killed" && (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 text-red-400" onClick={() => updateSegmentCycleStatus(sc.id, "killed")}>
                            Kill
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400" onClick={() => {
                          if (confirm(`Delete segment "${seg.name}"?`)) deleteSegment(seg.id);
                        }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Spend warnings */}
      {segments.map((seg) => {
        const sc = segmentCycles.find((s) => s.segment_id === seg.id);
        const spentPct = sc ? Math.round((sc.spent_cents / seg.weekly_limit_cents) * 100) : 0;
        if (spentPct < 80) return null;
        return (
          <div
            key={`warn-${seg.id}`}
            className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
              spentPct >= 100 ? "bg-red-500/10 text-red-400 border border-red-500/30" :
              spentPct >= 95 ? "bg-orange-500/10 text-orange-400 border border-orange-500/30" :
              "bg-amber-500/10 text-amber-400 border border-amber-500/30"
            }`}
          >
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span><strong>{seg.name}</strong>: {spentPct}% of weekly budget used{spentPct >= 100 ? " — HARD FREEZE" : spentPct >= 95 ? " — SOFT THROTTLE" : " — WARNING"}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Section 3: Simulation ───
const SimulationEngine = ({ budget }: { budget: ReturnType<typeof useBudgetControl> }) => {
  const [rpm, setRpm] = useState(2.22);
  const [weeklyLimit, setWeeklyLimit] = useState((budget.cycle?.global_weekly_limit_cents || 500000) / 100);

  // Auto-run simulation on mount and whenever inputs change
  const result = budget.simulate({ rpm, weeklyLimit: Math.round(weeklyLimit * 100) });
  const realSpend = budget.realSpendCents;
  const simSpend = result.day7Forecast;
  const avgPerClip = (result.avgEarningsPerClipCents || 300) / 100;

  return (
    <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">What-If Simulation</h3>
        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] ml-auto">Auto-updating</Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase">RPM ($)</label>
          <Input type="number" step="0.01" value={rpm} onChange={(e) => setRpm(Number(e.target.value))} className="h-8 text-sm" />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase">Weekly Limit ($)</label>
          <Input type="number" value={weeklyLimit} onChange={(e) => setWeeklyLimit(Number(e.target.value))} className="h-8 text-sm" />
        </div>
        <div className="bg-secondary/30 rounded-lg p-2 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Max Views</p>
          <p className="text-sm font-bold text-foreground">{(result.maxViews || 0).toLocaleString()}</p>
        </div>
        <div className="bg-secondary/30 rounded-lg p-2 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Clips @ ~${avgPerClip.toFixed(2)} avg</p>
          <p className="text-sm font-bold text-foreground">{(result.totalClips || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Real vs Simulated comparison */}
      <div className="bg-secondary/20 border border-border/30 rounded-lg p-4 space-y-3">
        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-primary" /> Real vs. Simulated (This Week)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground uppercase">Real Spend</p>
            <p className="text-xl font-bold text-foreground">{fmt$(realSpend)}</p>
            <Progress value={Math.min(100, (realSpend / Math.round(weeklyLimit * 100)) * 100)} className="h-2" />
            <p className="text-[10px] text-muted-foreground">{Math.round((realSpend / Math.round(weeklyLimit * 100)) * 100)}% of budget</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground uppercase">Simulated (Full Budget)</p>
            <p className="text-xl font-bold text-primary">{fmt$(simSpend)}</p>
            <Progress value={100} className="h-2" />
            <p className="text-[10px] text-muted-foreground">100% utilization → {result.totalClips} clips</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border/20 pt-2">
          <TrendingUp className="w-3 h-3" />
          <span>Gap: <strong className="text-foreground">{fmt$(simSpend - realSpend)}</strong> remaining capacity this week</span>
        </div>
      </div>

      {/* Segment Distribution */}
      {result.segDistribution && result.segDistribution.length > 0 && (
        <div className="bg-secondary/20 border border-border/30 rounded-lg p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-primary" /> Budget Distribution by Segment
          </h4>
          <div className="space-y-2">
            {result.segDistribution.map((seg) => (
              <div key={seg.name} className="flex items-center gap-3">
                <span className="text-xs font-medium text-foreground w-32 truncate">{seg.name}</span>
                <div className="flex-1">
                  <Progress value={seg.pctUsed} className="h-2" />
                </div>
                <span className="text-[10px] text-muted-foreground w-16 text-right">{seg.clips} clips</span>
                <span className="text-[10px] font-medium text-foreground w-20 text-right">{fmt$(seg.spendCents)}</span>
                <span className="text-[10px] text-muted-foreground w-12 text-right">{seg.pctUsed}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "7-Day Forecast", value: result.day7Forecast },
          { label: "30-Day Projection", value: result.day30Projection },
          { label: "Worst Case", value: result.worstCase },
          { label: "Risk-Adjusted", value: result.riskAdjusted },
          { label: "Safe Limit", value: result.safeLimit },
        ].map((item) => (
          <div key={item.label} className="bg-secondary/30 rounded-lg p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase">{item.label}</p>
            <p className="text-lg font-bold text-foreground">{fmt$(item.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Section 4: Audit Log ───
const AuditLog = ({ budget }: { budget: ReturnType<typeof useBudgetControl> }) => {
  const { events } = budget;

  return (
    <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Budget Events Log</h3>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No events logged yet.</p>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {events.map((evt) => (
            <div key={evt.id} className="flex items-start gap-3 text-xs border-b border-border/10 pb-2">
              <span className="text-muted-foreground shrink-0 w-28">
                {new Date(evt.created_at).toLocaleString()}
              </span>
              <div className="flex-1">
                <span className="font-semibold text-foreground">{evt.action.replace(/_/g, " ")}</span>
                {evt.notes && <p className="text-muted-foreground mt-0.5">{evt.notes}</p>}
              </div>
              {evt.estimated_impact_cents !== 0 && (
                <span className="text-muted-foreground shrink-0">
                  Impact: {fmt$(evt.estimated_impact_cents || 0)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Section 5: Exports ───
const ExportsSection = ({ budget }: { budget: ReturnType<typeof useBudgetControl> }) => {
  const handleExport = (type: string) => {
    const { segments, segmentCycles, events } = budget;

    if (type === "segments") {
      const header = "Segment,Weekly Limit,Monthly Limit,Priority,Status,Spent,Projected,Remaining";
      const rows = segments.map((s) => {
        const sc = segmentCycles.find((x) => x.segment_id === s.id);
        return [s.name, s.weekly_limit_cents / 100, s.monthly_limit_cents / 100, s.priority, sc?.status || "N/A", (sc?.spent_cents || 0) / 100, (sc?.projected_cents || 0) / 100, (sc?.remaining_cents || 0) / 100].join(",");
      });
      downloadCsv([header, ...rows].join("\n"), `budget-segments-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success("Segments exported");
    }

    if (type === "events") {
      const header = "Timestamp,Action,Impact";
      const rows = events.map((e) => [e.created_at, e.action, (e.estimated_impact_cents || 0) / 100].join(","));
      downloadCsv([header, ...rows].join("\n"), `budget-events-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success("Events exported");
    }
  };

  return (
    <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Download className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Export Reports</h3>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => handleExport("segments")} className="gap-1">
          <Download className="w-3 h-3" /> Segment Budgets CSV
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleExport("events")} className="gap-1">
          <Download className="w-3 h-3" /> Events Log CSV
        </Button>
      </div>
    </div>
  );
};

// ─── Main Budget Control Tab ───
const BudgetControlTab = () => {
  const budget = useBudgetControl();

  if (budget.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global kill switch banner */}
      {budget.cycle?.status === "killed" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-400">GLOBAL KILL SWITCH ACTIVE</p>
            <p className="text-xs text-red-400/70">All payouts are frozen. No segments can process payments until reactivated.</p>
          </div>
        </motion.div>
      )}

      {/* Pending approval warning */}
      {budget.cycle?.status === "pending_approval" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-400">WEEKLY APPROVAL REQUIRED</p>
            <p className="text-xs text-amber-400/70">Global cycle and segment budgets must be approved before Friday payouts can execute.</p>
          </div>
        </motion.div>
      )}

      <GlobalBudgets budget={budget} />
      <SegmentBudgets budget={budget} />

      <Tabs defaultValue="simulation" className="space-y-4">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>
        <TabsContent value="simulation">
          <SimulationEngine budget={budget} />
        </TabsContent>
        <TabsContent value="audit">
          <AuditLog budget={budget} />
        </TabsContent>
        <TabsContent value="exports">
          <ExportsSection budget={budget} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetControlTab;
