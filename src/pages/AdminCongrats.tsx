import { useState, useEffect } from "react";
import { ArrowLeft, Eye, Share2, SkipForward, TrendingUp } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BoardLoginForm from "@/components/board/BoardLoginForm";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

interface DailyMetric {
  date: string;
  shown: number;
  accepted: number;
  declined: number;
}

const PIE_COLORS = ["hsl(var(--primary))", "hsl(142 76% 36%)", "hsl(0 84% 60%)"];

export default function AdminCongrats() {
  const { user, isAdmin, loading, signInWithEmail, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [totals, setTotals] = useState({ shown: 0, accepted: 0, declined: 0 });
  const [daily, setDaily] = useState<DailyMetric[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setFetching(true);
      const { data } = await (supabase.from("exit_intent_events" as any) as any)
        .select("event_type, created_at")
        .eq("page", "congrats-neuro-hacker")
        .order("created_at", { ascending: true });

      if (!data) { setFetching(false); return; }

      const counts = { shown: 0, accepted: 0, declined: 0 };
      const dayMap: Record<string, { shown: number; accepted: number; declined: number }> = {};

      (data as any[]).forEach((row: any) => {
        const t = row.event_type as "shown" | "accepted" | "declined";
        if (counts[t] !== undefined) counts[t]++;
        const day = row.created_at?.slice(0, 10) ?? "unknown";
        if (!dayMap[day]) dayMap[day] = { shown: 0, accepted: 0, declined: 0 };
        if (dayMap[day][t] !== undefined) dayMap[day][t]++;
      });

      setTotals(counts);
      setDaily(
        Object.entries(dayMap).map(([date, v]) => ({ date, ...v }))
      );
      setFetching(false);
    })();
  }, [isAdmin]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user || !isAdmin) return <BoardLoginForm signInWithEmail={signInWithEmail} />;

  const shareRate = totals.shown ? ((totals.accepted / totals.shown) * 100).toFixed(1) : "0";
  const skipRate = totals.shown ? ((totals.declined / totals.shown) * 100).toFixed(1) : "0";

  const pieData = [
    { name: "Views Only", value: Math.max(0, totals.shown - totals.accepted - totals.declined) },
    { name: "Shared", value: totals.accepted },
    { name: "Skipped", value: totals.declined },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-sm font-bold">Congrats Neuro-Hacker Metrics</h1>
          <Button variant="ghost" size="sm" onClick={signOut}>Logout</Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Page Views", value: totals.shown, icon: Eye, color: "text-primary" },
            { label: "Viral Shares", value: totals.accepted, icon: Share2, color: "text-green-500" },
            { label: "Skips", value: totals.declined, icon: SkipForward, color: "text-destructive" },
            { label: "Share Rate", value: `${shareRate}%`, icon: TrendingUp, color: "text-primary" },
          ].map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="pt-5 pb-4 flex flex-col items-center text-center gap-1">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                <p className="text-2xl font-black">{fetching ? "…" : kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Bar chart */}
          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-sm">Daily Breakdown</CardTitle></CardHeader>
            <CardContent className="h-64">
              {daily.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daily}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="shown" name="Views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="accepted" name="Shares" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="declined" name="Skips" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  {fetching ? "Loading…" : "No data yet"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pie chart */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Conversion Split</CardTitle></CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              {totals.shown > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm">{fetching ? "Loading…" : "No data"}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rates summary */}
        <Card>
          <CardContent className="pt-5 grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-black text-primary">{shareRate}%</p>
              <p className="text-xs text-muted-foreground">Viral Share Rate</p>
            </div>
            <div>
              <p className="text-3xl font-black text-destructive">{skipRate}%</p>
              <p className="text-xs text-muted-foreground">Skip Rate</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
