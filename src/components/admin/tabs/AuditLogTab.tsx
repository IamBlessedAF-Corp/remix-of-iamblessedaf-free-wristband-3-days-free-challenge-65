import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollText, RefreshCw, Search, ChevronDown, ChevronRight, Filter } from "lucide-react";
import { format } from "date-fns";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

interface AuditEntry {
  id: string;
  created_at: string;
  table_name: string;
  operation: string;
  row_id: string | null;
  user_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_fields: string[] | null;
}

const OP_STYLES: Record<string, string> = {
  INSERT: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  UPDATE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  DELETE: "bg-destructive/15 text-destructive border-destructive/30",
};

const TRACKED_TABLES = [
  "orders", "creator_profiles", "campaign_config",
  "clip_submissions", "board_cards", "budget_cycles",
];

export default function AuditLogTab() {
  const [search, setSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("all");
  const [opFilter, setOpFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: entries = [], isLoading, refetch } = useQuery({
    queryKey: ["audit-log", tableFilter, opFilter],
    queryFn: async () => {
      let query = supabase
        .from("audit_log" as "orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (tableFilter !== "all") {
        query = query.eq("table_name" as "tier", tableFilter);
      }
      if (opFilter !== "all") {
        query = query.eq("operation" as "tier", opFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as AuditEntry[];
    },
    staleTime: 10_000,
  });

  const filtered = search.trim()
    ? entries.filter(e =>
        e.table_name.includes(search.toLowerCase()) ||
        e.row_id?.includes(search) ||
        e.user_id?.includes(search) ||
        e.changed_fields?.some(f => f.includes(search.toLowerCase()))
      )
    : entries;

  // KPI stats
  const opCounts: Record<string, number> = { INSERT: 0, UPDATE: 0, DELETE: 0 };
  const tableCounts: Record<string, number> = {};
  entries.forEach(e => {
    opCounts[e.operation] = (opCounts[e.operation] ?? 0) + 1;
    tableCounts[e.table_name] = (tableCounts[e.table_name] ?? 0) + 1;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Audit Log"
        description="Row-level change tracking for compliance — INSERT / UPDATE / DELETE"
        kpis={[
          { label: "Total Events", value: entries.length },
          { label: "Inserts", value: opCounts.INSERT },
          { label: "Updates", value: opCounts.UPDATE },
          { label: "Deletes", value: opCounts.DELETE },
        ]}
        charts={[
          {
            type: "pie",
            title: "By Table",
            data: Object.entries(tableCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([name, value]) => ({ name, value })),
          },
        ]}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search table, row ID, user…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Select value={tableFilter} onValueChange={setTableFilter}>
          <SelectTrigger className="h-8 w-40 text-xs">
            <Filter className="w-3 h-3 mr-1" />
            <SelectValue placeholder="All tables" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tables</SelectItem>
            {TRACKED_TABLES.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={opFilter} onValueChange={setOpFilter}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue placeholder="All ops" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ops</SelectItem>
            <SelectItem value="INSERT">INSERT</SelectItem>
            <SelectItem value="UPDATE">UPDATE</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => refetch()}>
          <RefreshCw className="w-3 h-3" /> Refresh
        </Button>
        <ExportCsvButton data={filtered.map(e => ({ ...e, old_data: JSON.stringify(e.old_data), new_data: JSON.stringify(e.new_data), changed_fields: e.changed_fields?.join(", ") }))} filename="audit-log.csv" columns={["created_at", "table_name", "operation", "row_id", "user_id", "changed_fields"]} />
      </div>

      {/* Log entries */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-primary" />
              Recent Changes
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">{filtered.length} entries</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground">
              <ScrollText className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
              <p>No audit entries yet. Changes will appear automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] w-8"></TableHead>
                    <TableHead className="text-[10px]">Time</TableHead>
                    <TableHead className="text-[10px]">Table</TableHead>
                    <TableHead className="text-[10px]">Op</TableHead>
                    <TableHead className="text-[10px]">Row ID</TableHead>
                    <TableHead className="text-[10px]">Changed Fields</TableHead>
                    <TableHead className="text-[10px]">User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(entry => {
                    const isOpen = expandedId === entry.id;
                    return (
                      <Collapsible key={entry.id} open={isOpen} onOpenChange={() => setExpandedId(isOpen ? null : entry.id)} asChild>
                        <>
                          <CollapsibleTrigger asChild>
                            <TableRow className="cursor-pointer hover:bg-secondary/20">
                              <TableCell className="py-2 px-2">
                                {isOpen
                                  ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                  : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                              </TableCell>
                              <TableCell className="text-[10px] text-muted-foreground whitespace-nowrap py-2">
                                {format(new Date(entry.created_at), "MMM d HH:mm:ss")}
                              </TableCell>
                              <TableCell className="text-xs font-mono py-2">{entry.table_name}</TableCell>
                              <TableCell className="py-2">
                                <Badge variant="outline" className={`text-[10px] ${OP_STYLES[entry.operation] ?? ""}`}>
                                  {entry.operation}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-[10px] font-mono text-muted-foreground max-w-[100px] truncate py-2">
                                {entry.row_id?.slice(0, 8) ?? "—"}
                              </TableCell>
                              <TableCell className="text-[10px] text-muted-foreground py-2 max-w-[200px] truncate">
                                {entry.changed_fields?.join(", ") ?? (entry.operation === "INSERT" ? "all" : "—")}
                              </TableCell>
                              <TableCell className="text-[10px] font-mono text-muted-foreground max-w-[80px] truncate py-2">
                                {entry.user_id?.slice(0, 8) ?? "system"}
                              </TableCell>
                            </TableRow>
                          </CollapsibleTrigger>
                          <CollapsibleContent asChild>
                            <TableRow>
                              <TableCell colSpan={7} className="p-0">
                                <div className="bg-secondary/10 border-t border-b border-border/20 p-4 space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {entry.old_data && (
                                      <div>
                                        <p className="text-[10px] font-semibold text-destructive/70 uppercase tracking-wider mb-1">Old Values</p>
                                        <pre className="text-[10px] font-mono bg-destructive/5 border border-destructive/10 rounded p-2 overflow-x-auto max-h-48">
                                          {JSON.stringify(
                                            entry.changed_fields
                                              ? Object.fromEntries(entry.changed_fields.map(f => [f, (entry.old_data as Record<string, unknown>)?.[f]]))
                                              : entry.old_data,
                                            null, 2
                                          )}
                                        </pre>
                                      </div>
                                    )}
                                    {entry.new_data && (
                                      <div>
                                        <p className="text-[10px] font-semibold text-emerald-400/70 uppercase tracking-wider mb-1">New Values</p>
                                        <pre className="text-[10px] font-mono bg-emerald-500/5 border border-emerald-500/10 rounded p-2 overflow-x-auto max-h-48">
                                          {JSON.stringify(
                                            entry.changed_fields
                                              ? Object.fromEntries(entry.changed_fields.map(f => [f, (entry.new_data as Record<string, unknown>)?.[f]]))
                                              : entry.new_data,
                                            null, 2
                                          )}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-4 text-[10px] text-muted-foreground">
                                    <span>Full Row ID: <span className="font-mono">{entry.row_id ?? "—"}</span></span>
                                    <span>User: <span className="font-mono">{entry.user_id ?? "system"}</span></span>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          </CollapsibleContent>
                        </>
                      </Collapsible>
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
