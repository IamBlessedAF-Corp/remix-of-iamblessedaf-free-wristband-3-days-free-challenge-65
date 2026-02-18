import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import PaginationControls from "./PaginationControls";
import AdminSectionDashboard from "./AdminSectionDashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RefreshCw, Pencil, CheckCircle, X, Search } from "lucide-react";
import ExportCsvButton from "./ExportCsvButton";

export default function OrdersTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");

  const { data: orders, isLoading, page, totalPages, totalCount, pageSize, nextPage, prevPage } = usePaginatedQuery({
    table: "orders",
    queryKey: "admin-orders",
    pageSize: 50,
  });

  const handleSave = async (id: string) => {
    const { error } = await (supabase.from("orders") as any).update({ status: editStatus }).eq("id", id);
    if (error) return toast.error("Failed to update");
    toast.success("Order updated");
    setEditingId(null);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const filtered = search.trim()
    ? orders.filter(o => o.customer_email?.toLowerCase().includes(search.toLowerCase()) || o.tier.toLowerCase().includes(search.toLowerCase()) || o.stripe_session_id.includes(search))
    : orders;

  const totalRevenue = orders.filter(o => o.status === "completed").reduce((s, o) => s + o.amount_cents, 0);
  const tierMap: Record<string, number> = {};
  orders.forEach(o => { tierMap[o.tier] = (tierMap[o.tier] || 0) + 1; });

  if (isLoading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Orders"
        description="All purchases — editable status"
        kpis={[
          { label: "Total Orders", value: orders.length },
          { label: "Completed", value: orders.filter(o => o.status === "completed").length },
          { label: "Revenue", value: `$${(totalRevenue / 100).toFixed(2)}` },
          { label: "Tiers", value: Object.keys(tierMap).length },
        ]}
        charts={[
          { type: "pie", title: "By Tier", data: Object.entries(tierMap).slice(0, 6).map(([name, value]) => ({ name: name.slice(0, 12), value })) },
        ]}
      />
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search email, tier, session..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
        </div>
        <ExportCsvButton data={filtered} filename="orders.csv" columns={["customer_email", "tier", "amount_cents", "referral_code", "status", "currency", "created_at"]} />
      </div>
      <div className="bg-card border border-border/40 rounded-xl overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
            <th className="text-left py-2 px-3">Email</th><th className="text-left py-2 px-3">Tier</th><th className="text-right py-2 px-3">Amount</th>
            <th className="text-left py-2 px-3">Referral</th><th className="text-left py-2 px-3">Status</th><th className="text-left py-2 px-3">Date</th><th className="py-2 px-3"></th>
          </tr></thead>
          <tbody className="divide-y divide-border/10">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-secondary/20">
                <td className="py-2 px-3 font-medium">{o.customer_email || "—"}</td>
                <td className="py-2 px-3"><Badge variant="outline" className="text-[10px]">{o.tier}</Badge></td>
                <td className="py-2 px-3 text-right font-bold">${(o.amount_cents / 100).toFixed(2)}</td>
                <td className="py-2 px-3 text-muted-foreground">{o.referral_code || "—"}</td>
                <td className="py-2 px-3">
                  {editingId === o.id ? (
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger className="h-7 w-28 text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">completed</SelectItem>
                        <SelectItem value="pending">pending</SelectItem>
                        <SelectItem value="refunded">refunded</SelectItem>
                        <SelectItem value="cancelled">cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={`text-[10px] ${o.status === "completed" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>{o.status}</Badge>
                  )}
                </td>
                <td className="py-2 px-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="py-2 px-3">
                  {editingId === o.id ? (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleSave(o.id)}><CheckCircle className="w-3 h-3 text-emerald-400" /></Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(null)}><X className="w-3 h-3" /></Button>
                    </div>
                  ) : (
                    <Button size="icon" variant="ghost" className="h-6 w-6 opacity-50 hover:opacity-100" onClick={() => { setEditingId(o.id); setEditStatus(o.status); }}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationControls page={page} totalPages={totalPages} totalCount={totalCount} pageSize={pageSize} onPrev={prevPage} onNext={nextPage} />
    </div>
  );
}
