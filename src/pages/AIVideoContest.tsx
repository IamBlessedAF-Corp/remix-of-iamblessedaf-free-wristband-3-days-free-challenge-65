import { motion } from "framer-motion";
import { CheckCircle, Trophy, Zap, Users, Clock, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CreatorSignupModal } from "@/components/contest/CreatorSignupModal";
import { CreatorNextSteps } from "@/components/contest/CreatorNextSteps";

const AIVideoContest = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { user, loading } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="px-4 py-12 max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={logo}
            alt="I am Blessed AF"
            className="w-full max-w-xs h-auto object-contain mx-auto mb-8"
          />

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            $2,500 Bounty for 90 Sec AI Clip
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            + $15K/Month Remote Growth Hacker Role
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-full px-5 py-2 mb-3">
            <span className="text-primary font-bold text-lg">💰 $2 per valid entry</span>
            <span className="text-muted-foreground text-sm">— every clipper gets paid</span>
          </div>
          <p className="text-lg text-primary font-semibold">
            Kevin Hart AI Video Contest – Ignite Gratitude Virality! 🚀
          </p>
        </motion.div>

        {/* Key Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { label: "Deadline", value: "March 1, 2026" },
            { label: "Launch", value: "February 7, 2026" },
            { label: "Prize Pool", value: "$2,500 + Bonuses" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-secondary/50 rounded-lg p-6 text-center border border-border/50"
              variants={itemVariants}
            >
              <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Contest Concept */}
      <section className="px-4 py-12 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Why This Contest?</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Real Impact + Career Rocket Fuel. We're engineering virality (K-factor ≥2) and real revenue. Your AI clips don't just win prizes; they spark a movement where viewers send 3 gratitude texts to loved ones, tracked via unique links.
            </p>
            <p className="text-lg text-muted-foreground mb-4">
              Top clips get featured on <strong>@IamBlessedAF</strong> (14k+ followers) + <strong>@DaVincyGang</strong> (320k followers), driving your portfolio viral.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <p className="text-foreground font-semibold mb-2">The One Metric That Matters:</p>
              <p className="text-muted-foreground">
                <strong>"Blessings Confirmed" (BCs)</strong> – Real people completing the 3-Day Challenge via your unique referral link. Style, length, aesthetics irrelevant. Only real completions count.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reward Tiers */}
      <section className="px-4 py-12 max-w-4xl mx-auto">
        <motion.h2
          className="text-3xl font-bold mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Measurable Wins
        </motion.h2>

        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            {
              bcs: "Every Valid Entry",
              reward: "$2 Per Submission",
              details: "Every clipper with a valid entry gets paid $2 — no minimum BCs required",
            },
            {
              bcs: "250 BCs",
              reward: "$2,500 Grand Prize",
              details: "Highest total wins the bounty",
            },
            {
              bcs: "500 BCs",
              reward: "$500 Bonus",
              details: "+ IG shoutout from @IamBlessedAF",
            },
            {
              bcs: "1,000 BCs",
              reward: "$1,000 Bonus",
              details: "+ Co-branded merch collab",
            },
            {
              bcs: "2,000+ BCs",
              reward: "$15K/Month Remote Role",
              details:
                "6-month Growth Hacker contract (renewable) – Work on viral engineering for next drops",
            },
          ].map((tier, i) => (
            <motion.div
              key={i}
              className="bg-card rounded-lg p-6 border border-border/50 hover:border-primary/50 transition-all"
              variants={itemVariants}
            >
              <div className="flex items-start gap-4">
                <Trophy className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-primary font-semibold mb-1">
                    {tier.bcs} Required
                  </p>
                  <h3 className="text-lg font-bold mb-2">{tier.reward}</h3>
                  <p className="text-muted-foreground">{tier.details}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-12 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-3xl font-bold mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>

          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Code,
                title: "Create Your AI Clip",
                desc: "90-sec video using Runway Gen-3, Kling, Luma, or any AI tool. Follow the master prompt or go rogue.",
              },
              {
                icon: Users,
                title: "Drive Completions",
                desc: "Share your unique referral link in the video. Each viewer who completes the 3-Day Challenge counts as 1 BC.",
              },
              {
                icon: Zap,
                title: "Multi-Platform Promotion",
                desc: "Post on IG, TikTok, X, Reddit (/AIVideo, /RunwayML), Discord servers for Runway/Luma/Kling. Embed clips everywhere.",
              },
              {
                icon: Trophy,
                title: "Win Based on BCs",
                desc: "Highest BC count wins the $2,500 bounty. Hit milestones for $500/$1,000 bonuses. 2,000+ BCs = $15K/month remote role.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} className="flex gap-4" variants={itemVariants}>
                  <Icon className="w-8 h-8 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Master Prompt */}
      <section className="px-4 py-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6">🛠️ Master Prompt</h2>
          <p className="text-muted-foreground mb-4">
            Copy-paste into Runway Gen-3, Kling, or Luma for character consistency:
          </p>

          <div className="bg-foreground/5 rounded-lg p-6 border border-border/50 font-mono text-sm space-y-3 mb-6">
            <p>
              <span className="text-primary font-bold">Global Visual Style:</span>{" "}
              Hyper-realistic 4K, 60fps. Cinematic handheld shaky-cam, rapid-fire editing.
            </p>
            <p>
              <span className="text-primary font-bold">Character:</span> Kevin Hart
              clone (5'4", Black male, muscular, mid-40s, short black fade,
              extremely expressive wide eyes).
            </p>
            <p>
              <span className="text-primary font-bold">Outfit:</span> Tight,
              glittery 'IamBlessedAF' purple onesie.
            </p>
            <p>
              <span className="text-primary font-bold">Location:</span> Iconic
              Wynwood Miami garage with vibrant neon graffiti murals.
            </p>
            <p>
              <span className="text-primary font-bold">Mannerisms:</span> Rapid
              blinks, head shakes, infectious high-pitched laugh, exaggerated hand
              flails.
            </p>
            <p>
              <span className="text-primary font-bold">Voice:</span> Fast-talking,
              overlapping words, rising yells—perfect lip-sync. Indistinguishable from
              real footage.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() =>
              setExpandedSection(
                expandedSection === "script" ? null : "script"
              )
            }
            className="w-full mb-6"
          >
            {expandedSection === "script"
              ? "Hide Script Details"
              : "Show Script Details"}
          </Button>

          {expandedSection === "script" && (
            <motion.div
              className="space-y-6 bg-secondary/30 rounded-lg p-6 border border-border/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {[
                {
                  time: "[0-15 sec] The 'Broken Brain' Hook",
                  prompt:
                    "Kevin Hart launches off a trampoline, 24mm wide angle, mid-air flip fail in extreme slow-motion with a terrified 'HELP ME!' face. He crashes into a massive pile of yellow rubber chickens. Shaky low-angle zoom on his shocked face freeze-frame. Text overlay: 'Brain Grumpy? Rewire FREE!'",
                  script:
                    "AHHH – HELP ME… HELP! ME! It's Kevin Hart – short-circuitin' into your life! Your brain's a grumpy microwave zappin' negativity? FREE 3-Day Challenge rewires it to happiness blender mode!",
                },
                {
                  time: "[15-45 sec] The Love Loop (3 Text Challenge)",
                  prompt:
                    "Kevin pops from the pile wearing a chicken hat. He holds a giant, glowing smartphone. He climbs a ladder shakily; the rung snaps, and he dangles like a piñata while frantically texting. Every time he hits 'Send', digital confetti hearts explode. Cut to him accidentally texting a 'scary boss' cutout something nice.",
                  script:
                    "Defensive brain parts make you scared like me near tall ladders – beep beep stress! But Huberman science says thanks-yous quiet 'em! It's the Love Loop, people! Send THREE gratitude texts to people you love. That's it! It lights up your happy spot and pumps the good chemicals! Brain scans prove it cuts the sad vibes!",
                },
                {
                  time: "[45-70 sec] Celeb Cameos & The Roast",
                  prompt:
                    "Kevin grabs an Oprah cutout, tips it with a bonk. Quick impressions: Deep voice Tony Robbins flex, grand Oprah wave, zen Deepak hum. Kevin is trying to explain neuroplasticity while purple balloons pop in his face. High energy, sweaty, hilarious facial contortions.",
                  script:
                    "Tony Robbins booms – 'Wake your inner giant!' Giant? I'm an inner elf in Muppets clothes! Oprah whispers – 'Thanks make life awesome!' They're right! Send your 3 texts or stay short on smiles like me!",
                },
                {
                  time: "[70-90 sec] Mega CTA + Chaos",
                  prompt:
                    "Full slow-mo avalanche of purple tennis balls. Kevin 'surfs' the balls, holding a gold trophy with a large QR code. Final wide shot: Kevin buried in balls, giving a shaky thumbs-up. Text: SCAN TO SEND YOUR 3 TEXTS.",
                  script:
                    "SCAN QR NOW – JOIN FREE 3-DAY CHALLENGE, SEND YOUR 3 TEXTS, REWIRE FOR HAPPY! Don't miss out! IAM BLESSED AF! [Buried] Still blessed… but a chicken is biting my toe! Share this & tag a friend to rewire together! Scan QR for your challenge.",
                },
              ].map((section, i) => (
                <div key={i} className="border-l-4 border-primary pl-4">
                  <h4 className="font-bold text-primary mb-2">{section.time}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-semibold text-foreground">Prompt:</span>{" "}
                    {section.prompt}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Script:</span>{" "}
                    "{section.script}"
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Creator Guidelines */}
      <section className="px-4 py-12 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Creator Guidelines</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Timeline</h3>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <Clock className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p>
                      <span className="text-foreground font-semibold">
                        Contest Launch:{" "}
                      </span>
                      February 7, 2026
                    </p>
                    <p>
                      <span className="text-foreground font-semibold">
                        Deadline:{" "}
                      </span>
                      March 1, 2026
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">How to Submit</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    ✅ Upload to IG/TikTok/X and tag{" "}
                    <strong>@IamBlessedAF</strong>
                  </li>
                  <li>
                    ✅ Include contest hashtags:{" "}
                    <strong>
                      #AIVideoContest #KevinHartAI #BlessedChallenge
                      #IamBlessedAF #GratitudeVirality
                    </strong>
                  </li>
                  <li>
                    ✅ Share your unique referral link in the video or captions
                  </li>
                  <li>
                    ✅ DM @JoeDaVincy for creator dashboard access (tracks BCs
                    live)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">Judging Criteria</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    🏆 <strong>Primary:</strong> Highest BC count beyond 250
                  </li>
                  <li>
                    🏆 <strong>Tiebreaker:</strong> Virality (shares,
                    engagements)
                  </li>
                  <li>
                    🏆 <strong>Pro Tip:</strong> Embed clips in Reddit/Discord
                    for cross-platform K-factor boost
                  </li>
                </ul>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                <p className="text-foreground font-semibold mb-2">
                  💡 The Real Talk
                </p>
                <p className="text-muted-foreground mb-3">
                  We don't care if your video is cinematic perfection, a chaotic
                  15-second meme, a serious voice-over explainer, or anything
                  else.
                </p>
                <p className="text-muted-foreground">
                  <strong>You can follow the Kevin Hart script exactly, twist it,
                  ignore it completely, or create something totally different.</strong> Style,
                  length, and aesthetics are irrelevant. Only real completions
                  count. More BCs = you win bigger. Simple as that.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Changes based on auth state */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : user ? (
          <CreatorNextSteps />
        ) : (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Create & Win?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Sign up to get your unique referral link and start tracking BCs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-lg"
                onClick={() => setShowSignupModal(true)}
              >
                Join the Contest
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14"
                onClick={() => window.open("https://www.instagram.com/iamblessedaf", "_blank")}
              >
                Follow @IamBlessedAF
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-8">
              Questions? DM @JoeDaVincy or reply to any email. Let's engineer some viral
              gratitude! 🚀
            </p>
          </motion.div>
        )}
      </section>

      {/* Signup Modal */}
      <CreatorSignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSuccess={() => setShowSignupModal(false)}
      />
    </div>
  );
};

export default AIVideoContest;
