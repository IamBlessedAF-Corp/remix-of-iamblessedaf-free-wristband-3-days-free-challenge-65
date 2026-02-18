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

// Use untyped access since roadmap_completions is new and not yet in generated types
const from = (table: string) => supabase.from(table as "board_columns");

export function useRoadmapCompletions() {
  const qc = useQueryClient();

  const { data: completions = [] } = useQuery<RoadmapCompletion[]>({
    queryKey: ["roadmap-completions"],
    queryFn: async () => {
      const { data, error } = await (from("roadmap_completions") as unknown as { select: (cols: string) => Promise<{ data: RoadmapCompletion[] | null; error: { message: string } | null }> }).select("*");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const completedSet = new Set(completions.map((c) => `${c.phase}::${c.item_title}`));

  const markDone = useMutation({
    mutationFn: async ({ title, phase }: { title: string; phase: string }) => {
      const { error } = await (from("roadmap_completions") as unknown as { insert: (row: Record<string, string>) => Promise<{ error: { message: string } | null }> }).insert({ item_title: title, phase });
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
      const { error } = await (from("roadmap_completions") as unknown as { delete: () => { eq: (col: string, val: string) => { eq: (col: string, val: string) => Promise<{ error: { message: string } | null }> } } }).delete().eq("item_title", title).eq("phase", phase);
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
