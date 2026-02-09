import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp } from "lucide-react";
import type { LinkSummary, ClickRow } from "@/hooks/useLinkAnalytics";

interface Props {
  links: LinkSummary[];
  clicks: ClickRow[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(220 70% 55%)",
  "hsl(340 65% 50%)",
  "hsl(160 60% 45%)",
];

/** Named links = links with a human-readable short_code (no random chars) */
function isNamedLink(code: string) {
  return /^[a-zA-Z0-9-_]{2,20}$/.test(code) && !/[A-Z].*[a-z].*[A-Z]/.test(code);
}

export default function PerLinkTrafficChart({ links, clicks }: Props) {
  const [view, setView] = useState<"bar" | "daily">("bar");

  // Named links with clicks
  const namedLinks = useMemo(
    () => links.filter((l) => l.click_count > 0 || isNamedLink(l.short_code)),
    [links]
  );

  // Bar chart data — total clicks per named link
  const barData = useMemo(() => {
    return namedLinks
      .map((l) => ({
        code: l.short_code,
        clicks: l.click_count,
        destination: l.destination_url.replace(/https?:\/\/[^/]+/, ""),
        campaign: l.campaign || "",
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 12);
  }, [namedLinks]);

  // Daily breakdown per link
  const dailyData = useMemo(() => {
    const linkMap = new Map(namedLinks.map((l) => [l.id, l.short_code]));
    const dayLink: Record<string, Record<string, number>> = {};

    for (const c of clicks) {
      const code = linkMap.get(c.link_id);
      if (!code) continue;
      const day = c.clicked_at.substring(0, 10);
      if (!dayLink[day]) dayLink[day] = {};
      dayLink[day][code] = (dayLink[day][code] || 0) + 1;
    }

    return Object.entries(dayLink)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, codes]) => ({ date: date.substring(5), ...codes }));
  }, [clicks, namedLinks]);

  const activeCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const row of dailyData) {
      Object.keys(row).forEach((k) => k !== "date" && codes.add(k));
    }
    return Array.from(codes);
  }, [dailyData]);

  if (barData.length === 0) return null;

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Traffic by Link</h3>
        </div>
        <div className="flex bg-secondary rounded-lg p-0.5">
          <button
            onClick={() => setView("bar")}
            className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-colors ${
              view === "bar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Total
          </button>
          <button
            onClick={() => setView("daily")}
            className={`px-3 py-1 text-[10px] font-semibold rounded-md transition-colors ${
              view === "daily" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Daily
          </button>
        </div>
      </div>

      {view === "bar" ? (
        <ResponsiveContainer width="100%" height={Math.max(200, barData.length * 36)}>
          <BarChart data={barData} layout="vertical" margin={{ left: 70, right: 16, top: 4, bottom: 4 }}>
            <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="code"
              tick={{ fontSize: 11, fontWeight: 600 }}
              width={65}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 11,
              }}
              formatter={(value: number, _name: string, props: any) => [
                `${value} clicks`,
                props.payload.destination,
              ]}
            />
            <Bar dataKey="clicks" radius={[0, 4, 4, 0]} barSize={20}>
              {barData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <>
          {dailyData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No daily click data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dailyData} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  {activeCodes.map((code, i) => (
                    <Bar key={code} dataKey={code} stackId="a" fill={COLORS[i % COLORS.length]} radius={i === activeCodes.length - 1 ? [4, 4, 0, 0] : undefined} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-3 justify-center">
                {activeCodes.map((code, i) => (
                  <div key={code} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-[10px] font-semibold text-muted-foreground">{code}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
