import { Link2, MousePointerClick, Zap, TrendingUp } from "lucide-react";

interface Props {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  periodClicks: number;
}

export default function LinkStatsCards({ totalLinks, totalClicks, activeLinks, periodClicks }: Props) {
  const cards = [
    { label: "Total Links", value: totalLinks, icon: Link2, color: "text-primary" },
    { label: "Total Clicks", value: totalClicks, icon: MousePointerClick, color: "text-primary" },
    { label: "Active Links", value: activeLinks, icon: Zap, color: "text-primary" },
    { label: "Period Clicks", value: periodClicks, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-card border border-border/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <c.icon className={`w-4 h-4 ${c.color}`} />
            <span className="text-xs text-muted-foreground font-medium">{c.label}</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{c.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
