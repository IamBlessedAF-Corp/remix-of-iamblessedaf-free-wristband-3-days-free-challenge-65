import { motion } from "framer-motion";

const stats = [
  { label: "Clippers Joined", value: "2,340+" },
  { label: "Meals Donated", value: "25,000+" },
  { label: "Wristbands Claimed", value: "4,800+" },
  { label: "Avg Clip Views", value: "18k" },
];

const ContestSocialProof = () => (
  <section className="px-4 py-12 bg-secondary/20">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold mb-8 text-center">📊 The Numbers Don't Lie</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="bg-card rounded-xl p-5 text-center border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-card rounded-xl p-6 border border-border/50">
          <p className="text-lg text-muted-foreground text-center">
            "I was posting gratitude clips for free. Now the same clips with a 5-second wristband hook pay me <strong className="text-foreground">$4–$12 each</strong>.
            Plus my audience loves the brain-rewire angle—engagement went up 30%."
          </p>
          <p className="text-center text-sm text-primary font-semibold mt-3">
            — @MindfulClipperKay, 45k avg views
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default ContestSocialProof;
