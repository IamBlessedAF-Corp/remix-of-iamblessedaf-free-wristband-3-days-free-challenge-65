import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Film, Award, Users, Link2, Settings, Blocks,
  ShieldAlert, CreditCard, Kanban, Map, ScrollText, Brain, Search as SearchIcon,
  Trophy, Bell, LogOut, RefreshCw, Menu, ChevronLeft, Shield,
  CheckCircle, Clock, AlertTriangle, Trash2, ExternalLink, Play,
  Lightbulb, BarChart3, Eye, DollarSign, TrendingUp,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useClipperAdmin, type ClipRow } from "@/hooks/useClipperAdmin";
import { useLinkAnalytics } from "@/hooks/useLinkAnalytics";
import { useBudgetControl } from "@/hooks/useBudgetControl";
import { useBoard } from "@/hooks/useBoard";
import { useAutoExecute } from "@/hooks/useAutoExecute";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BoardLoginForm from "@/components/board/BoardLoginForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import AdminAnalyticsDashboard from "@/components/clipper/AdminAnalyticsDashboard";
import BudgetControlTab from "@/components/admin/BudgetControlTab";
import KanbanBoard from "@/components/board/KanbanBoard";
import PipelineControls from "@/components/board/PipelineControls";
import LinkStatsCards from "@/components/admin/LinkStatsCards";
import DailyClicksChart from "@/components/admin/DailyClicksChart";
import LinkPieCharts from "@/components/admin/LinkPieCharts";
import TopLinksTable from "@/components/admin/TopLinksTable";
import UtmBuilder from "@/components/admin/UtmBuilder";
import PerLinkTrafficChart from "@/components/admin/PerLinkTrafficChart";

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

// ─── Placeholder Tab ───
const PlaceholderTab = ({ title, icon: Icon, description }: { title: string; icon: any; description: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <Icon className="w-12 h-12 text-muted-foreground/30 mb-4" />
    <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
    <p className="text-sm text-muted-foreground max-w-md">{description}</p>
  </div>
);

// ─── Main Admin Hub ───
export default function AdminHub() {
  const { user, isAdmin, loading: authLoading, signInWithEmail, signOut } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="flex items-center justify-center gap-2 mb-6"><Shield className="w-5 h-5 text-primary" /><h1 className="text-lg font-bold text-foreground">Admin Access</h1></div>
          <BoardLoginForm signInWithEmail={signInWithEmail} />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
        <div><Shield className="w-10 h-10 text-destructive mx-auto mb-3" /><h2 className="text-lg font-bold text-foreground mb-1">Access Denied</h2><p className="text-sm text-muted-foreground mb-4">Admin role required.</p><Button variant="outline" onClick={signOut}>Sign Out</Button></div>
      </div>
    );
  }

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

// ─── Tab Router ───
function TabContent({ tab }: { tab: TabId }) {
  switch (tab) {
    case "dashboard": return <DashboardTab />;
    case "clippers": return <ClippersTab />;
    case "leaderboard": return <LeaderboardTab />;
    case "budget": return <BudgetControlTab />;
    case "board": return <BoardTab />;
    case "links": return <LinksTab />;
    case "experts": return <ExpertsTab />;
    case "congrats": return <CongratsTab />;
    case "logs": return <LogsTab />;
    case "campaign": return <PlaceholderTab title="Campaign Settings" icon={Settings} description="Configure activation thresholds, RPM, bonus tiers, payout rules, and weekly cutoff logic." />;
    case "blocks": return <PlaceholderTab title="Intelligent Blocks" icon={Blocks} description="Reusable dynamic UI blocks: Activation Badge, Bonus Card, Risk Banner, Tooltip explanations." />;
    case "risk": return <PlaceholderTab title="Risk Engine" icon={ShieldAlert} description="Global CTR/Reg Rate/Day1 averages, 7-day trends, throttle status, auto risk throttle." />;
    case "payments": return <PlaceholderTab title="Payments" icon={CreditCard} description="Weekly payout batch, pending verification, approved batch, Friday payout queue." />;
    case "roadmap": return <PlaceholderTab title="Roadmap" icon={Map} description="Quarterly roadmap with milestone tracking, priority badges, and board task linking." />;
    case "forecast": return <PlaceholderTab title="Forecast AI" icon={Brain} description="30-day revenue forecast, 90-day projection, budget burn simulation." />;
    case "fraud": return <PlaceholderTab title="Fraud Monitor" icon={SearchIcon} description="AI anomaly detection: abnormal CTR/reg spikes, bot patterns, risk scoring 0-100." />;
    case "alerts": return <PlaceholderTab title="Alerts" icon={Bell} description="Real-time KPI alerts for CTR drops, budget exceedance, fraud risk." />;
    default: return null;
  }
}

