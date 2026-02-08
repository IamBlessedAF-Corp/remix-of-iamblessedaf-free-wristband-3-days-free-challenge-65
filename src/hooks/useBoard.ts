import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BoardColumn {
  id: string;
  name: string;
  position: number;
  color: string;
  created_at: string;
}

export interface BoardCard {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  master_prompt: string | null;
  position: number;
  priority: string;
  staging_status: string;
  logs: string | null;
  summary: string | null;
  preview_link: string | null;
  labels: string[];
  screenshots: string[];
  stage: string;
  completed_at: string | null;
  vs_score: number;
  cc_score: number;
  hu_score: number;
  r_score: number;
  ad_score: number;
  delegation_score: number;
  created_at: string;
  updated_at: string;
}

// Helper to cast table names for new tables not yet in generated types
const from = (table: string) => supabase.from(table as any);

export function useBoard() {
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [cards, setCards] = useState<BoardCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    const [colRes, cardRes] = await Promise.all([
      from("board_columns").select("*").order("position"),
      from("board_cards").select("*").order("position"),
    ]);
    if (colRes.data) setColumns(colRes.data as unknown as BoardColumn[]);
    if (cardRes.data) setCards(cardRes.data as unknown as BoardCard[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const moveCard = async (cardId: string, newColumnId: string, newPosition: number) => {
    // Check if we're moving to the Done column
    const doneCol = columns.find((c) => c.name.includes("✅ Done"));
    const isDone = doneCol?.id === newColumnId;
    const completedAt = isDone ? new Date().toISOString() : undefined;

    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? { ...c, column_id: newColumnId, position: newPosition, ...(isDone ? { completed_at: completedAt! } : {}) }
          : c
      )
    );

    const updatePayload: Record<string, any> = {
      column_id: newColumnId,
      position: newPosition,
    };
    if (isDone) updatePayload.completed_at = completedAt;

    await (from("board_cards") as any).update(updatePayload).eq("id", cardId);
  };

  const updateCard = async (cardId: string, updates: Partial<BoardCard>) => {
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, ...updates } : c)));
    await (from("board_cards") as any).update(updates).eq("id", cardId);
  };

  const createCard = async (card: Partial<BoardCard>) => {
    const { data } = await (from("board_cards") as any).insert(card).select().single();
    if (data) setCards((prev) => [...prev, data as BoardCard]);
    return data;
  };

  const deleteCard = async (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    await (from("board_cards") as any).delete().eq("id", cardId);
  };

  return { columns, cards, loading, moveCard, updateCard, createCard, deleteCard, refetch: fetchBoard };
}
