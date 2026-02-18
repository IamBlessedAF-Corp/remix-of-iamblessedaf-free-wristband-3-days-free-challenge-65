import { ReactNode, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, PieChart, Pie, Cell
} from "recharts";

interface KPI {
  label: string;
  value: string | number;
  delta?: string;
  color?: string;
}

interface MiniChart {
  type: "area" | "bar" | "pie";
  title: string;
  data: { name: string; value: number }[];
}

interface Props {
  title: string;
  description?: string;
  kpis: KPI[];
  charts?: MiniChart[];
  children?: ReactNode;
  defaultCollapsed?: boolean;
}

const COLORS = ["hsl(var(--primary))", "hsl(142 70% 45%)", "hsl(38 92% 50%)", "hsl(262 80% 55%)", "hsl(0 72% 51%)"];

export default function AdminSectionDashboard({ title, description, kpis, charts, children, defaultCollapsed = false }: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="space-y-4 mb-6">
      <button className="flex items-center justify-between w-full text-left" onClick={() => setCollapsed(!collapsed)}>
        <div>
          <h2 className="text-lg font-black text-foreground">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <svg className={`w-5 h-5 text-muted-foreground transition-transform ${collapsed ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {!collapsed && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {kpis.map((k) => (
              <div key={k.label} className="bg-card border border-border/40 rounded-xl p-3 hover:border-primary/30 transition-colors">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">{k.label}</p>
                <p className="text-xl font-bold text-foreground">{typeof k.value === "number" ? k.value.toLocaleString() : k.value}</p>
                {k.delta && (
                  <p className={`text-[10px] font-medium mt-0.5 ${k.delta.startsWith("+") ? "text-emerald-400" : k.delta.startsWith("-") ? "text-red-400" : "text-muted-foreground"}`}>
                    {k.delta}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Mini Charts */}
          {charts && charts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {charts.map((chart) => (
                <div key={chart.title} className="bg-card border border-border/40 rounded-xl p-4">
                  <h3 className="text-xs font-bold text-foreground mb-3">{chart.title}</h3>
                  <div className="h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {chart.type === "area" ? (
                        <AreaChart data={chart.data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                        </AreaChart>
                      ) : chart.type === "bar" ? (
                        <BarChart data={chart.data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      ) : (
                        <PieChart>
                          <Pie data={chart.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} strokeWidth={0}>
                            {chart.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          )}

          {children}
        </>
      )}
    </div>
  );
}
