import { motion } from "framer-motion";
import { Gift, Instagram, Calendar } from "lucide-react";

const getNextFriday = () => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 5=Fri
  const daysUntilFriday = (5 - day + 7) % 7 || 7; // if today is Friday, show next Friday
  const nextFri = new Date(now);
  nextFri.setDate(now.getDate() + daysUntilFriday);
  return nextFri;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

const ClipCtaInfo = () => {
  const nextFriday = getNextFriday();
  const formattedDate = formatDate(nextFriday);

  return (
    <motion.div
      className="mb-12 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">
        🎬 Your Clip's Call to Action
      </h3>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Gift className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <p className="text-lg text-muted-foreground">
            <span className="text-foreground font-semibold">
              "Get this DOPE FREE Wristband
            </span>{" "}
            and get a chance to…"
          </p>
        </div>

        <div className="bg-primary/15 border border-primary/30 rounded-lg p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-primary" />
            <p className="text-sm text-primary font-semibold">{formattedDate}</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            🏆 Win $1,111 this Friday at 7PM EST
          </p>
        </div>

        <div className="flex items-start gap-3">
          <Instagram className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            Winner will be chosen <strong className="text-foreground">LIVE</strong> on{" "}
            <a
              href="https://www.instagram.com/iamblessedaf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-bold hover:underline"
            >
              @IamBlessedAF
            </a>{" "}
            Instagram account 🔴
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ClipCtaInfo;
