import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, ShoppingCart, Mail, MailX, Clock, CheckCircle2, Send } from "lucide-react";
import ExportCsvButton from "@/components/admin/ExportCsvButton";
import { format, formatDistanceToNow } from "date-fns";

type AbandonedCart = {
  id: string;
  stripe_session_id: string;
  tier: string;
  customer_email: string | null;
  status: string;
  created_at: string;
  recovery_sent_at: string | null;
  recovery_channel: string | null;
  completed_at: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending:       { label: "Pending",       variant: "secondary" },
  recovery_sent: { label: "Recovery Sent", variant: "default" },
  completed:     { label: "Completed",     variant: "outline" },
  no_email:      { label: "No Email",      variant: "destructive" },
};

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-5">
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AbandonedCartsTab() {
  const qc = useQueryClient();

  const { data: carts = [], isLoading, refetch } = useQuery<AbandonedCart[]>({
    queryKey: ["abandoned-carts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("abandoned_carts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as AbandonedCart[];
    },
  });

  const triggerRecovery = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("recover-abandoned-cart", { body: {} });
      if (error) throw error;
      return data as { processed: number; recovered: number };
    },
    onSuccess: (data) => {
      toast.success(`Recovery run: ${data.recovered} email(s) sent out of ${data.processed} carts processed`);
      qc.invalidateQueries({ queryKey: ["abandoned-carts"] });
    },
    onError: (err) => {
      console.error("[AbandonedCarts] Recovery error:", err);
      toast.error("Recovery run failed. Check edge function logs.");
    },
  });

  const pending   = carts.filter(c => c.status === "pending");
  const sent      = carts.filter(c => c.status === "recovery_sent");
  const completed = carts.filter(c => c.status === "completed");
  const noEmail   = carts.filter(c => c.status === "no_email");

  const recoverRate = sent.length + completed.length > 0
    ? Math.round((completed.length / (sent.length + completed.length)) * 100)
    : 0;

  const csvData = carts.map(c => ({
    id: c.id,
    tier: c.tier,
    email: c.customer_email ?? "",
    status: c.status,
    channel: c.recovery_channel ?? "",
    created_at: c.created_at,
    recovery_sent_at: c.recovery_sent_at ?? "",
    completed_at: c.completed_at ?? "",
  }));

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Abandoned Carts
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track checkout starts without completion and trigger recovery flows
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <ExportCsvButton data={csvData} filename="abandoned-carts" />
          <Button
            size="sm"
            onClick={() => triggerRecovery.mutate()}
            disabled={triggerRecovery.isPending || pending.length === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="w-4 h-4 mr-1.5" />
            {triggerRecovery.isPending ? "Running…" : `Run Recovery (${pending.length} pending)`}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Clock}        label="Pending"       value={pending.length}   sub="awaiting recovery" />
        <StatCard icon={Mail}         label="Recovery Sent" value={sent.length}       sub="email dispatched" />
        <StatCard icon={CheckCircle2} label="Recovered"     value={completed.length}  sub={`${recoverRate}% conversion`} />
        <StatCard icon={MailX}        label="No Email"      value={noEmail.length}    sub="unrecoverable" />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Cart Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Loading…</div>
          ) : carts.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No abandoned carts found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[130px]">Email</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Recovery Sent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carts.map(cart => {
                    const cfg = STATUS_CONFIG[cart.status] ?? { label: cart.status, variant: "outline" as const };
                    return (
                      <TableRow key={cart.id}>
                        <TableCell className="font-mono text-xs max-w-[160px] truncate">
                          {cart.customer_email ?? <span className="text-muted-foreground italic">—</span>}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{cart.tier}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground capitalize">
                          {cart.recovery_channel ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(cart.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {cart.recovery_sent_at
                            ? format(new Date(cart.recovery_sent_at), "MMM d, HH:mm")
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
