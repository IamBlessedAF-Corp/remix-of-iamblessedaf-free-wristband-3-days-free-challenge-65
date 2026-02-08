import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PipelineMode = "clarify" | "execute" | "validate" | "full";

interface ExecutionState {
  isRunning: boolean;
  currentCardId: string | null;
  currentCardTitle: string | null;
  currentMode: PipelineMode | null;
  currentPhase: string | null; // e.g. "clarify (2/5)"
  processedCount: number;
  error: string | null;
}

export function useAutoExecute(onRefetch: () => void) {
  const [state, setState] = useState<ExecutionState>({
    isRunning: false,
    currentCardId: null,
    currentCardTitle: null,
    currentMode: null,
    currentPhase: null,
    processedCount: 0,
    error: null,
  });
  const abortRef = useRef(false);

  const stop = useCallback(() => {
    abortRef.current = true;
    setState((s) => ({ ...s, isRunning: false }));
  }, []);

  /** Run a single mode on a single column until empty */
  const runPhase = useCallback(
    async (
      columnId: string,
      mode: "clarify" | "execute" | "validate",
      phaseLabel: string
    ): Promise<number> => {
      let processed = 0;

      while (!abortRef.current) {
        setState((s) => ({ ...s, currentPhase: `${phaseLabel} (${processed})` }));

        try {
          const { data, error } = await supabase.functions.invoke("process-board-task", {
            body: { source_column_id: columnId, mode },
          });

          if (error) {
            const msg = error.message || "Edge function error";
            toast.error(msg);
            throw new Error(msg);
          }

          if (data?.error) {
            toast.error(data.error);
            throw new Error(data.error);
          }

          if (data?.done) {
            onRefetch();
            break;
          }

          processed++;
          setState((s) => ({
            ...s,
            currentCardId: data.processed_card_id,
            currentCardTitle: data.card_title || null,
            processedCount: s.processedCount + 1,
          }));

          const icon = mode === "clarify" ? "💡" : mode === "validate" ? "🔍" : "⚡";

          if (data.skipped) {
            toast.info(`${icon} Skipped: ${data.card_title || "card"}`);
          } else if (mode === "clarify" && data.relevant === false) {
            toast.warning(`${icon} Not relevant: ${data.card_title || "card"}`);
          } else if (mode === "validate" && data.validation_status === "fail") {
            toast.error(`${icon} Failed validation: ${data.card_title || "card"}`);
          } else {
            toast.success(`${icon} ${phaseLabel}: ${data.card_title || "card"}`);
          }

          onRefetch();
          await new Promise((r) => setTimeout(r, 1500));
        } catch {
          break;
        }
      }

      return processed;
    },
    [onRefetch]
  );

  /** Execute a single mode or the full pipeline */
  const execute = useCallback(
    async (sourceColumnId: string, mode: PipelineMode = "execute", columnMap?: Record<string, string>) => {
      abortRef.current = false;
      setState({
        isRunning: true,
        currentCardId: null,
        currentCardTitle: null,
        currentMode: mode,
        currentPhase: null,
        processedCount: 0,
        error: null,
      });

      try {
        if (mode === "full" && columnMap) {
          // Full pipeline: Clarify → Execute → Validate
          const clarifyCol = columnMap.clarify;
          const executeCol = columnMap.execute;
          const validateCol = columnMap.validate;

          if (clarifyCol && !abortRef.current) {
            setState((s) => ({ ...s, currentPhase: "Phase 1: Clarify" }));
            await runPhase(clarifyCol, "clarify", "Clarify");
          }

          if (executeCol && !abortRef.current) {
            setState((s) => ({ ...s, currentPhase: "Phase 2: Execute" }));
            await runPhase(executeCol, "execute", "Execute");
          }

          if (validateCol && !abortRef.current) {
            setState((s) => ({ ...s, currentPhase: "Phase 3: Validate" }));
            await runPhase(validateCol, "validate", "Validate");
          }

          if (!abortRef.current) {
            toast.success("🎯 Full pipeline complete!");
          }
        } else {
          // Single mode
          await runPhase(sourceColumnId, mode as "clarify" | "execute" | "validate", mode);
          if (!abortRef.current) {
            toast.success(`✅ ${mode} phase complete`);
          }
        }
      } catch (err: any) {
        setState((s) => ({ ...s, error: err?.message || "Unknown error" }));
      }

      setState((s) => ({
        ...s,
        isRunning: false,
        currentCardId: null,
        currentCardTitle: null,
        currentPhase: null,
      }));
    },
    [runPhase]
  );

  return { ...state, execute, stop };
}
