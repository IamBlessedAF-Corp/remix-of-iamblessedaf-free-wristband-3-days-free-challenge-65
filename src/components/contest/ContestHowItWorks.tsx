import { motion } from "framer-motion";
import { Film, Share2, DollarSign, Trophy } from "lucide-react";

const steps = [
  {
    icon: Film,
    title: "1. Make a Hoops × Gratitude Clip",
    desc: "Dribble footage + 5-sec gratitude hook. \"Free wristband + win $1,111 this Friday.\" Use any style—dunks, streetball, training montage. Your creativity, your way.",
  },
  {
    icon: Share2,
    title: "2. Post With Your Link",
    desc: "Upload to TikTok, IG Reels, YouTube Shorts. Include your unique referral link in bio/caption. Tag @IamBlessedAF + use #BlessedChallenge.",
  },
  {
    icon: DollarSign,
    title: "3. Get Paid Per Clip",
    desc: "$2 floor (any view count) → $0.22/1k views → $22 cap. Payouts processed weekly. See earnings live in your creator dashboard.",
  },
  {
    icon: Trophy,
    title: "4. Enter the $1,111 Drawing",
    desc: "Every valid entry = 1 ticket to the $1,111 grand prize drawing, held LIVE on @IamBlessedAF IG every Friday at 7PM EST.",
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
        <h2 className="text-3xl font-bold mb-8">⚡ How It Works (60 Seconds)</h2>

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
          <p className="text-foreground font-semibold mb-2">💡 The Real Talk</p>
          <p className="text-muted-foreground">
            We don't care about production value. A shaky phone clip of you shooting free throws with "claim your free wristband" in the caption
            works just as well as a cinematic edit. <strong className="text-foreground">Views = money. That's it.</strong>
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default ContestHowItWorks;
