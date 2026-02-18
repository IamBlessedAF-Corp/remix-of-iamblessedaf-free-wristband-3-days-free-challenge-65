import { lazy, Suspense } from "react";
import { useClipperAdmin } from "@/hooks/useClipperAdmin";
import { useBudgetControl } from "@/hooks/useBudgetControl";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminSectionDashboard from "@/components/admin/AdminSectionDashboard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RefreshCw, Flame, DollarSign, TrendingUp } from "lucide-react";
import RevenueLtvDashboard from "@/components/admin/RevenueLtvDashboard";

const FunnelMap = lazy(() => import("@/pages/FunnelMap"));

export default function DashboardTab() {
  const admin = useClipperAdmin();
  const budget = useBudgetControl();
  const s = admin.stats;

  const { data: orderCount } = useQuery({
    queryKey: ["orders-count-live"],
    queryFn: async () => {
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });
  const { data: creatorCount } = useQuery({
    queryKey: ["creators-count-live"],
    queryFn: async () => {
      const { count } = await supabase.from("creator_profiles").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  return (
    <div className="space-y-4">
      <AdminSectionDashboard
        title="Growth Intelligence Command Center"
        description="Live data from all systems"
        kpis={[
          { label: "Active Clippers", value: s?.totalClippers || 0 },
          { label: "Total Clips", value: s?.totalClips || 0 },
          { label: "Total Views", value: s ? (s.totalViews >= 1000 ? `${(s.totalViews / 1000).toFixed(1)}k` : String(s.totalViews)) : "…" },
          { label: "Creators", value: creatorCount || 0 },
          { label: "Orders", value: orderCount || 0 },
          { label: "Budget Status", value: budget.cycle?.status || "—" },
        ]}
      />
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="funnel" className="gap-1 text-xs"><Flame className="w-3.5 h-3.5" /> Funnel Engine</TabsTrigger>
          <TabsTrigger value="revenue" className="gap-1 text-xs"><DollarSign className="w-3.5 h-3.5" /> Revenue Intelligence</TabsTrigger>
          <TabsTrigger value="growth" className="gap-1 text-xs"><TrendingUp className="w-3.5 h-3.5" /> Growth Metrics</TabsTrigger>
        </TabsList>
        <TabsContent value="funnel">
          <Suspense fallback={<div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>}>
            <FunnelMap />
          </Suspense>
        </TabsContent>
        <TabsContent value="revenue"><RevenueLtvDashboard /></TabsContent>
        <TabsContent value="growth"><GrowthMetricsSubTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// RevenueIntelligenceSubTab replaced by RevenueLtvDashboard component

function GrowthMetricsSubTab() {
  const admin = useClipperAdmin();
  const s = admin.stats;
  if (admin.loading || !s) return <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;

  const platformData: Record<string, number> = {};
  admin.clips.forEach(c => { platformData[c.platform] = (platformData[c.platform] || 0) + 1; });

  return (
    <AdminSectionDashboard
      title="Growth Metrics"
      description="Clipper acquisition, views, and viral growth"
      kpis={[
        { label: "Total Clippers", value: s.totalClippers },
        { label: "Total Clips", value: s.totalClips, delta: `${s.clipsThisWeek - s.clipsLastWeek >= 0 ? "+" : ""}${s.clipsThisWeek - s.clipsLastWeek} vs last week` },
        { label: "Total Views", value: s.totalViews >= 1000 ? `${(s.totalViews / 1000).toFixed(1)}k` : String(s.totalViews) },
        { label: "Avg Views/Clip", value: s.avgViewsPerClip },
        { label: "This Week", value: s.clipsThisWeek },
        { label: "Pending", value: s.pendingReviewCount },
      ]}
      charts={[
        { type: "pie", title: "Platform Split", data: Object.entries(platformData).map(([name, value]) => ({ name, value })) },
        { type: "bar", title: "Clips by Status", data: [
          { name: "Pending", value: s.pendingReviewCount },
          { name: "Verified", value: s.verifiedCount },
          { name: "Rejected", value: s.totalClips - s.pendingReviewCount - s.verifiedCount },
        ]},
      ]}
    />
  );
}
