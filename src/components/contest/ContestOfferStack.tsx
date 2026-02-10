import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const stack = [
  {
    item: "$2.22 Guaranteed Floor — Even at 1,000 Views",
    value: "$2.22+",
    detail: "Your clip gets 1,000 views? You pocket $2.22. Not promises, not 'potential' — guaranteed cash. No minimum followers, no approval committee, no gatekeepers.",
  },
  {
    item: "$0.22 RPM — 7x TikTok Creator Fund",
    value: "7x RPM",
    detail: "TikTok pays $0.02–$0.04 per 1k. We pay $0.22. That's 7x. Post 10 clips/week at 10k avg = $88.80/month from content you'd remix anyway.",
  },
  {
    item: "Content Vault — No Original Content Required",
    value: "VAULT",
    detail: "Pick from 24+ curated gratitude × neuroscience clips. Remix with your style. Brief + vault + submit in a click. Zero creative friction.",
  },
  {
    item: "FREE Wristband + 1 Meal Per Claim",
    value: "IMPACT",
    detail: "Every viewer who claims a wristband = 1 meal donated via Feeding America. Your clips literally feed people. That's K-factor fuel.",
  },
  {
    item: "$1,111 Grand Prize Drawing (Every Friday)",
    value: "$1,111",
    detail: "Every valid clip = 1 ticket. Drawing LIVE on @IamBlessedAF IG every Friday at 7PM EST. More clips = more tickets = more chances.",
  },
  {
    item: "Feature on @IamBlessedAF + @DaVincyGang",
    value: "EXPOSURE",
    detail: "Top clips get posted to 14k + 320k combined followers. Build your portfolio while getting paid. Double incentive = compound K-factor.",
  },
  {
    item: "$1,111 Super Payout at 1M Combined Views",
    value: "$1,111",
    detail: "Hit 1,000,000 total views across all your clips → unlock a $1,111 bonus. At 10 clips/week averaging 10k views, that's ~10 weeks. Stack clips, stack views, cash out.",
  },
];

const ContestOfferStack = () => (
  <section className="px-4 py-12 max-w-4xl mx-auto">
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <h2 className="text-3xl font-bold mb-2">📦 The Offer Stack</h2>
      <p className="text-muted-foreground mb-8">
        Here's everything you get for making gratitude × neuroscience clips:
      </p>

      <div className="space-y-4">
        {stack.map((s, i) => (
          <motion.div
            key={i}
            className="bg-card rounded-lg p-5 border border-border/50 hover:border-primary/50 transition-all"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h3 className="text-lg font-bold">{s.item}</h3>
                  <span className="text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
                    {s.value}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1">{s.detail}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-secondary/40 rounded-xl p-6 border border-border/50 text-center">
        <p className="text-muted-foreground mb-1">10 clips/week at 10k avg views:</p>
        <p className="text-3xl font-bold text-primary">$22/week → $88.80/month + $1,111 drawing</p>
        <p className="text-sm text-muted-foreground mt-2">
          Hit 1M combined views (~10 weeks at that pace) → unlock the <strong className="text-foreground">$1,111 Super Payout</strong> on top of everything else.
        </p>
      </div>
    </motion.div>
  </section>
);

export default ContestOfferStack;
