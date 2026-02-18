import { useState } from "react";
import { useClipperAdmin } from "@/hooks/useClipperAdmin";
import { useBudgetControl } from "@/hooks/useBudgetControl";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import { getBlocks, BLOCK_CATEGORY_COLORS, type BlockDef } from "@/data/intelligentBlocks";

// Mini wireframe preview patterns per category
const BLOCK_PREVIEWS: Record<string, React.ReactNode> = {
  Content: (
    <div className="w-full h-full flex flex-col gap-0.5 p-1">
      <div className="h-1 w-8 bg-foreground/30 rounded-full" />
      <div className="h-0.5 w-full bg-foreground/10 rounded-full" />
      <div className="h-0.5 w-10 bg-foreground/10 rounded-full" />
      <div className="flex-1 rounded bg-primary/10 mt-0.5" />
    </div>
  ),
  Product: (
    <div className="w-full h-full flex gap-1 p-1 items-center">
      <div className="w-5 h-6 rounded bg-primary/15 shrink-0" />
      <div className="flex flex-col gap-0.5 flex-1">
        <div className="h-1 w-6 bg-foreground/25 rounded-full" />
        <div className="h-0.5 w-8 bg-foreground/10 rounded-full" />
        <div className="h-1.5 w-5 bg-primary/20 rounded mt-auto" />
      </div>
    </div>
  ),
  CTA: (
    <div className="w-full h-full flex flex-col items-center justify-center gap-0.5 p-1">
      <div className="h-1 w-8 bg-foreground/20 rounded-full" />
      <div className="h-3 w-11 bg-primary/30 rounded mt-0.5 flex items-center justify-center">
        <div className="h-0.5 w-5 bg-primary-foreground/50 rounded-full" />
      </div>
      <div className="h-0.5 w-6 bg-foreground/10 rounded-full" />
    </div>
  ),
  Hero: (
    <div className="w-full h-full flex flex-col p-1">
      <div className="h-1.5 w-10 bg-foreground/25 rounded-full" />
      <div className="h-0.5 w-7 bg-foreground/10 rounded-full mt-0.5" />
      <div className="flex-1 rounded bg-gradient-to-br from-primary/15 to-primary/5 mt-1" />
    </div>
  ),
  Trust: (
    <div className="w-full h-full flex flex-col gap-0.5 p-1">
      {[1,2,3].map(i => (
        <div key={i} className="flex gap-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
          <div className="h-0.5 bg-foreground/10 rounded-full mt-0.5" style={{ width: `${4 + i * 2}px` }} />
        </div>
      ))}
    </div>
  ),
  Urgency: (
    <div className="w-full h-full flex flex-col items-center justify-center gap-0.5 p-1">
      <div className="h-2 w-12 bg-red-500/15 rounded flex items-center justify-center">
        <div className="h-0.5 w-6 bg-red-500/30 rounded-full" />
      </div>
      <div className="flex gap-1 mt-0.5">
        {[1,2,3,4].map(i => <div key={i} className="w-2.5 h-3 bg-foreground/10 rounded text-center text-[4px] font-mono text-foreground/20">0</div>)}
      </div>
    </div>
  ),
  Viral: (
    <div className="w-full h-full flex flex-col p-1 gap-0.5">
      <div className="flex gap-0.5 items-center">
        <div className="w-1.5 h-1.5 rounded-full bg-pink-500/25" />
        <div className="h-0.5 w-7 bg-foreground/10 rounded-full" />
      </div>
      <div className="h-2 w-full bg-pink-500/8 rounded flex items-center justify-center mt-auto">
        <div className="h-0.5 w-5 bg-pink-500/20 rounded-full" />
      </div>
    </div>
  ),
  "Value Stack": (
    <div className="w-full h-full flex flex-col gap-[2px] p-1 justify-center">
      {[1,2,3,4].map(i => (
        <div key={i} className="flex items-center gap-0.5">
          <div className="w-1 h-1 rounded-full bg-primary/25 shrink-0" />
          <div className="h-0.5 rounded-full bg-foreground/10" style={{ width: `${14 - i * 2}px` }} />
        </div>
      ))}
    </div>
  ),
  System: (
    <div className="w-full h-full flex flex-col p-1 gap-0.5">
      <div className="flex items-center gap-0.5">
        <div className="w-1 h-1 rounded bg-cyan-500/30" />
        <div className="h-0.5 w-4 bg-foreground/10 rounded-full" />
        <div className="ml-auto h-1 w-3 bg-emerald-500/20 rounded-full" />
      </div>
      <div className="flex-1 bg-cyan-500/5 rounded" />
      <div className="h-0.5 w-8 bg-foreground/8 rounded-full" />
    </div>
  ),
};

