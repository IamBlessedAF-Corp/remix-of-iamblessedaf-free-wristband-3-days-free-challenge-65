import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { Workflow, CalendarIcon, X } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SankeyNode {
  id: string;
  label: string;
  value: number;
  color: string;
  x: number;
  y: number;
  height: number;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  dropOff: number;
}

interface SankeyFunnelProps {
  clicks: number;
  visitors: number;
  challengeJoined: number;
  signups: number;
  orders: number;
  shares: number;
  totalRevenueCents: number;
}

const NODE_COLORS = [
  "hsl(var(--primary))",
  "hsl(217 91% 60%)",
  "hsl(280 67% 55%)",
  "hsl(142 71% 45%)",
  "hsl(47 96% 53%)",
  "hsl(330 81% 60%)",
];

const SVG_W = 900;
const SVG_H = 360;
const NODE_W = 18;
const COL_COUNT = 6;
const PADDING_X = 80;
const PADDING_Y = 30;
const INNER_W = SVG_W - PADDING_X * 2;
const INNER_H = SVG_H - PADDING_Y * 2 - 30; // extra bottom room for annotations

function buildSankeyPath(
  sx: number, sy: number, sh: number,
  tx: number, ty: number, th: number,
): string {
  const s0 = sy;
  const s1 = sy + sh;
  const t0 = ty;
  const t1 = ty + th;
  const mx = (sx + tx) / 2;
  return `M${sx},${s0} C${mx},${s0} ${mx},${t0} ${tx},${t0} L${tx},${t1} C${mx},${t1} ${mx},${s1} ${sx},${s1} Z`;
}

interface DateRangeFilter {
  from: Date;
  to: Date;
}

function useDateRangeFunnelData(range: DateRangeFilter | null) {
  return useQuery({
    queryKey: ["funnel-date-range", range?.from.toISOString(), range?.to.toISOString()],
    queryFn: async () => {
      if (!range) return null;
      const from = startOfDay(range.from).toISOString();
      const to = endOfDay(range.to).toISOString();

      const [clicks, signups, challenge, orders, shares] = await Promise.all([
        supabase.from("link_clicks").select("ip_hash").gte("clicked_at", from).lte("clicked_at", to),
        supabase.from("creator_profiles").select("*", { count: "exact", head: true }).gte("created_at", from).lte("created_at", to),
        supabase.from("challenge_participants").select("*", { count: "exact", head: true }).gte("created_at", from).lte("created_at", to),
        supabase.from("orders").select("amount_cents").eq("status", "completed").gte("created_at", from).lte("created_at", to),
        supabase.from("repost_logs").select("*", { count: "exact", head: true }).gte("created_at", from).lte("created_at", to),
      ]);

      const uniqueIps = new Set((clicks.data || []).map(d => d.ip_hash).filter(Boolean));
      return {
        totalClicks: clicks.data?.length || 0,
        uniqueVisitors: uniqueIps.size,
        signupCount: signups.count || 0,
        challengeCount: challenge.count || 0,
        orders: orders.data?.length || 0,
        shares: shares.count || 0,
        totalRevenueCents: (orders.data || []).reduce((s, o) => s + (o.amount_cents || 0), 0),
      };
    },
    enabled: !!range,
    staleTime: 30_000,
  });
}

const PRESET_RANGES = [
  { label: "Last 7d", days: 7 },
  { label: "Last 30d", days: 30 },
  { label: "Last 90d", days: 90 },
];

