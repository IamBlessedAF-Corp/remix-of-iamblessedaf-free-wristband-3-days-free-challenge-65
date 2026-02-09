import { motion } from "framer-motion";
import { Check, Star, Rocket, Crown, Trophy, Zap, Globe, Heart } from "lucide-react";

interface Milestone {
  meals: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  date?: string; // when it was achieved
  achieved: boolean;
}

const MILESTONES: Milestone[] = [
  {
    meals: 100,
    title: "First 100 Meals",
    description: "The movement begins — our first 100 meals donated through the community.",
    icon: <Zap className="w-5 h-5" />,
    date: "Jan 15, 2026",
    achieved: true,
  },
  {
    meals: 1_000,
    title: "1,000 Meals Fed",
    description: "1,000 people fed. Proof that small acts of gratitude create real change.",
    icon: <Star className="w-5 h-5" />,
    date: "Jan 28, 2026",
    achieved: true,
  },
  {
    meals: 5_000,
    title: "5K Milestone",
    description: "Five thousand meals and counting. The Blessed community is unstoppable.",
    icon: <Heart className="w-5 h-5" />,
    date: "Feb 5, 2026",
    achieved: true,
  },
  {
    meals: 11_111,
    title: "11,111 Meals 🔥",
    description: "Our first sacred number milestone. 11,111 meals = 11,111 moments of gratitude.",
    icon: <Rocket className="w-5 h-5" />,
    date: "Feb 9, 2026",
    achieved: true,
  },
  {
    meals: 50_000,
    title: "50K Impact",
    description: "Half way to 100K. Every wristband, every share, every blessing matters.",
    icon: <Globe className="w-5 h-5" />,
    achieved: false,
  },
  {
    meals: 111_111,
    title: "111,111 Meals",
    description: "10% of the way to our 2026 goal. A sacred milestone for the community.",
    icon: <Trophy className="w-5 h-5" />,
    achieved: false,
  },
  {
    meals: 500_000,
    title: "Half a Million",
    description: "500,000 meals donated. We're reshaping how generosity works on the internet.",
    icon: <Crown className="w-5 h-5" />,
    achieved: false,
  },
  {
    meals: 1_111_111,
    title: "🏆 1,111,111 Meals",
    description: "THE GOAL. 1,111,111 meals. When we hit this, we change the world forever.",
    icon: <Star className="w-5 h-5" />,
    achieved: false,
  },
];

export default function MilestoneTimeline() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Milestone <span className="text-primary">Timeline</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Every number is a real person who received a meal because of you
        </p>
      </div>

      <div className="max-w-2xl mx-auto relative">
        {/* Vertical line */}
        <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-border" />

        {/* Milestone items */}
        <div className="space-y-0">
          {MILESTONES.map((milestone, i) => (
            <motion.div
              key={milestone.meals}
              className="relative pl-16 sm:pl-20 pb-10 last:pb-0"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              {/* Circle on timeline */}
              <div
                className={`absolute left-3.5 sm:left-5.5 w-5 h-5 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${
                  milestone.achieved
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border text-muted-foreground"
                }`}
                style={{ left: "14px" }}
              >
                {milestone.achieved ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                )}
              </div>

              {/* Content card */}
              <div
                className={`rounded-xl border p-4 sm:p-5 transition-all ${
                  milestone.achieved
                    ? "bg-card border-primary/20 shadow-sm"
                    : "bg-muted/30 border-border/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`${
                          milestone.achieved ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {milestone.icon}
                      </span>
                      <h3
                        className={`font-bold text-sm sm:text-base ${
                          milestone.achieved ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {milestone.title}
                      </h3>
                    </div>
                    <p
                      className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${
                        milestone.achieved
                          ? "text-muted-foreground"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {milestone.description}
                    </p>
                  </div>

                  {/* Meal count badge */}
                  <div
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-right ${
                      milestone.achieved
                        ? "bg-primary/10"
                        : "bg-muted"
                    }`}
                  >
                    <p
                      className={`text-xs font-bold tabular-nums ${
                        milestone.achieved ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {milestone.meals.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-muted-foreground">meals</p>
                  </div>
                </div>

                {/* Date achieved */}
                {milestone.date && (
                  <p className="text-[10px] text-muted-foreground mt-2.5 flex items-center gap-1">
                    <Check className="w-3 h-3 text-primary" />
                    Achieved {milestone.date}
                  </p>
                )}

                {/* Next milestone CTA */}
                {!milestone.achieved && i === MILESTONES.findIndex((m) => !m.achieved) && (
                  <div className="mt-3 bg-primary/5 border border-primary/10 rounded-lg px-3 py-2">
                    <p className="text-[11px] text-primary font-medium">
                      🎯 This is our next milestone — share a wristband to help us get there!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
