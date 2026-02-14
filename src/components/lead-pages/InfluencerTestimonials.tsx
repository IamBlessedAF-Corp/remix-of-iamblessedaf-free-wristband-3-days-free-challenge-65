import { motion } from "framer-motion";
import { Users, Instagram, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import joedavincyImg from "@/assets/testimonial-joedavincy.jpeg";
import davenmichaelsImg from "@/assets/testimonial-davenmichaels.jpeg";
import elpatronnImg from "@/assets/testimonial-elpatronn.jpeg";
import jefflernerImg from "@/assets/testimonial-jefflerner.jpeg";
import joedavincyProfileImg from "@/assets/joedavincy-profile.jpeg";

const INFLUENCERS = [
  {
    name: "Joe Da Vincy Cury",
    handle: "@joedavincy",
    followers: "322K",
    verified: true,
    title: "Growth Hacker × 7 Inc 5000 Companies",
    img: joedavincyImg,
    embedUrl: "https://www.instagram.com/p/CNaP-mCnhts/embed",
    quote: "This movement is about to change the game. The gratitude wristband isn't just merch — it's a conversation starter, a brand builder, and a lead magnet all in one.",
  },
  {
    name: "Daven Michaels",
    handle: "@davenmichaels",
    followers: "1M",
    verified: false,
    title: "NY Times Best Selling Author · Founder #123Employee",
    img: davenmichaelsImg,
    embedUrl: "https://www.instagram.com/tv/CNaUL6wJ1ib/embed",
    quote: "I've seen thousands of marketing strategies. This one stands out because it leads with genuine value — a real gift that creates real reciprocity. Brilliant execution.",
  },
  {
    name: "Rudy Treminio",
    handle: "@elpatronn10x",
    followers: "990K",
    verified: true,
    title: "Entrepreneur · CEO · Author",
    img: elpatronnImg,
    embedUrl: "https://www.instagram.com/tv/CNaUL6wJ1ib/embed",
    quote: "If there's money to be made, I can sell it — but this? This SELLS ITSELF. You gift the wristband, the gratitude does the selling for you. My team went crazy with this.",
  },
  {
    name: "Jeff Lerner",
    handle: "@jefflernerofficial",
    followers: "104K",
    verified: true,
    title: "Digital Entrepreneur · Educator",
    img: jefflernerImg,
    embedUrl: "https://www.instagram.com/p/CNaP-mCnhts/embed",
    quote: "The principle is simple: give first, build trust, then the business follows. This strategy is the physical embodiment of that principle at scale.",
  },
];

const InfluencerTestimonials = () => {
  return (
    <section className="max-w-3xl mx-auto px-4 py-14">
      {/* ─── Strategist Positioning ─── */}
      <motion.div
        className="bg-card border border-border/40 rounded-2xl p-5 mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-4">
          <img
            src={joedavincyProfileImg}
            alt="Joe Da Vincy — Marketing Strategist"
            className="w-20 h-20 rounded-full object-cover border-2 border-primary/30 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Your Marketing Strategist</span>
            </div>
            <p className="text-base font-bold text-foreground">Joe Da Vincy</p>
            <p className="text-sm text-muted-foreground leading-snug">
              Marketing Strategist for <strong className="text-foreground">7 Inc 5000 Companies</strong> & hundreds of influencers. The same proven system Inc 5000 companies paid <strong className="text-foreground">$25,000</strong> for — valued at <strong className="text-primary">$9,700</strong> — yours FREE.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <Instagram className="w-3 h-3 inline mr-1" />@joedavincy · <span className="font-semibold text-foreground">322K</span> followers
            </p>
          </div>
        </div>
      </motion.div>

      <div className="text-center mb-10">
        <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 text-xs font-bold">
          <Users className="w-3 h-3 mr-1" /> ENDORSED BY INDUSTRY LEADERS
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Trusted by <span className="text-primary">2M+ Combined Followers</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Top entrepreneurs and growth hackers are already using this strategy.
        </p>
      </div>

      <div className="space-y-6">
        {INFLUENCERS.map((inf, i) => (
          <motion.div
            key={i}
            className="bg-card border border-border/40 rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            {/* Instagram profile screenshot */}
            <div className="relative">
              <img
                src={inf.img}
                alt={`${inf.name} Instagram profile`}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
            </div>

            {/* Quote */}
            <div className="px-5 pb-4 -mt-2 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Instagram className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-bold text-foreground">{inf.name}</span>
                {inf.verified && (
                  <span className="text-[10px] text-primary">✓ Verified</span>
                )}
                <span className="text-[10px] text-muted-foreground ml-auto">{inf.followers} followers</span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed italic mb-4">
                "{inf.quote}"
              </p>
            </div>

            {/* Embedded Instagram video */}
            <div className="px-5 pb-5">
              <div className="rounded-xl overflow-hidden border border-border/30">
                <iframe
                  src={inf.embedUrl}
                  className="w-full border-0"
                  style={{ minHeight: "480px" }}
                  loading="lazy"
                  allowTransparency
                  allow="encrypted-media"
                  title={`${inf.name} video testimonial`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default InfluencerTestimonials;
