import { Badge } from "@/components/ui/badge";
import { Shield, DollarSign, Calendar } from "lucide-react";

interface Props {
  totalViews: number;
  totalEarningsCents: number;
  lastPayoutDate: string | null;
}

const getStatus = (views: number) => {
  if (views >= 1_000_000) return { label: "Super Clipper", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
  if (views >= 500_000) return { label: "Proven Clipper", color: "bg-primary/15 text-primary border-primary/30" };
  if (views >= 100_000) return { label: "Verified Clipper", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
  return { label: "New Clipper", color: "bg-secondary text-muted-foreground border-border" };
};

const ClipperStatusHeader = ({ totalViews, totalEarningsCents, lastPayoutDate }: Props) => {
  const status = getStatus(totalViews);

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Your Status</p>
            <Badge className={`mt-0.5 text-xs font-bold ${status.color}`}>{status.label}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/50 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Total Earned</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            ${(totalEarningsCents / 100).toFixed(2)}
          </p>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Last Payout</span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {lastPayoutDate ?? "Pending first"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClipperStatusHeader;
