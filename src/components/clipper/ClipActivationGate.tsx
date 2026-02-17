import { Eye, MousePointerClick, UserPlus, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import MetricTooltip from "./MetricTooltip";

interface ClipMetrics {
  views: number;
  ctr: number;
  regRate: number;
  day1PostRate: number;
  isActivated: boolean;
}

interface Props {
  metrics: ClipMetrics;
  clipId?: string;
}

const THRESHOLDS = {
  views: 1000,
  ctr: 0.01,
  regRate: 0.15,
  day1PostRate: 0.25,
};

const ClipActivationGate = ({ metrics }: Props) => {
  const checks = [
    {
      label: "Views",
      icon: Eye,
      value: metrics.views.toLocaleString(),
      required: "≥ 1,000",
      pass: metrics.views >= THRESHOLDS.views,
      description: "Total net views on your clip (current minus baseline at submission).",
      why: "Minimum audience size ensures your clip is actually reaching people, not just uploaded.",
      improve: "Share your clip on 2-3 platforms. Optimize your hook in the first 2 seconds.",
    },
    {
      label: "CTR",
      icon: MousePointerClick,
      value: `${(metrics.ctr * 100).toFixed(2)}%`,
      required: "≥ 1.0%",
      pass: metrics.ctr >= THRESHOLDS.ctr,
      description: "Click-Through Rate — what % of viewers click your referral link.",
      why: "Views without clicks don't generate registrations. CTR measures CTA effectiveness.",
      improve: "Add a CTA overlay in the last 3 seconds. Pin a comment with your link.",
    },
    {
      label: "Reg Rate",
      icon: UserPlus,
      value: `${(metrics.regRate * 100).toFixed(1)}%`,
      required: "≥ 15%",
      pass: metrics.regRate >= THRESHOLDS.regRate,
      description: "What % of clickers actually register for the challenge.",
      why: "High reg rate = quality traffic. Low reg rate = wrong audience or misleading hook.",
      improve: "Target mindset/wellness audiences. Say 'free 3-day challenge' clearly.",
    },
    {
      label: "Day1 Post",
      icon: MessageSquare,
      value: `${(metrics.day1PostRate * 100).toFixed(1)}%`,
      required: "≥ 25%",
      pass: metrics.day1PostRate >= THRESHOLDS.day1PostRate,
      description: "What % of registrants post their first gratitude message within 24 hours.",
      why: "This proves real engagement, not just curiosity signups. Drives sustainable payouts.",
      improve: "Frame the challenge as 'start TODAY'. Add urgency to your CTA.",
    },
  ];

  const allPassing = checks.every((c) => c.pass);

  return (
    <div className={`rounded-2xl p-4 border ${
      allPassing
        ? "bg-emerald-500/5 border-emerald-500/30"
        : "bg-amber-500/5 border-amber-500/30"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Clip Activation Gate
        </h4>
        {allPassing ? (
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> EARNING
          </span>
        ) : (
          <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> NOT ACTIVE
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {checks.map((check) => {
          const Icon = check.icon;
          return (
            <div
              key={check.label}
              className={`rounded-xl p-2.5 border ${
                check.pass
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-secondary/50 border-border/30"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3 h-3 ${check.pass ? "text-emerald-400" : "text-muted-foreground"}`} />
                <MetricTooltip
                  label={check.label}
                  value={check.value}
                  required={check.required}
                  description={check.description}
                  whyItMatters={check.why}
                  howToImprove={check.improve}
                  status={check.pass ? "passing" : "failing"}
                >
                  <span className="text-[10px]">{check.label}</span>
                </MetricTooltip>
              </div>
              <p className={`text-sm font-bold ${check.pass ? "text-emerald-400" : "text-foreground"}`}>
                {check.value}
              </p>
              <p className="text-[9px] text-muted-foreground">{check.required}</p>
            </div>
          );
        })}
      </div>

      {!allPassing && (
        <p className="text-[10px] text-amber-400 mt-2 text-center font-medium">
          ⚠️ Clip must pass all 4 gates to earn. Tap each metric for tips.
        </p>
      )}
    </div>
  );
};

export default ClipActivationGate;
