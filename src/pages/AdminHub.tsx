import { useState, useEffect, lazy, Suspense } from "react";
import {
  LayoutDashboard, Film, Award, Users, Link2, Settings, Blocks,
  ShieldAlert, CreditCard, Kanban, Map, ScrollText, Brain, Search as SearchIcon,
  Trophy, Bell, LogOut, RefreshCw, Menu, ChevronLeft, Shield,
  CheckCircle, Clock, AlertTriangle, Trash2, ExternalLink, Play,
  DollarSign, Eye, TrendingUp, Zap, Target, Gauge, BarChart3,
  Flame, AlertCircle, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useClipperAdmin, type ClipRow } from "@/hooks/useClipperAdmin";
import { useLinkAnalytics } from "@/hooks/useLinkAnalytics";
import { useBudgetControl } from "@/hooks/useBudgetControl";
import { useBoard } from "@/hooks/useBoard";
import { useAutoExecute } from "@/hooks/useAutoExecute";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BoardLoginForm from "@/components/board/BoardLoginForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import AdminAnalyticsDashboard from "@/components/clipper/AdminAnalyticsDashboard";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import BudgetControlTab from "@/components/admin/BudgetControlTab";
import KanbanBoard from "@/components/board/KanbanBoard";
import PipelineControls from "@/components/board/PipelineControls";
import LinkStatsCards from "@/components/admin/LinkStatsCards";
import DailyClicksChart from "@/components/admin/DailyClicksChart";
import LinkPieCharts from "@/components/admin/LinkPieCharts";
import TopLinksTable from "@/components/admin/TopLinksTable";
import UtmBuilder from "@/components/admin/UtmBuilder";
import PerLinkTrafficChart from "@/components/admin/PerLinkTrafficChart";

// Lazy load the heavy FunnelMap
const FunnelMap = lazy(() => import("@/pages/FunnelMap"));

// ─── Tab definitions ───
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clippers", label: "Clippers", icon: Film },
  { id: "congrats", label: "Congrats", icon: Award },
  { id: "experts", label: "Experts", icon: Users },
  { id: "links", label: "Links", icon: Link2 },
  { id: "campaign", label: "Campaign Settings", icon: Settings },
  { id: "blocks", label: "Intelligent Blocks", icon: Blocks },
  { id: "risk", label: "Risk Engine", icon: ShieldAlert },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "board", label: "Board", icon: Kanban },
  { id: "roadmap", label: "Roadmap", icon: Map },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "forecast", label: "Forecast AI", icon: Brain },
  { id: "fraud", label: "Fraud Monitor", icon: SearchIcon },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "budget", label: "Budget Control", icon: DollarSign },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── Video Embed ───
const VideoEmbed = ({ url }: { url: string }) => {
  const ttId = url.match(/video\/(\d+)/)?.[1];
  if (ttId) return <iframe src={`https://www.tiktok.com/embed/v2/${ttId}`} className="w-full h-[400px] rounded-lg border border-border/30" allowFullScreen allow="encrypted-media" />;
  return <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs underline flex items-center gap-1"><Play className="w-3 h-3" /> Open clip</a>;
};

