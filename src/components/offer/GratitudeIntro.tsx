import { motion } from "framer-motion";
import hawkinsScale from "@/assets/hawkins-scale.jpg";

const GratitudeIntro = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Headline */}
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
        <span className="text-3xl md:text-4xl">🎉</span> Congrats! You Gave the 1st Step to Rewire Your{" "}
        <span className="text-primary">BRAIN</span> to Feel Happier!{" "}
        <span className="text-3xl md:text-4xl">🧠</span>
      </h2>

      {/* Quotes */}
      <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-4 shadow-soft">
        <p className="text-sm md:text-base italic text-foreground leading-relaxed">
          "Most people live in survival emotions like fear, anger, guilt, shame"
        </p>
        <footer className="mt-2 text-xs md:text-sm text-muted-foreground font-semibold">
          — Dr Joe Dispenza
        </footer>
      </blockquote>

      <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-6 shadow-soft">
        <p className="text-sm md:text-base italic text-foreground leading-relaxed">
          "Gratitude is the fastest & repeatable way to shift emotional state by changing physiology and perception. Make it a daily ritual."
        </p>
        <footer className="mt-2 text-xs md:text-sm text-muted-foreground font-semibold">
          — Tony Robbins
        </footer>
      </blockquote>

      {/* Hawkins explanation */}
      <p className="text-base md:text-lg text-muted-foreground mb-2 max-w-lg mx-auto">
        Dr. Hawkins — PhD Psychiatrist Research illustrated by this emotional scale, the frequency of{" "}
        <span className="font-bold text-foreground">shame is 20 Hz</span> and{" "}
        <span className="font-bold text-foreground">Joy is 540 Hz</span>.
      </p>
      <p className="text-base md:text-lg text-muted-foreground mb-2 max-w-lg mx-auto">
        Gratitude makes you feel the emotion of <span className="font-bold text-foreground">Joy</span>.
      </p>
      <p className="text-xl md:text-2xl font-bold text-primary mb-6 max-w-lg mx-auto">
        THAT'S 27x HAPPIER
      </p>

      {/* Hawkins Emotional Guidance Scale */}
      <motion.div
        className="max-w-lg mx-auto mb-6 rounded-2xl overflow-hidden border border-border/50 shadow-soft"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <img
          src={hawkinsScale}
          alt="Dr. Hawkins Emotional Guidance Scale"
          className="w-full h-auto object-contain"
          loading="lazy"
        />
      </motion.div>

      {/* Huberman Quote */}
      <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-6 shadow-soft">
        <p className="text-sm md:text-base italic text-foreground leading-relaxed">
          "The most effective way to feel Grateful is not with empty Affirmations, it's by receiving genuine Gratitude"
        </p>
        <footer className="mt-3 text-xs md:text-sm text-muted-foreground font-semibold">
          — Andrew Huberman, Neuroscientist
        </footer>
      </blockquote>

      {/* Huberman Video Clip */}
      <p className="text-sm md:text-base italic text-muted-foreground max-w-lg mx-auto mb-3 leading-relaxed">
        "The Biggest Surprise in researching since i started the podcast is how GRATITUDE skyrocket{" "}
        <span className="font-bold text-foreground">DOPAMINE</span> &{" "}
        <span className="font-bold text-foreground">SEROTONIN</span>..."
      </p>
      <motion.div
        className="max-w-lg mx-auto mb-6 rounded-2xl overflow-hidden border border-border/50 shadow-soft"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/ph1BuMRFJ88"
            title="Huberman on Gratitude"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </motion.div>

      {/* CTA transition */}
      <p className="text-lg md:text-xl font-bold text-foreground mb-1">
        Wanna achieve it Faster?
      </p>
      <p className="text-sm text-muted-foreground">
        Hack your environment for Gratitude with the
      </p>
    </motion.div>
  );
};

export default GratitudeIntro;
