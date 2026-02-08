import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExecutionState {
  isRunning: boolean;
  currentCardId: string | null;
  currentCardTitle: string | null;
  processedCount: number;
  error: string | null;
}

export function useAutoExecute(onRefetch: () => void) {
  const [state, setState] = useState<ExecutionState>({
    isRunning: false,
    currentCardId: null,
    currentCardTitle: null,
    processedCount: 0,
    error: null,
  });
  const abortRef = useRef(false);

  const stop = useCallback(() => {
    abortRef.current = true;
    setState((s) => ({ ...s, isRunning: false }));
  }, []);

  const execute = useCallback(
    async (sourceColumnId: string) => {
      abortRef.current = false;
      setState({
        isRunning: true,
        currentCardId: null,
        currentCardTitle: null,
        processedCount: 0,
        error: null,
      });

      let processed = 0;

      while (!abortRef.current) {
        try {
          const { data, error } = await supabase.functions.invoke("process-board-task", {
            body: { source_column_id: sourceColumnId },
          });

          if (error) {
            const msg = error.message || "Edge function error";
            setState((s) => ({ ...s, isRunning: false, error: msg }));
            toast.error(msg);
            break;
          }

          if (data?.error) {
            setState((s) => ({ ...s, isRunning: false, error: data.error }));
            toast.error(data.error);
            break;
          }

          // No more cards
          if (data?.done) {
            setState((s) => ({
              ...s,
              isRunning: false,
              currentCardId: null,
              currentCardTitle: null,
            }));
            toast.success(`Auto-execute complete — ${processed} cards processed`);
            onRefetch();
            break;
          }

          // Card processed
          processed++;
          setState((s) => ({
            ...s,
            currentCardId: data.processed_card_id,
            currentCardTitle: data.card_title || null,
            processedCount: processed,
          }));

          if (data.skipped) {
            toast.info(`Skipped: ${data.card_title || "card"} (no master prompt)`);
          } else {
            toast.success(`Processed: ${data.card_title || "card"}`);
          }

          onRefetch();

          // Small delay between cards
          await new Promise((r) => setTimeout(r, 1000));
        } catch (err: any) {
          const msg = err?.message || "Unknown error";
          setState((s) => ({ ...s, isRunning: false, error: msg }));
          toast.error(msg);
          break;
        }
      }

      setState((s) => ({ ...s, isRunning: false }));
    },
    [onRefetch]
  );

  return { ...state, execute, stop };
}
