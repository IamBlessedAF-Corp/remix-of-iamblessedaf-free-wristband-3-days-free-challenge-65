import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Database, Search, ChevronDown, ChevronRight, Download, Eye, Rows3, Columns3, RefreshCw } from "lucide-react";
import { downloadCsv } from "@/utils/csvExport";

// All public tables in the project
const DB_TABLES = [
  { name: "affiliate_tiers", label: "Affiliate Tiers", category: "Creators" },
  { name: "bc_redemptions", label: "BC Redemptions", category: "Gamification" },
  { name: "bc_store_items", label: "BC Store Items", category: "Gamification" },
  { name: "bc_transactions", label: "BC Transactions", category: "Gamification" },
  { name: "bc_wallets", label: "BC Wallets", category: "Gamification" },
  { name: "blessings", label: "Blessings", category: "Creators" },
  { name: "board_cards", label: "Board Cards", category: "Operations" },
  { name: "board_columns", label: "Board Columns", category: "Operations" },
  { name: "budget_cycles", label: "Budget Cycles", category: "Finance" },
  { name: "budget_events_log", label: "Budget Events Log", category: "Finance" },
  { name: "budget_segment_cycles", label: "Budget Segment Cycles", category: "Finance" },
  { name: "budget_segments", label: "Budget Segments", category: "Finance" },
  { name: "campaign_config", label: "Campaign Config", category: "Content" },
  { name: "challenge_participants", label: "Challenge Participants", category: "Engagement" },
  { name: "changelog_entries", label: "Changelog Entries", category: "Operations" },
  { name: "clip_submissions", label: "Clip Submissions", category: "Creators" },
  { name: "clipper_monthly_bonuses", label: "Clipper Monthly Bonuses", category: "Finance" },
  { name: "clipper_payouts", label: "Clipper Payouts", category: "Finance" },
  { name: "clipper_risk_throttle", label: "Clipper Risk Throttle", category: "Risk" },
  { name: "clipper_segment_membership", label: "Clipper Segments", category: "Risk" },
  { name: "creator_profiles", label: "Creator Profiles", category: "Creators" },
  { name: "exit_intent_events", label: "Exit Intent Events", category: "Analytics" },
  { name: "expert_leads", label: "Expert Leads", category: "Creators" },
  { name: "expert_scripts", label: "Expert Scripts", category: "Content" },
  { name: "followup_sequences", label: "Followup Sequences", category: "Engagement" },
  { name: "link_clicks", label: "Link Clicks", category: "Analytics" },
  { name: "orders", label: "Orders", category: "Finance" },
  { name: "otp_codes", label: "OTP Codes", category: "Auth" },
  { name: "portal_activity", label: "Portal Activity", category: "Analytics" },
  { name: "repost_logs", label: "Repost Logs", category: "Creators" },
  { name: "role_permissions", label: "Role Permissions", category: "Operations" },
  { name: "scheduled_gratitude_messages", label: "Scheduled Messages", category: "Engagement" },
  { name: "short_links", label: "Short Links", category: "Content" },
  { name: "smart_wristband_waitlist", label: "Wristband Waitlist", category: "Engagement" },
  { name: "sms_audit_log", label: "SMS Audit Log", category: "Engagement" },
  { name: "sms_deliveries", label: "SMS Deliveries", category: "Engagement" },
] as const;

type TableName = typeof DB_TABLES[number]["name"];

const CATEGORY_COLORS: Record<string, string> = {
  Creators: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Gamification: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Operations: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  Finance: "bg-green-500/10 text-green-400 border-green-500/20",
  Content: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Engagement: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Risk: "bg-red-500/10 text-red-400 border-red-500/20",
  Analytics: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Auth: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

function useTableCount(tableName: string, enabled: boolean) {
  return useQuery({
    queryKey: ["db-count", tableName],
    queryFn: async () => {
      const { count, error } = await supabase
        .from(tableName as any)
        .select("*", { count: "exact", head: true });
      if (error) return null;
      return count;
    },
    enabled,
    staleTime: 60_000,
  });
}

function useTablePreview(tableName: string, enabled: boolean) {
  return useQuery({
    queryKey: ["db-preview", tableName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) return [];
      return data as Record<string, any>[];
    },
    enabled,
    staleTime: 60_000,
  });
}

