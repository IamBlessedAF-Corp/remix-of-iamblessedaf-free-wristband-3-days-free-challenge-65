import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ShieldCheck, ShieldAlert, RefreshCw, Clock, Database,
  CheckCircle, AlertTriangle, XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

interface TableDetail {
  table: string;
  rowCount: number;
  status: "ok" | "warning" | "error";
  message: string;
}

interface Anomaly {
  type: string;
  table: string;
  message: string;
  severity: "warning" | "error";
}

interface BackupVerification {
  id: string;
  verified_at: string;
  status: string;
  total_tables_checked: number;
  total_rows_snapshot: number;
  table_details: TableDetail[];
  anomalies: Anomaly[];
  duration_ms: number;
  alert_sent: boolean;
  notes: string | null;
}

const STATUS_STYLES: Record<string, { icon: typeof ShieldCheck; color: string; bg: string }> = {
  success: { icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  warning: { icon: ShieldAlert, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  failure: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
};

/**
 * Admin panel for viewing backup verification history
 * and triggering manual verification runs.
 */
export default function BackupVerificationPanel() {
  const [triggering, setTriggering] = useState(false);

  const { data: verifications = [], isLoading, refetch } = useQuery({
    queryKey: ["backup-verifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_verifications")
        .select("*")
        .order("verified_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as unknown as BackupVerification[];
    },
    staleTime: 30_000,
  });

  const latest = verifications[0] ?? null;
  const style = STATUS_STYLES[latest?.status ?? "success"] ?? STATUS_STYLES.success;
  const StatusIcon = style.icon;

  const triggerManualCheck = async () => {
    setTriggering(true);
    try {
      const { error } = await supabase.functions.invoke("verify-backup");
      if (error) throw error;
      toast.success("Backup verification completed");
      refetch();
    } catch (err) {
      toast.error("Verification failed — check edge function logs");
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header + Trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold text-foreground">Backup Verification</h2>
            <p className="text-xs text-muted-foreground">
              Automated integrity checks on critical database tables
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          disabled={triggering}
          onClick={triggerManualCheck}
        >
          <RefreshCw className={`w-3 h-3 ${triggering ? "animate-spin" : ""}`} />
          {triggering ? "Running…" : "Run Now"}
        </Button>
      </div>

      {/* Latest Status Card */}
      {latest ? (
        <Card className={`border ${style.bg}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-8 h-8 ${style.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-foreground uppercase">{latest.status}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {latest.total_tables_checked} tables
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {latest.total_rows_snapshot.toLocaleString()} rows
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {latest.duration_ms}ms
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last verified {format(new Date(latest.verified_at), "MMM d, yyyy HH:mm:ss")}
                </p>
                {latest.notes && (
                  <p className="text-xs text-destructive mt-1">{latest.notes}</p>
                )}
              </div>
              {latest.alert_sent && (
                <Badge variant="destructive" className="text-[10px] shrink-0">
                  Alert Sent
                </Badge>
              )}
            </div>

            {/* Table Details */}
            {latest.table_details.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {latest.table_details.map((td) => (
                  <div
                    key={td.table}
                    className={`rounded-lg p-2 border text-center ${
                      td.status === "ok"
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : td.status === "warning"
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-destructive/5 border-destructive/20"
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      {td.status === "ok" ? (
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      ) : td.status === "warning" ? (
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                      ) : (
                        <XCircle className="w-3 h-3 text-destructive" />
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">{td.table}</p>
                    <p className="text-xs font-bold text-foreground">{td.rowCount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Anomalies */}
            {latest.anomalies.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-[10px] font-bold text-foreground uppercase">Anomalies</p>
                {latest.anomalies.map((a, i) => (
                  <div
                    key={i}
                    className={`text-xs p-2 rounded border ${
                      a.severity === "error"
                        ? "border-destructive/30 bg-destructive/5 text-destructive"
                        : "border-amber-500/30 bg-amber-500/5 text-amber-400"
                    }`}
                  >
                    <span className="font-mono font-bold">{a.table}</span>: {a.message}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="border border-border/40">
          <CardContent className="p-8 text-center">
            <Database className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No verifications yet</p>
            <p className="text-xs text-muted-foreground">Click "Run Now" to trigger your first backup check.</p>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {verifications.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Verification History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Time</TableHead>
                    <TableHead className="text-[10px]">Status</TableHead>
                    <TableHead className="text-[10px] text-right">Tables</TableHead>
                    <TableHead className="text-[10px] text-right">Rows</TableHead>
                    <TableHead className="text-[10px] text-right">Anomalies</TableHead>
                    <TableHead className="text-[10px] text-right">Duration</TableHead>
                    <TableHead className="text-[10px]">Alert</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verifications.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {format(new Date(v.verified_at), "MMM d HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            v.status === "success"
                              ? "border-emerald-500/30 text-emerald-400"
                              : v.status === "warning"
                              ? "border-amber-500/30 text-amber-400"
                              : "border-destructive/30 text-destructive"
                          }`}
                        >
                          {v.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right">{v.total_tables_checked}</TableCell>
                      <TableCell className="text-xs text-right font-mono">
                        {v.total_rows_snapshot.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {v.anomalies.length > 0 ? (
                          <span className="text-destructive font-bold">{v.anomalies.length}</span>
                        ) : (
                          "0"
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">{v.duration_ms}ms</TableCell>
                      <TableCell>
                        {v.alert_sent && (
                          <Badge variant="destructive" className="text-[10px]">Sent</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
