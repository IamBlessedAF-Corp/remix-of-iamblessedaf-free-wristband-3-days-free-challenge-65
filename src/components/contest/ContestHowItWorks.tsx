import { motion } from "framer-motion";
import { Film, Share2, DollarSign, Trophy } from "lucide-react";

const steps = [
  {
    icon: Film,
    title: "1. Pick From the Content Vault",
    desc: "24+ curated gratitude × neuroscience clips ready to remix. No originals needed. Add a 5-sec hook: \"Free wristband + win $1,111 this Friday.\" Your creativity, your style.",
  },
  {
    icon: Share2,
    title: "2. Submit in a Click",
    desc: "Post to TikTok, IG Reels, YouTube Shorts with your unique link in bio/caption. Tag @IamBlessedAF + #GratitudeChallenge #BrainHack. Brief → remix → upload → done.",
  },
  {
    icon: DollarSign,
    title: "3. Get Paid Per Clip",
    desc: "$2.22 floor (even at 1,000 views). $0.22/1k RPM scales from there. 10 clips/week at 10k avg = $22/week = $88.80/month. Views verified via platform analytics.",
  },
  {
    icon: Trophy,
    title: "4. Win $1,111 Every Friday",
    desc: "Every valid entry = 1 ticket to the $1,111 grand prize drawing, held LIVE on @IamBlessedAF IG every Friday at 7PM EST. More clips = more tickets.",
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
        <h2 className="text-3xl font-bold mb-2">⚡ How It Works (60 Seconds)</h2>
        <p className="text-muted-foreground mb-8">
          Vault → Remix → Submit → Paid. The same low-friction loop that powers Vyro's marketplace and GoPro's Million Dollar Challenge.
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

        <div className="mt-8 bg-primary/10 border border-primary/20 rounded-xl p-6">
          <p className="text-foreground font-semibold mb-2">💡 Why This Works (First Principles)</p>
          <p className="text-muted-foreground">
            Production value doesn't matter. <strong className="text-foreground">Views = money. That's it.</strong> A remix with
            "claim your free wristband" in the caption works just as well as a cinematic edit. 
            The math is simple: views verified → payout processed → trust manufactured → you post more → loop compounds.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default ContestHowItWorks;
