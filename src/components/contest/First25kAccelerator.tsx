import { motion } from "framer-motion";
import { Zap, Clock, Eye, Film, ShieldCheck, TrendingUp, Flame } from "lucide-react";

const First25kAccelerator = () => {
  return (
    <section className="px-4 py-16 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/15 border border-primary/30 rounded-full text-xs font-bold uppercase tracking-wider text-primary">
            <Flame className="w-3.5 h-3.5" />
            New Clipper Bonus
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-3 leading-tight">
          First 25k Accelerator
        </h2>
        <p className="text-center text-muted-foreground max-w-xl mx-auto mb-10 text-base">
          Hit 25,000 views in your first 4 days + post 5 clips →{" "}
          <span className="text-primary font-bold">$22 instant bonus</span> +{" "}
          <span className="text-primary font-bold">2× earnings for 48 hours</span>.
        </p>

        {/* Qualification Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Requirement 1 */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">25,000 Total Views</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Combined across all clips within your first 4 days
              </p>
            </div>
          </div>

          {/* Requirement 2 */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Film className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">5+ Clips Posted</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Minimum 5 unique clips submitted to any platform
              </p>
            </div>
          </div>

          {/* Requirement 3 */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">4-Day Window</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Starts from your first clip submission — no extensions
              </p>
            </div>
          </div>

          {/* Reward */}
          <div className="bg-primary/5 border border-primary/25 rounded-2xl p-5 flex gap-4 items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm text-primary">Unlock Rewards</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                $22 instant bonus + 2× clip earnings for the next 48 hours
              </p>
            </div>
          </div>
        </div>

        {/* Visual Flow */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            How It Works
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2 text-center">
            {[
              { label: "Post 5+ clips", sub: "Days 1–4" },
              { label: "Hit 25k views", sub: "Combined total" },
              { label: "$22 bonus drops", sub: "Instant credit" },
              { label: "2× earnings", sub: "Next 48 hours" },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-2 flex-1 w-full sm:w-auto">
                <div className="flex-1 bg-secondary/50 rounded-xl py-3 px-2">
                  <p className="text-sm font-bold">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground">{step.sub}</p>
                </div>
                {i < 3 && (
                  <TrendingUp className="w-4 h-4 text-primary hidden sm:block flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Behavioral Nudge */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 text-center mb-6">
          <p className="text-lg font-bold mb-1">
            🔥 Most clippers who hit 25k in 4 days keep earning 3× longer
          </p>
          <p className="text-sm text-muted-foreground">
            Early momentum compounds. The 2× window is designed to reward your best posting sprint.
          </p>
        </div>

        {/* Fine Print / Anti-Abuse */}
        <div className="flex items-start gap-3 bg-secondary/30 rounded-xl p-4">
          <ShieldCheck className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
            <p>
              <strong className="text-foreground">One-time activation only.</strong>{" "}
              The 25k Accelerator can be claimed once per account. Duplicate accounts, bot-generated views, or recycled content will disqualify the bonus. View counts are verified against public platform APIs during the 24-hour review period.
            </p>
            <p>
              The 2× multiplier applies to standard clip RPM earnings only — milestone bonuses ($111 / $444 / $1,111) are not multiplied. Multiplier window begins immediately upon qualification and expires exactly 48 hours later.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default First25kAccelerator;