// ─── Dashboard Tab ───
function DashboardTab() {
  const admin = useClipperAdmin();
  if (admin.loading || !admin.stats) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  return <AdminAnalyticsDashboard stats={admin.stats} clips={admin.clips} clippers={admin.clippers} />;
}

// ─── Clippers Tab ───
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
    <div className="space-y-4">
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
  );
}

// ─── Leaderboard Tab ───
function LeaderboardTab() {
  const admin = useClipperAdmin();
  if (admin.loading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  return (
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
  );
}

// ─── Board Tab ───
function BoardTab() {
  const board = useBoard();
  const autoExec = useAutoExecute(board.refetch);
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = searchQuery.trim() ? board.cards.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase())) : board.cards;
  return (
    <div className="space-y-4">
      <PipelineControls columns={board.columns} isRunning={autoExec.isRunning} currentPhase={autoExec.currentPhase} currentCardTitle={autoExec.currentCardTitle} processedCount={autoExec.processedCount} onExecute={autoExec.execute} onSweep={autoExec.sweep} onStop={autoExec.stop} />
      <Input placeholder="Search cards..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-xs" />
      <KanbanBoard isAdmin={true} columns={board.columns} cards={filtered} loading={board.loading} moveCard={board.moveCard} updateCard={board.updateCard} createCard={board.createCard} deleteCard={board.deleteCard} />
    </div>
  );
}

// ─── Links Tab ───
function LinksTab() {
  const [days, setDays] = useState(30);
  const { stats, links, clicks, loading, refetch } = useLinkAnalytics(days);
  if (loading && !stats) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  if (!stats) return <p className="text-center text-muted-foreground py-20">No data.</p>;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {[7, 30, 90].map(d => (
          <button key={d} onClick={() => setDays(d)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${days === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-secondary"}`}>{d}d</button>
        ))}
        <Button variant="outline" size="sm" onClick={refetch} className="gap-1.5 ml-auto"><RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
      </div>
      <LinkStatsCards totalLinks={stats.totalLinks} totalClicks={stats.totalClicks} activeLinks={stats.activeLinks} periodClicks={stats.dailyClicks.reduce((s, d) => s + d.clicks, 0)} />
      <DailyClicksChart dailyClicks={stats.dailyClicks} />
      <PerLinkTrafficChart links={links} clicks={clicks} />
      <LinkPieCharts deviceBreakdown={stats.deviceBreakdown} browserBreakdown={stats.browserBreakdown} osBreakdown={stats.osBreakdown} />
      <UtmBuilder />
      <TopLinksTable links={stats.topLinks} />
    </div>
  );
}

// ─── Experts Tab ───
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
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{ label: "Total", value: stats.total }, { label: "New", value: stats.new }, { label: "Contacted", value: stats.contacted }, { label: "Converted", value: stats.converted }].map(k => (
          <div key={k.label} className="bg-card border border-border/40 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>
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

// ─── Congrats Tab ───
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
  const skipRate = totals.shown ? ((totals.declined / totals.shown) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Page Views", value: fetching ? "…" : totals.shown }, { label: "Viral Shares", value: fetching ? "…" : totals.accepted }, { label: "Skips", value: fetching ? "…" : totals.declined }, { label: "Share Rate", value: fetching ? "…" : `${shareRate}%` }].map(k => (
          <div key={k.label} className="bg-card border border-border/40 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border/40 rounded-xl p-6 text-center">
          <p className="text-3xl font-black text-primary">{shareRate}%</p>
          <p className="text-xs text-muted-foreground">Viral Share Rate</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-6 text-center">
          <p className="text-3xl font-black text-destructive">{skipRate}%</p>
          <p className="text-xs text-muted-foreground">Skip Rate</p>
        </div>
      </div>
    </div>
  );
}

// ─── Logs Tab ───
function LogsTab() {
  const budget = useBudgetControl();
  if (budget.loading) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-foreground">Budget Events Audit Log</h2>
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
