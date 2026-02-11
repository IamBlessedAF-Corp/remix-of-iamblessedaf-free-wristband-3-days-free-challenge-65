import { useState } from "react";
import { useSmsAuditLog, type SmsAuditEntry } from "@/hooks/useSmsAuditLog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Lock,
  Megaphone,
  MessageSquare,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const laneConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  otp: { icon: <Lock className="w-3.5 h-3.5" />, color: "text-red-500", label: "OTP" },
  transactional: { icon: <MessageSquare className="w-3.5 h-3.5" />, color: "text-blue-500", label: "Transactional" },
  marketing: { icon: <Megaphone className="w-3.5 h-3.5" />, color: "text-purple-500", label: "Marketing" },
};

const AuditRow = ({ entry }: { entry: SmsAuditEntry }) => {
  const lane = laneConfig[entry.traffic_type] || laneConfig.transactional;
  const isFailed = entry.status === "failed";

  return (
    <div className="flex items-start gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
      <div className={cn("mt-0.5 flex-shrink-0", lane.color)}>{lane.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-mono text-foreground truncate">
            {entry.recipient_phone}
          </span>
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", lane.color)}>
            {lane.label}
          </Badge>
          {isFailed && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              Failed
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Template: <span className="font-mono text-foreground">{entry.template_key}</span>
        </p>
        {entry.error_message && (
          <p className="text-[11px] text-destructive mt-0.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {entry.error_message}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(entry.created_at), "MMM d, h:mm:ss a")}
          </span>
          {entry.twilio_sid && (
            <span className="text-[9px] font-mono text-muted-foreground truncate max-w-[120px]">
              {entry.twilio_sid}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const SmsComplianceDashboard = () => {
  const { entries, loading, stats, refetch } = useSmsAuditLog();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const filteredEntries =
    activeTab === "all"
      ? entries
      : activeTab === "failed"
        ? entries.filter((e) => e.status === "failed")
        : entries.filter((e) => e.traffic_type === activeTab);

  const templateEntries = Object.entries(stats.templateUsage)
    .sort(([, a], [, b]) => b - a);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          A2P Compliance
          {stats.byStatus.failed > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 ml-0.5">
              {stats.byStatus.failed}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg p-0" side="right">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Shield className="w-4 h-4 text-primary" />
              SMS Lane Compliance
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

          {/* Lane stats */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="bg-muted/50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-foreground">{stats.total}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-red-500">{stats.byLane.otp}</p>
              <p className="text-[10px] text-muted-foreground">OTP</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-blue-500">{stats.byLane.transactional}</p>
              <p className="text-[10px] text-muted-foreground">Transactional</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-purple-500">{stats.byLane.marketing}</p>
              <p className="text-[10px] text-muted-foreground">Marketing</p>
            </div>
          </div>

          {/* Template usage */}
          {templateEntries.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Template Usage</p>
              <div className="flex flex-wrap gap-1.5">
                {templateEntries.slice(0, 6).map(([key, count]) => (
                  <Badge key={key} variant="secondary" className="text-[10px] px-2 py-0.5">
                    {key}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(100vh-280px)]">
          <TabsList className="mx-4 mt-3 mb-2 grid grid-cols-5 h-8">
            <TabsTrigger value="all" className="text-[10px] px-1">All</TabsTrigger>
            <TabsTrigger value="otp" className="text-[10px] px-1">OTP</TabsTrigger>
            <TabsTrigger value="transactional" className="text-[10px] px-1">Trans.</TabsTrigger>
            <TabsTrigger value="marketing" className="text-[10px] px-1">Mktg</TabsTrigger>
            <TabsTrigger value="failed" className="text-[10px] px-1">
              Failed
              {stats.byStatus.failed > 0 && (
                <span className="ml-1 text-destructive">{stats.byStatus.failed}</span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No audit entries{activeTab !== "all" ? ` for ${activeTab}` : ""}</p>
              </div>
            ) : (
              filteredEntries.map((e) => <AuditRow key={e.id} entry={e} />)
            )}
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default SmsComplianceDashboard;
