import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TreePine, Users, Share2, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { recordShare } from "./ShareMilestoneTracker";

interface ChainData {
  total_nominations: number;
  total_acceptances: number;
  max_depth: number;
}

/**
 * GratitudeTree — Visual representation of your viral chain.
 * Phase 3: Gamifies the CHAIN — users want to grow their tree.
 * "Your gratitude tree has X branches across Y generations"
 */
export default function GratitudeTree() {
  const { user } = useAuth();
  const [chain, setChain] = useState<ChainData | null>(null);
  const [totalNominations, setTotalNominations] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      // Get the user's chain stats
      const { data: chains } = await supabase
        .from("nomination_chains")
        .select("total_nominations, total_acceptances, max_depth")
        .eq("root_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (chains && chains.length > 0) {
        setChain(chains[0] as ChainData);
      }

      // Get total nominations sent
      const { count } = await supabase
        .from("nominations")
        .select("*", { count: "exact", head: true })
        .eq("sender_id", user.id);

      setTotalNominations(count || 0);
    };

    fetch();
  }, [user]);

  const shareTree = async () => {
    const text = `🌳 My Gratitude Tree has ${totalNominations} branches!\n\nJoin the 11:11 Gratitude Challenge:\nhttps://iamblessedaf.com/challenge\n\n#1111GratitudeChallenge #IamBlessedAF`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "My Gratitude Tree", text });
        recordShare();
        toast.success("Shared! +15 BC 🪙");
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      recordShare();
      toast.success("Link copied! +15 BC 🪙");
    }
  };

  const branches = chain?.total_nominations || totalNominations;
  const generations = chain?.max_depth || 0;
  const accepted = chain?.total_acceptances || 0;

  // Visual tree levels
  const treeLevels = Math.min(generations + 1, 5);

  return (
    <motion.div
      className="bg-card border border-border/50 rounded-xl p-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <TreePine className="w-4 h-4 text-primary" />
          Your Gratitude Tree
        </h3>
        <Button variant="ghost" size="sm" onClick={shareTree} className="h-7 text-xs gap-1">
          <Share2 className="w-3 h-3" />
          Share
        </Button>
      </div>

      {/* Tree visualization */}
      <div className="flex flex-col items-center py-4">
        {/* Root (you) */}
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
          YOU
        </div>
        
        {/* Branches */}
        {treeLevels > 0 && (
          <div className="w-0.5 h-4 bg-primary/30" />
        )}
        
        {Array.from({ length: Math.min(treeLevels, 4) }).map((_, level) => (
          <div key={level} className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(level + 2, 5) }).map((_, node) => (
                <div
                  key={node}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold ${
                    node < (accepted > 0 ? Math.ceil(accepted / (level + 1)) : 0)
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted text-muted-foreground border border-border/50"
                  }`}
                >
                  {node < 3 ? "✓" : "·"}
                </div>
              ))}
            </div>
            {level < treeLevels - 1 && (
              <div className="w-0.5 h-3 bg-border/50" />
            )}
          </div>
        ))}

        {branches === 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Send your first nomination to plant your tree 🌱
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="text-center p-2 bg-muted/30 rounded-lg">
          <p className="text-lg font-black text-foreground">{branches}</p>
          <p className="text-[10px] text-muted-foreground">Branches</p>
        </div>
        <div className="text-center p-2 bg-muted/30 rounded-lg">
          <p className="text-lg font-black text-primary">{accepted}</p>
          <p className="text-[10px] text-muted-foreground">Accepted</p>
        </div>
        <div className="text-center p-2 bg-muted/30 rounded-lg">
          <p className="text-lg font-black text-foreground">{generations}</p>
          <p className="text-[10px] text-muted-foreground">Generations</p>
        </div>
      </div>

      {branches > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="w-3 h-3 text-primary" />
          <span>
            Your gratitude has reached <strong className="text-foreground">{branches}</strong> people
            {generations > 0 && <> across <strong className="text-foreground">{generations}</strong> generations</>}
          </span>
        </div>
      )}
    </motion.div>
  );
}
