import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RoadmapCompletion {
  id: string;
  item_title: string;
  phase: string;
  completed_at: string;
  completed_by: string | null;
}

export function useRoadmapCompletions() {
  const qc = useQueryClient();

  const { data: completions = [] } = useQuery<RoadmapCompletion[]>({
    queryKey: ["roadmap-completions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmap_completions")
        .select("*");
      if (error) throw new Error(error.message);
      return (data ?? []) as RoadmapCompletion[];
    },
  });

  const completedSet = new Set(completions.map((c) => `${c.phase}::${c.item_title}`));

  const markDone = useMutation({
    mutationFn: async ({ title, phase }: { title: string; phase: string }) => {
      const { error } = await supabase
        .from("roadmap_completions")
        .insert({ item_title: title, phase });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["roadmap-completions"] });
      toast.success(`✅ "${vars.title}" marked as done!`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const unmarkDone = useMutation({
    mutationFn: async ({ title, phase }: { title: string; phase: string }) => {
      const { error } = await supabase
        .from("roadmap_completions")
        .delete()
        .eq("item_title", title)
        .eq("phase", phase);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["roadmap-completions"] });
      toast.success(`↩️ "${vars.title}" unmarked`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const isCompleted = (phase: string, title: string) => completedSet.has(`${phase}::${title}`);

  return { completions, isCompleted, markDone, unmarkDone };
}
