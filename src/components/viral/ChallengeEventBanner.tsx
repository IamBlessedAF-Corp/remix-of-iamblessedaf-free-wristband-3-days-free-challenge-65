import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChallengeEvent {
  id: string;
  name: string;
  description: string | null;
  theme: string | null;
  ends_at: string;
  prize_description: string | null;
}

/**
 * ChallengeEventBanner — Shows active seasonal challenge events.
 * Phase 3: Monthly themed challenges reset K-factor decay with novelty.
 */
export default function ChallengeEventBanner() {
  const [event, setEvent] = useState<ChallengeEvent | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("challenge_events")
        .select("*")
        .eq("status", "active" as any)
        .order("ends_at", { ascending: true })
        .limit(1);

      if (data && data.length > 0) {
        setEvent(data[0] as ChallengeEvent);
      }
    };

    fetch();
  }, []);

  useEffect(() => {
    if (!event) return;

    const update = () => {
      const diff = new Date(event.ends_at).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("¡Terminado!");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setTimeLeft(`${days}d ${hours}h restantes`);
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [event]);

  if (!event) return null;

  return (
    <motion.div
      className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{event.name}</h3>
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          {event.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {timeLeft}
            </span>
            {event.prize_description && (
              <span className="text-xs font-bold text-primary">
                🏆 {event.prize_description}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
