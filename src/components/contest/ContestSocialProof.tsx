import { motion } from "framer-motion";
import { useSimulatedStats } from "@/hooks/useSimulatedStats";

const ContestSocialProof = () => {
  const { participants, meals, wristbands } = useSimulatedStats();

  const stats = [
    { label: "Challenge Participants", value: participants > 0 ? participants.toLocaleString() + "+" : "—" },
    { label: "Meals Donated", value: meals > 0 ? meals.toLocaleString() + "+" : "—" },
    { label: "Wristbands Claimed", value: wristbands > 0 ? wristbands.toLocaleString() + "+" : "—" },
  ];

  return (
    <section className="px-4 py-12 bg-secondary/20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-3 text-center">📊 The Numbers Don't Lie</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            The gratitude movement is scaling fast. Real impact, real numbers — and the clipper program is how we 10x it.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
              The gratitude challenge is already driving real impact — meals donated, brains rewired, wristbands claimed.
              Now we're launching the <strong className="text-foreground">clipper program</strong> to pour gasoline on this fire. 
              <strong className="text-foreground"> Be one of the first to claim your spot.</strong>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContestSocialProof;
