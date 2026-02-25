import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  initials: string;
  location: string;
  result: string;
  quote: string;
  days: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah M.",
    initials: "SM",
    location: "Austin, TX",
    result: "Stress dropped from 8/10 to 3/10",
    quote: "I was skeptical, but after 14 days wearing the wristband, I catch myself pausing and feeling grateful at random moments. My therapist noticed the difference before I even told her about it.",
    days: 14,
  },
  {
    name: "Marcus J.",
    initials: "MJ",
    location: "Miami, FL",
    result: "Reconnected with his brother after 2 years",
    quote: "I gifted one to my brother. He called me the next day — first real conversation in 2 years. We both cried. This tiny wristband started something words couldn't.",
    days: 3,
  },
  {
    name: "Priya K.",
    initials: "PK",
    location: "San Francisco, CA",
    result: "Morning anxiety reduced by 70%",
    quote: "Every morning I'd wake up with anxiety. Now I look at my wrist first thing and take a gratitude breath. It sounds crazy simple, but my morning anxiety is almost gone after 21 days.",
    days: 21,
  },
  {
    name: "David R.",
    initials: "DR",
    location: "Chicago, IL",
    result: "His team's morale skyrocketed",
    quote: "I got 3 wristbands for my team leads. Within a week, the energy in our office shifted. People started thanking each other out loud. Our Glassdoor reviews went up. Unreal ROI.",
    days: 7,
  },
];

interface TestimonialsSectionProps {
  delay?: number;
}

const TestimonialsSection = ({ delay = 0 }: TestimonialsSectionProps) => {
  return (
    <motion.section
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <p className="text-center text-xs uppercase tracking-[0.2em] text-primary font-bold mb-1">
        Real People. Real Results.
      </p>
      <p className="text-center text-2xl md:text-3xl font-black text-foreground mb-6">
        What Neuro-Hackers Are Saying
      </p>

      <div className="space-y-4">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            className="bg-card border border-border/50 rounded-xl p-4 shadow-soft"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.1 * i }}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {t.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-foreground">{t.name}</span>
                  <span className="text-xs text-muted-foreground">· {t.location}</span>
                </div>
                {/* Stars */}
                <div className="flex gap-0.5 my-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-primary text-primary" />
                  ))}
                </div>
                {/* Result badge */}
                <div className="inline-flex items-center bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[11px] font-semibold mb-2">
                  ✅ {t.result}
                </div>
                {/* Quote */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{t.quote}"
                </p>
                <p className="text-[11px] text-muted-foreground/60 mt-1.5">
                  After {t.days} days with the wristband
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default TestimonialsSection;
