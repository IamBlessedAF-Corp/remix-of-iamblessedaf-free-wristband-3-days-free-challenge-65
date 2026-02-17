import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Trophy, Target, Star, Share2, Link, Copy, Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

interface EarningsSliderCalculatorProps {
  referralLink?: string | null;
}

const FLOOR = 2.22;
const RPM = 0.22;
const CAP = 22;

const BONUSES = [
  { views: 100_000, amount: 111, label: "$111", icon: Target },
  { views: 500_000, amount: 444, label: "$444", icon: Star },
  { views: 1_000_000, amount: 1111, label: "$1,111", icon: Trophy },
];

function calcPerClip(avgViews: number): number {
  const raw = (avgViews / 1000) * RPM;
  return Math.min(CAP, Math.max(FLOOR, raw));
}

function weeksToViews(target: number, weeklyViews: number): number | null {
  if (weeklyViews <= 0) return null;
  return Math.ceil(target / weeklyViews);
}

const EarningsSliderCalculator = ({ referralLink }: EarningsSliderCalculatorProps) => {
  const [clipsPerWeek, setClipsPerWeek] = useState(10);
  const [avgViews, setAvgViews] = useState(10000);
  const [linkCopied, setLinkCopied] = useState(false);

  const stats = useMemo(() => {
    const perClip = calcPerClip(avgViews);
    const weekly = perClip * clipsPerWeek;
    const monthly = weekly * 4;
    const weeklyViews = clipsPerWeek * avgViews;

    const bonusTimeline = BONUSES.map((b) => {
      const weeks = weeksToViews(b.views, weeklyViews);
      return { ...b, weeks };
    });

    // Total earnings in first 6 months (26 weeks)
    const sixMonthClipEarnings = weekly * 26;
    const sixMonthBonuses = bonusTimeline.reduce((sum, b) => {
      if (b.weeks && b.weeks <= 26) return sum + b.amount;
      return sum;
    }, 0);
    const sixMonthTotal = sixMonthClipEarnings + sixMonthBonuses;

    return { perClip, weekly, monthly, weeklyViews, bonusTimeline, sixMonthTotal };
  }, [clipsPerWeek, avgViews]);

  const viewsLabel = avgViews >= 1000 ? `${(avgViews / 1000).toFixed(0)}k` : avgViews.toString();

  return (
    <motion.section
      className="px-4 py-8 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-card border border-border rounded-xl p-5 md:p-7">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-1">
          <Calculator className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Build Your Earnings Plan</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Drag the sliders to see exactly what you'd earn.
        </p>

        {/* Sliders */}
        <div className="space-y-6 mb-6">
          {/* Clips per week */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-foreground">Clips per week</label>
              <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                {clipsPerWeek}
              </span>
            </div>
            <Slider
              value={[clipsPerWeek]}
              onValueChange={(v) => setClipsPerWeek(v[0])}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>1</span>
              <span>10</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>

          {/* Average views */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-foreground">Avg views per clip</label>
              <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                {viewsLabel}
              </span>
            </div>
            <Slider
              value={[avgViews]}
              onValueChange={(v) => setAvgViews(v[0])}
              min={1000}
              max={100000}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>1k</span>
              <span>25k</span>
              <span>50k</span>
              <span>100k</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Per Clip</p>
            <p className="text-lg font-black text-primary">${stats.perClip.toFixed(2)}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Weekly</p>
            <p className="text-lg font-black text-foreground">${stats.weekly.toFixed(2)}</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Monthly</p>
            <p className="text-lg font-black text-foreground">${stats.monthly.toFixed(2)}</p>
          </div>
        </div>

        {/* Bonus Timeline */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Bonus Unlock Timeline</p>
          </div>
          <div className="space-y-2.5">
            {stats.bonusTimeline.map((b) => {
              const Icon = b.icon;
              const unlocked = b.weeks !== null && b.weeks <= 26;
              return (
                <div key={b.views} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${unlocked ? "text-primary" : "text-muted-foreground/40"}`} />
                    <span className={`text-sm font-semibold ${unlocked ? "text-foreground" : "text-muted-foreground/60"}`}>
                      {b.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({(b.views / 1000).toFixed(0)}k views)
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${unlocked ? "text-primary" : "text-muted-foreground/40"}`}>
                    {b.weeks !== null
                      ? b.weeks <= 52
                        ? `~${b.weeks} wks`
                        : "1yr+"
                      : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6-month projection */}
        <div className="bg-secondary/40 rounded-lg p-3.5 text-center">
          <p className="text-sm text-foreground">
            <strong>6-month projection:</strong>{" "}
            <span className="text-primary font-black text-lg">${stats.sixMonthTotal.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>{" "}
            <span className="text-muted-foreground">total earnings (clips + bonuses)</span>
          </p>
        </div>

        {/* Referral link */}
        {referralLink && (
          <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-primary" /> Your Referral Link — paste in bio
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-primary bg-background/60 rounded px-2 py-1.5 truncate font-mono">
                {referralLink}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  setLinkCopied(true);
                  toast.success("Referral link copied!");
                  setTimeout(() => setLinkCopied(false), 2000);
                }}
                className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/15 px-3 py-1.5 rounded-md transition-colors"
              >
                {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {linkCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* Share + Copy Link buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const text = `🎬 My Clipper Earnings Plan:\n${clipsPerWeek} clips/wk × ${viewsLabel} avg views\n💰 $${stats.monthly.toFixed(2)}/mo in clip pay\n🏆 6-month projection: $${stats.sixMonthTotal.toLocaleString()}\n\nStart clipping → ${referralLink || "iamblessedaf.com/Gratitude-Clips-Challenge"}`;
              if (navigator.share) {
                navigator.share({ title: "My Clipper Earnings Plan", text }).catch(() => {});
              } else {
                navigator.clipboard.writeText(text);
                toast.success("Earnings plan copied to clipboard!");
              }
            }}
            className="flex items-center justify-center gap-2 py-2.5 bg-primary/10 hover:bg-primary/15 text-primary font-bold text-sm rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Plan
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(referralLink || "https://iamblessedaf.com/Gratitude-Clips-Challenge");
              toast.success("Link copied!");
            }}
            className="flex items-center justify-center gap-2 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-bold text-sm rounded-lg transition-colors"
          >
            <Link className="w-4 h-4" />
            Copy Link
          </button>
        </div>

        <p className="mt-3 text-[10px] text-muted-foreground/60 text-center leading-relaxed">
          Projections based on current payout rates. Actual results depend on content performance. Bonuses are cumulative milestones.
        </p>
      </div>
    </motion.section>
  );
};

export default EarningsSliderCalculator;
