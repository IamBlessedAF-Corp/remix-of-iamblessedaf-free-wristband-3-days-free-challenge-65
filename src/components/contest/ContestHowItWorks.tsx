import { motion } from "framer-motion";
import { Film, Download, Share2, DollarSign } from "lucide-react";

const steps = [
  {
    icon: Film,
    title: "1. Pick a Clip From Our Vault",
    desc: "We curate 24+ viral gratitude & neuroscience videos (Tony Robbins, Huberman, Dispenza). Pick any clip — these are pre-approved for remixing. No copyright issues.",
  },
  {
    icon: Download,
    title: "2. Download & Add Our CTA End-Screen",
    desc: "Download our ready-made CTA overlays below. Add one to the last 3–5 seconds of your clip. CTAs include: \"Claim your FREE wristband\" or \"Join the 3-Day Gratitude Challenge.\" This is what drives viewers to your referral link.",
  },
  {
    icon: Share2,
    title: "3. Post With Your Referral Link",
    desc: "Upload to TikTok, IG Reels, or YouTube Shorts. Put your unique referral link in your bio or caption. Tag @IamBlessedAF + #GratitudeChallenge #IamBlessedAF. That's it — you're live.",
  },
  {
    icon: DollarSign,
    title: "4. Views = Money. Period.",
    desc: "$2.22 guaranteed floor per clip (even at 1k views). $0.22/1k RPM scales from there. Views verified via platform analytics. Payouts weekly. Stack bonuses up to $1,111.",
  },
];

const ContestHowItWorks = () => (
  <section className="px-4 py-12 bg-secondary/20">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold mb-2">⚡ What Exactly Do I Clip?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          You're <strong className="text-foreground">remixing viral gratitude content</strong> and adding a CTA that sends viewers to claim a free wristband or join the gratitude challenge. That's it. Here's the step-by-step:
        </p>

        <div className="space-y-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                className="flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 bg-card border border-border/50 rounded-xl p-5">
          <p className="text-foreground font-semibold mb-2">🎯 TL;DR — The Formula</p>
          <p className="text-muted-foreground">
            <strong className="text-foreground">Vault clip</strong> + <strong className="text-foreground">your remix style</strong> + <strong className="text-foreground">our CTA end-screen</strong> + <strong className="text-foreground">your referral link</strong> = <strong className="text-primary">paid per view</strong>.
            No filming. No scripting. Just remix, plug the CTA, and post.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default ContestHowItWorks;
