import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WeekSummary {
  weekStart: string;
  weekEnd: string;
  clips: number;
  views: number;
  earningsCents: number;
  status: "paid" | "in_review" | "pending";
}

interface Props {
  userId: string;
}

const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - (day === 0 ? 6 : day - 1));
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const ClipperPayoutHistory = ({ userId }: Props) => {
  const [weeks, setWeeks] = useState<WeekSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    const { data: clips } = await supabase
      .from("clip_submissions")
      .select("submitted_at, view_count, earnings_cents")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false });

    if (!clips || clips.length === 0) {
      setWeeks([]);
      setLoading(false);
      return;
    }

    // Group by week (Mon–Sun)
    const weekMap = new Map<string, { clips: number; views: number; earningsCents: number; weekStart: Date }>();

    clips.forEach((c) => {
      const monday = getMonday(new Date(c.submitted_at));
      const key = monday.toISOString();
      const existing = weekMap.get(key) || { clips: 0, views: 0, earningsCents: 0, weekStart: monday };
      existing.clips += 1;
      existing.views += c.view_count || 0;
      existing.earningsCents += c.earnings_cents || 0;
      weekMap.set(key, existing);
    });

    const now = new Date();
    const currentMonday = getMonday(now);

    const summaries: WeekSummary[] = Array.from(weekMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([, w]) => {
        const weekEnd = new Date(w.weekStart);
        weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

        // Current week = pending, last week = in_review, older = paid
        let status: WeekSummary["status"] = "paid";
        if (w.weekStart.getTime() === currentMonday.getTime()) {
          status = "pending";
        } else if (w.weekStart.getTime() === currentMonday.getTime() - 7 * 86400000) {
          status = "in_review";
        }

        return {
          weekStart: formatDate(w.weekStart),
          weekEnd: formatDate(weekEnd),
          clips: w.clips,
          views: w.views,
          earningsCents: w.earningsCents,
          status,
        };
      });

    setWeeks(summaries);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const statusConfig = {
    paid: { icon: CheckCircle, label: "Paid", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    in_review: { icon: Clock, label: "In Review", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    pending: { icon: AlertCircle, label: "Active", className: "bg-primary/15 text-primary border-primary/30" },
  };

  if (loading) return null;

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-1">
        <DollarSign className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Payout History</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Weekly summaries — payouts are reviewed every Monday.
      </p>

      {weeks.length === 0 ? (
        <div className="text-center py-6">
          <Calendar className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No clips submitted yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Submit your first clip to start earning.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {weeks.map((week, i) => {
            const cfg = statusConfig[week.status];
            const Icon = cfg.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl p-3 bg-secondary/50 border border-border/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {week.weekStart} – {week.weekEnd}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {week.clips} clip{week.clips !== 1 ? "s" : ""} · {week.views.toLocaleString()} views
                  </p>
                </div>
                <div className="text-right flex-shrink-0 flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">
                    ${(week.earningsCents / 100).toFixed(2)}
                  </p>
                  <Badge className={`text-[10px] px-1.5 py-0.5 ${cfg.className}`}>
                    <Icon className="w-3 h-3 mr-0.5" />
                    {cfg.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-[10px] text-muted-foreground/60 text-center leading-relaxed">
        Payouts undergo a 24-hour review to verify view counts against public platform data.
      </p>
    </div>
  );
};

export default ClipperPayoutHistory;
