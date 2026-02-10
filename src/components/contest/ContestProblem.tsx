import { motion } from "framer-motion";

const ContestProblem = () => (
  <section className="px-4 py-12 bg-secondary/20">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="space-y-8"
      >
        {/* Problem */}
        <div>
          <h2 className="text-3xl font-bold mb-4">🚨 The Problem Nobody Talks About</h2>
          <p className="text-lg text-muted-foreground">
            You're creating gratitude, mindset, and neuroscience content—brain rewire clips, Huberman breakdowns, dopamine hacks.
            Getting 10k, 20k, 50k views.
            And TikTok pays you… <strong className="text-foreground">$0.02–$0.04 per 1,000 views</strong>. That's $0.40 for a 20k video.
            You'd need <strong>2.5 million views</strong> just to hit $100. The math is broken.
          </p>
        </div>

        {/* False Belief */}
        <div>
          <h2 className="text-2xl font-bold mb-4">❌ The False Belief</h2>
          <p className="text-lg text-muted-foreground">
            "Views don't pay enough to matter." Wrong. Views don't pay enough <em>on the platform</em>.
            But what if someone paid you <strong>directly per clip</strong>—not per 1,000 views from an ad algorithm?
          </p>
        </div>

        {/* Epiphany */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">💡 The Epiphany</h2>
          <p className="text-lg text-muted-foreground mb-4">
            We don't pay based on ad revenue. We pay based on <strong>clip performance</strong> with a guaranteed floor.
          </p>
          <div className="space-y-2 text-foreground font-medium">
            <p>• $2 floor — even a 5k-view clip pays you $2. No minimum threshold BS.</p>
            <p>• $0.22 per 1,000 views — that's <strong>$0.22 RPM</strong>. TikTok pays $0.03.</p>
            <p>• $22 cap — a 100k clip maxes out at $22. One viral clip = one day's food budget.</p>
          </div>
          <p className="text-lg text-muted-foreground mt-4">
            <strong className="text-primary">Translation:</strong> A mid clipper posting 5 clips/week at 20k avg views = <strong>$22/week = $88/month</strong>. From gratitude content you're already making.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default ContestProblem;
