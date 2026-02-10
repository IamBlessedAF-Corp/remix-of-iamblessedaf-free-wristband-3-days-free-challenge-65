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
            You're creating gratitude, mindset, and neuroscience content — brain rewire clips, Huberman breakdowns, dopamine hacks.
            Getting 5k, 10k, 20k views.
            And TikTok pays you… <strong className="text-foreground">$0.02–$0.04 per 1,000 views</strong>. That's $0.40 for a 20k video.
            You'd need <strong>2.5 million views</strong> just to hit $100. The math is broken.
          </p>
        </div>

        {/* False Belief */}
        <div>
          <h2 className="text-2xl font-bold mb-4">❌ The Old Belief</h2>
          <p className="text-lg text-muted-foreground">
            "Clipping = hobby. Views don't pay enough to matter." 
            The market believed this for years. But Vyro turned clipping into a marketplace. HighLevel made it an acquisition channel. GoPro made it aspirational.
            The new belief: <strong className="text-foreground">clipping is a measurable performance channel — CPV/CPM without traditional ad spend</strong>.
          </p>
        </div>

        {/* Epiphany */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">💡 The Epiphany</h2>
          <p className="text-lg text-muted-foreground mb-4">
            We don't pay based on ad revenue. We pay based on <strong>clip performance</strong> with a guaranteed floor.
            The audience becomes the paid media team.
          </p>
          <div className="space-y-2 text-foreground font-medium">
            <p>• <strong>$2.22 floor</strong> — even a 1,000-view clip pays you $2.22. That's guaranteed cash, not "potential."</p>
            <p>• <strong>$0.22 per 1,000 views</strong> — that's 7x what TikTok Creator Fund pays. Real RPM on real views.</p>
            <p>• <strong>Content Vault</strong> — no originals needed. Pick → remix → submit in a click. Zero creative friction.</p>
          </div>
          <p className="text-lg text-muted-foreground mt-4">
            <strong className="text-primary">The real math:</strong> 10 clips/week at 10k avg views = <strong>$22/week = $88.80/month</strong>. 
            From gratitude content remixed from our vault. Plus a shot at <strong>$1,111 every Friday</strong>.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default ContestProblem;
