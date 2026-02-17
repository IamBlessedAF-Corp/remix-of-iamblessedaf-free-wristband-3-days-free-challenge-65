import { useState, useEffect } from "react";
import { useCampaignConfig, type CampaignConfigItem, type PendingChange } from "@/hooks/useCampaignConfig";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Target, DollarSign, Zap, Clock, ShieldAlert, Save, AlertTriangle,
  CheckCircle, RefreshCw, Pencil, X, ArrowRight,
} from "lucide-react";
import AdminSectionDashboard from "./AdminSectionDashboard";

const CATEGORY_META: Record<string, { icon: any; title: string }> = {
  thresholds: { icon: Target, title: "Activation Thresholds" },
  economics: { icon: DollarSign, title: "Economics" },
  bonuses: { icon: Zap, title: "Monthly Bonuses" },
  schedule: { icon: Clock, title: "Schedule" },
  risk: { icon: ShieldAlert, title: "Risk / Throttle" },
};

// Format display value based on key
function formatDisplay(key: string, value: string): string {
  if (key === "rpm") return `$${value}`;
  if (key.endsWith("_cents")) return `$${(Number(value) / 100).toFixed(2)}`;
  if (key.startsWith("min_") && key !== "min_views" && key !== "min_payout_cents") return `${(Number(value) * 100).toFixed(1)}%`;
  if (key === "min_views") return Number(value).toLocaleString();
  if (key === "throttle_rpm_override") return `$${value}`;
  return value;
}

export default function EditableCampaignSettings() {
  const { configs, loading, saveChanges, refresh, byCategory } = useCampaignConfig();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [saving, setSaving] = useState(false);

  // Sync drafts when configs load
  useEffect(() => {
    const d: Record<string, string> = {};
    configs.forEach(c => { d[c.key] = c.value; });
    setDrafts(d);
  }, [configs]);

  const hasChanges = configs.some(c => drafts[c.key] !== undefined && drafts[c.key] !== c.value);

  const handleStartEdit = (key: string) => setEditingKey(key);
  const handleCancelEdit = (key: string) => {
    const orig = configs.find(c => c.key === key);
    if (orig) setDrafts(prev => ({ ...prev, [key]: orig.value }));
    setEditingKey(null);
  };

  const handleDraftChange = (key: string, val: string) => {
    setDrafts(prev => ({ ...prev, [key]: val }));
  };

  const handleConfirmEdit = () => setEditingKey(null); // just close inline editor, value stays in draft

  // Collect all changes and open confirmation modal
  const handleReviewChanges = () => {
    const changes: PendingChange[] = [];
    configs.forEach(c => {
      if (drafts[c.key] !== undefined && drafts[c.key] !== c.value) {
        changes.push({
          key: c.key,
          label: c.label,
          oldValue: c.value,
          newValue: drafts[c.key],
          affected_areas: c.affected_areas,
          category: c.category,
        });
      }
    });
    setPendingChanges(changes);
    setConfirmOpen(true);
  };

  const handleDeploy = async () => {
    setSaving(true);
    try {
      await saveChanges(pendingChanges);
      toast.success(`${pendingChanges.length} setting(s) deployed successfully!`);
      setConfirmOpen(false);
      setPendingChanges([]);
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  // Build KPIs from current config values
  const kpiConfigs = ["min_views", "min_ctr", "min_reg_rate", "rpm", "min_payout_cents"];
  const kpis = kpiConfigs.map(key => {
    const c = configs.find(x => x.key === key);
    return {
      label: c?.label || key,
      value: c ? formatDisplay(c.key, drafts[c.key] ?? c.value) : "—",
      delta: drafts[key] !== undefined && configs.find(x => x.key === key)?.value !== drafts[key]
        ? "✏️ Changed"
        : undefined,
    };
  });

  const categories = Object.keys(CATEGORY_META);

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Campaign Settings"
        description="Edit any setting below — click Save to review all changes before deploying"
        kpis={kpis}
      />

      {/* Save bar */}
      {hasChanges && (
        <div className="sticky top-0 z-10 bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              You have unsaved changes
            </span>
            <Badge className="bg-primary/20 text-primary text-[10px]">
              {configs.filter(c => drafts[c.key] !== c.value).length} modified
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => {
              const d: Record<string, string> = {};
              configs.forEach(c => { d[c.key] = c.value; });
              setDrafts(d);
              setEditingKey(null);
            }} className="gap-1 text-xs"><X className="w-3 h-3" /> Discard</Button>
            <Button size="sm" onClick={handleReviewChanges} className="gap-1 text-xs">
              <Save className="w-3 h-3" /> Review & Deploy
            </Button>
          </div>
        </div>
      )}

      {/* Settings by category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {categories.map(cat => {
          const meta = CATEGORY_META[cat];
          const items = byCategory(cat);
          if (items.length === 0) return null;
          const Icon = meta.icon;
          return (
            <div key={cat} className="bg-card border border-border/40 rounded-xl p-5 space-y-1">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-primary" /> {meta.title}
              </h3>
              {items.map(item => {
                const isEditing = editingKey === item.key;
                const isDirty = drafts[item.key] !== item.value;
                return (
                  <div key={item.key} className={`flex items-center justify-between py-2.5 px-2 rounded-lg border-b border-border/15 last:border-0 transition-colors ${isDirty ? "bg-primary/5" : ""} ${isEditing ? "bg-secondary/50" : ""}`}>
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium text-foreground">{item.label}</p>
                        {isDirty && <Badge className="bg-amber-500/15 text-amber-400 text-[9px] px-1">modified</Badge>}
                      </div>
                      {item.description && <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isEditing ? (
                        <>
                          <Input
                            value={drafts[item.key] ?? item.value}
                            onChange={e => handleDraftChange(item.key, e.target.value)}
                            className="w-28 h-7 text-xs font-mono text-right"
                            autoFocus
                            onKeyDown={e => { if (e.key === "Enter") handleConfirmEdit(); if (e.key === "Escape") handleCancelEdit(item.key); }}
                          />
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleConfirmEdit}>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCancelEdit(item.key)}>
                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Badge variant="outline" className={`text-xs font-mono cursor-pointer hover:border-primary/50 transition-colors ${isDirty ? "border-amber-500/50 text-amber-400" : ""}`} onClick={() => handleStartEdit(item.key)}>
                            {formatDisplay(item.key, drafts[item.key] ?? item.value)}
                          </Badge>
                          <Button size="icon" variant="ghost" className="h-7 w-7 opacity-50 hover:opacity-100" onClick={() => handleStartEdit(item.key)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Confirm Deployment
            </DialogTitle>
            <DialogDescription>
              Review all changes and their impact before deploying. These changes will be applied immediately across all affected areas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {pendingChanges.map(ch => (
              <div key={ch.key} className="bg-secondary/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{ch.label}</span>
                  <Badge variant="outline" className="text-[10px]">{ch.category}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-red-400 line-through">{formatDisplay(ch.key, ch.oldValue)}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-mono text-emerald-400 font-bold">{formatDisplay(ch.key, ch.newValue)}</span>
                </div>
                <div className="mt-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Affected Areas:</p>
                  <div className="flex flex-wrap gap-1">
                    {ch.affected_areas.map(area => (
                      <Badge key={area} className="bg-primary/10 text-primary text-[10px] border-primary/20">{area}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleDeploy} disabled={saving} className="gap-1.5">
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              {saving ? "Deploying..." : `Deploy ${pendingChanges.length} Change${pendingChanges.length > 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
