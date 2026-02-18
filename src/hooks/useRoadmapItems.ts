import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PHASE_NEXT_STEPS } from "@/data/roadmapNextSteps";
import { toast } from "sonner";

export interface RoadmapItem {
  id: string;
  phase: string;
  title: string;
  detail: string;
  priority: string;
  prompt: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useRoadmapItems() {
  const qc = useQueryClient();

  const { data: dbItems = [], isLoading } = useQuery<RoadmapItem[]>({
    queryKey: ["roadmap-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roadmap_items")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw new Error(error.message);
      return (data ?? []) as RoadmapItem[];
    },
  });

  // Merge: DB items take priority, static file fills gaps
  const mergedItems = (() => {
    if (dbItems.length > 0) return dbItems;

    // Fallback to static file if DB is empty (seed scenario)
    const staticItems: Omit<RoadmapItem, "id" | "created_at" | "updated_at">[] = [];
    let order = 0;
    for (const [phase, items] of Object.entries(PHASE_NEXT_STEPS)) {
      for (const item of items) {
        staticItems.push({
          phase,
          title: item.title,
          detail: item.detail,
          priority: item.priority,
          prompt: item.prompt || null,
          sort_order: order++,
          is_active: true,
        });
      }
    }
    return staticItems as RoadmapItem[];
  })();

  // Group by phase
  const byPhase = mergedItems.reduce<Record<string, RoadmapItem[]>>((acc, item) => {
    if (!acc[item.phase]) acc[item.phase] = [];
    acc[item.phase].push(item);
    return acc;
  }, {});

  const seedFromStatic = useMutation({
    mutationFn: async () => {
      const items: any[] = [];
      let order = 0;
      for (const [phase, phaseItems] of Object.entries(PHASE_NEXT_STEPS)) {
        for (const item of phaseItems) {
          items.push({
            phase,
            title: item.title,
            detail: item.detail,
            priority: item.priority,
            prompt: item.prompt || null,
            sort_order: order++,
            is_active: true,
          });
        }
      }
      const { error } = await supabase.from("roadmap_items").insert(items);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roadmap-items"] });
      toast.success("Roadmap seeded from static file");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RoadmapItem> & { id: string }) => {
      const { error } = await supabase.from("roadmap_items").update(updates).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roadmap-items"] });
      toast.success("Item updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("roadmap_items").update({ is_active: false }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roadmap-items"] });
      toast.success("Item removed");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const addItem = useMutation({
    mutationFn: async (item: Omit<RoadmapItem, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("roadmap_items").insert(item);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roadmap-items"] });
      toast.success("Item added");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    items: mergedItems,
    byPhase,
    isLoading,
    isFromDb: dbItems.length > 0,
    seedFromStatic,
    updateItem,
    deleteItem,
    addItem,
  };
}