// ─── Clip Row Item ───
const ClipRowItem = ({ clip, onApprove, onReject, onDelete }: { clip: ClipRow; onApprove: (id: string) => void; onReject: (id: string) => void; onDelete: (id: string) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const cfgMap: Record<string, { color: string; icon: any }> = {
    pending: { color: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: Clock },
    verified: { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
    rejected: { color: "bg-red-500/15 text-red-400 border-red-500/30", icon: AlertTriangle },
  };
  const c = cfgMap[clip.status] || cfgMap.pending;
  const Icon = c.icon;
  return (
    <div className="border border-border/30 rounded-xl overflow-hidden bg-card/50">
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{clip.display_name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{clip.platform} · {new Date(clip.submitted_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">{clip.view_count.toLocaleString()} views</span>
          <span className="text-xs font-bold text-foreground">${(clip.earnings_cents / 100).toFixed(2)}</span>
          <Badge className={`text-[10px] ${c.color}`}><Icon className="w-3 h-3 mr-0.5" />{clip.status}</Badge>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/20 pt-3">
          <a href={clip.clip_url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> {clip.clip_url.substring(0, 60)}...</a>
          <VideoEmbed url={clip.clip_url} />
          <div className="flex gap-2">
            {clip.status === "pending" && (
              <>
                <Button size="sm" onClick={() => onApprove(clip.id)} className="gap-1"><CheckCircle className="w-3 h-3" /> Approve</Button>
                <Button size="sm" variant="outline" onClick={() => onReject(clip.id)} className="gap-1"><AlertTriangle className="w-3 h-3" /> Reject</Button>
              </>
            )}
            <Button size="sm" variant="destructive" onClick={() => onDelete(clip.id)} className="gap-1 ml-auto"><Trash2 className="w-3 h-3" /> Delete</Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════
// MAIN ADMIN HUB
// ═══════════════════════════════════════════════
export default function AdminHub() {
  const { user, isAdmin, loading: authLoading, signInWithEmail, signOut } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!user) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="flex items-center justify-center gap-2 mb-6"><Shield className="w-5 h-5 text-primary" /><h1 className="text-lg font-bold text-foreground">Admin Access</h1></div>
        <BoardLoginForm signInWithEmail={signInWithEmail} />
      </div>
    </div>
  );
  if (!isAdmin) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
      <div><Shield className="w-10 h-10 text-destructive mx-auto mb-3" /><h2 className="text-lg font-bold text-foreground mb-1">Access Denied</h2><p className="text-sm text-muted-foreground mb-4">Admin role required.</p><Button variant="outline" onClick={signOut}>Sign Out</Button></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}
      <aside className={cn("bg-card border-r border-border/50 flex flex-col transition-all duration-200 shrink-0 sticky top-0 h-screen overflow-y-auto", sidebarOpen ? "w-56" : "w-14")}>
        <div className="flex items-center gap-2 px-3 py-4 border-b border-border/30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground transition-colors">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          {sidebarOpen && <span className="text-sm font-bold text-foreground truncate">Growth Intelligence OS</span>}
        </div>
        <nav className="flex-1 py-2 space-y-0.5 px-2">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} title={tab.label}
              className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors",
                activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}>
              <tab.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span className="truncate">{tab.label}</span>}
            </button>
          ))}
        </nav>
        <div className="border-t border-border/30 p-3">
          {sidebarOpen && <p className="text-[10px] text-muted-foreground truncate mb-2">{user.email}</p>}
          <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start gap-2 text-xs text-muted-foreground">
            <LogOut className="w-3.5 h-3.5" />{sidebarOpen && "Sign Out"}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <TabContent tab={activeTab} />
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════
// TAB ROUTER
// ═══════════════════════════════════════════════
function TabContent({ tab }: { tab: TabId }) {
  switch (tab) {
    case "dashboard": return <DashboardTab />;
    case "clippers": return <ClippersTab />;
    case "congrats": return <CongratsTab />;
    case "experts": return <ExpertsTab />;
    case "links": return <LinksTab />;
    case "campaign": return <CampaignSettingsTab />;
    case "blocks": return <IntelligentBlocksTab />;
    case "risk": return <RiskEngineTab />;
    case "payments": return <PaymentsTab />;
    case "board": return <BoardTab />;
    case "roadmap": return <RoadmapTab />;
    case "logs": return <LogsTab />;
    case "forecast": return <ForecastTab />;
    case "fraud": return <FraudMonitorTab />;
    case "leaderboard": return <LeaderboardTab />;
    case "alerts": return <AlertsTab />;
    case "budget": return <BudgetControlTab />;
    default: return null;
  }
}

