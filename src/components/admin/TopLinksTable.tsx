import { ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { LinkSummary } from "@/hooks/useLinkAnalytics";

interface Props {
  links: LinkSummary[];
}

export default function TopLinksTable({ links }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyShortUrl = (code: string, id: string) => {
    navigator.clipboard.writeText(`https://iamblessedaf.com/go/${code}`);
    setCopiedId(id);
    toast.success("Short URL copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (links.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-xl p-5 text-center">
        <h3 className="text-sm font-bold text-foreground mb-4">Top Links</h3>
        <p className="text-xs text-muted-foreground py-6">No links created yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5">
      <h3 className="text-sm font-bold text-foreground mb-4">Top Links by Clicks</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-2 font-medium text-muted-foreground">Short Code</th>
              <th className="text-left py-2 font-medium text-muted-foreground">Destination</th>
              <th className="text-left py-2 font-medium text-muted-foreground">Campaign</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Clicks</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Created</th>
              <th className="text-center py-2 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.id} className="border-b border-border/10 hover:bg-muted/30 transition-colors">
                <td className="py-2.5">
                  <span className="font-mono text-primary font-semibold">{link.short_code}</span>
                </td>
                <td className="py-2.5 max-w-[200px] truncate text-muted-foreground">
                  {link.destination_url.replace(/https?:\/\//, "")}
                </td>
                <td className="py-2.5">
                  {link.campaign ? (
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      {link.campaign}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-2.5 text-right font-bold text-foreground">
                  {link.click_count.toLocaleString()}
                </td>
                <td className="py-2.5 text-right text-muted-foreground">
                  {new Date(link.created_at).toLocaleDateString()}
                </td>
                <td className="py-2.5 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => copyShortUrl(link.short_code, link.id)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title="Copy short URL"
                    >
                      {copiedId === link.id ? (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>
                    <a
                      href={link.destination_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title="Open destination"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
