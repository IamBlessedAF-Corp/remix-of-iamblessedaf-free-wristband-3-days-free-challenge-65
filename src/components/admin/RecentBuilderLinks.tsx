import { useEffect, useState } from "react";
import { Clock, Copy, Check, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RecentLink {
  id: string;
  short_code: string;
  destination_url: string;
  campaign: string | null;
  click_count: number;
  created_at: string;
  metadata: Record<string, string> | null;
}

export default function RecentBuilderLinks() {
  const [links, setLinks] = useState<RecentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLinks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("short_links")
      .select("id, short_code, destination_url, campaign, click_count, created_at, metadata")
      .eq("source_page", "admin-utm-builder")
      .order("created_at", { ascending: false })
      .limit(10);

    setLinks((data as RecentLink[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();

    const channel = supabase
      .channel("builder-links")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "short_links", filter: "source_page=eq.admin-utm-builder" },
        () => fetchLinks()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(`https://iamblessedaf.com/go/${code}`);
    setCopiedId(id);
    toast.success("Copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getUtmBadges = (meta: Record<string, string> | null) => {
    if (!meta) return [];
    return ["utm_source", "utm_medium", "utm_campaign"]
      .filter((k) => meta[k])
      .map((k) => ({ key: k.replace("utm_", ""), value: meta[k] }));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  if (loading) return null;
  if (links.length === 0) return null;

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-bold text-foreground">Recent Builder Links</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">Last {links.length}</span>
      </div>

      <div className="divide-y divide-border/40">
        {links.map((link) => {
          const badges = getUtmBadges(link.metadata as Record<string, string> | null);
          const isCopied = copiedId === link.id;

          return (
            <div key={link.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-bold text-foreground truncate">
                    /go/{link.short_code}
                  </code>
                  <span className="text-[10px] text-muted-foreground">→</span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {link.destination_url}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {badges.map((b) => (
                    <span
                      key={b.key}
                      className="inline-flex items-center text-[10px] font-medium bg-secondary text-secondary-foreground rounded px-1.5 py-0.5"
                    >
                      {b.key}={b.value}
                    </span>
                  ))}
                  {link.campaign && !badges.some((b) => b.key === "campaign" && b.value === link.campaign) && (
                    <span className="inline-flex items-center text-[10px] font-medium bg-primary/10 text-primary rounded px-1.5 py-0.5">
                      {link.campaign}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">{formatDate(link.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                  {link.click_count} clicks
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleCopy(link.short_code, link.id)}
                >
                  {isCopied ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