export default function SankeyFunnelDiagram({
  clicks, visitors, challengeJoined, signups, orders, shares, totalRevenueCents,
}: SankeyFunnelProps) {
  const [dateRange, setDateRange] = useState<DateRangeFilter | null>(null);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const { data: rangeData, isLoading: rangeLoading } = useDateRangeFunnelData(dateRange);

  // Use filtered data when date range is active, else props
  const d = dateRange && rangeData ? {
    clicks: rangeData.totalClicks,
    visitors: rangeData.uniqueVisitors,
    challengeJoined: rangeData.challengeCount,
    signups: rangeData.signupCount,
    orders: rangeData.orders,
    shares: rangeData.shares,
    totalRevenueCents: rangeData.totalRevenueCents,
  } : { clicks, visitors, challengeJoined, signups, orders, shares, totalRevenueCents };

  const { nodes, links } = useMemo(() => {
    const rawNodes = [
      { id: "clicks",    label: "Link Clicks",       value: d.clicks },
      { id: "visitors",  label: "Unique Visitors",    value: d.visitors },
      { id: "challenge", label: "Challenge",          value: d.challengeJoined },
      { id: "signups",   label: "Signups",            value: d.signups },
      { id: "orders",    label: "Purchases",          value: d.orders },
      { id: "shares",    label: "Shares / Referrals", value: d.shares },
    ];

    const maxValue = Math.max(...rawNodes.map(n => n.value), 1);
    const colSpacing = INNER_W / (COL_COUNT - 1);

    const computedNodes: SankeyNode[] = rawNodes.map((n, i) => {
      const heightRatio = n.value / maxValue;
      const h = Math.max(12, heightRatio * (INNER_H - 40));
      return {
        ...n,
        color: NODE_COLORS[i],
        x: PADDING_X + i * colSpacing,
        y: PADDING_Y + (INNER_H - h) / 2,
        height: h,
      };
    });

    const rawLinks: SankeyLink[] = [
      { source: "clicks",    target: "visitors",  value: d.visitors,        dropOff: d.clicks - d.visitors },
      { source: "visitors",  target: "challenge", value: d.challengeJoined, dropOff: d.visitors - d.challengeJoined },
      { source: "visitors",  target: "signups",   value: d.signups,         dropOff: d.visitors - d.signups },
      { source: "signups",   target: "orders",    value: d.orders,          dropOff: d.signups - d.orders },
      { source: "orders",    target: "shares",    value: d.shares,          dropOff: d.orders - d.shares },
    ];

    return { nodes: computedNodes, links: rawLinks };
  }, [d.clicks, d.visitors, d.challengeJoined, d.signups, d.orders, d.shares]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, SankeyNode>();
    nodes.forEach(n => m.set(n.id, n));
    return m;
  }, [nodes]);

  const applyPreset = (days: number) => {
    setDateRange({ from: subDays(new Date(), days), to: new Date() });
  };

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-sm flex items-center gap-2 mr-auto">
            <Workflow className="w-4 h-4 text-primary" />
            Conversion Flow — Sankey
            <span className="text-xs font-normal text-muted-foreground">
              Revenue: <strong className="text-primary">${(d.totalRevenueCents / 100).toLocaleString()}</strong>
            </span>
          </CardTitle>

          {/* Preset buttons */}
          <div className="flex gap-1">
            {PRESET_RANGES.map(p => (
              <Button
                key={p.label}
                variant={dateRange && Math.round((new Date().getTime() - dateRange.from.getTime()) / 86400000) === p.days ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => applyPreset(p.days)}
              >
                {p.label}
              </Button>
            ))}
            {dateRange && (
              <Button variant="ghost" size="sm" className="h-7 px-1.5" onClick={() => setDateRange(null)}>
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Custom date pickers */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Popover open={fromOpen} onOpenChange={setFromOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 px-2">
                  <CalendarIcon className="w-3 h-3" />
                  {dateRange ? format(dateRange.from, "MMM d") : "From"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={dateRange?.from}
                  onSelect={(d) => {
                    if (d) {
                      setDateRange(prev => ({ from: d, to: prev?.to ?? new Date() }));
                      setFromOpen(false);
                    }
                  }}
                  disabled={(d) => d > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <span>–</span>
            <Popover open={toOpen} onOpenChange={setToOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 px-2">
                  <CalendarIcon className="w-3 h-3" />
                  {dateRange ? format(dateRange.to, "MMM d") : "To"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={dateRange?.to}
                  onSelect={(d) => {
                    if (d) {
                      setDateRange(prev => ({ from: prev?.from ?? subDays(new Date(), 30), to: d }));
                      setToOpen(false);
                    }
                  }}
                  disabled={(d) => d > new Date() || (dateRange ? d < dateRange.from : false)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {dateRange && (
          <p className="text-[10px] text-muted-foreground mt-1">
            Showing: {format(dateRange.from, "MMM d, yyyy")} → {format(dateRange.to, "MMM d, yyyy")}
            {rangeLoading && " · Loading…"}
          </p>
        )}
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-auto min-w-[600px]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {links.map((link, i) => {
              const src = nodeMap.get(link.source);
              const tgt = nodeMap.get(link.target);
              if (!src || !tgt) return null;
              return (
                <linearGradient key={`grad-${i}`} id={`link-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={src.color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={tgt.color} stopOpacity={0.4} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Links with drop-off annotations */}
          {links.map((link, i) => {
            const src = nodeMap.get(link.source);
            const tgt = nodeMap.get(link.target);
            if (!src || !tgt || link.value === 0) return null;

            const maxFlow = Math.max(src.value, 1);
            const flowRatio = link.value / maxFlow;
            const linkH = Math.max(4, flowRatio * src.height);
            const srcY = src.y + (src.height - linkH) / 2;
            const tgtY = tgt.y + (tgt.height - linkH) / 2;
            const midX = (src.x + NODE_W + tgt.x) / 2;
            const midY = (srcY + tgtY) / 2 + linkH / 2;

            return (
              <g key={`link-${i}`}>
                <motion.path
                  d={buildSankeyPath(src.x + NODE_W, srcY, linkH, tgt.x, tgtY, linkH)}
                  fill={`url(#link-grad-${i})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                />
                {/* Drop-off annotation */}
                {link.dropOff > 0 && (
                  <g>
                    <rect
                      x={midX - 28}
                      y={midY - 10}
                      width={56}
                      height={18}
                      rx={4}
                      fill="hsl(var(--destructive)/0.12)"
                      stroke="hsl(var(--destructive)/0.3)"
                      strokeWidth={0.5}
                    />
                    <text
                      x={midX}
                      y={midY + 2.5}
                      textAnchor="middle"
                      fontSize="8"
                      fill="hsl(var(--destructive))"
                      fontWeight="600"
                    >
                      −{link.dropOff.toLocaleString()} dropped
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => (
            <g key={node.id}>
              <motion.rect
                x={node.x} y={node.y}
                width={NODE_W} height={node.height}
                rx={4} fill={node.color}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                style={{ transformOrigin: `${node.x + NODE_W / 2}px ${node.y + node.height / 2}px` }}
              />
              <text x={node.x + NODE_W / 2} y={node.y - 8} textAnchor="middle" fontSize="10" fontWeight="600" fill="hsl(var(--foreground))">
                {node.label}
              </text>
              <text x={node.x + NODE_W / 2} y={node.y + node.height + 14} textAnchor="middle" fontSize="10" fontWeight="700" fill="hsl(var(--muted-foreground))">
                {node.value.toLocaleString()}
              </text>
              {/* Conversion rate vs previous stage */}
              {i > 0 && nodes[i - 1].value > 0 && (
                <text
                  x={(nodes[i - 1].x + NODE_W + node.x) / 2}
                  y={PADDING_Y + INNER_H + 22}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill="hsl(var(--primary))"
                >
                  {((node.value / nodes[i - 1].value) * 100).toFixed(1)}%
                </text>
              )}
            </g>
          ))}
        </svg>
      </CardContent>
    </Card>
  );
}
