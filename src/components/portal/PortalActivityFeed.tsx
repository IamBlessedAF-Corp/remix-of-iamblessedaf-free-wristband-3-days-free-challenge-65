import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Heart, Users, Gift, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FeedEvent {
  id: string;
  text: string;
  iconName: string;
  time: string;
  isReal: boolean;
}

// ── Icon resolver ──
const ICON_MAP: Record<string, any> = {
  gift: Gift,
  sparkles: Sparkles,
  heart: Heart,
  activity: Activity,
  users: Users,
};

function getIcon(name: string) {
  return ICON_MAP[name] || Activity;
}

// ── Simulated events (fallback until real volume) ──
const NAMES = [
  "Sarah", "Mike", "Emily", "Jordan", "Chris", "Ashley", "Taylor", "Alex",
  "Morgan", "Casey", "Jamie", "Riley", "Dakota", "Quinn", "Avery", "Cameron",
];
const STATES = ["TX", "CA", "NY", "FL", "OH", "IL", "PA", "GA", "NC", "MI"];
const SIM_EVENTS = [
  { template: (n: string, s: string) => `${n} from ${s} just blessed 3 friends 🎁`, icon: "gift" },
  { template: (n: string, s: string) => `${n} from ${s} reached Gold Ambassador 🥇`, icon: "sparkles" },
  { template: (n: string, s: string) => `${n} from ${s} donated 111 meals 🍽️`, icon: "heart" },
  { template: (n: string, s: string) => `${n} from ${s} started a 7-day streak 🔥`, icon: "activity" },
  { template: (n: string, s: string) => `${n} from ${s} just joined the community 🙌`, icon: "users" },
];

let simCounter = 0;
function generateSimEvent(): FeedEvent {
  simCounter += 1;
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const state = STATES[Math.floor(Math.random() * STATES.length)];
  const event = SIM_EVENTS[Math.floor(Math.random() * SIM_EVENTS.length)];
  const mins = Math.floor(Math.random() * 30) + 1;
  return {
    id: `sim-${simCounter}`,
    text: event.template(name, state),
    iconName: event.icon,
    time: `${mins}m ago`,
    isReal: false,
  };
}

function formatTimeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const MIN_FEED_SIZE = 8;

export default function PortalActivityFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const realCountRef = useRef(0);

  // ── Load initial real events + pad with simulated ──
  useEffect(() => {
    async function loadInitial() {
      const { data } = await supabase
        .from("portal_activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12);

      const realEvents: FeedEvent[] = (data ?? []).map((row: any) => ({
        id: row.id,
        text: row.display_text,
        iconName: row.icon_name,
        time: formatTimeAgo(new Date(row.created_at)),
        isReal: true,
      }));

      realCountRef.current = realEvents.length;

      // Pad with simulated events if not enough real ones
      const simNeeded = Math.max(0, MIN_FEED_SIZE - realEvents.length);
      const simEvents = Array.from({ length: simNeeded }, () => generateSimEvent());

      setEvents([...realEvents, ...simEvents]);
    }

    loadInitial();
  }, []);

  // ── Realtime subscription for new events ──
  useEffect(() => {
    const channel = supabase
      .channel("portal-activity-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "portal_activity" },
        (payload) => {
          const row = payload.new as any;
          const newEvent: FeedEvent = {
            id: row.id,
            text: row.display_text,
            iconName: row.icon_name,
            time: "just now",
            isReal: true,
          };
          realCountRef.current += 1;
          setEvents((prev) => [newEvent, ...prev.slice(0, 11)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Simulated drip: add a fake event every 8s only if real count < MIN ──
  useEffect(() => {
    const interval = setInterval(() => {
      if (realCountRef.current < MIN_FEED_SIZE) {
        setEvents((prev) => [generateSimEvent(), ...prev.slice(0, 11)]);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // ── Update relative times every 30s ──
  useEffect(() => {
    const interval = setInterval(() => {
      setEvents((prev) =>
        prev.map((evt) =>
          evt.isReal ? evt : { ...evt, time: `${Math.floor(Math.random() * 30) + 1}m ago` }
        )
      );
    }, 30000);
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
          {events.map((evt) => {
            const IconComp = getIcon(evt.iconName);
            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: -12, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2.5 py-2 border-b border-border/15 last:border-0"
              >
                <IconComp className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs text-foreground flex-1">{evt.text}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{evt.time}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
