import { useState } from "react";
import { useSmsDeliveries, type SmsDelivery } from "@/hooks/useSmsDeliveries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MessageCircle, RefreshCw, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  delivered: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-green-500", label: "Delivered" },
  sent: { icon: <Clock className="w-3.5 h-3.5" />, color: "text-blue-400", label: "Sent" },
  queued: { icon: <Clock className="w-3.5 h-3.5" />, color: "text-yellow-500", label: "Queued" },
  failed: { icon: <XCircle className="w-3.5 h-3.5" />, color: "text-destructive", label: "Failed" },
  undelivered: { icon: <XCircle className="w-3.5 h-3.5" />, color: "text-orange-500", label: "Undelivered" },
};

const getStatusConfig = (status: string) =>
  statusConfig[status] || { icon: <Clock className="w-3.5 h-3.5" />, color: "text-muted-foreground", label: status };

const SmsRow = ({ delivery }: { delivery: SmsDelivery }) => {
  const sc = getStatusConfig(delivery.status);
  return (
    <div className="flex items-start gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
      <div className={cn("mt-0.5 flex-shrink-0", sc.color)}>{sc.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-foreground truncate">
            {delivery.recipient_name || delivery.recipient_phone}
          </span>
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", sc.color)}>
            {sc.label}
          </Badge>
        </div>
        {delivery.recipient_name && (
          <p className="text-[11px] text-muted-foreground font-mono">{delivery.recipient_phone}</p>
        )}
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{delivery.message}</p>
        {delivery.error_message && (
          <p className="text-[11px] text-destructive mt-0.5">⚠ {delivery.error_message}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(delivery.created_at), "MMM d, h:mm a")}
          </span>
          {delivery.source_page && (
            <Badge variant="secondary" className="text-[9px] px-1 py-0">{delivery.source_page}</Badge>
          )}
        </div>
      </div>
    </div>
  );
};

const SmsTrackingPanel = () => {
  const { deliveries, loading, stats, refetch } = useSmsDeliveries();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
          <MessageCircle className="w-3.5 h-3.5" />
          SMS
          {stats.total > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-0.5">
              {stats.total}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="w-4 h-4 text-primary" />
              SMS Delivery Tracker
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => refetch()}
              disabled={loading}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            </Button>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="text-muted-foreground">{stats.delivered} delivered</span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <Clock className="w-3 h-3 text-yellow-500" />
              <span className="text-muted-foreground">{stats.pending} pending</span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <XCircle className="w-3 h-3 text-destructive" />
              <span className="text-muted-foreground">{stats.failed} failed</span>
            </div>
          </div>
        </SheetHeader>

        <div className="overflow-y-auto max-h-[calc(100vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : deliveries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No SMS messages sent yet</p>
            </div>
          ) : (
            deliveries.map((d) => <SmsRow key={d.id} delivery={d} />)
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SmsTrackingPanel;
