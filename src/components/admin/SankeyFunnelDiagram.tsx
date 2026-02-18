import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Workflow } from "lucide-react";

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
const SVG_H = 340;
const NODE_W = 18;
const COL_COUNT = 6;
const PADDING_X = 80;
const PADDING_Y = 30;
const INNER_W = SVG_W - PADDING_X * 2;
const INNER_H = SVG_H - PADDING_Y * 2;

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

export default function SankeyFunnelDiagram({
  clicks, visitors, challengeJoined, signups, orders, shares, totalRevenueCents,
}: SankeyFunnelProps) {
  const { nodes, links } = useMemo(() => {
    const rawNodes = [
      { id: "clicks", label: "Link Clicks", value: clicks },
      { id: "visitors", label: "Unique Visitors", value: visitors },
      { id: "challenge", label: "Challenge", value: challengeJoined },
      { id: "signups", label: "Signups", value: signups },
      { id: "orders", label: "Purchases", value: orders },
      { id: "shares", label: "Shares / Referrals", value: shares },
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

    // Define flow links — each link carries the minimum of source and target
    const rawLinks: SankeyLink[] = [
      { source: "clicks", target: "visitors", value: visitors },
      { source: "visitors", target: "challenge", value: challengeJoined },
      { source: "visitors", target: "signups", value: signups },
      { source: "signups", target: "orders", value: orders },
      { source: "orders", target: "shares", value: shares },
    ];

    return { nodes: computedNodes, links: rawLinks };
  }, [clicks, visitors, challengeJoined, signups, orders, shares]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, SankeyNode>();
    nodes.forEach(n => m.set(n.id, n));
    return m;
  }, [nodes]);

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Workflow className="w-4 h-4 text-primary" />
          Conversion Flow — Sankey
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            Revenue: <strong className="text-primary">${(totalRevenueCents / 100).toLocaleString()}</strong>
          </span>
        </CardTitle>
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
                <linearGradient
                  key={`grad-${i}`}
                  id={`link-grad-${i}`}
                  x1="0%" y1="0%" x2="100%" y2="0%"
                >
                  <stop offset="0%" stopColor={src.color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={tgt.color} stopOpacity={0.4} />
                </linearGradient>
              );
            })}
          </defs>

          {/* Links */}
          {links.map((link, i) => {
            const src = nodeMap.get(link.source);
            const tgt = nodeMap.get(link.target);
            if (!src || !tgt || link.value === 0) return null;

            const maxFlow = Math.max(src.value, 1);
            const flowRatio = link.value / maxFlow;
            const linkH = Math.max(4, flowRatio * src.height);

            // Position link within source and target nodes
            const srcY = src.y + (src.height - linkH) / 2;
            const tgtY = tgt.y + (tgt.height - linkH) / 2;

            return (
              <motion.path
                key={`link-${i}`}
                d={buildSankeyPath(
                  src.x + NODE_W, srcY, linkH,
                  tgt.x, tgtY, linkH,
                )}
                fill={`url(#link-grad-${i})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.08 }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => (
            <g key={node.id}>
              <motion.rect
                x={node.x}
                y={node.y}
                width={NODE_W}
                height={node.height}
                rx={4}
                fill={node.color}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                style={{ transformOrigin: `${node.x + NODE_W / 2}px ${node.y + node.height / 2}px` }}
              />
              {/* Label */}
              <text
                x={node.x + NODE_W / 2}
                y={node.y - 8}
                textAnchor="middle"
                className="fill-foreground text-[10px] font-semibold"
              >
                {node.label}
              </text>
              {/* Value */}
              <text
                x={node.x + NODE_W / 2}
                y={node.y + node.height + 16}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] font-bold"
              >
                {node.value.toLocaleString()}
              </text>
              {/* Conversion rate arrow */}
              {i > 0 && nodes[i - 1].value > 0 && (
                <text
                  x={(nodes[i - 1].x + NODE_W + node.x) / 2}
                  y={PADDING_Y + INNER_H + 10}
                  textAnchor="middle"
                  className="fill-primary text-[9px] font-bold"
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
