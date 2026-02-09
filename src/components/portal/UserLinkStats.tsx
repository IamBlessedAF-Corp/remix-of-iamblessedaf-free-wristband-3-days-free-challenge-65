import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link2, MousePointerClick, TrendingUp, ExternalLink } from "lucide-react";

interface Props {
  userId: string;
}

export default function UserLinkStats({ userId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["user-link-stats", userId],
    queryFn: async () => {
      const { data: links, error } = await supabase
        .from("short_links")
        .select("id, short_code, destination_url, campaign, click_count, created_at")
        .eq("created_by", userId)
        .order("click_count", { ascending: false })
        .limit(10);

      if (error) throw error;
      return links || [];
    },
  });

  const links = data || [];
  const totalClicks = links.reduce((s, l) => s + l.click_count, 0);
  const totalLinks = links.length;

  if (isLoading) {
    return (
      <div className="bg-card border border-border/60 rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-muted rounded w-32 mb-4" />
        <div className="h-20 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
        <Link2 className="w-4 h-4 text-primary" />
        Your Link Analytics
      </h3>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-foreground">{totalLinks}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Links</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-primary">{totalClicks}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Total Clicks</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-foreground">
            {totalLinks > 0 ? (totalClicks / totalLinks).toFixed(1) : "0"}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium">Avg/Link</p>
        </div>
      </div>

      {/* Top links */}
      {links.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No links shared yet — share your referral link to start tracking! 🔗
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between py-2 border-b border-border/20 last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <MousePointerClick className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-mono text-primary truncate">
                    /go/{link.short_code}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {link.campaign || link.destination_url.replace(/https?:\/\/[^/]+/, "")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-foreground">
                  {link.click_count}
                </span>
                <TrendingUp className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
