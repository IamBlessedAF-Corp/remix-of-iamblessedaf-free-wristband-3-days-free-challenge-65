import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";

const inspirationClips = [
  { id: "wz4Z9ZQH5gw", label: "Gratitude Shift" },
  { id: "UBwFBHLqP-c", label: "Brain Rewire" },
  { id: "xwrTL_xgoPE", label: "Joy Practice" },
  { id: "ORJsKGd7yBo", label: "Dopamine Reset" },
  { id: "BSpNEfdSgLY", label: "Mindset Flip" },
  { id: "lZGrgUPVPsU", label: "Blessed Moment" },
  { id: "gLe2220l90w", label: "Gratitude Walk" },
  { id: "VfMVrJQoawc", label: "Neural Pathway" },
  { id: "4S_KbOqNI9g", label: "Morning Ritual" },
  { id: "097X7NWlpxk", label: "Serotonin Boost" },
  { id: "sjl4p75o07U", label: "Heart Opening" },
  { id: "imbQ-JzCgQ4", label: "Calm Energy" },
  { id: "eRv1GCPtWjs", label: "Flow State" },
  { id: "KVjfFN89qvQ", label: "Gratitude Science" },
  { id: "dN_xttI2Pa4", label: "Daily Practice" },
  { id: "kRlnskozHWk", label: "Blessed Life" },
  { id: "FbTWxDoqcMs", label: "Inner Peace" },
  { id: "3FOtl9bQ2Mk", label: "Rewire Joy" },
  { id: "qA1e_uty3ic", label: "Neuro Hack" },
  { id: "ZaQ1MY8xftE", label: "Mindful Clip" },
  { id: "CqaBQqAqAkc", label: "Positive Shift" },
  { id: "S0_35Nz5R80", label: "Gratitude Burst" },
  { id: "nE4XikwpnTQ", label: "Brain Chemistry" },
  { id: "VDFdVLIw2Uw", label: "Blessed Energy" },
];

const exampleRemix = "MlmSL42rwVE";

const InspirationGallery = () => (
  <section className="px-4 py-12 max-w-5xl mx-auto">
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-full px-4 py-1.5 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-primary font-semibold text-sm">Remix These → Get Paid</span>
        </div>
        <h2 className="text-3xl font-bold mb-2">🎬 Inspiration Gallery</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Pick any clip below, remix it with your style + a gratitude hook + "claim your free wristband" CTA.
          No copyright issues — just creative remixes that <strong className="text-foreground">pay you $2–$22 each</strong>.
        </p>
      </div>

      {/* Example remix style */}
      <div className="mb-10">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" />
          Example Remix Style (Make Yours Like This)
        </h3>
        <div className="max-w-md mx-auto rounded-xl overflow-hidden border border-primary/30 shadow-lg">
          <div className="relative w-full" style={{ paddingBottom: "177.78%" }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${exampleRemix}`}
              title="Example remix style"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          👆 This style = no copyright issues. Your remix, your earnings.
        </p>
      </div>

      {/* Clips grid */}
      <h3 className="text-lg font-bold mb-4">📱 Source Clips to Remix ({inspirationClips.length} available)</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {inspirationClips.map((clip, i) => (
          <motion.a
            key={clip.id}
            href={`https://youtube.com/shorts/${clip.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-card rounded-lg border border-border/50 overflow-hidden hover:border-primary/50 transition-all"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
          >
            <img
              src={`https://img.youtube.com/vi/${clip.id}/mqdefault.jpg`}
              alt={clip.label}
              className="w-full aspect-[9/16] object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-white text-xs font-medium">{clip.label}</p>
            </div>
          </motion.a>
        ))}
      </div>

      <div className="mt-6 bg-primary/10 border border-primary/20 rounded-xl p-5 text-center">
        <p className="text-foreground font-semibold mb-1">🎯 Remix Formula</p>
        <p className="text-muted-foreground text-sm">
          Pick a clip → Add your voiceover or text overlay → Include "Claim your FREE wristband + win $1,111" →
          Tag @IamBlessedAF + #GratitudeChallenge → Post → Get paid.
        </p>
      </div>
    </motion.div>
  </section>
);

export default InspirationGallery;
