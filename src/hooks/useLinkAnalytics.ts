import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LinkSummary {
  id: string;
  short_code: string;
  destination_url: string;
  campaign: string | null;
  source_page: string | null;
  click_count: number;
  created_at: string;
  is_active: boolean;
}

export interface ClickRow {
  clicked_at: string;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
}

export interface AggregatedStats {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  osBreakdown: Record<string, number>;
  dailyClicks: { date: string; clicks: number }[];
  topCampaigns: { campaign: string; clicks: number; links: number }[];
  topLinks: LinkSummary[];
}

function aggregateClicks(clicks: ClickRow[], links: LinkSummary[]): AggregatedStats {
  const deviceBreakdown: Record<string, number> = {};
  const browserBreakdown: Record<string, number> = {};
  const osBreakdown: Record<string, number> = {};
  const dailyMap: Record<string, number> = {};

  for (const c of clicks) {
    const d = c.device_type || "unknown";
    deviceBreakdown[d] = (deviceBreakdown[d] || 0) + 1;

    const b = c.browser || "unknown";
    browserBreakdown[b] = (browserBreakdown[b] || 0) + 1;

    const o = c.os || "unknown";
    osBreakdown[o] = (osBreakdown[o] || 0) + 1;

    const day = c.clicked_at.substring(0, 10);
    dailyMap[day] = (dailyMap[day] || 0) + 1;
  }

  // Daily clicks sorted
  const dailyClicks = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, clicks]) => ({ date, clicks }));

  // Campaign aggregation
  const campaignMap: Record<string, { clicks: number; linkIds: Set<string> }> = {};
  for (const link of links) {
    const camp = link.campaign || "none";
    if (!campaignMap[camp]) campaignMap[camp] = { clicks: 0, linkIds: new Set() };
    campaignMap[camp].clicks += link.click_count;
    campaignMap[camp].linkIds.add(link.id);
  }
  const topCampaigns = Object.entries(campaignMap)
    .map(([campaign, { clicks, linkIds }]) => ({ campaign, clicks, links: linkIds.size }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  // Top links by clicks
  const topLinks = [...links].sort((a, b) => b.click_count - a.click_count).slice(0, 15);

  return {
    totalLinks: links.length,
    totalClicks: links.reduce((sum, l) => sum + l.click_count, 0),
    activeLinks: links.filter((l) => l.is_active).length,
    deviceBreakdown,
    browserBreakdown,
    osBreakdown,
    dailyClicks,
    topCampaigns,
    topLinks,
  };
}

export function useLinkAnalytics(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const linksQuery = useQuery({
    queryKey: ["admin-short-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("short_links")
        .select("id, short_code, destination_url, campaign, source_page, click_count, created_at, is_active")
        .order("click_count", { ascending: false })
        .limit(500);

      if (error) throw error;
      return (data || []) as LinkSummary[];
    },
  });

  const clicksQuery = useQuery({
    queryKey: ["admin-link-clicks", days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("link_clicks")
        .select("clicked_at, device_type, browser, os, utm_source, utm_medium, utm_campaign, referrer")
        .gte("clicked_at", since.toISOString())
        .order("clicked_at", { ascending: false })
        .limit(1000);

      if (error) throw error;
      return (data || []) as ClickRow[];
    },
  });

  const stats =
    linksQuery.data && clicksQuery.data
      ? aggregateClicks(clicksQuery.data, linksQuery.data)
      : null;

  return {
    stats,
    links: linksQuery.data || [],
    clicks: clicksQuery.data || [],
    loading: linksQuery.isLoading || clicksQuery.isLoading,
    error: linksQuery.error || clicksQuery.error,
    refetch: () => {
      linksQuery.refetch();
      clicksQuery.refetch();
    },
  };
}
