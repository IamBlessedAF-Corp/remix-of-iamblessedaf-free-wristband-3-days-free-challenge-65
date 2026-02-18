import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TrafficStats {
  totalPageViews: number;
  uniqueVisitors: number;
  avgSessionClicks: number;
  bounceRate: number;
  topSources: { source: string; visits: number; pct: number }[];
  topCountries: { country: string; visits: number; pct: number }[];
  topCities: { city: string; visits: number; pct: number }[];
  topPages: { page: string; visits: number; pct: number }[];
  utmCampaigns: { campaign: string; clicks: number; pct: number }[];
  utmMediums: { medium: string; clicks: number; pct: number }[];
  dailyTraffic: { date: string; views: number; unique: number }[];
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  osBreakdown: Record<string, number>;
  deliverability: {
    totalSent: number;
    delivered: number;
    failed: number;
    pending: number;
    deliveryRate: number;
    byChannel: { channel: string; sent: number; delivered: number; failed: number; rate: number }[];
  };
  hourlyHeatmap: { hour: number; clicks: number }[];
  newVsReturning: { new: number; returning: number };
}

function pctTop(arr: { key: string; count: number }[], total: number) {
  return arr
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((r) => ({ ...r, pct: total > 0 ? Math.round((r.count / total) * 100) : 0 }));
}

