import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSectionDashboard from "./AdminSectionDashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { RefreshCw, Pencil, CheckCircle, X, Coins, Store, Gift, History } from "lucide-react";

export default function GamificationTab() {
  const qc = useQueryClient();

  const { data: wallets = [], isLoading: wLoad } = useQuery({
    queryKey: ["admin-bc-wallets"],
    queryFn: async () => {
      const { data } = await supabase.from("bc_wallets").select("*").order("balance", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["admin-bc-transactions"],
    queryFn: async () => {
      const { data } = await supabase.from("bc_transactions").select("*").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  const { data: storeItems = [] } = useQuery({
    queryKey: ["admin-bc-store"],
    queryFn: async () => {
      const { data } = await supabase.from("bc_store_items").select("*").order("sort_order");
      return data || [];
    },
  });

  const { data: redemptions = [] } = useQuery({
    queryKey: ["admin-bc-redemptions"],
    queryFn: async () => {
      const { data } = await supabase.from("bc_redemptions").select("*").order("created_at", { ascending: false }).limit(200);
      return data || [];
    },
  });

  // Editable store items
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState<{ name: string; cost_bc: number; is_active: boolean; stock: number | null }>({ name: "", cost_bc: 0, is_active: true, stock: null });

  const handleEditItem = (item: any) => {
    setEditingItem(item.id);
    setItemDraft({ name: item.name, cost_bc: item.cost_bc, is_active: item.is_active, stock: item.stock });
  };

  const handleSaveItem = async (id: string) => {
    const { error } = await (supabase.from("bc_store_items") as any).update({
      name: itemDraft.name, cost_bc: itemDraft.cost_bc, is_active: itemDraft.is_active, stock: itemDraft.stock,
    }).eq("id", id);
    if (error) return toast.error("Failed to update");
    toast.success("Store item updated");
    setEditingItem(null);
    qc.invalidateQueries({ queryKey: ["admin-bc-store"] });
  };

  const totalBC = wallets.reduce((s, w) => s + w.balance, 0);
  const totalEarned = wallets.reduce((s, w) => s + w.lifetime_earned, 0);
  const totalSpent = wallets.reduce((s, w) => s + w.lifetime_spent, 0);

  if (wLoad) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Gamification (BC Economy)"
        description="Wallets, transactions, store items (editable), redemptions"
        kpis={[
          { label: "Wallets", value: wallets.length },
          { label: "Total BC", value: totalBC.toLocaleString() },
          { label: "Earned", value: totalEarned.toLocaleString() },
          { label: "Spent", value: totalSpent.toLocaleString() },
          { label: "Store Items", value: storeItems.length },
          { label: "Redemptions", value: redemptions.length },
        ]}
        charts={[
          { type: "pie", title: "BC Flow", data: [{ name: "In Wallets", value: totalBC || 1 }, { name: "Spent", value: totalSpent || 1 }] },
        ]}
      />

      <Tabs defaultValue="store" className="space-y-4">
        <TabsList>
          <TabsTrigger value="store" className="gap-1 text-xs"><Store className="w-3.5 h-3.5" /> Store Items</TabsTrigger>
          <TabsTrigger value="wallets" className="gap-1 text-xs"><Coins className="w-3.5 h-3.5" /> Wallets</TabsTrigger>
          <TabsTrigger value="transactions" className="gap-1 text-xs"><History className="w-3.5 h-3.5" /> Transactions</TabsTrigger>
          <TabsTrigger value="redemptions" className="gap-1 text-xs"><Gift className="w-3.5 h-3.5" /> Redemptions</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
                <th className="text-left py-2 px-3">Name</th><th className="text-left py-2 px-3">Category</th><th className="text-right py-2 px-3">Cost (BC)</th>
                <th className="text-right py-2 px-3">Stock</th><th className="text-center py-2 px-3">Active</th><th className="py-2 px-3"></th>
              </tr></thead>
              <tbody className="divide-y divide-border/10">
                {storeItems.map(item => (
                  <tr key={item.id} className="hover:bg-secondary/20">
                    <td className="py-2 px-3">
                      {editingItem === item.id ? (
                        <Input value={itemDraft.name} onChange={e => setItemDraft(d => ({ ...d, name: e.target.value }))} className="h-7 text-xs w-40" />
                      ) : (
                        <span className="font-medium">{item.name}</span>
                      )}
                    </td>
                    <td className="py-2 px-3"><Badge variant="outline" className="text-[10px]">{item.category}</Badge></td>
                    <td className="py-2 px-3 text-right">
                      {editingItem === item.id ? (
                        <Input type="number" value={itemDraft.cost_bc} onChange={e => setItemDraft(d => ({ ...d, cost_bc: Number(e.target.value) }))} className="h-7 text-xs w-20 text-right" />
                      ) : (
                        <span className="font-bold">{item.cost_bc}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {editingItem === item.id ? (
                        <Input type="number" value={itemDraft.stock ?? ""} onChange={e => setItemDraft(d => ({ ...d, stock: e.target.value ? Number(e.target.value) : null }))} className="h-7 text-xs w-16 text-right" placeholder="∞" />
                      ) : (
                        <span>{item.stock ?? "∞"}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {editingItem === item.id ? (
                        <Switch checked={itemDraft.is_active} onCheckedChange={v => setItemDraft(d => ({ ...d, is_active: v }))} />
                      ) : (
                        <Badge className={`text-[10px] ${item.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>{item.is_active ? "Active" : "Off"}</Badge>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {editingItem === item.id ? (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleSaveItem(item.id)}><CheckCircle className="w-3 h-3 text-emerald-400" /></Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingItem(null)}><X className="w-3 h-3" /></Button>
                        </div>
                      ) : (
                        <Button size="icon" variant="ghost" className="h-6 w-6 opacity-50 hover:opacity-100" onClick={() => handleEditItem(item)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="wallets">
          <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
                <th className="text-left py-2 px-3">User ID</th><th className="text-right py-2 px-3">Balance</th><th className="text-right py-2 px-3">Earned</th>
                <th className="text-right py-2 px-3">Spent</th><th className="text-right py-2 px-3">Streak</th><th className="text-left py-2 px-3">Last Bonus</th>
              </tr></thead>
              <tbody className="divide-y divide-border/10">
                {wallets.map(w => (
                  <tr key={w.id} className="hover:bg-secondary/20">
                    <td className="py-2 px-3 font-mono text-muted-foreground text-[10px]">{w.user_id.slice(0, 8)}…</td>
                    <td className="py-2 px-3 text-right font-bold">{w.balance}</td>
                    <td className="py-2 px-3 text-right text-emerald-400">{w.lifetime_earned}</td>
                    <td className="py-2 px-3 text-right text-red-400">{w.lifetime_spent}</td>
                    <td className="py-2 px-3 text-right">{w.streak_days} 🔥</td>
                    <td className="py-2 px-3 text-muted-foreground">{w.last_login_bonus_at || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
                <th className="text-left py-2 px-3">Type</th><th className="text-left py-2 px-3">Reason</th><th className="text-right py-2 px-3">Amount</th>
                <th className="text-right py-2 px-3">After</th><th className="text-left py-2 px-3">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-border/10">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-secondary/20">
                    <td className="py-2 px-3"><Badge variant="outline" className={`text-[10px] ${t.type === "earn" ? "border-emerald-500/30 text-emerald-400" : "border-red-500/30 text-red-400"}`}>{t.type}</Badge></td>
                    <td className="py-2 px-3 text-muted-foreground">{t.reason}</td>
                    <td className={`py-2 px-3 text-right font-bold ${t.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>{t.amount > 0 ? "+" : ""}{t.amount}</td>
                    <td className="py-2 px-3 text-right">{t.balance_after}</td>
                    <td className="py-2 px-3 text-muted-foreground">{new Date(t.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="redemptions">
          <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
                <th className="text-left py-2 px-3">User</th><th className="text-right py-2 px-3">Cost BC</th><th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Code</th><th className="text-left py-2 px-3">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-border/10">
                {redemptions.map(r => (
                  <tr key={r.id} className="hover:bg-secondary/20">
                    <td className="py-2 px-3 font-mono text-muted-foreground text-[10px]">{r.user_id.slice(0, 8)}…</td>
                    <td className="py-2 px-3 text-right font-bold">{r.cost_bc}</td>
                    <td className="py-2 px-3"><Badge variant="outline" className="text-[10px]">{r.status}</Badge></td>
                    <td className="py-2 px-3 font-mono text-muted-foreground">{r.redemption_code || "—"}</td>
                    <td className="py-2 px-3 text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
