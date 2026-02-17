import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Shield, TrendingUp, Copy, Check, Link2 } from "lucide-react";
import { toast } from "sonner";

type Mode = "444" | "111-low" | "111-agg";

const modes: { key: Mode; label: string; icon: typeof Zap; accent: boolean }[] = [
  { key: "444", label: "$444 Unlock", icon: Zap, accent: true },
  { key: "111-low", label: "Lower Effort", icon: Shield, accent: false },
  { key: "111-agg", label: "Aggressive", icon: TrendingUp, accent: false },
];

const scenarioData: Record<Mode, {
  tag: string;
  label: string;
  rows: { left: string; right: string }[];
  total: string;
}> = {
  "444": {
    tag: "Stacked Payments · 11 Days",
    label: "$444 Unlock",
    rows: [
      { left: "3 clips/day × 11 days", right: "33 clips" },
      { left: "Avg 15,000 views/clip", right: "~500,000 views" },
      { left: "Clip earnings (500k × $0.22 RPM)", right: "$109.89" },
      { left: "+ 100k bonus", right: "+ $111.00" },
      { left: "+ 500k bonus", right: "+ $444.00" },
    ],
    total: "$664.89",
  },
  "111-low": {
    tag: "Lower Effort · 7 Days",
    label: "Fast $111 Unlock",
    rows: [
      { left: "2 clips/day × 7 days", right: "14 clips" },
      { left: "Avg 7,500 views/clip", right: "105,000 views" },
      { left: "Clip earnings (14 × $2.22 min)", right: "$31.08" },
      { left: "+ 100k bonus unlocked", right: "+ $111.00" },
    ],
    total: "$142.08",
  },
  "111-agg": {
    tag: "Aggressive · 3 Days",
    label: "Fast $111 Unlock",
    rows: [
      { left: "3 clips/day × 3 days", right: "9 clips" },
      { left: "Avg 12,000 views/clip", right: "108,000 views" },
      { left: "Clip earnings (108k × $0.22 RPM)", right: "$23.76" },
      { left: "+ 100k bonus unlocked", right: "+ $111.00" },
    ],
    total: "$134.76",
  },
};

const GratitudeDegenBlock = ({ referralLink }: { referralLink?: string | null }) => {
  const [mode, setMode] = useState<Mode>("444");
  const [copied, setCopied] = useState(false);
  const s = scenarioData[mode];
  const is444 = mode === "444";

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.section
      className="px-4 pt-8 pb-2 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative overflow-hidden bg-card border border-primary/30 rounded-xl p-5 md:p-7">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Degen Earnings Scenarios
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-foreground leading-tight">
            Unlock <span className="text-primary">$111–$444</span> in days, not months.
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            All bonuses stack on top of per-clip pay. Pick your pace.
          </p>

          {/* Toggle */}
          <div className="mt-4 flex items-center bg-secondary/60 rounded-lg p-0.5 w-fit">
            {modes.map((m) => {
              const Icon = m.icon;
              const active = mode === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    active
                      ? m.accent
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Active Scenario Card */}
          <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`mt-4 rounded-lg p-4 border ${
              is444
                ? "bg-primary/5 border-primary/30"
                : "bg-secondary/30 border-border/50"
            }`}
          >
            <div className="flex items-center gap-2 mb-2.5">
              <TrendingUp className={`w-3.5 h-3.5 ${is444 ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {s.tag}
              </span>
            </div>
            <p className="text-sm font-bold text-foreground mb-2">{s.label}</p>

            <div className="space-y-1.5 text-sm">
              {s.rows.map((r) => (
                <div key={r.left} className="flex justify-between">
                  <span className="text-muted-foreground">{r.left}</span>
                  <span className={`font-bold ${r.left.startsWith("+") ? "text-primary" : "text-foreground"}`}>
                    {r.right}
                  </span>
                </div>
              ))}
              <div className="border-t border-border/40 pt-1.5 flex justify-between">
                <span className="font-bold text-foreground">Total payout</span>
                <span className="font-black text-primary text-lg">{s.total}</span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground/70 mt-1.5 italic">
              Example scenario · Actual results depend on content performance
            </p>
          </motion.div>

          {/* Safety line */}
          <div className="mt-4 flex items-start gap-2">
            <Shield className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Even if no clip goes viral, you still earn <strong className="text-foreground">$2.22 per clip guaranteed</strong>.
              Bonuses are cumulative — they never reset or expire.
            </p>
          </div>

          {/* Referral link */}
          {referralLink && (
            <div className="mt-4 bg-secondary/40 border border-border/50 rounded-lg p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> Your Referral Link
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-primary bg-background/60 rounded px-2 py-1.5 truncate font-mono">
                  {referralLink}
                </code>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-md transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground/60">
            Scenarios illustrate potential earnings at specific view volumes. Results depend on content performance and platform distribution.
            Lower-view clips still earn the $2.22 minimum. All bonuses are cumulative and one-time.
          </p>
        </div>
      </div>
    </motion.section>
  );
};

export default GratitudeDegenBlock;
