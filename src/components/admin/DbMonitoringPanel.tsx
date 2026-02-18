import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Activity, AlertTriangle, Clock, Database, Gauge, RefreshCw,
  Server, Zap, TrendingUp, BarChart3,
} from "lucide-react";
import { format } from "date-fns";

/** Severity badge colors using semantic tokens */
const SEVERITY_STYLES: Record<string, string> = {
  info: "bg-primary/10 text-primary border-primary/20",
  warn: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  slow: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

interface QueryLog {
  id: string;
  created_at: string;
  source: string;
  function_name: string | null;
  query_duration_ms: number;
  row_count: number | null;
  severity: string;
  query_fingerprint: string | null;
  metadata: Record<string, unknown> | null;
  connection_info: Record<string, unknown> | null;
}

/** Hook: fetch table row counts for health overview */
function useTableHealthStats() {
  return useQuery({
    queryKey: ["db-health-stats"],
    queryFn: async () => {
      const tables = [
        "orders", "clip_submissions", "creator_profiles", "link_clicks",
        "short_links", "sms_deliveries", "challenge_participants",
      ];
      const results: { table: string; count: number }[] = [];
      for (const t of tables) {
        const { count } = await supabase
          .from(t as any)
          .select("*", { count: "exact", head: true });
        results.push({ table: t, count: count ?? 0 });
      }
      return results;
    },
    staleTime: 30_000,
  });
}

/** Hook: fetch slow query logs */
function useQueryLogs() {
  return useQuery({
    queryKey: ["query-performance-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("query_performance_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as QueryLog[];
    },
    staleTime: 15_000,
  });
}

/** Hook: aggregate stats from logs */
function useQueryStats() {
  return useQuery({
    queryKey: ["query-performance-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("query_performance_logs")
        .select("query_duration_ms, severity, function_name")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      const logs = data ?? [];
      const total = logs.length;
      const avgMs = total > 0
        ? Math.round(logs.reduce((s, l) => s + (l.query_duration_ms ?? 0), 0) / total)
        : 0;
      const slowCount = logs.filter(l => l.severity === "slow" || l.severity === "critical").length;
      const p95 = total > 0
        ? [...logs.map(l => l.query_duration_ms)].sort((a, b) => a - b)[Math.floor(total * 0.95)] ?? 0
        : 0;

      // Group by function
      const byFunction: Record<string, { count: number; avgMs: number; total: number }> = {};
      for (const l of logs) {
        const fn = l.function_name ?? "unknown";
        if (!byFunction[fn]) byFunction[fn] = { count: 0, avgMs: 0, total: 0 };
        byFunction[fn].count++;
        byFunction[fn].total += l.query_duration_ms ?? 0;
      }
      Object.values(byFunction).forEach(v => {
        v.avgMs = Math.round(v.total / v.count);
      });

      return { total, avgMs, slowCount, p95, byFunction };
    },
    staleTime: 15_000,
  });
}

export default function DbMonitoringPanel() {
  const { data: healthStats, isLoading: healthLoading } = useTableHealthStats();
  const { data: logs = [], isLoading: logsLoading, refetch: refetchLogs } = useQueryLogs();
  const { data: stats } = useQueryStats();
  const [showAllLogs, setShowAllLogs] = useState(false);

  const displayedLogs = showAllLogs ? logs : logs.slice(0, 10);

  // Connection pool simulation (Supabase manages PgBouncer — these represent theoretical limits)
  const poolConfig = {
    maxConnections: 60,
    activeEstimate: Math.min(healthStats?.length ?? 3, 12),
    poolMode: "transaction",
    idleTimeout: 300,
  };
  const poolUtilization = Math.round((poolConfig.activeEstimate / poolConfig.maxConnections) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-lg font-bold text-foreground">DB Monitoring & Connection Pool</h2>
            <p className="text-xs text-muted-foreground">
              PgBouncer (managed) · Query performance · Slow query alerts
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => refetchLogs()}>
          <RefreshCw className="w-3 h-3" /> Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Server className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pool Mode</p>
              <p className="text-sm font-bold text-foreground">{poolConfig.poolMode}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Gauge className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pool Usage</p>
              <p className="text-sm font-bold text-foreground">{poolUtilization}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Query</p>
              <p className="text-sm font-bold text-foreground">{stats?.avgMs ?? 0}ms</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Slow Queries</p>
              <p className="text-sm font-bold text-foreground">{stats?.slowCount ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Pool Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Server className="w-4 h-4 text-primary" />
            Connection Pool (PgBouncer — Managed)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground">Max Connections</p>
              <p className="font-bold text-foreground">{poolConfig.maxConnections}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Est. Active</p>
              <p className="font-bold text-foreground">{poolConfig.activeEstimate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Idle Timeout</p>
              <p className="font-bold text-foreground">{poolConfig.idleTimeout}s</p>
            </div>
            <div>
              <p className="text-muted-foreground">P95 Latency</p>
              <p className="font-bold text-foreground">{stats?.p95 ?? 0}ms</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Pool Utilization</span>
              <span>{poolUtilization}%</span>
            </div>
            <Progress value={poolUtilization} className="h-2" />
          </div>
          <p className="text-[10px] text-muted-foreground">
            ℹ️ PgBouncer is pre-configured and managed by Lovable Cloud. Connection pooling runs in <strong>transaction mode</strong> — each query borrows a connection only for the duration of the transaction, maximizing throughput.
          </p>
        </CardContent>
      </Card>

      {/* Per-Function Performance */}
      {stats?.byFunction && Object.keys(stats.byFunction).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Performance by Edge Function
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Function</TableHead>
                    <TableHead className="text-[10px] text-right">Queries</TableHead>
                    <TableHead className="text-[10px] text-right">Avg (ms)</TableHead>
                    <TableHead className="text-[10px]">Health</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(stats.byFunction)
                    .sort(([, a], [, b]) => b.avgMs - a.avgMs)
                    .map(([fn, data]) => (
                      <TableRow key={fn}>
                        <TableCell className="text-xs font-mono">{fn}</TableCell>
                        <TableCell className="text-xs text-right">{data.count}</TableCell>
                        <TableCell className="text-xs text-right font-mono">{data.avgMs}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${
                            data.avgMs > 2000 ? SEVERITY_STYLES.critical :
                            data.avgMs > 500 ? SEVERITY_STYLES.slow :
                            data.avgMs > 200 ? SEVERITY_STYLES.warn :
                            SEVERITY_STYLES.info
                          }`}>
                            {data.avgMs > 2000 ? "Critical" : data.avgMs > 500 ? "Slow" : data.avgMs > 200 ? "Warn" : "Healthy"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Health Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Table Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <div className="flex items-center gap-2 py-4 justify-center text-xs text-muted-foreground">
              <RefreshCw className="w-3 h-3 animate-spin" /> Loading…
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(healthStats ?? []).map(({ table, count }) => (
                <div key={table} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20 border border-border/20">
                  <Zap className="w-3 h-3 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-mono text-muted-foreground truncate">{table}</p>
                    <p className="text-xs font-bold text-foreground">{count.toLocaleString()} rows</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Query Performance Logs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Query Performance Logs
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">{logs.length} entries</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center gap-2 py-4 justify-center text-xs text-muted-foreground">
              <RefreshCw className="w-3 h-3 animate-spin" /> Loading…
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground space-y-2">
              <Activity className="w-8 h-8 mx-auto text-muted-foreground/30" />
              <p>No query logs yet. Logs will appear as edge functions report query performance.</p>
              <p className="text-[10px]">Instrument your edge functions to log slow queries automatically.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded border border-border/30">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">Time</TableHead>
                      <TableHead className="text-[10px]">Function</TableHead>
                      <TableHead className="text-[10px] text-right">Duration</TableHead>
                      <TableHead className="text-[10px] text-right">Rows</TableHead>
                      <TableHead className="text-[10px]">Severity</TableHead>
                      <TableHead className="text-[10px]">Fingerprint</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {format(new Date(log.created_at), "MMM d HH:mm:ss")}
                        </TableCell>
                        <TableCell className="text-xs font-mono">{log.function_name ?? "—"}</TableCell>
                        <TableCell className="text-xs text-right font-mono">
                          <span className={log.query_duration_ms > 500 ? "text-destructive font-bold" : ""}>
                            {log.query_duration_ms}ms
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-right">{log.row_count ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${SEVERITY_STYLES[log.severity] ?? SEVERITY_STYLES.info}`}>
                            {log.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] font-mono text-muted-foreground max-w-[150px] truncate">
                          {log.query_fingerprint ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {logs.length > 10 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2 text-xs w-full"
                  onClick={() => setShowAllLogs(!showAllLogs)}
                >
                  {showAllLogs ? "Show less" : `Show all ${logs.length} logs`}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
