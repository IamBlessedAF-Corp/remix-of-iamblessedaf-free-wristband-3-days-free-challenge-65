import { motion } from "framer-motion";

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

      {/* Neuroscience claim */}
      <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-lg mx-auto">
        Neuroscience Research confirms that a daily{" "}
        <span className="font-bold text-foreground">GRATITUDE</span> Practice can make you{" "}
        <span className="font-bold text-foreground">FEEL up to 27x Happier</span>
      </p>

      {/* Huberman Quote */}
      <blockquote className="bg-card border border-border/50 rounded-2xl p-5 max-w-lg mx-auto mb-6 shadow-soft">
        <p className="text-sm md:text-base italic text-foreground leading-relaxed">
          "The most effective way to feel Grateful is not with empty Affirmations, it's by receiving genuine Gratitude"
        </p>
        <footer className="mt-3 text-xs md:text-sm text-muted-foreground font-semibold">
          — Andrew Huberman, Neuroscientist
        </footer>
      </blockquote>

      {/* CTA transition */}
      <p className="text-lg md:text-xl font-bold text-foreground">
        Wanna achieve it Faster?
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Hack your environment for Gratitude with the
      </p>
    </motion.div>
  );
};

export default GratitudeIntro;