export function useTrafficAnalytics(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceISO = since.toISOString();

  const clicksQ = useQuery({
    queryKey: ["traffic-clicks", days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("link_clicks")
        .select("link_id, clicked_at, device_type, browser, os, utm_source, utm_medium, utm_campaign, referrer, ip_hash, country, city")
        .gte("clicked_at", sinceISO)
        .order("clicked_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data || [];
    },
  });

  const linksQ = useQuery({
    queryKey: ["traffic-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("short_links")
        .select("id, short_code, destination_url, source_page, campaign, click_count, is_active")
        .order("click_count", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  const smsQ = useQuery({
    queryKey: ["traffic-sms-delivery", days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sms_audit_log")
        .select("id, status, traffic_type, created_at")
        .gte("created_at", sinceISO)
        .limit(1000);
      if (error) throw error;
      return data || [];
    },
  });

  const loading = clicksQ.isLoading || linksQ.isLoading || smsQ.isLoading;

  const stats: TrafficStats | null = (() => {
    const clicks = clicksQ.data;
    const links = linksQ.data;
    const smsLogs = smsQ.data;
    if (!clicks || !links || !smsLogs) return null;

    const totalPageViews = clicks.length;
    const uniqueIPs = new Set(clicks.map((c) => c.ip_hash || c.link_id).filter(Boolean));
    const uniqueVisitors = uniqueIPs.size;

    // Daily traffic with unique
    const dailyMap: Record<string, { views: number; ips: Set<string> }> = {};
    const hourlyMap: Record<number, number> = {};
    const sourceMap: Record<string, number> = {};
    const countryMap: Record<string, number> = {};
    const cityMap: Record<string, number> = {};
    const campaignMap: Record<string, number> = {};
    const mediumMap: Record<string, number> = {};
    const deviceMap: Record<string, number> = {};
    const browserMap: Record<string, number> = {};
    const osMap: Record<string, number> = {};

    // Session tracking for bounce rate
    const ipSessions: Record<string, number> = {};

    for (const c of clicks) {
      const day = c.clicked_at.substring(0, 10);
      if (!dailyMap[day]) dailyMap[day] = { views: 0, ips: new Set() };
      dailyMap[day].views++;
      dailyMap[day].ips.add(c.ip_hash || c.link_id);

      const hour = new Date(c.clicked_at).getHours();
      hourlyMap[hour] = (hourlyMap[hour] || 0) + 1;

      const src = c.utm_source || c.referrer || "direct";
      sourceMap[src] = (sourceMap[src] || 0) + 1;

      const country = c.country || "Unknown";
      countryMap[country] = (countryMap[country] || 0) + 1;

      const city = c.city || "Unknown";
      cityMap[city] = (cityMap[city] || 0) + 1;

      const camp = c.utm_campaign || "none";
      if (camp !== "none") campaignMap[camp] = (campaignMap[camp] || 0) + 1;

      const med = c.utm_medium || "none";
      if (med !== "none") mediumMap[med] = (mediumMap[med] || 0) + 1;

      const d = c.device_type || "unknown";
      deviceMap[d] = (deviceMap[d] || 0) + 1;

      const b = c.browser || "unknown";
      browserMap[b] = (browserMap[b] || 0) + 1;

      const o = c.os || "unknown";
      osMap[o] = (osMap[o] || 0) + 1;

      const ipKey = c.ip_hash || "anon";
      ipSessions[ipKey] = (ipSessions[ipKey] || 0) + 1;
    }

    const singleVisitIPs = Object.values(ipSessions).filter((v) => v === 1).length;
    const totalIPs = Object.keys(ipSessions).length;
    const bounceRate = totalIPs > 0 ? Math.round((singleVisitIPs / totalIPs) * 100) : 0;
    const avgSessionClicks = totalIPs > 0 ? Math.round((totalPageViews / totalIPs) * 10) / 10 : 0;

    const returningIPs = Object.values(ipSessions).filter((v) => v > 1).length;

    const dailyTraffic = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { views, ips }]) => ({ date, views, unique: ips.size }));

    const topSources = pctTop(
      Object.entries(sourceMap).map(([key, count]) => ({ key, count })),
      totalPageViews
    ).map((r) => ({ source: r.key, visits: r.count, pct: r.pct }));

    const topCountries = pctTop(
      Object.entries(countryMap).map(([key, count]) => ({ key, count })),
      totalPageViews
    ).map((r) => ({ country: r.key, visits: r.count, pct: r.pct }));

    const topCities = pctTop(
      Object.entries(cityMap).map(([key, count]) => ({ key, count })),
      totalPageViews
    ).map((r) => ({ city: r.key, visits: r.count, pct: r.pct }));

    // Top pages from links destination
    const pageMap: Record<string, number> = {};
    for (const link of links) {
      try {
        const url = new URL(link.destination_url);
        const page = url.pathname;
        pageMap[page] = (pageMap[page] || 0) + link.click_count;
      } catch {
        pageMap[link.destination_url] = (pageMap[link.destination_url] || 0) + link.click_count;
      }
    }
    const topPages = pctTop(
      Object.entries(pageMap).map(([key, count]) => ({ key, count })),
      links.reduce((s, l) => s + l.click_count, 0)
    ).map((r) => ({ page: r.key, visits: r.count, pct: r.pct }));

    const utmCampaigns = pctTop(
      Object.entries(campaignMap).map(([key, count]) => ({ key, count })),
      totalPageViews
    ).map((r) => ({ campaign: r.key, clicks: r.count, pct: r.pct }));

    const utmMediums = pctTop(
      Object.entries(mediumMap).map(([key, count]) => ({ key, count })),
      totalPageViews
    ).map((r) => ({ medium: r.key, clicks: r.count, pct: r.pct }));

    const hourlyHeatmap = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      clicks: hourlyMap[h] || 0,
    }));

    // SMS Deliverability
    const totalSent = smsLogs.length;
    const delivered = smsLogs.filter((s) => s.status === "delivered" || s.status === "sent").length;
    const failed = smsLogs.filter((s) => s.status === "failed" || s.status === "undelivered").length;
    const pending = smsLogs.filter((s) => s.status === "pending" || s.status === "queued").length;

    const channelMap: Record<string, { sent: number; delivered: number; failed: number }> = {};
    for (const s of smsLogs) {
      const ch = s.traffic_type || "unknown";
      if (!channelMap[ch]) channelMap[ch] = { sent: 0, delivered: 0, failed: 0 };
      channelMap[ch].sent++;
      if (s.status === "delivered" || s.status === "sent") channelMap[ch].delivered++;
      if (s.status === "failed" || s.status === "undelivered") channelMap[ch].failed++;
    }

    return {
      totalPageViews,
      uniqueVisitors,
      avgSessionClicks,
      bounceRate,
      topSources,
      topCountries,
      topCities,
      topPages,
      utmCampaigns,
      utmMediums,
      dailyTraffic,
      deviceBreakdown: deviceMap,
      browserBreakdown: browserMap,
      osBreakdown: osMap,
      deliverability: {
        totalSent,
        delivered,
        failed,
        pending,
        deliveryRate: totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0,
        byChannel: Object.entries(channelMap).map(([channel, v]) => ({
          channel,
          ...v,
          rate: v.sent > 0 ? Math.round((v.delivered / v.sent) * 100) : 0,
        })),
      },
      hourlyHeatmap,
      newVsReturning: { new: singleVisitIPs, returning: returningIPs },
    };
  })();

  return {
    stats,
    loading,
    error: clicksQ.error || linksQ.error || smsQ.error,
    refetch: () => {
      clicksQ.refetch();
      linksQ.refetch();
      smsQ.refetch();
    },
  };
}
