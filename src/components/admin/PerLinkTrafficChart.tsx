import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, X, Globe, Tag, Link2, CalendarDays } from "lucide-react";
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

const QUICK_RANGES = [
  { label: "All", days: 0 },
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
] as const;

function toDateStr(d: Date) {
  return d.toISOString().substring(0, 10);
}

/** Named links = links with a human-readable short_code (no random chars) */
function isNamedLink(code: string) {
  return /^[a-zA-Z0-9-_]{2,20}$/.test(code) && !/[A-Z].*[a-z].*[A-Z]/.test(code);
}

function breakdownToSorted(map: Record<string, number>) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
}

function BreakdownMiniChart({ label, icon: Icon, data }: { label: string; icon: React.ElementType; data: [string, number][] }) {
  const total = data.reduce((s, [, v]) => s + v, 0);
  if (data.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <Icon className="w-3.5 h-3.5 text-primary" />
        {label}
      </div>
      <div className="space-y-1.5">
        {data.map(([key, count]) => {
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={key} className="space-y-0.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground truncate max-w-[140px]">{key || "(none)"}</span>
                <span className="font-semibold text-foreground ml-2">{count} <span className="text-muted-foreground font-normal">({pct.toFixed(0)}%)</span></span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PerLinkTrafficChart({ links, clicks }: Props) {
  const [view, setView] = useState<"bar" | "daily">("bar");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeQuick, setActiveQuick] = useState<number>(0); // 0 = All

  const handleQuickRange = (days: number) => {
    setActiveQuick(days);
    if (days === 0) {
      setDateFrom("");
      setDateTo("");
    } else {
      const now = new Date();
      setDateTo(toDateStr(now));
      const from = new Date();
      from.setDate(from.getDate() - days);
      setDateFrom(toDateStr(from));
    }
  };

  // Filter clicks by date range
  const filteredClicks = useMemo(() => {
    if (!dateFrom && !dateTo) return clicks;
    return clicks.filter((c) => {
      const day = c.clicked_at.substring(0, 10);
      if (dateFrom && day < dateFrom) return false;
      if (dateTo && day > dateTo) return false;
      return true;
    });
  }, [clicks, dateFrom, dateTo]);

  // Named links with clicks
  const namedLinks = useMemo(
    () => links.filter((l) => l.click_count > 0 || isNamedLink(l.short_code)),
    [links]
  );

  // Build click counts from filtered clicks (not from link.click_count which is all-time)
  const filteredClickCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of filteredClicks) {
      counts[c.link_id] = (counts[c.link_id] || 0) + 1;
    }
    return counts;
  }, [filteredClicks]);

  const isFiltered = dateFrom !== "" || dateTo !== "";

  // Bar chart data — clicks per named link (filtered or all-time)
  const barData = useMemo(() => {
    return namedLinks
      .map((l) => ({
        code: l.short_code,
        clicks: isFiltered ? (filteredClickCounts[l.id] || 0) : l.click_count,
        destination: l.destination_url.replace(/https?:\/\/[^/]+/, ""),
        campaign: l.campaign || "",
      }))
      .filter((d) => d.clicks > 0 || !isFiltered)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 12);
  }, [namedLinks, filteredClickCounts, isFiltered]);

  // Daily breakdown per link
  const dailyData = useMemo(() => {
    const linkMap = new Map(namedLinks.map((l) => [l.id, l.short_code]));
    const dayLink: Record<string, Record<string, number>> = {};

    for (const c of filteredClicks) {
      const code = linkMap.get(c.link_id);
      if (!code) continue;
      const day = c.clicked_at.substring(0, 10);
      if (!dayLink[day]) dayLink[day] = {};
      dayLink[day][code] = (dayLink[day][code] || 0) + 1;
    }

    return Object.entries(dayLink)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, codes]) => ({ date: date.substring(5), ...codes }));
  }, [filteredClicks, namedLinks]);

  const activeCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const row of dailyData) {
      Object.keys(row).forEach((k) => k !== "date" && codes.add(k));
    }
    return Array.from(codes);
  }, [dailyData]);

  // Detail breakdown for selected link
  const selectedDetail = useMemo(() => {
    if (!selectedCode) return null;

    const link = namedLinks.find((l) => l.short_code === selectedCode);
    if (!link) return null;

    const linkClicks = filteredClicks.filter((c) => c.link_id === link.id);

    const utmSource: Record<string, number> = {};
    const utmMedium: Record<string, number> = {};
    const utmCampaign: Record<string, number> = {};
    const referrers: Record<string, number> = {};

    for (const c of linkClicks) {
      const src = c.utm_source || "(direct)";
      utmSource[src] = (utmSource[src] || 0) + 1;

      const med = c.utm_medium || "(none)";
      utmMedium[med] = (utmMedium[med] || 0) + 1;

      const camp = c.utm_campaign || "(none)";
      utmCampaign[camp] = (utmCampaign[camp] || 0) + 1;

      const ref = c.referrer ? c.referrer.replace(/https?:\/\//, "").split("/")[0] : "(direct)";
      referrers[ref] = (referrers[ref] || 0) + 1;
    }

    return {
      link,
      totalClicks: linkClicks.length,
      utmSource: breakdownToSorted(utmSource),
      utmMedium: breakdownToSorted(utmMedium),
      utmCampaign: breakdownToSorted(utmCampaign),
      referrers: breakdownToSorted(referrers),
    };
  }, [selectedCode, namedLinks, filteredClicks]);

  const handleBarClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload?.code) {
      const code = data.activePayload[0].payload.code;
      setSelectedCode((prev) => (prev === code ? null : code));
    }
  };

  if (barData.length === 0 && !isFiltered) return null;

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
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

      {/* Date range filter */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
        <div className="flex bg-secondary rounded-lg p-0.5">
          {QUICK_RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => handleQuickRange(r.days)}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-colors ${
                activeQuick === r.days && !((r.days === 0) !== (!dateFrom && !dateTo))
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-1">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setActiveQuick(-1); }}
            className="h-7 px-2 text-[10px] bg-secondary border border-border/50 rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-[10px] text-muted-foreground">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setActiveQuick(-1); }}
            className="h-7 px-2 text-[10px] bg-secondary border border-border/50 rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {isFiltered && (
          <button
            onClick={() => handleQuickRange(0)}
            className="text-[10px] text-muted-foreground hover:text-foreground underline transition-colors"
          >
            Clear
          </button>
        )}
        {isFiltered && (
          <span className="text-[10px] text-primary font-semibold ml-auto">
            {filteredClicks.length} click{filteredClicks.length !== 1 ? "s" : ""} in range
          </span>
        )}
      </div>

      {view === "bar" ? (
        <>
          <p className="text-[10px] text-muted-foreground mb-2">Click a bar to see UTM &amp; referrer details</p>
          {barData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No clicks in this date range</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, barData.length * 36)}>
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ left: 70, right: 16, top: 4, bottom: 4 }}
                onClick={handleBarClick}
                style={{ cursor: "pointer" }}
              >
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
                  {barData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      opacity={selectedCode && selectedCode !== entry.code ? 0.35 : 1}
                      stroke={selectedCode === entry.code ? "hsl(var(--foreground))" : "none"}
                      strokeWidth={selectedCode === entry.code ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Expanded detail panel */}
          {selectedDetail && (
            <div className="mt-4 border border-border/50 rounded-lg bg-secondary/30 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Link2 className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-bold text-foreground">/{selectedDetail.link.short_code}</span>
                  <span className="text-[10px] text-muted-foreground">→ {selectedDetail.link.destination_url.replace(/https?:\/\/[^/]+/, "")}</span>
                </div>
                <button
                  onClick={() => setSelectedCode(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[10px] text-muted-foreground mb-3">
                {selectedDetail.totalClicks} tracked click{selectedDetail.totalClicks !== 1 ? "s" : ""} in {isFiltered ? "selected range" : "period"}
                {selectedDetail.link.campaign && (
                  <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[9px] font-semibold">
                    {selectedDetail.link.campaign}
                  </span>
                )}
              </p>

              {selectedDetail.totalClicks === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No click-level data in the selected period</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <BreakdownMiniChart label="UTM Source" icon={Tag} data={selectedDetail.utmSource} />
                  <BreakdownMiniChart label="UTM Medium" icon={Tag} data={selectedDetail.utmMedium} />
                  <BreakdownMiniChart label="UTM Campaign" icon={Tag} data={selectedDetail.utmCampaign} />
                  <BreakdownMiniChart label="Referrer" icon={Globe} data={selectedDetail.referrers} />
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {dailyData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No daily click data {isFiltered ? "in this range" : "yet"}</p>
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
