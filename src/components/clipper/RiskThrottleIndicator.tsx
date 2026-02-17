import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldAlert, ShieldCheck, TrendingDown, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MetricTooltip from "./MetricTooltip";

interface ThrottleState {
  is_active: boolean;
  current_avg_ctr: number;
  current_avg_reg_rate: number;
  current_avg_day1_rate: number;
  consecutive_low_days: number;
  consecutive_recovery_days: number;
  rpm_override: number | null;
}

const RiskThrottleIndicator = () => {
  const [throttle, setThrottle] = useState<ThrottleState | null>(null);

  useEffect(() => {
    supabase
      .from("clipper_risk_throttle")
      .select("*")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setThrottle(data as unknown as ThrottleState);
      });
  }, []);

  if (!throttle) return null;

  const rpm = throttle.rpm_override ?? 0.22;
  const isProtection = throttle.is_active;

  return (
    <div className={`rounded-2xl p-5 border ${
      isProtection
        ? "bg-destructive/5 border-destructive/30"
        : "bg-card border-border/50"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isProtection ? (
            <ShieldAlert className="w-5 h-5 text-destructive" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          )}
          <h3 className="text-sm font-bold text-foreground">
            {isProtection ? "⚠️ Protection Mode Active" : "System Health"}
          </h3>
        </div>
        <Badge className={`text-[10px] ${
          isProtection
            ? "bg-destructive/15 text-destructive border-destructive/30"
            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        }`}>
          {isProtection ? "Throttled" : "Normal"}
        </Badge>
      </div>

      {isProtection && (
        <div className="bg-destructive/10 rounded-xl p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground">RPM reduced to ${rpm.toFixed(2)}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Global metrics dropped below thresholds for {throttle.consecutive_low_days} days. 
                Bonus unlocks paused. Recovery: {throttle.consecutive_recovery_days}/3 days.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-secondary/50 rounded-xl p-2.5 text-center">
          <MetricTooltip
            label="CTR"
            value={`${(throttle.current_avg_ctr * 100).toFixed(2)}%`}
            required={isProtection ? "≥ 1.0%" : "≥ 0.8%"}
            description="Click-Through Rate — percentage of viewers who click your referral link."
            whyItMatters="Higher CTR means your CTA placement is working. Low CTR wastes views."
            howToImprove="Add a clear CTA overlay in the last 3 seconds. Use pinned comments with your link."
            status={throttle.current_avg_ctr >= 0.01 ? "passing" : "failing"}
          >
            <span className="text-[11px]">CTR</span>
          </MetricTooltip>
          <p className={`text-sm font-bold mt-0.5 ${throttle.current_avg_ctr >= 0.01 ? "text-emerald-400" : "text-destructive"}`}>
            {(throttle.current_avg_ctr * 100).toFixed(2)}%
          </p>
        </div>

        <div className="bg-secondary/50 rounded-xl p-2.5 text-center">
          <MetricTooltip
            label="Reg Rate"
            value={`${(throttle.current_avg_reg_rate * 100).toFixed(1)}%`}
            required={isProtection ? "≥ 15%" : "≥ 12%"}
            description="Registration Rate — percentage of clickers who sign up for the challenge."
            whyItMatters="High reg rate validates your audience is genuinely interested, not just curious."
            howToImprove="Target wellness/mindset audiences. Mention 'free challenge' and '3 days' in your hook."
            status={throttle.current_avg_reg_rate >= 0.15 ? "passing" : "failing"}
          >
            <span className="text-[11px]">Reg</span>
          </MetricTooltip>
          <p className={`text-sm font-bold mt-0.5 ${throttle.current_avg_reg_rate >= 0.15 ? "text-emerald-400" : "text-destructive"}`}>
            {(throttle.current_avg_reg_rate * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-secondary/50 rounded-xl p-2.5 text-center">
          <MetricTooltip
            label="Day1 Post Rate"
            value={`${(throttle.current_avg_day1_rate * 100).toFixed(1)}%`}
            required={isProtection ? "≥ 25%" : "≥ 20%"}
            description="Day-1 Post Rate — percentage of registrants who actually post their first gratitude message within 24 hours."
            whyItMatters="This proves real engagement, not just signups. High Day1 = real impact = sustainable payouts."
            howToImprove="Frame the challenge as 'start today' not 'start someday'. Urgency drives action."
            status={throttle.current_avg_day1_rate >= 0.25 ? "passing" : "failing"}
          >
            <span className="text-[11px]">Day1</span>
          </MetricTooltip>
          <p className={`text-sm font-bold mt-0.5 ${throttle.current_avg_day1_rate >= 0.25 ? "text-emerald-400" : "text-destructive"}`}>
            {(throttle.current_avg_day1_rate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>RPM: ${rpm.toFixed(2)} / 1k views</span>
        <span>Min payout: $2.22</span>
      </div>
    </div>
  );
};

export default RiskThrottleIndicator;