function BlockListItem({ block: b, catColors }: { block: BlockDef; catColors: Record<string, string> }) {
  const [expanded, setExpanded] = useState(false);
  const previewUrl = `${window.location.origin}${b.usedIn[0] || "/"}`;

  return (
    <div className="border border-border/30 rounded-xl bg-card/60 hover:border-border/50 transition-all group">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-secondary/20 transition-colors"
      >
        <div className="w-20 h-14 rounded-lg border border-border/40 bg-background overflow-hidden shrink-0 relative group-hover:border-primary/30 transition-colors">
          {BLOCK_PREVIEWS[b.category] || BLOCK_PREVIEWS["Content"]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <b.icon className="w-3.5 h-3.5 text-primary shrink-0" />
            <h3 className="text-xs font-bold text-foreground truncate">{b.name}</h3>
            <Badge className={`text-[8px] px-1 py-0 leading-tight ${catColors[b.category] || "bg-secondary text-foreground border-border"}`}>
              {b.category}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">{b.component}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {b.liveValue !== undefined && (
            <Badge variant="outline" className="text-[8px] border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
              🟢 {b.liveValue}
            </Badge>
          )}
          <span className="text-[9px] text-muted-foreground">{b.usedIn.length} {b.usedIn.length === 1 ? "page" : "pages"}</span>
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-border/20 px-3 pb-3 pt-2 space-y-2">
          <p className="text-[11px] text-muted-foreground leading-relaxed">{b.desc}</p>
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Used in:</span>
            {b.usedIn.map(page => (
              <button key={page} onClick={(e) => { e.stopPropagation(); window.open(`${window.location.origin}${page}`, "_blank"); }}
                className="text-[9px] bg-primary/5 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md hover:bg-primary/10 transition-colors flex items-center gap-0.5">
                {page} <ExternalLink className="w-2.5 h-2.5" />
              </button>
            ))}
          </div>
          <div className="rounded-lg border border-border/30 overflow-hidden bg-background">
            <div className="flex items-center justify-between px-2 py-1 bg-secondary/30 border-b border-border/20">
              <span className="text-[9px] font-mono text-muted-foreground truncate">{b.usedIn[0] || "/"}</span>
              <button onClick={(e) => { e.stopPropagation(); window.open(previewUrl, "_blank"); }}
                className="text-[9px] text-primary hover:underline flex items-center gap-0.5">
                Open full page <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="w-full" style={{ height: "480px", position: "relative" }}>
              <iframe src={previewUrl} className="pointer-events-none" style={{ width: "1440px", height: "900px", transform: "scale(0.533)", transformOrigin: "top left" }} title={`Preview: ${b.name}`} loading="lazy" sandbox="allow-scripts allow-same-origin" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IntelligentBlocksTab() {
  const admin = useClipperAdmin();
  const budget = useBudgetControl();
  const [filterCat, setFilterCat] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: activityCount } = useQuery({
    queryKey: ["portal-activity-count"],
    queryFn: async () => {
      const { count } = await supabase.from("portal_activity").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: orderCount } = useQuery({
    queryKey: ["orders-count-blocks"],
    queryFn: async () => {
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const blocks = getBlocks({
    activatedClips: admin.clips.filter(c => c.status === "verified").length,
    totalClips: admin.clips.length,
    clippersCount: admin.clippers.length,
    earnersCount: admin.clippers.filter(c => c.totalEarningsCents > 0).length,
    throttledSegs: budget.segmentCycles.filter(sc => sc.status === "killed" || sc.status === "throttled").length,
    totalSegs: budget.segments.length,
    pendingClips: admin.clips.filter(c => c.status === "pending").length,
    cycleStatus: budget.cycle?.status || "none",
    segmentCyclesCount: budget.segmentCycles.length,
    approvedSegCycles: budget.segmentCycles.filter(sc => sc.status === "approved").length,
    activityCount: activityCount || 0,
    orderCount: orderCount || 0,
  });

  const categories = ["all", ...Array.from(new Set(blocks.map(b => b.category)))];
  const filtered = blocks.filter(b => {
    if (filterCat !== "all" && b.category !== filterCat) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) && !b.desc.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <AdminSectionDashboard
        title="Intelligent Blocks Registry"
        description={`${blocks.length} reusable components across the entire funnel`}
        kpis={[
          { label: "Total Blocks", value: blocks.length },
          { label: "Categories", value: categories.length - 1 },
          { label: "Funnel Pages", value: Array.from(new Set(blocks.flatMap(b => b.usedIn))).length },
          { label: "Content", value: blocks.filter(b => b.category === "Content").length },
          { label: "Product", value: blocks.filter(b => b.category === "Product").length },
          { label: "System (Live)", value: blocks.filter(b => b.category === "System").length },
        ]}
        charts={[
          { type: "pie", title: "Blocks by Category", data: categories.filter(c => c !== "all").map(c => ({ name: c, value: blocks.filter(b => b.category === c).length })) },
          { type: "bar", title: "Pages Using Blocks", data: [
            { name: "/offer/111", value: blocks.filter(b => b.usedIn.includes("/offer/111")).length },
            { name: "Grok", value: blocks.filter(b => b.usedIn.includes("/offer/111-grok")).length },
            { name: "GPT", value: blocks.filter(b => b.usedIn.includes("/offer/111-gpt")).length },
            { name: "/", value: blocks.filter(b => b.usedIn.includes("/")).length },
            { name: "Portal", value: blocks.filter(b => b.usedIn.includes("/portal")).length },
          ]},
        ]}
      />
      <div className="flex flex-wrap items-center gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={cn("px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors",
              filterCat === cat ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border/40 hover:text-foreground hover:border-border"
            )}>
            {cat === "all" ? `All (${blocks.length})` : `${cat} (${blocks.filter(b => b.category === cat).length})`}
          </button>
        ))}
        <div className="ml-auto">
          <Input placeholder="Search blocks…" value={search} onChange={e => setSearch(e.target.value)} className="h-8 w-48 text-xs" />
        </div>
      </div>
      <div className="space-y-1.5">
        {filtered.map(b => <BlockListItem key={b.name} block={b} catColors={BLOCK_CATEGORY_COLORS} />)}
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No blocks match your filter.</div>}
    </div>
  );
}
