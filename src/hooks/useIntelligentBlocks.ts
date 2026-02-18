import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface IntelligentBlock {
  id: string;
  name: string;
  category: string;
  component: string;
  used_in: string[];
  description: string;
  icon_name: string;
  live_value_query: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useIntelligentBlocks() {
  const qc = useQueryClient();

  const { data: blocks = [], isLoading } = useQuery<IntelligentBlock[]>({
    queryKey: ["intelligent-blocks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intelligent_blocks")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw new Error(error.message);
      return (data ?? []) as IntelligentBlock[];
    },
  });

  const updateBlock = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<IntelligentBlock> & { id: string }) => {
      const { error } = await supabase
        .from("intelligent_blocks")
        .update(updates)
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["intelligent-blocks"] });
      toast.success("Block updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createBlock = useMutation({
    mutationFn: async (block: Omit<IntelligentBlock, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase
        .from("intelligent_blocks")
        .insert(block);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["intelligent-blocks"] });
      toast.success("Block created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteBlock = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("intelligent_blocks")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["intelligent-blocks"] });
      toast.success("Block removed");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const duplicateBlock = useMutation({
    mutationFn: async (block: IntelligentBlock) => {
      const { id, created_at, updated_at, ...rest } = block;
      const { error } = await supabase
        .from("intelligent_blocks")
        .insert({ ...rest, name: `${rest.name} (Copy)` });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["intelligent-blocks"] });
      toast.success("Block duplicated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { blocks, isLoading, updateBlock, createBlock, deleteBlock, duplicateBlock };
}
