import { BarChart3 } from "lucide-react";

interface CampaignRow {
  campaign: string;
  clicks: number;
  links: number;
}

interface Props {
  campaigns: CampaignRow[];
}

export default function CampaignTable({ campaigns }: Props) {
  if (campaigns.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-5 text-center">
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 justify-center">
          <BarChart3 className="w-4 h-4 text-primary" /> Top Campaigns
        </h3>
        <p className="text-xs text-muted-foreground py-6">No campaign data yet</p>
      </div>
    );
  }

  const maxClicks = Math.max(...campaigns.map((c) => c.clicks), 1);

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5">
      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" /> Top Campaigns
      </h3>
      <div className="space-y-3">
        {campaigns.map((c) => (
          <div key={c.campaign} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground truncate max-w-[180px]">
                {c.campaign}
              </span>
              <span className="text-muted-foreground">
                {c.clicks} clicks · {c.links} links
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(c.clicks / maxClicks) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