function useTableFullExport(tableName: string) {
  const download = async () => {
    const { data, error } = await supabase
      .from(tableName as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error || !data || data.length === 0) return;

    const rows = data as Record<string, any>[];
    const keys = Object.keys(rows[0]);
    const header = keys.join(",");
    const csv = [
      header,
      ...rows.map(r => keys.map(k => {
        const v = r[k];
        if (v == null) return "";
        const s = typeof v === "object" ? JSON.stringify(v) : String(v);
        return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(","))
    ].join("\n");
    downloadCsv(csv, `${tableName}.csv`);
  };
  return download;
}

function TableRow_({ table }: { table: typeof DB_TABLES[number] }) {
  const [open, setOpen] = useState(false);
  const { data: count } = useTableCount(table.name, true);
  const { data: preview = [], isLoading: previewLoading } = useTablePreview(table.name, open);
  const exportCsv = useTableFullExport(table.name);

  const columns = preview.length > 0 ? Object.keys(preview[0]) : [];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 cursor-pointer transition-colors border-b border-border/20">
          {open ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
          <Database className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium text-foreground flex-1">{table.label}</span>
          <code className="text-[10px] text-muted-foreground font-mono">{table.name}</code>
          <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[table.category] || ""}`}>{table.category}</Badge>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Rows3 className="w-3 h-3" />
            <span>{count != null ? count.toLocaleString() : "—"}</span>
          </div>
          {columns.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Columns3 className="w-3 h-3" />
              <span>{columns.length}</span>
            </div>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 py-3 bg-secondary/10 border-b border-border/20 space-y-3">
          {/* Column chips */}
          {columns.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Columns ({columns.length})</p>
              <div className="flex flex-wrap gap-1">
                {columns.map(col => (
                  <Badge key={col} variant="outline" className="text-[10px] font-mono bg-card">{col}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Preview table */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Eye className="w-3 h-3" /> Preview (last 5 rows)
              </p>
              <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1" onClick={exportCsv}>
                <Download className="w-3 h-3" /> Download CSV (up to 1k)
              </Button>
            </div>
            {previewLoading ? (
              <div className="flex items-center gap-2 py-4 justify-center text-xs text-muted-foreground">
                <RefreshCw className="w-3 h-3 animate-spin" /> Loading…
              </div>
            ) : preview.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No rows</p>
            ) : (
              <div className="overflow-x-auto rounded border border-border/30">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.slice(0, 8).map(col => (
                        <TableHead key={col} className="text-[10px] font-mono whitespace-nowrap">{col}</TableHead>
                      ))}
                      {columns.length > 8 && <TableHead className="text-[10px]">+{columns.length - 8}</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, i) => (
                      <TableRow key={i}>
                        {columns.slice(0, 8).map(col => (
                          <TableCell key={col} className="text-[10px] max-w-[200px] truncate font-mono">
                            {row[col] == null ? <span className="text-muted-foreground/50">null</span> : typeof row[col] === "object" ? JSON.stringify(row[col]).slice(0, 60) : String(row[col]).slice(0, 60)}
                          </TableCell>
                        ))}
                        {columns.length > 8 && <TableCell className="text-[10px] text-muted-foreground">…</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function DatabaseTab() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = [...new Set(DB_TABLES.map(t => t.category))];
  const filtered = DB_TABLES.filter(t => {
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    if (search && !t.label.toLowerCase().includes(search.toLowerCase()) && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Database className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-lg font-bold text-foreground">Database Explorer</h2>
          <p className="text-xs text-muted-foreground">{DB_TABLES.length} tables · Preview data, columns & export</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search tables…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
          </div>
          <div className="flex gap-1 flex-wrap">
            <Button size="sm" variant={categoryFilter === "all" ? "default" : "outline"} className="h-7 text-[10px]" onClick={() => setCategoryFilter("all")}>All</Button>
            {categories.map(c => (
              <Button key={c} size="sm" variant={categoryFilter === c ? "default" : "outline"} className="h-7 text-[10px]" onClick={() => setCategoryFilter(c)}>{c}</Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table list */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No tables match your search</p>
          ) : (
            filtered.map(table => <TableRow_ key={table.name} table={table} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
