import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    q: "How do I get paid?",
    a: "Submit your clip link through your dashboard. Once we verify the view count from your platform's public analytics, your earnings are added to your balance. Payouts are processed weekly — you choose your payout method during onboarding.",
  },
  {
    q: "What counts as a valid clip?",
    a: "Any short-form video (TikTok, Reels, Shorts) that uses content from our vault or follows the gratitude × neuroscience theme. The clip must be posted publicly on your account. Reposts, private videos, and videos with manipulated view counts don't qualify.",
  },
  {
    q: "When do bonuses pay out?",
    a: "Bonuses are one-time payouts triggered when your cumulative lifetime views cross a milestone (100k → $111, 500k → $444, 1M → $1,111). They're processed in the next weekly payout cycle after you hit the threshold. Views never reset — they stack across all your clips.",
  },
  {
    q: "Is there a minimum follower count?",
    a: "No. Zero follower requirements. If your clip gets views, you get paid. The system is based on performance, not popularity.",
  },
  {
    q: "How are views verified?",
    a: "We use the public view count shown on each platform (TikTok, Instagram, YouTube). No third-party tools, no inflated numbers. What the platform shows is what counts.",
  },
  {
    q: "What's the $22 cap per clip?",
    a: "Each individual clip pays $0.22 per 1,000 views up to a maximum of $22 per clip (roughly 100k views). This keeps the system sustainable while rewarding consistent posting over single viral hits. Bonus milestones reward your total volume on top of per-clip pay.",
  },
  {
    q: "How does payout verification work?",
    a: "Every clip goes through a lightweight verification step to ensure fair payouts for all creators. We check the public view count on your platform and confirm the clip meets our content guidelines. Most clips are approved within 24 hours. If a clip needs extra review, we'll let you know — no surprises, no penalties for honest work.",
  },
];

const ClipperFaq = () => (
  <motion.section
    className="px-4 py-10 max-w-3xl mx-auto"
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
  >
    <h2 className="text-2xl font-bold mb-1">Frequently Asked Questions</h2>
    <p className="text-sm text-muted-foreground mb-5">
      Straight answers — no fine print.
    </p>

    <Accordion type="multiple" className="space-y-2">
      {faqs.map((faq, i) => (
        <AccordionItem
          key={i}
          value={`faq-${i}`}
          className="bg-card border border-border/50 rounded-xl px-5 data-[state=open]:border-primary/30"
        >
          <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-4">
            {faq.q}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
            {faq.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </motion.section>
);

export default ClipperFaq;
