import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Eye, Check, Clock, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import NominationCountdown from "./NominationCountdown";

interface Nomination {
  id: string;
  recipient_name: string;
  status: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

/**
 * NominationStatusTracker — Real-time status of your nominations.
 * Phase 1: Retention loop — users come back to check if nominees accepted.
 */
export default function NominationStatusTracker() {
  const { user } = useAuth();
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNominations = async () => {
      const { data } = await supabase
        .from("nominations")
        .select("id, recipient_name, status, expires_at, accepted_at, created_at")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      setNominations((data as Nomination[]) || []);
      setLoading(false);
    };

    fetchNominations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("my-nominations")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "nominations",
          filter: `sender_id=eq.${user.id}`,
        },
        (payload) => {
          setNominations((prev) =>
            prev.map((n) =>
              n.id === payload.new.id ? { ...n, ...payload.new } : n
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Send className="w-3.5 h-3.5 text-muted-foreground" />;
      case "delivered":
        return <Check className="w-3.5 h-3.5 text-blue-500" />;
      case "opened":
        return <Eye className="w-3.5 h-3.5 text-amber-500" />;
      case "accepted":
        return <Check className="w-3.5 h-3.5 text-primary" />;
      case "expired":
        return <X className="w-3.5 h-3.5 text-destructive" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "sent":
        return "Enviado";
      case "delivered":
        return "Entregado";
      case "opened":
        return "Abierto";
      case "accepted":
        return "¡Aceptado! ✅";
      case "expired":
        return "Expirado";
      default:
        return status;
    }
  };

  if (loading || nominations.length === 0) return null;

  const accepted = nominations.filter((n) => n.status === "accepted").length;
  const pending = nominations.filter((n) => ["sent", "delivered", "opened"].includes(n.status)).length;

  return (
    <motion.div
      className="bg-card border border-border/50 rounded-xl p-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" />
          Mis Nominaciones
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-primary font-bold">{accepted} aceptadas</span>
          {pending > 0 && (
            <span className="text-muted-foreground">· {pending} pendientes</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {nominations.slice(0, 10).map((nom) => (
          <div
            key={nom.id}
            className={`flex items-center justify-between p-2.5 rounded-lg border ${
              nom.status === "accepted"
                ? "bg-primary/5 border-primary/20"
                : nom.status === "expired"
                ? "bg-muted/30 border-border/30"
                : "bg-card border-border/40"
            }`}
          >
            <div className="flex items-center gap-2">
              {getStatusIcon(nom.status)}
              <span className="text-sm font-medium text-foreground">{nom.recipient_name}</span>
            </div>
            <div className="flex items-center gap-2">
              {["sent", "delivered", "opened"].includes(nom.status) && (
                <NominationCountdown expiresAt={nom.expires_at} variant="inline" />
              )}
              <span className={`text-xs font-medium ${
                nom.status === "accepted" ? "text-primary" : "text-muted-foreground"
              }`}>
                {getStatusLabel(nom.status)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {accepted >= 3 && (
        <div className="mt-3 p-2 bg-primary/10 rounded-lg text-center">
          <p className="text-xs font-bold text-primary">
            🎉 ¡Todos tus nominados aceptaron! +100 BC bonus
          </p>
        </div>
      )}
    </motion.div>
  );
}
