import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent-foreground))",
  "hsl(210, 60%, 55%)",
  "hsl(150, 50%, 45%)",
  "hsl(35, 80%, 55%)",
  "hsl(0, 60%, 55%)",
  "hsl(270, 50%, 55%)",
  "hsl(180, 50%, 45%)",
];

interface Props {
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  osBreakdown: Record<string, number>;
}

function breakdownToData(breakdown: Record<string, number>) {
  return Object.entries(breakdown)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function MiniPie({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-5 text-center">
        <h3 className="text-sm font-bold text-foreground mb-4">{title}</h3>
        <p className="text-xs text-muted-foreground">No data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5">
      <h3 className="text-sm font-bold text-foreground mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            dataKey="value"
            stroke="hsl(var(--border))"
            strokeWidth={1}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px" }}
            formatter={(value) => <span className="text-muted-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function LinkPieCharts({ deviceBreakdown, browserBreakdown, osBreakdown }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MiniPie title="Devices" data={breakdownToData(deviceBreakdown)} />
      <MiniPie title="Browsers" data={breakdownToData(browserBreakdown)} />
      <MiniPie title="OS" data={breakdownToData(osBreakdown)} />
    </div>
  );
}
