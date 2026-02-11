import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Eye, Film, Users, DollarSign, TrendingUp, Award, Calendar,
  BarChart3, ShieldCheck, Link2, Gift, ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";
import type { CampaignStats, ClipRow, ClipperUser } from "@/hooks/useClipperAdmin";

interface Props {
  stats: CampaignStats;
  clips: ClipRow[];
  clippers: ClipperUser[];
}

// ─── Helpers ───
const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const COLORS = ["hsl(var(--primary))", "hsl(262 80% 55%)", "hsl(142 70% 45%)", "hsl(38 92% 50%)", "hsl(0 72% 51%)"];

// ─── Stat Card with delta ───
const BigStat = ({ icon: Icon, label, value, delta, accent }: {
  icon: any; label: string; value: string; delta?: number; accent?: string;
}) => {
  const DeltaIcon = delta && delta > 0 ? ArrowUpRight : delta && delta < 0 ? ArrowDownRight : Minus;
  return (
    <div className="bg-card border border-border/40 rounded-xl p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent || "bg-primary/10"}`}>
          <Icon className={`w-4 h-4 ${accent ? "text-white" : "text-primary"}`} />
        </div>
        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {delta !== undefined && (
        <div className={`flex items-center gap-0.5 mt-1 text-[11px] font-medium ${
          delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-muted-foreground"
        }`}>
          <DeltaIcon className="w-3 h-3" />
          {delta > 0 ? `+${delta}` : delta < 0 ? String(delta) : "0"} vs last week
        </div>
      )}
    </div>
  );
};

const AdminAnalyticsDashboard = ({ stats, clips, clippers }: Props) => {
  const [referralCount, setReferralCount] = useState(0);
  const [wristbandsCount, setWristbandsCount] = useState(0);

  useEffect(() => {
    // Fetch referral accounts (creator_profiles created via referral)
    const fetchExtras = async () => {
      const { count: creators } = await supabase
        .from("creator_profiles")
        .select("id", { count: "exact", head: true });
      setReferralCount(creators || 0);

      // Free wristbands claimed = orders with tier 'free-wristband'
      const { count: wristbands } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("tier", "free-wristband");
      setWristbandsCount(wristbands || 0);
    };
    fetchExtras();
  }, []);

  // ─── Views per clip data ───
  const viewsPerClip = clips
    .filter(c => c.status === "verified")
    .map(c => ({
      name: c.display_name?.substring(0, 10) || "?",
      views: c.view_count,
      date: new Date(c.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      platform: c.platform,
    }))
    .slice(0, 20);

  // ─── Daily submissions timeline ───
  const dailyMap = new Map<string, { clips: number; views: number }>();
  clips.forEach(c => {
    const day = new Date(c.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const prev = dailyMap.get(day) || { clips: 0, views: 0 };
    prev.clips += 1;
    prev.views += c.view_count || 0;
    dailyMap.set(day, prev);
  });
  const dailyData = Array.from(dailyMap.entries())
    .map(([day, d]) => ({ day, ...d }))
    .slice(-14);

  // ─── Platform distribution ───
  const platformMap: Record<string, number> = {};
  clips.forEach(c => { platformMap[c.platform] = (platformMap[c.platform] || 0) + 1; });
  const platformData = Object.entries(platformMap).map(([name, value]) => ({ name, value }));

  // ─── Status distribution ───
  const statusMap: Record<string, number> = {};
  clips.forEach(c => { statusMap[c.status] = (statusMap[c.status] || 0) + 1; });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  const clipsDelta = stats.clipsThisWeek - stats.clipsLastWeek;

  // ─── Verification guidance ───
  const verificationTips = [
    "Compare clip URL username to creator's TikTok/IG handle in their profile",
    "Check submission date vs. clip's actual post date on the platform",
    "Verify view counts match public platform data (±10% tolerance)",
    "Flag duplicate URLs submitted by different users",
  ];

  return (
    <div className="space-y-6">
      {/* ── Row 1: Key Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <BigStat icon={Users} label="Clippers" value={String(stats.totalClippers)} />
        <BigStat icon={Film} label="Total Clips" value={String(stats.totalClips)} delta={clipsDelta} />
        <BigStat icon={Eye} label="Total Views" value={fmt(stats.totalViews)} />
        <BigStat icon={DollarSign} label="Total Paid" value={`$${(stats.totalPaidCents / 100).toFixed(2)}`} accent="bg-emerald-500" />
        <BigStat icon={Link2} label="Accounts Created" value={String(referralCount)} />
        <BigStat icon={Gift} label="Wristbands Claimed" value={String(wristbandsCount)} />
      </div>

      {/* ── Row 2: Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Activity Timeline */}
        <div className="bg-card border border-border/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Daily Activity (Last 14 Days)</h3>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="clips" stroke="hsl(var(--primary))" fill="url(#viewGradient)" strokeWidth={2} name="Clips" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Views per Clip */}
        <div className="bg-card border border-border/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Views Per Clip (Verified)</h3>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewsPerClip}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 3: Platform + Status breakdown ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Platform Pie */}
        <div className="bg-card border border-border/40 rounded-xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">Platform Split</h3>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={platformData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} strokeWidth={0}>
                  {platformData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie */}
        <div className="bg-card border border-border/40 rounded-xl p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">Review Status</h3>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} strokeWidth={0}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={
                      entry.name === "verified" ? "hsl(142 70% 45%)" :
                      entry.name === "pending" ? "hsl(38 92% 50%)" :
                      "hsl(0 72% 51%)"
                    } />
                  ))}
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Guide */}
        <div className="bg-card border border-border/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Clip Verification</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">How to verify a clip belongs to the clipper:</p>
          <div className="space-y-2">
            {verificationTips.map((tip, i) => (
              <div key={i} className="flex gap-2 text-[11px]">
                <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                <span className="text-muted-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 4: Top Performers ── */}
      <div className="bg-card border border-border/40 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Top Performers</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {clippers.slice(0, 3).map((u, i) => (
            <div key={u.user_id} className={`rounded-xl p-4 border ${
              i === 0 ? "bg-amber-500/5 border-amber-500/30" :
              i === 1 ? "bg-secondary/50 border-border/40" :
              "bg-secondary/30 border-border/30"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                <p className="text-sm font-bold text-foreground truncate">{u.display_name}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm font-bold text-foreground">{u.totalClips}</p>
                  <p className="text-[9px] text-muted-foreground">Clips</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{fmt(u.totalViews)}</p>
                  <p className="text-[9px] text-muted-foreground">Views</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">${(u.totalEarningsCents / 100).toFixed(2)}</p>
                  <p className="text-[9px] text-muted-foreground">Earned</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Avg: {u.totalClips > 0 ? fmt(Math.round(u.totalViews / u.totalClips)) : 0} views/clip
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 5: Quick KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border/40 rounded-xl p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Avg Views/Clip</p>
          <p className="text-xl font-bold text-foreground">{fmt(stats.avgViewsPerClip)}</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Top Platform</p>
          <p className="text-xl font-bold text-foreground capitalize">{stats.topPlatform}</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Pending Review</p>
          <p className="text-xl font-bold text-amber-400">{stats.pendingReviewCount}</p>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Verified</p>
          <p className="text-xl font-bold text-emerald-400">{stats.verifiedCount}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
