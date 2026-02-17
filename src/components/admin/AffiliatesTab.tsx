import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSectionDashboard from "./AdminSectionDashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RefreshCw, Pencil, CheckCircle, X } from "lucide-react";

export default function AffiliatesTab() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ current_tier: string; credit_amount: number }>({ current_tier: "starter", credit_amount: 3300 });

  const { data: tiers = [], isLoading } = useQuery({
    queryKey: ["admin-affiliate-tiers"],
    queryFn: async () => {
      const { data } = await supabase.from("affiliate_tiers").select("*").order("credit_amount", { ascending: false });
      return data || [];
    },
  });

  const handleSave = async (id: string) => {
    const { error } = await (supabase.from("affiliate_tiers") as any).update({
      current_tier: draft.current_tier, credit_amount: draft.credit_amount,
    }).eq("id", id);
    if (error) return toast.error("Failed");
    toast.success("Tier updated");
    setEditingId(null);
    qc.invalidateQueries({ queryKey: ["admin-affiliate-tiers"] });
  };

  const tierMap: Record<string, number> = {};
  tiers.forEach(t => { tierMap[t.current_tier] = (tierMap[t.current_tier] || 0) + 1; });
  const totalWristbands = tiers.reduce((s, t) => s + t.wristbands_distributed, 0);

  if (isLoading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Affiliate Tiers"
        description="Editable tier levels and credit amounts"
        kpis={[
          { label: "Affiliates", value: tiers.length },
          { label: "Total Wristbands", value: totalWristbands },
          { label: "Total Credits", value: `$${(tiers.reduce((s, t) => s + t.credit_amount, 0) / 100).toFixed(0)}` },
          { label: "Tiers Used", value: Object.keys(tierMap).length },
        ]}
        charts={[
          { type: "pie", title: "By Tier", data: Object.entries(tierMap).map(([name, value]) => ({ name, value })) },
        ]}
      />

      <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
            <th className="text-left py-2 px-3">User ID</th><th className="text-left py-2 px-3">Tier</th><th className="text-right py-2 px-3">Credit ($)</th>
            <th className="text-right py-2 px-3">Wristbands</th><th className="text-left py-2 px-3">Unlocked</th><th className="py-2 px-3"></th>
          </tr></thead>
          <tbody className="divide-y divide-border/10">
            {tiers.map(t => (
              <tr key={t.id} className="hover:bg-secondary/20">
                <td className="py-2 px-3 font-mono text-muted-foreground text-[10px]">{t.user_id.slice(0, 8)}…</td>
                <td className="py-2 px-3">
                  {editingId === t.id ? (
                    <Select value={draft.current_tier} onValueChange={v => setDraft(d => ({ ...d, current_tier: v }))}>
                      <SelectTrigger className="h-7 w-28 text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["starter", "bronze", "silver", "gold", "diamond"].map(tier => (
                          <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">{t.current_tier}</Badge>
                  )}
                </td>
                <td className="py-2 px-3 text-right">
                  {editingId === t.id ? (
                    <Input type="number" value={draft.credit_amount} onChange={e => setDraft(d => ({ ...d, credit_amount: Number(e.target.value) }))} className="h-7 text-xs w-20 text-right" />
                  ) : (
                    <span className="font-bold">${(t.credit_amount / 100).toFixed(2)}</span>
                  )}
                </td>
                <td className="py-2 px-3 text-right">{t.wristbands_distributed}</td>
                <td className="py-2 px-3 text-muted-foreground">{t.tier_unlocked_at ? new Date(t.tier_unlocked_at).toLocaleDateString() : "—"}</td>
                <td className="py-2 px-3">
                  {editingId === t.id ? (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleSave(t.id)}><CheckCircle className="w-3 h-3 text-emerald-400" /></Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(null)}><X className="w-3 h-3" /></Button>
                    </div>
                  ) : (
                    <Button size="icon" variant="ghost" className="h-6 w-6 opacity-50 hover:opacity-100" onClick={() => { setEditingId(t.id); setDraft({ current_tier: t.current_tier, credit_amount: t.credit_amount }); }}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
