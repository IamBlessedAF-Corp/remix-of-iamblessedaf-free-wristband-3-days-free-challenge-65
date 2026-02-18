import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Bug, CheckCircle, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

interface ErrorEvent {
  id: string;
  source: string;
  level: string;
  message: string;
  stack: string | null;
  component: string | null;
  page_url: string | null;
  user_agent: string | null;
  user_id: string | null;
  session_id: string | null;
  fingerprint: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

type FilterLevel = "all" | "error" | "warn" | "fatal";
type FilterResolved = "all" | "open" | "resolved";

export default function ErrorMonitorTab() {
  const queryClient = useQueryClient();
  const [levelFilter, setLevelFilter] = useState<FilterLevel>("all");
  const [resolvedFilter, setResolvedFilter] = useState<FilterResolved>("open");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: errors = [], isLoading, refetch } = useQuery({
    queryKey: ["error-events", levelFilter, resolvedFilter],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (levelFilter !== "all") params.level = `eq.${levelFilter}`;
      if (resolvedFilter === "open") params.resolved_at = "is.null";
      else if (resolvedFilter === "resolved") params.resolved_at = "not.is.null";

      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/error_events?select=*&order=created_at.desc&limit=200`;
      const queryStr = Object.entries(params).map(([k, v]) => `${k}=${v}`).join("&");
      const fullUrl = queryStr ? `${url}&${queryStr}` : url;

      const res = await fetch(fullUrl, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch errors");
      return (await res.json()) as ErrorEvent[];
    },
    refetchInterval: 30_000,
  });

  const resolveMutation = useMutation({
    mutationFn: async (errorId: string) => {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/error_events?id=eq.${errorId}`,
        {
          method: "PATCH",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ resolved_at: new Date().toISOString() }),
        }
      );
      if (!res.ok) throw new Error("Failed to resolve error");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["error-events"] });
      toast.success("Error marked as resolved");
    },
  });

  const stats = {
    total: errors.length,
    fatal: errors.filter((e) => e.level === "fatal").length,
    error: errors.filter((e) => e.level === "error").length,
    warn: errors.filter((e) => e.level === "warn").length,
    open: errors.filter((e) => !e.resolved_at).length,
  };

  const levelBadge = (level: string) => {
    switch (level) {
      case "fatal":
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Fatal</Badge>;
      case "error":
        return <Badge variant="destructive" className="gap-1 bg-orange-600"><Bug className="w-3 h-3" /> Error</Badge>;
      case "warn":
        return <Badge variant="secondary" className="gap-1"><AlertTriangle className="w-3 h-3" /> Warn</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Error Monitoring</h2>
          <p className="text-sm text-muted-foreground">Sentry-style error tracking across frontend and backend functions</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportCsvButton data={errors} filename="error-events.csv" columns={["created_at", "level", "source", "message", "component", "page_url", "fingerprint", "resolved_at"]} />
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-red-500">{stats.fatal}</p>
            <p className="text-xs text-muted-foreground">Fatal</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-orange-500">{stats.error}</p>
            <p className="text-xs text-muted-foreground">Errors</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.warn}</p>
            <p className="text-xs text-muted-foreground">Warnings</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30">
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-primary">{stats.open}</p>
            <p className="text-xs text-muted-foreground">Open</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as FilterLevel)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="fatal">Fatal</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resolvedFilter} onValueChange={(v) => setResolvedFilter(v as FilterResolved)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading errors...</div>
          ) : errors.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
              <CheckCircle className="w-10 h-10 text-green-500" />
              <p className="font-medium">No errors found</p>
              <p className="text-sm">Your app is running smoothly! 🎉</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Level</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-[100px]">Source</TableHead>
                  <TableHead className="w-[160px]">Time</TableHead>
                  <TableHead className="w-[80px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((err) => (
                  <>
                    <TableRow
                      key={err.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setExpandedId(expandedId === err.id ? null : err.id)}
                    >
                      <TableCell>{levelBadge(err.level)}</TableCell>
                      <TableCell className="max-w-[400px] truncate font-mono text-xs">
                        {err.message}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{err.source}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(err.created_at), "MMM d HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        {!err.resolved_at && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              resolveMutation.mutate(err.id);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Button>
                        )}
                        {err.resolved_at && (
                          <Badge variant="outline" className="text-xs text-green-600">Resolved</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedId === err.id && (
                      <TableRow key={`${err.id}-detail`}>
                        <TableCell colSpan={5} className="bg-muted/30">
                          <div className="space-y-2 p-3 text-xs">
                            {err.component && (
                              <p><span className="font-semibold text-foreground">Component:</span> {err.component}</p>
                            )}
                            {err.page_url && (
                              <p><span className="font-semibold text-foreground">URL:</span> {err.page_url}</p>
                            )}
                            {err.fingerprint && (
                              <p><span className="font-semibold text-foreground">Fingerprint:</span> {err.fingerprint}</p>
                            )}
                            {err.session_id && (
                              <p><span className="font-semibold text-foreground">Session:</span> {err.session_id}</p>
                            )}
                            {err.stack && (
                              <div>
                                <p className="font-semibold text-foreground mb-1">Stack Trace:</p>
                                <pre className="bg-background p-2 rounded border text-[11px] overflow-x-auto max-h-48 whitespace-pre-wrap">
                                  {err.stack}
                                </pre>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
