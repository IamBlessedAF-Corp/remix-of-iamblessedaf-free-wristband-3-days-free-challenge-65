import { useState } from "react";
import { useClipperAdmin } from "@/hooks/useClipperAdmin";
import { useBudgetControl } from "@/hooks/useBudgetControl";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExternalLink, ChevronDown, ChevronRight, Maximize2, X } from "lucide-react";
import { getBlocks, BLOCK_CATEGORY_COLORS, type BlockDef } from "@/data/intelligentBlocks";

// Extract the primary component name from the component field (e.g. "GrokHeroSection" from "GrokHeroSection / GptHeroSection")
function extractComponentName(comp: string): string {
  return comp.split("/")[0].split("(")[0].replace(/\s/g, "").replace("Inline", "").trim();
}

function BlockListItem({ block: b, catColors }: { block: BlockDef; catColors: Record<string, string> }) {
  const [expanded, setExpanded] = useState(false);
  const compName = extractComponentName(b.component);
  const previewUrl = `/block-preview?component=${encodeURIComponent(compName)}`;

  return (
    <div className="border border-border/30 rounded-xl bg-card/60 hover:border-border/50 transition-all group">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-secondary/20 transition-colors"
      >
        {/* Thumbnail: 6x bigger — live iframe preview scaled down */}
        <div className="w-[180px] h-[120px] rounded-xl border border-border/40 bg-background overflow-hidden shrink-0 relative group-hover:border-primary/30 transition-colors">
          <iframe
            src={previewUrl}
            className="pointer-events-none"
            style={{
              width: "430px",
              height: "600px",
              transform: "scale(0.42)",
              transformOrigin: "top left",
            }}
            title={`Thumb: ${b.name}`}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <b.icon className="w-4 h-4 text-primary shrink-0" />
            <h3 className="text-sm font-bold text-foreground truncate">{b.name}</h3>
            <Badge className={`text-[9px] px-1.5 py-0.5 leading-tight ${catColors[b.category] || "bg-secondary text-foreground border-border"}`}>
              {b.category}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono truncate mt-1">{b.component}</p>
          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{b.desc}</p>
          <div className="flex gap-1 mt-2">
            {b.usedIn.slice(0, 3).map(page => (
              <Badge key={page} variant="outline" className="text-[8px] px-1 py-0 bg-secondary/30">{page}</Badge>
            ))}
            {b.usedIn.length > 3 && <Badge variant="outline" className="text-[8px] px-1 py-0">+{b.usedIn.length - 3}</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {b.liveValue !== undefined && (
            <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
              🟢 {b.liveValue}
            </Badge>
          )}
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/20 px-4 pb-4 pt-3 space-y-3">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Used in:</span>
            {b.usedIn.map(page => (
              <button key={page} onClick={(e) => { e.stopPropagation(); window.open(`${window.location.origin}${page}`, "_blank"); }}
                className="text-[9px] bg-primary/5 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md hover:bg-primary/10 transition-colors flex items-center gap-0.5">
                {page} <ExternalLink className="w-2.5 h-2.5" />
              </button>
            ))}
          </div>

          {/* Full-size isolated block preview */}
          <div className="rounded-xl border border-border/30 overflow-hidden bg-background">
            <div className="flex items-center justify-between px-3 py-2 bg-secondary/30 border-b border-border/20">
              <span className="text-[10px] font-mono text-muted-foreground">{b.name} — Isolated Preview</span>
              <button onClick={(e) => { e.stopPropagation(); window.open(previewUrl, "_blank"); }}
                className="text-[10px] text-primary hover:underline flex items-center gap-1">
                <Maximize2 className="w-3 h-3" /> Full screen
              </button>
            </div>
            <div className="w-full overflow-hidden" style={{ height: "600px" }}>
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title={`Preview: ${b.name}`}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
              />
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
      <div className="space-y-2">
        {filtered.map(b => <BlockListItem key={b.name} block={b} catColors={BLOCK_CATEGORY_COLORS} />)}
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No blocks match your filter.</div>}
    </div>
  );
}
