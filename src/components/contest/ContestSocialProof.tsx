import { motion } from "framer-motion";
import { useGlobalMeals } from "@/hooks/useGlobalMeals";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ContestSocialProof = () => {
  const { meals } = useGlobalMeals();
  const [challengeCount, setChallengeCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from("challenge_participants")
        .select("*", { count: "exact", head: true });
      if (count !== null) setChallengeCount(count);
    };
    fetchCount();
  }, []);

  const stats = [
    { label: "Challenge Participants", value: challengeCount > 0 ? challengeCount.toLocaleString() + "+" : "—" },
    { label: "Meals Donated", value: meals > 0 ? meals.toLocaleString() + "+" : "—" },
    { label: "Wristbands Claimed", value: challengeCount > 0 ? challengeCount.toLocaleString() + "+" : "—" },
  ];

  return (
    <section className="px-4 py-12 bg-secondary/20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-3 text-center">📊 The Campaign Is Working</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
            Our gratitude movement is growing fast. Here's the live impact — and we're just getting started with the clipper program.
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
              Now we're opening the <strong className="text-foreground">clipper program</strong> to scale it even further. 
              <strong className="text-foreground"> Be one of the first clippers to join.</strong>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContestSocialProof;
