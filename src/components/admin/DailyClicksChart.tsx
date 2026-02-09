import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  dailyClicks: { date: string; clicks: number }[];
}

export default function DailyClicksChart({ dailyClicks }: Props) {
  if (dailyClicks.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-5 text-center">
        <h3 className="text-sm font-bold text-foreground mb-4">Daily Clicks</h3>
        <p className="text-xs text-muted-foreground py-10">No click data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5">
      <h3 className="text-sm font-bold text-foreground mb-4">Daily Clicks</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={dailyClicks}>
          <defs>
            <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickFormatter={(v) => v.substring(5)}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="hsl(var(--primary))"
            fill="url(#clickGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
