import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Heart, Users, Gift, Sparkles } from "lucide-react";

interface FeedEvent {
  id: number;
  text: string;
  icon: any;
  time: string;
}

const NAMES = [
  "Sarah", "Mike", "Emily", "Jordan", "Chris", "Ashley", "Taylor", "Alex",
  "Morgan", "Casey", "Jamie", "Riley", "Dakota", "Quinn", "Avery", "Cameron",
];
const STATES = ["TX", "CA", "NY", "FL", "OH", "IL", "PA", "GA", "NC", "MI"];
const EVENTS = [
  { template: (n: string, s: string) => `${n} from ${s} just blessed 3 friends 🎁`, icon: Gift },
  { template: (n: string, s: string) => `${n} from ${s} reached Gold Ambassador 🥇`, icon: Sparkles },
  { template: (n: string, s: string) => `${n} from ${s} donated 111 meals 🍽️`, icon: Heart },
  { template: (n: string, s: string) => `${n} from ${s} started a 7-day streak 🔥`, icon: Activity },
  { template: (n: string, s: string) => `${n} from ${s} just joined the community 🙌`, icon: Users },
];

function randomEvent(id: number): FeedEvent {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const state = STATES[Math.floor(Math.random() * STATES.length)];
  const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  const mins = Math.floor(Math.random() * 30) + 1;
  return {
    id,
    text: event.template(name, state),
    icon: event.icon,
    time: `${mins}m ago`,
  };
}

export default function PortalActivityFeed() {
  const [events, setEvents] = useState<FeedEvent[]>(() =>
    Array.from({ length: 8 }, (_, i) => randomEvent(i))
  );
  const idRef = useRef(8);

  // Add new event every 6s
  useEffect(() => {
    const interval = setInterval(() => {
      idRef.current += 1;
      setEvents((prev) => [randomEvent(idRef.current), ...prev.slice(0, 11)]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        Live Activity Feed
        <span className="ml-auto flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-normal">Live</span>
        </span>
      </h3>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        <AnimatePresence initial={false}>
          {events.map((evt) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -12, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2.5 py-2 border-b border-border/15 last:border-0"
            >
              <evt.icon className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs text-foreground flex-1">{evt.text}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">{evt.time}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