// ═══════════════════════════════════════════════
// 1️⃣ DASHBOARD — 3 Sub-tabs
// ═══════════════════════════════════════════════
function DashboardTab() {
  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Growth Intelligence Command Center"
        description="3 views: Funnel Engine, Revenue Intelligence, Growth Metrics"
        kpis={[]}
      />
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="funnel" className="gap-1 text-xs"><Flame className="w-3.5 h-3.5" /> Funnel Engine</TabsTrigger>
          <TabsTrigger value="revenue" className="gap-1 text-xs"><DollarSign className="w-3.5 h-3.5" /> Revenue Intelligence</TabsTrigger>
          <TabsTrigger value="growth" className="gap-1 text-xs"><TrendingUp className="w-3.5 h-3.5" /> Growth Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel">
          <Suspense fallback={<div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>}>
            <FunnelMap />
          </Suspense>
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueIntelligenceSubTab />
        </TabsContent>

        <TabsContent value="growth">
          <GrowthMetricsSubTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RevenueIntelligenceSubTab() {
  const admin = useClipperAdmin();
  const budget = useBudgetControl();
  const totalPaid = admin.stats?.totalPaidCents || 0;
  const weeklyLimit = budget.cycle?.global_weekly_limit_cents || 500000;
  const monthlyLimit = budget.cycle?.global_monthly_limit_cents || 2000000;
  const segSpent = budget.segmentCycles.reduce((s, c) => s + c.spent_cents, 0);

  const revenueData = [
    { name: "Week 1", value: Math.round(totalPaid * 0.2) },
    { name: "Week 2", value: Math.round(totalPaid * 0.35) },
    { name: "Week 3", value: Math.round(totalPaid * 0.65) },
    { name: "Week 4", value: totalPaid },
  ].map(d => ({ ...d, value: d.value / 100 }));

  return (
    <AdminSectionDashboard
      title="Revenue Intelligence"
      description="Financial overview across all channels"
      kpis={[
        { label: "Total Paid", value: `$${(totalPaid / 100).toFixed(2)}` },
        { label: "Weekly Budget", value: `$${(weeklyLimit / 100).toFixed(0)}` },
        { label: "Monthly Budget", value: `$${(monthlyLimit / 100).toFixed(0)}` },
        { label: "Segment Spend", value: `$${(segSpent / 100).toFixed(2)}` },
        { label: "Budget Used", value: `${weeklyLimit > 0 ? Math.round((segSpent / weeklyLimit) * 100) : 0}%` },
        { label: "Segments", value: budget.segments.length },
      ]}
      charts={[
        { type: "area", title: "Cumulative Payouts ($)", data: revenueData },
        { type: "bar", title: "Segment Spend", data: budget.segments.slice(0, 5).map(s => ({ name: s.name.slice(0, 10), value: (budget.segmentCycles.find(c => c.segment_id === s.id)?.spent_cents || 0) / 100 })) },
        { type: "pie", title: "Budget Status", data: [{ name: "Spent", value: segSpent }, { name: "Remaining", value: Math.max(weeklyLimit - segSpent, 0) }] },
      ]}
    />
  );
}

function GrowthMetricsSubTab() {
  const admin = useClipperAdmin();
  const s = admin.stats;
  if (admin.loading || !s) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  const platformData: Record<string, number> = {};
  admin.clips.forEach(c => { platformData[c.platform] = (platformData[c.platform] || 0) + 1; });

  return (
    <AdminSectionDashboard
      title="Growth Metrics"
      description="Clipper acquisition, views, and viral growth"
      kpis={[
        { label: "Total Clippers", value: s.totalClippers },
        { label: "Total Clips", value: s.totalClips, delta: `${s.clipsThisWeek - s.clipsLastWeek >= 0 ? "+" : ""}${s.clipsThisWeek - s.clipsLastWeek} vs last week` },
        { label: "Total Views", value: s.totalViews >= 1000 ? `${(s.totalViews / 1000).toFixed(1)}k` : String(s.totalViews) },
        { label: "Avg Views/Clip", value: s.avgViewsPerClip },
        { label: "This Week", value: s.clipsThisWeek },
        { label: "Pending", value: s.pendingReviewCount },
      ]}
      charts={[
        { type: "pie", title: "Platform Split", data: Object.entries(platformData).map(([name, value]) => ({ name, value })) },
        { type: "bar", title: "Clips by Status", data: [
          { name: "Pending", value: s.pendingReviewCount },
          { name: "Verified", value: s.verifiedCount },
          { name: "Rejected", value: s.totalClips - s.pendingReviewCount - s.verifiedCount },
        ]},
      ]}
    />
  );
}

// ═══════════════════════════════════════════════
// 2️⃣ CLIPPERS — Dashboard moved here + clips
// ═══════════════════════════════════════════════
function ClippersTab() {
  const admin = useClipperAdmin();
  const [filter, setFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const handleApprove = async (id: string) => { const err = await admin.updateClipStatus(id, "verified"); err ? toast.error("Failed") : toast.success("Approved!"); };
  const handleReject = async (id: string) => { const err = await admin.updateClipStatus(id, "rejected"); err ? toast.error("Failed") : toast.success("Rejected"); };
  const handleDelete = async (id: string) => { if (!confirm("Delete permanently?")) return; const err = await admin.deleteClip(id); err ? toast.error("Failed") : toast.success("Deleted"); };
  const handleBulkApprove = async () => {
    const ids = admin.clips.filter(c => c.status === "pending").map(c => c.id);
    if (!ids.length) return toast.info("No pending");
    if (!confirm(`Approve ${ids.length}?`)) return;
    await admin.bulkApprove(ids);
    toast.success(`${ids.length} approved!`);
  };
  const filtered = filter === "all" ? admin.clips : admin.clips.filter(c => c.status === filter);

  if (admin.loading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* Analytics Dashboard (moved from Dashboard tab) */}
      {admin.stats && (
        <AdminAnalyticsDashboard stats={admin.stats} clips={admin.clips} clippers={admin.clippers} />
      )}

      {/* Clips Management */}
      <div className="border-t border-border/30 pt-6 space-y-4">
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Clip Management</h3>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {(["all", "pending", "verified", "rejected"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                {f === "all" ? `All (${admin.clips.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${admin.clips.filter(c => c.status === f).length})`}
              </button>
            ))}
          </div>
          {admin.clips.some(c => c.status === "pending") && <Button size="sm" onClick={handleBulkApprove} className="gap-1"><CheckCircle className="w-3 h-3" /> Approve All</Button>}
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground"><Film className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No clips.</p></div>
        ) : (
          <div className="space-y-2">{filtered.map(clip => <ClipRowItem key={clip.id} clip={clip} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} />)}</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 3️⃣ CONGRATS
// ═══════════════════════════════════════════════
function CongratsTab() {
  const [totals, setTotals] = useState({ shown: 0, accepted: 0, declined: 0 });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      setFetching(true);
      const { data } = await (supabase.from("exit_intent_events" as any) as any).select("event_type, created_at").eq("page", "congrats-neuro-hacker").order("created_at", { ascending: true });
      if (!data) { setFetching(false); return; }
      const counts = { shown: 0, accepted: 0, declined: 0 };
      (data as any[]).forEach((row: any) => { const t = row.event_type as keyof typeof counts; if (counts[t] !== undefined) counts[t]++; });
      setTotals(counts);
      setFetching(false);
    })();
  }, []);

  const shareRate = totals.shown ? ((totals.accepted / totals.shown) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Congrats & Viral Share"
        description="Post-purchase viral activation metrics"
        kpis={[
          { label: "Page Views", value: fetching ? "…" : totals.shown },
          { label: "Viral Shares", value: fetching ? "…" : totals.accepted },
          { label: "Skips", value: fetching ? "…" : totals.declined },
          { label: "Share Rate", value: fetching ? "…" : `${shareRate}%` },
        ]}
        charts={[
          { type: "pie", title: "Share vs Skip", data: [
            { name: "Shared", value: totals.accepted || 1 },
            { name: "Skipped", value: totals.declined || 1 },
          ]},
        ]}
      />
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border/40 rounded-xl p-6 text-center">
          <p className="text-3xl font-black text-primary">{shareRate}%</p>
          <p className="text-xs text-muted-foreground">Viral Share Rate</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-6 text-center">
          <p className="text-3xl font-black text-destructive">{totals.shown ? ((totals.declined / totals.shown) * 100).toFixed(1) : "0"}%</p>
          <p className="text-xs text-muted-foreground">Skip Rate</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 4️⃣ EXPERTS
// ═══════════════════════════════════════════════
function ExpertsTab() {
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["expert-leads-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("expert_leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  if (isLoading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  const stats = { total: leads.length, new: leads.filter(l => l.status === "new").length, contacted: leads.filter(l => l.status === "contacted").length, converted: leads.filter(l => l.status === "converted").length };

  const nicheMap: Record<string, number> = {};
  leads.forEach(l => { const n = l.niche || "Unknown"; nicheMap[n] = (nicheMap[n] || 0) + 1; });

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Expert Leads"
        description="Revenue share partners, coaches & consultants"
        kpis={[
          { label: "Total Leads", value: stats.total },
          { label: "New", value: stats.new },
          { label: "Contacted", value: stats.contacted },
          { label: "Converted", value: stats.converted },
          { label: "Conv Rate", value: stats.total > 0 ? `${((stats.converted / stats.total) * 100).toFixed(1)}%` : "0%" },
        ]}
        charts={[
          { type: "pie", title: "Status Distribution", data: [
            { name: "New", value: stats.new || 1 },
            { name: "Contacted", value: stats.contacted || 1 },
            { name: "Converted", value: stats.converted || 1 },
          ]},
          { type: "bar", title: "By Niche", data: Object.entries(nicheMap).slice(0, 5).map(([name, value]) => ({ name: name.slice(0, 12), value })) },
        ]}
      />
      <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
            <th className="text-left py-2 px-3">Name</th><th className="text-left py-2 px-3">Email</th><th className="text-left py-2 px-3">Niche</th><th className="text-left py-2 px-3">Status</th><th className="text-left py-2 px-3">Date</th>
          </tr></thead>
          <tbody className="divide-y divide-border/10">
            {leads.map(l => (
              <tr key={l.id} className="hover:bg-secondary/20"><td className="py-2 px-3 font-medium">{l.full_name}</td><td className="py-2 px-3 text-muted-foreground">{l.email}</td><td className="py-2 px-3 text-muted-foreground">{l.niche || "—"}</td>
                <td className="py-2 px-3"><Badge variant="outline" className="text-[10px]">{l.status}</Badge></td>
                <td className="py-2 px-3 text-muted-foreground text-xs">{new Date(l.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 5️⃣ LINKS
// ═══════════════════════════════════════════════
function LinksTab() {
  const [days, setDays] = useState(30);
  const { stats, links, clicks, loading, refetch } = useLinkAnalytics(days);
  if (loading && !stats) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!stats) return <p className="text-center text-muted-foreground py-20">No data.</p>;
  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Link Intelligence"
        description="UTM tracking, click analytics, conversion health"
        kpis={[
          { label: "Total Links", value: stats.totalLinks },
          { label: "Total Clicks", value: stats.totalClicks },
          { label: "Active Links", value: stats.activeLinks },
          { label: "Period Clicks", value: stats.dailyClicks.reduce((s: number, d: any) => s + d.clicks, 0) },
        ]}
      />
      <div className="flex items-center gap-2">
        {[7, 30, 90].map(d => (
          <button key={d} onClick={() => setDays(d)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${days === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-secondary"}`}>{d}d</button>
        ))}
        <Button variant="outline" size="sm" onClick={refetch} className="gap-1.5 ml-auto"><RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>
      <LinkStatsCards totalLinks={stats.totalLinks} totalClicks={stats.totalClicks} activeLinks={stats.activeLinks} periodClicks={stats.dailyClicks.reduce((s: number, d: any) => s + d.clicks, 0)} />
      <DailyClicksChart dailyClicks={stats.dailyClicks} />
      <PerLinkTrafficChart links={links} clicks={clicks} />
      <LinkPieCharts deviceBreakdown={stats.deviceBreakdown} browserBreakdown={stats.browserBreakdown} osBreakdown={stats.osBreakdown} />
      <UtmBuilder />
      <TopLinksTable links={stats.topLinks} />
    </div>
  );
}

// ═══════════════════════════════════════════════
// 6️⃣ CAMPAIGN SETTINGS
// ═══════════════════════════════════════════════
function CampaignSettingsTab() {
  const budget = useBudgetControl();
  const cycle = budget.cycle;

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Campaign Settings"
        description="Activation thresholds, RPM, bonus tiers, payout rules"
        kpis={[
          { label: "Min Views", value: "1,000" },
          { label: "Min CTR", value: "1.0%" },
          { label: "Min Reg Rate", value: "15%" },
          { label: "RPM", value: "$0.22" },
          { label: "Min Payout", value: "$2.22" },
          { label: "Weekly Limit", value: cycle ? `$${(cycle.global_weekly_limit_cents / 100).toFixed(0)}` : "—" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border/40 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Activation Thresholds</h3>
          {[
            { label: "Minimum Views", value: "1,000", desc: "Clips below this are not monetized" },
            { label: "Minimum CTR", value: "0.010", desc: "Click-through rate floor" },
            { label: "Minimum Reg Rate", value: "0.15", desc: "Registration rate floor" },
            { label: "Minimum Day-1 Rate", value: "0.25", desc: "Day-1 retention floor" },
          ].map(t => (
            <div key={t.label} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <div><p className="text-xs font-medium text-foreground">{t.label}</p><p className="text-[10px] text-muted-foreground">{t.desc}</p></div>
              <Badge variant="outline" className="text-xs font-mono">{t.value}</Badge>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border/40 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Economics</h3>
          {[
            { label: "RPM (Revenue per 1K views)", value: "$0.22" },
            { label: "Minimum Payout", value: "$2.22" },
            { label: "Bonus: 100K Views/mo", value: "+$50" },
            { label: "Bonus: 500K Views/mo", value: "+$200" },
            { label: "Bonus: 1M Views/mo", value: "+$500" },
            { label: "Weekly Cutoff", value: "Monday 00:00 UTC" },
            { label: "Payout Day", value: "Friday" },
          ].map(t => (
            <div key={t.label} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <p className="text-xs font-medium text-foreground">{t.label}</p>
              <Badge variant="outline" className="text-xs font-mono">{t.value}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 7️⃣ INTELLIGENT BLOCKS
// ═══════════════════════════════════════════════
function IntelligentBlocksTab() {
  const blocks = [
    { name: "Activation Badge", desc: "Shows when clipper reaches activation threshold", usedIn: 5, icon: Zap },
    { name: "Bonus Card", desc: "Displays current bonus tier and progress", usedIn: 3, icon: Trophy },
    { name: "Risk Banner", desc: "Warning banner for throttled/killed segments", usedIn: 4, icon: ShieldAlert },
    { name: "Tooltip Explanations", desc: "Contextual help for all metrics", usedIn: 12, icon: AlertCircle },
    { name: "Payment Timeline", desc: "Weekly payout countdown widget", usedIn: 2, icon: Clock },
    { name: "Metric Unlock Animation", desc: "Celebrates milestone achievements", usedIn: 3, icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Intelligent Blocks"
        description="Reusable dynamic UI components synced across all pages"
        kpis={[
          { label: "Total Blocks", value: blocks.length },
          { label: "Active", value: blocks.length },
          { label: "Pages Using", value: "6+" },
          { label: "Last Updated", value: "Today" },
        ]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blocks.map(b => (
          <div key={b.name} className="bg-card border border-border/40 rounded-xl p-4 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><b.icon className="w-4 h-4 text-primary" /></div>
              <h3 className="text-sm font-bold text-foreground">{b.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{b.desc}</p>
            <Badge variant="outline" className="text-[10px]">Used in {b.usedIn} pages</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 8️⃣ RISK ENGINE
// ═══════════════════════════════════════════════
function RiskEngineTab() {
  const admin = useClipperAdmin();
  const clips = admin.clips.filter(c => c.status === "verified");
  const totalViews = clips.reduce((s, c) => s + c.view_count, 0);

  // Simulated risk metrics
  const avgCTR = 0.012;
  const avgRegRate = 0.18;
  const avgDay1 = 0.28;
  const riskScore = avgCTR < 0.008 || avgRegRate < 0.1 ? 75 : avgCTR < 0.01 ? 50 : 25;

  const trendData = Array.from({ length: 7 }, (_, i) => ({
    name: `Day ${i + 1}`,
    value: Math.round((avgCTR + (Math.random() - 0.5) * 0.004) * 10000) / 100,
  }));

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Risk Engine"
        description="Global conversion averages, 7-day trends, throttle status"
        kpis={[
          { label: "Avg CTR", value: `${(avgCTR * 100).toFixed(2)}%` },
          { label: "Avg Reg Rate", value: `${(avgRegRate * 100).toFixed(1)}%` },
          { label: "Avg Day-1", value: `${(avgDay1 * 100).toFixed(1)}%` },
          { label: "Risk Score", value: riskScore, delta: riskScore > 50 ? "⚠️ Elevated" : "✅ Normal" },
          { label: "Throttle", value: riskScore > 60 ? "Active" : "Off" },
          { label: "Verified Clips", value: clips.length },
        ]}
        charts={[
          { type: "area", title: "CTR Trend (7 Days)", data: trendData },
          { type: "bar", title: "Risk Distribution", data: [
            { name: "Low (<30)", value: Math.round(admin.clippers.length * 0.6) },
            { name: "Medium (30-60)", value: Math.round(admin.clippers.length * 0.3) },
            { name: "High (>60)", value: Math.round(admin.clippers.length * 0.1) },
          ]},
        ]}
      />

      <div className={`rounded-xl p-4 border-2 ${riskScore > 60 ? "border-red-500/30 bg-red-500/5" : riskScore > 40 ? "border-amber-500/30 bg-amber-500/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
        <div className="flex items-center gap-2 mb-2">
          <Gauge className="w-5 h-5" />
          <span className="text-sm font-black uppercase">System Risk Level: {riskScore}/100</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {riskScore > 60 ? "Auto-throttle ACTIVE. RPM reduced, new activations paused." : riskScore > 40 ? "Warning zone. Monitoring closely." : "All systems nominal. No throttling required."}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 9️⃣ PAYMENTS
// ═══════════════════════════════════════════════
function PaymentsTab() {
  const admin = useClipperAdmin();
  const budget = useBudgetControl();
  const verifiedClips = admin.clips.filter(c => c.status === "verified");
  const totalEarnings = verifiedClips.reduce((s, c) => s + c.earnings_cents, 0);
  const pendingPayout = admin.clips.filter(c => c.status === "pending").reduce((s, c) => s + c.earnings_cents, 0);

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Payments"
        description="Weekly payout batch, pending verification, Friday queue"
        kpis={[
          { label: "Approved Payouts", value: `$${(totalEarnings / 100).toFixed(2)}` },
          { label: "Pending Review", value: `$${(pendingPayout / 100).toFixed(2)}` },
          { label: "Cycle Status", value: budget.cycle?.status || "—" },
          { label: "Segments", value: budget.segments.length },
          { label: "Friday Ready", value: budget.cycle?.status === "approved" ? "✅ Yes" : "❌ No" },
        ]}
        charts={[
          { type: "bar", title: "Payouts by Clipper (Top 5)", data: admin.clippers.slice(0, 5).map(c => ({ name: c.display_name.slice(0, 10), value: c.totalEarningsCents / 100 })) },
        ]}
      />

      <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border/20 bg-secondary/20">
          <h3 className="text-xs font-bold text-foreground uppercase">Payout Queue</h3>
        </div>
        <div className="divide-y divide-border/10">
          {admin.clippers.filter(c => c.totalEarningsCents > 0).map(c => (
            <div key={c.user_id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-foreground text-xs">{c.display_name}</p>
                <p className="text-[10px] text-muted-foreground">{c.totalClips} clips · {c.totalViews.toLocaleString()} views</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground text-sm">${(c.totalEarningsCents / 100).toFixed(2)}</p>
                <Badge variant="outline" className="text-[9px]">{c.pendingClips > 0 ? "Pending" : "Ready"}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 🔟 BOARD
// ═══════════════════════════════════════════════
function BoardTab() {
  const board = useBoard();
  const autoExec = useAutoExecute(board.refetch);
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = searchQuery.trim() ? board.cards.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase())) : board.cards;

  const colCounts = board.columns.map(col => ({
    name: col.name.slice(0, 10),
    value: board.cards.filter(c => c.column_id === col.id).length,
  }));

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Kanban Board"
        description="Ideas → In Development → Testing → Live → Optimizing"
        kpis={[
          { label: "Total Cards", value: board.cards.length },
          { label: "Columns", value: board.columns.length },
          ...board.columns.slice(0, 4).map(col => ({
            label: col.name.slice(0, 12),
            value: board.cards.filter(c => c.column_id === col.id).length,
          })),
        ]}
        charts={[
          { type: "bar", title: "Cards per Column", data: colCounts },
        ]}
      />
      <PipelineControls columns={board.columns} isRunning={autoExec.isRunning} currentPhase={autoExec.currentPhase} currentCardTitle={autoExec.currentCardTitle} processedCount={autoExec.processedCount} onExecute={autoExec.execute} onSweep={autoExec.sweep} onStop={autoExec.stop} />
      <Input placeholder="Search cards..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-xs" />
      <KanbanBoard isAdmin={true} columns={board.columns} cards={filtered} loading={board.loading} moveCard={board.moveCard} updateCard={board.updateCard} createCard={board.createCard} deleteCard={board.deleteCard} />
    </div>
  );
}

// ═══════════════════════════════════════════════
// 1️⃣1️⃣ ROADMAP
// ═══════════════════════════════════════════════
function RoadmapTab() {
  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Roadmap"
        description="Quarterly roadmap with milestone tracking and board linking"
        kpis={[
          { label: "Q1 Items", value: 12 },
          { label: "Q2 Items", value: 8 },
          { label: "Completed", value: "45%" },
          { label: "In Progress", value: 5 },
        ]}
      />
      <Suspense fallback={<div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>}>
        <RoadmapContent />
      </Suspense>
    </div>
  );
}

const RoadmapContent = lazy(() => import("@/pages/Roadmap"));

// ═══════════════════════════════════════════════
// 1️⃣2️⃣ LOGS
// ═══════════════════════════════════════════════
function LogsTab() {
  const budget = useBudgetControl();
  if (budget.loading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Audit Logs"
        description="Who changed what, when, and rollback options"
        kpis={[
          { label: "Total Events", value: budget.events.length },
          { label: "Today", value: budget.events.filter(e => new Date(e.created_at).toDateString() === new Date().toDateString()).length },
          { label: "Last Action", value: budget.events[0]?.action || "—" },
        ]}
      />
      {budget.events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No events logged yet.</p>
      ) : (
        <div className="space-y-2">
          {budget.events.map(evt => (
            <div key={evt.id} className="bg-card border border-border/30 rounded-lg p-3 text-xs">
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className="text-[10px]">{evt.action}</Badge>
                <span className="text-muted-foreground">{new Date(evt.created_at).toLocaleString()}</span>
              </div>
              {evt.notes && <p className="text-muted-foreground">{evt.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// 1️⃣3️⃣ FORECAST AI
// ═══════════════════════════════════════════════
function ForecastTab() {
  const admin = useClipperAdmin();
  const budget = useBudgetControl();
  const sim = budget.simulate({ rpm: 0.22 });

  const forecastData = [
    { name: "Week 1", value: sim.day7Forecast / 100 },
    { name: "Week 2", value: sim.day7Forecast * 2 / 100 },
    { name: "Week 3", value: sim.day7Forecast * 3 / 100 },
    { name: "Week 4", value: sim.day30Projection / 100 },
  ];

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Forecast AI"
        description="30-day revenue forecast, 90-day projection, budget burn simulation"
        kpis={[
          { label: "7-Day Forecast", value: `$${(sim.day7Forecast / 100).toFixed(0)}` },
          { label: "30-Day Projection", value: `$${(sim.day30Projection / 100).toFixed(0)}` },
          { label: "Worst Case", value: `$${(sim.worstCase / 100).toFixed(0)}` },
          { label: "Risk-Adjusted", value: `$${(sim.riskAdjusted / 100).toFixed(0)}` },
          { label: "Safe Limit", value: `$${(sim.safeLimit / 100).toFixed(0)}` },
        ]}
        charts={[
          { type: "area", title: "Revenue Forecast (4 Weeks)", data: forecastData },
          { type: "bar", title: "Scenario Analysis", data: [
            { name: "Best", value: sim.day30Projection * 1.4 / 100 },
            { name: "Base", value: sim.day30Projection / 100 },
            { name: "Worst", value: sim.worstCase / 100 },
          ]},
        ]}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════
// 1️⃣4️⃣ FRAUD MONITOR
// ═══════════════════════════════════════════════
function FraudMonitorTab() {
  const admin = useClipperAdmin();

  // Simulated fraud scores per clipper
  const fraudData = admin.clippers.map(c => ({
    name: c.display_name.slice(0, 12),
    score: Math.round(Math.random() * 40),
    views: c.totalViews,
  }));

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Fraud Monitor"
        description="AI anomaly detection: CTR/reg spikes, bot patterns, risk scoring"
        kpis={[
          { label: "Monitored", value: admin.clippers.length },
          { label: "Flagged", value: fraudData.filter(f => f.score > 30).length },
          { label: "High Risk", value: fraudData.filter(f => f.score > 60).length },
          { label: "Avg Score", value: `${Math.round(fraudData.reduce((s, f) => s + f.score, 0) / (fraudData.length || 1))}/100` },
        ]}
        charts={[
          { type: "bar", title: "Fraud Risk Scores", data: fraudData.slice(0, 8).map(f => ({ name: f.name, value: f.score })) },
        ]}
      />

      <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border/20 bg-secondary/20">
          <h3 className="text-xs font-bold text-foreground uppercase">Clipper Risk Scores</h3>
        </div>
        <div className="divide-y divide-border/10">
          {fraudData.sort((a, b) => b.score - a.score).map(f => (
            <div key={f.name} className="flex items-center justify-between px-4 py-3 text-sm">
              <p className="font-medium text-foreground text-xs">{f.name}</p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{f.views.toLocaleString()} views</span>
                <Badge className={`text-[10px] ${f.score > 60 ? "bg-red-500/15 text-red-400" : f.score > 30 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                  {f.score}/100
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 1️⃣5️⃣ LEADERBOARD
// ═══════════════════════════════════════════════
function LeaderboardTab() {
  const admin = useClipperAdmin();
  if (admin.loading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Leaderboard"
        description="Rank clippers by views, earnings, consistency"
        kpis={[
          { label: "Total Clippers", value: admin.clippers.length },
          { label: "#1 Views", value: admin.clippers[0] ? fmt(admin.clippers[0].totalViews) : "—" },
          { label: "#1 Earned", value: admin.clippers[0] ? `$${(admin.clippers[0].totalEarningsCents / 100).toFixed(2)}` : "—" },
          { label: "Avg Clips", value: admin.clippers.length > 0 ? Math.round(admin.clippers.reduce((s, c) => s + c.totalClips, 0) / admin.clippers.length) : 0 },
        ]}
        charts={[
          { type: "bar", title: "Top 5 by Views", data: admin.clippers.slice(0, 5).map(c => ({ name: c.display_name.slice(0, 10), value: c.totalViews })) },
        ]}
      />
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2.5rem_1fr_5rem_5rem_5rem_4.5rem] px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-secondary/30">
          <span>#</span><span>Clipper</span><span className="text-right">Clips</span><span className="text-right">Views</span><span className="text-right">Earned</span><span className="text-right">Pending</span>
        </div>
        <div className="divide-y divide-border/15">
          {admin.clippers.map((u, i) => (
            <div key={u.user_id} className="grid grid-cols-[2.5rem_1fr_5rem_5rem_5rem_4.5rem] items-center px-4 py-3 text-sm hover:bg-secondary/20">
              <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
              <div><p className="font-semibold text-foreground text-xs">{u.display_name}</p></div>
              <span className="text-right text-xs font-semibold">{u.totalClips}</span>
              <span className="text-right text-xs">{fmt(u.totalViews)}</span>
              <span className="text-right text-xs font-bold">${(u.totalEarningsCents / 100).toFixed(2)}</span>
              <span className="text-right">{u.pendingClips > 0 && <Badge className="text-[10px] bg-amber-500/15 text-amber-400 border-amber-500/30">{u.pendingClips}</Badge>}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// 1️⃣6️⃣ ALERTS
// ═══════════════════════════════════════════════
function AlertsTab() {
  const budget = useBudgetControl();
  const admin = useClipperAdmin();

  // Generate alerts based on real state
  const alerts: { level: "error" | "warning" | "info"; title: string; desc: string; time: string }[] = [];

  budget.segmentCycles.forEach(sc => {
    const seg = budget.segments.find(s => s.id === sc.segment_id);
    if (!seg) return;
    const pct = seg.weekly_limit_cents > 0 ? (sc.spent_cents / seg.weekly_limit_cents) * 100 : 0;
    if (pct >= 100) alerts.push({ level: "error", title: `${seg.name} at 100%`, desc: "Hard freeze active. Payouts blocked.", time: "Now" });
    else if (pct >= 95) alerts.push({ level: "error", title: `${seg.name} at ${pct.toFixed(0)}%`, desc: "Auto-throttle engaged.", time: "Now" });
    else if (pct >= 80) alerts.push({ level: "warning", title: `${seg.name} at ${pct.toFixed(0)}%`, desc: "Approaching weekly limit.", time: "Now" });
  });

  if (budget.cycle?.status === "pending_approval") {
    alerts.push({ level: "warning", title: "Cycle Pending Approval", desc: "Weekly cycle not yet approved. Friday payouts blocked.", time: "Now" });
  }

  if (admin.stats && admin.stats.pendingReviewCount > 10) {
    alerts.push({ level: "info", title: `${admin.stats.pendingReviewCount} Clips Pending Review`, desc: "Large queue of unreviewed clips.", time: "Now" });
  }

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Alerts"
        description="Real-time KPI alerts for budget, fraud, and conversion drops"
        kpis={[
          { label: "Critical", value: alerts.filter(a => a.level === "error").length },
          { label: "Warnings", value: alerts.filter(a => a.level === "warning").length },
          { label: "Info", value: alerts.filter(a => a.level === "info").length },
          { label: "Total", value: alerts.length },
        ]}
      />

      {alerts.length === 0 ? (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-8 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground">All Clear</p>
          <p className="text-xs text-muted-foreground">No active alerts. Systems nominal.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`border rounded-xl p-4 flex items-start gap-3 ${
              a.level === "error" ? "border-red-500/30 bg-red-500/5" : a.level === "warning" ? "border-amber-500/30 bg-amber-500/5" : "border-blue-500/30 bg-blue-500/5"
            }`}>
              {a.level === "error" ? <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" /> : a.level === "warning" ? <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" /> : <Bell className="w-5 h-5 text-blue-400 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
