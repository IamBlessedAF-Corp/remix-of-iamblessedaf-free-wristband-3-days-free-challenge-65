import { motion } from "framer-motion";
import { ExternalLink, Play, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import joedavincyImg from "@/assets/testimonial-joedavincy.jpeg";
import davenmichaelsImg from "@/assets/testimonial-davenmichaels.jpeg";
import elpatronnImg from "@/assets/testimonial-elpatronn.jpeg";
import jefflernerImg from "@/assets/testimonial-jefflerner.jpeg";

const INFLUENCERS = [
  {
    name: "Joe Da Vincy Cury",
    handle: "@joedavincy",
    followers: "322K",
    title: "Growth Hacker × 7 Inc 5000 Companies",
    img: joedavincyImg,
    videoUrl: "https://www.instagram.com/p/CNaP-mCnhts",
    quote: "This movement is about to change the game. The gratitude wristband isn't just merch — it's a conversation starter, a brand builder, and a lead magnet all in one.",
  },
  {
    name: "Daven Michaels",
    handle: "@davenmichaels",
    followers: "1M",
    title: "NY Times Best Selling Author · Founder #123Employee",
    img: davenmichaelsImg,
    videoUrl: "https://www.instagram.com/tv/CNaUL6wJ1ib/",
    quote: "I've seen thousands of marketing strategies. This one stands out because it leads with genuine value — a real gift that creates real reciprocity. Brilliant execution.",
  },
  {
    name: "Rudy Treminio",
    handle: "@elpatronn10x",
    followers: "990K",
    title: "Entrepreneur · CEO · Author",
    img: elpatronnImg,
    videoUrl: "https://www.instagram.com/tv/CNaUL6wJ1ib/",
    quote: "If there's money to be made, I can sell it — but this? This SELLS ITSELF. You gift the wristband, the gratitude does the selling for you. My team went crazy with this.",
  },
  {
    name: "Jeff Lerner",
    handle: "@jefflernerofficial",
    followers: "104K",
    title: "Digital Entrepreneur · Educator",
    img: jefflernerImg,
    videoUrl: "https://www.instagram.com/p/CNaP-mCnhts",
    quote: "The principle is simple: give first, build trust, then the business follows. This wristband strategy is the physical embodiment of that principle at scale.",
  },
];

const InfluencerTestimonials = () => {
  return (
    <section className="max-w-3xl mx-auto px-4 py-14">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
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

        <div className="grid md:grid-cols-2 gap-4">
          {INFLUENCERS.map((inf, i) => (
            <motion.a
              key={i}
              href={inf.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card border border-border/40 rounded-2xl p-4 hover:border-primary/30 transition-all hover:shadow-lg block"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={inf.img}
                  alt={inf.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{inf.name}</p>
                  <p className="text-[10px] text-primary font-semibold">{inf.handle} · {inf.followers} followers</p>
                  <p className="text-[10px] text-muted-foreground truncate">{inf.title}</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed italic mb-3">
                "{inf.quote}"
              </p>

              <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-wider group-hover:underline">
                <Play className="w-3 h-3" />
                Watch Video Testimonial
                <ExternalLink className="w-3 h-3 ml-auto opacity-50 group-hover:opacity-100" />
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default InfluencerTestimonials;
