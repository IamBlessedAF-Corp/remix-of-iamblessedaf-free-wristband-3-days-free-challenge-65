import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Eye, Film, DollarSign, TrendingUp, Calendar, BarChart3,
  Trophy, Flame, Clock, CheckCircle, AlertTriangle, ExternalLink, Play
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";

interface Clip {
  id: string;
  clip_url: string;
  platform: string;
  status: string;
  view_count: number;
  earnings_cents: number;
  submitted_at: string;
}

interface Props {
  userId: string;
}

const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const COLORS = ["hsl(var(--primary))", "hsl(262 80% 55%)", "hsl(142 70% 45%)", "hsl(38 92% 50%)"];

const statusCfg: Record<string, { color: string; label: string; icon: any }> = {
  pending: { color: "bg-amber-500/15 text-amber-400 border-amber-500/30", label: "Pending", icon: Clock },
  verified: { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", label: "Verified", icon: CheckCircle },
  rejected: { color: "bg-red-500/15 text-red-400 border-red-500/30", label: "Rejected", icon: AlertTriangle },
};

const getStatus = (views: number) => {
  if (views >= 1_000_000) return { label: "Super Clipper 👑", color: "text-amber-400" };
  if (views >= 500_000) return { label: "Proven Clipper ⚡", color: "text-primary" };
  if (views >= 100_000) return { label: "Verified Clipper ✓", color: "text-emerald-400" };
  return { label: "New Clipper 🌱", color: "text-muted-foreground" };
};

const ClipperPersonalAnalytics = ({ userId }: Props) => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("clip_submissions")
        .select("id, clip_url, platform, status, view_count, earnings_cents, submitted_at")
        .eq("user_id", userId)
        .order("submitted_at", { ascending: false });
      setClips(data || []);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  if (loading) return null;

  const totalViews = clips.reduce((s, c) => s + (c.view_count || 0), 0);
  const totalEarnings = clips.reduce((s, c) => s + (c.earnings_cents || 0), 0);
  const verifiedClips = clips.filter(c => c.status === "verified");
  const avgViews = verifiedClips.length > 0 ? Math.round(totalViews / verifiedClips.length) : 0;
  const status = getStatus(totalViews);

  // Week boundaries
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const thisWeekStart = new Date(now);
  thisWeekStart.setUTCDate(now.getUTCDate() - diff);
  thisWeekStart.setUTCHours(0, 0, 0, 0);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7);

  const thisWeekClips = clips.filter(c => new Date(c.submitted_at) >= thisWeekStart);
  const lastWeekClips = clips.filter(c => {
    const d = new Date(c.submitted_at);
    return d >= lastWeekStart && d < thisWeekStart;
  });

  const thisWeekViews = thisWeekClips.reduce((s, c) => s + (c.view_count || 0), 0);
  const thisWeekEarnings = thisWeekClips.reduce((s, c) => s + (c.earnings_cents || 0), 0);

  // ─── Daily chart data ───
  const dailyMap = new Map<string, { clips: number; views: number }>();
  clips.forEach(c => {
    const d = new Date(c.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const prev = dailyMap.get(d) || { clips: 0, views: 0 };
    prev.clips += 1;
    prev.views += c.view_count || 0;
    dailyMap.set(d, prev);
  });
  const dailyData = Array.from(dailyMap.entries()).map(([day, d]) => ({ day, ...d })).slice(-14);

  // ─── Views per clip chart ───
  const viewsPerClipData = clips.slice(0, 15).map((c, i) => ({
    name: `#${clips.length - i}`,
    views: c.view_count,
    date: new Date(c.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  })).reverse();

  // ─── Platform distribution ───
  const platformMap: Record<string, number> = {};
  clips.forEach(c => { platformMap[c.platform] = (platformMap[c.platform] || 0) + 1; });
  const platformData = Object.entries(platformMap).map(([name, value]) => ({ name, value }));

  // ─── Status distribution ───
  const statusMap: Record<string, number> = {};
  clips.forEach(c => { statusMap[c.status] = (statusMap[c.status] || 0) + 1; });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // Best performing clip
  const bestClip = [...clips].sort((a, b) => b.view_count - a.view_count)[0];

  return (
    <div className="space-y-4">
      {/* ── Status + Key Stats ── */}
      <div className="bg-card border border-border/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">Your Analytics</h3>
          </div>
          <Badge className={`text-xs ${status.color} bg-secondary border-border`}>{status.label}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-secondary/50 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Total Views</span>
            </div>
            <p className="text-xl font-bold text-foreground">{fmt(totalViews)}</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Total Earned</span>
            </div>
            <p className="text-xl font-bold text-foreground">${(totalEarnings / 100).toFixed(2)}</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Film className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Total Clips</span>
            </div>
            <p className="text-xl font-bold text-foreground">{clips.length}</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Avg Views/Clip</span>
            </div>
            <p className="text-xl font-bold text-foreground">{fmt(avgViews)}</p>
          </div>
        </div>

        {/* This week vs last week */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5">
          <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-2">📊 This Week</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{thisWeekClips.length}</p>
              <p className="text-[9px] text-muted-foreground">Clips</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{fmt(thisWeekViews)}</p>
              <p className="text-[9px] text-muted-foreground">Views</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">${(thisWeekEarnings / 100).toFixed(2)}</p>
              <p className="text-[9px] text-muted-foreground">Earned</p>
            </div>
          </div>
          {lastWeekClips.length > 0 && (
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Last week: {lastWeekClips.length} clips · {fmt(lastWeekClips.reduce((s, c) => s + c.view_count, 0))} views
            </p>
          )}
        </div>
      </div>

      {/* ── Chart: Daily Activity ── */}
      {dailyData.length > 1 && (
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Your Activity</h3>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="userViewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                <Area type="monotone" dataKey="clips" stroke="hsl(var(--primary))" fill="url(#userViewGrad)" strokeWidth={2} name="Clips" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Views per Clip Chart ── */}
      {viewsPerClipData.length > 1 && (
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Views Per Clip</h3>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewsPerClipData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Platform + Status ── */}
      <div className="grid grid-cols-2 gap-3">
        {platformData.length > 0 && (
          <div className="bg-card border border-border/50 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-foreground mb-2">Platforms</h3>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={platformData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} strokeWidth={0}>
                    {platformData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend iconSize={6} wrapperStyle={{ fontSize: "9px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {statusData.length > 0 && (
          <div className="bg-card border border-border/50 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-foreground mb-2">Status</h3>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} strokeWidth={0}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={
                        entry.name === "verified" ? "hsl(142 70% 45%)" :
                        entry.name === "pending" ? "hsl(38 92% 50%)" :
                        "hsl(0 72% 51%)"
                      } />
                    ))}
                  </Pie>
                  <Legend iconSize={6} wrapperStyle={{ fontSize: "9px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* ── Best Performing Clip ── */}
      {bestClip && bestClip.view_count > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Best Performing Clip</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{fmt(bestClip.view_count)} views</p>
              <p className="text-[10px] text-muted-foreground capitalize">
                {bestClip.platform} · {new Date(bestClip.submitted_at).toLocaleDateString()}
              </p>
            </div>
            <a href={bestClip.clip_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 text-primary" />
            </a>
          </div>
        </div>
      )}

      {/* ── Clip History Table ── */}
      <div className="bg-card border border-border/50 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-foreground mb-3">All Submissions</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {clips.map(clip => {
            const cfg = statusCfg[clip.status] || statusCfg.pending;
            const Icon = cfg.icon;
            return (
              <div key={clip.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/30 border border-border/20">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground capitalize">{clip.platform}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Submitted: {new Date(clip.submitted_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                  <Eye className="w-3 h-3" /> {clip.view_count.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-foreground">${(clip.earnings_cents / 100).toFixed(2)}</span>
                <Badge className={`text-[9px] px-1.5 ${cfg.color}`}>
                  <Icon className="w-2.5 h-2.5 mr-0.5" />
                  {cfg.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClipperPersonalAnalytics;
