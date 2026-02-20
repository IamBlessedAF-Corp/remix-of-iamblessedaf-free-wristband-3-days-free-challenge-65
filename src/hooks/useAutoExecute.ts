import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PipelineMode = "clarify" | "execute" | "validate" | "sixsigma" | "full";

const PHASE_ICONS: Record<string, string> = {
  clarify: "💡",
  execute: "⚡",
  validate: "🔍",
  sixsigma: "🔬",
};

const PHASE_LABELS: Record<string, string> = {
  clarify: "Clarify",
  execute: "Execute",
  validate: "Validate",
  sixsigma: "Six Sigma",
};

interface ExecutionState {
  isRunning: boolean;
  currentCardId: string | null;
  currentCardTitle: string | null;
  currentMode: PipelineMode | null;
  currentPhase: string | null;
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

  /** Note: proof screenshots are now uploaded manually by the user, not auto-captured */

  /** Invoke a single phase on a single card by ID */
  const runSinglePhase = useCallback(
    async (cardId: string, mode: string): Promise<{ ok: boolean; data: any }> => {
      try {
        const { data, error } = await supabase.functions.invoke("process-board-task", {
          body: { card_id: cardId, mode },
        });

        if (error) {
          toast.error(error.message || "Edge function error");
          return { ok: false, data: null };
        }

        if (data?.error) {
          toast.error(data.error);
          return { ok: false, data };
        }

        // Proof screenshots are now uploaded manually — no auto-capture

        return { ok: true, data };
      } catch (e: any) {
        toast.error(e?.message || "Unknown error");
        return { ok: false, data: null };
      }
    },
    []
  );

  /** Run a single mode on a column until empty (batch mode for individual phases) */
  const runPhase = useCallback(
    async (
      columnId: string,
      mode: "clarify" | "execute" | "validate" | "sixsigma",
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
            toast.error(error.message || "Edge function error");
            throw new Error(error.message);
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

          const icon = PHASE_ICONS[mode] || "⚡";

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

  /** Full pipeline: process ONE card end-to-end through all 4 phases before moving to the next */
  const runFullPipelineE2E = useCallback(
    async (sourceColumnId: string) => {
      const phases: Array<"clarify" | "execute" | "validate" | "sixsigma"> = [
        "clarify",
        "execute",
        "validate",
        "sixsigma",
      ];
      let cardIndex = 0;

      while (!abortRef.current) {
        // 1. Pick the next card from the source column
        const { data: pickData, error: pickError } = await supabase.functions.invoke(
          "process-board-task",
          { body: { source_column_id: sourceColumnId, mode: "clarify" } }
        );

        if (pickError) {
          toast.error(pickError.message || "Edge function error");
          break;
        }

        if (pickData?.error) {
          toast.error(pickData.error);
          break;
        }

        if (pickData?.done) {
          onRefetch();
          break; // No more cards in source column
        }

        const cardId = pickData.processed_card_id;
        const cardTitle = pickData.card_title || "card";
        cardIndex++;

        setState((s) => ({
          ...s,
          currentCardId: cardId,
          currentCardTitle: cardTitle,
          currentPhase: `Card ${cardIndex}: Clarify`,
          processedCount: s.processedCount + 1,
        }));

        // Show clarify result
        if (pickData.relevant === false) {
          toast.warning(`💡 Not relevant: ${cardTitle}`);
          onRefetch();
          await new Promise((r) => setTimeout(r, 1500));
          continue; // Skip remaining phases for irrelevant cards
        }

        if (pickData.skipped) {
          toast.info(`💡 Skipped: ${cardTitle}`);
        } else {
          toast.success(`💡 Clarify [${cardIndex}]: ${cardTitle}`);
        }

        onRefetch();
        await new Promise((r) => setTimeout(r, 2000));

        // 2. Run remaining phases (execute, validate, sixsigma) on this specific card
        let cardFailed = false;
        for (let i = 1; i < phases.length; i++) {
          if (abortRef.current) break;

          const phase = phases[i];
          const label = PHASE_LABELS[phase];
          const icon = PHASE_ICONS[phase];

          setState((s) => ({
            ...s,
            currentPhase: `Card ${cardIndex}: ${label}`,
          }));

          const { ok, data } = await runSinglePhase(cardId, phase);

          if (!ok) {
            cardFailed = true;
            toast.error(`${icon} ${label} failed for: ${cardTitle}`);
            break;
          }

          if (data?.skipped) {
            toast.info(`${icon} Skipped ${label}: ${cardTitle}`);
          } else if (phase === "validate" && data?.validation_status === "fail") {
            toast.error(`${icon} Failed validation: ${cardTitle} → routed to Errors`);
            cardFailed = true;
            break; // Don't run Six Sigma on failed validation
          } else if (phase === "sixsigma" && data?.passed === false) {
            toast.warning(`${icon} Six Sigma blocked (${data.score}%): ${cardTitle}`);
          } else {
            toast.success(`${icon} ${label} [${cardIndex}]: ${cardTitle}`);
          }

          onRefetch();
          await new Promise((r) => setTimeout(r, 2000));
        }

        if (cardFailed) {
          onRefetch();
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    },
    [onRefetch, runSinglePhase]
  );

  /** Sweep: run validate + sixsigma on all cards stuck in given columns */
  const sweep = useCallback(
    async (columnIds: string[]) => {
      abortRef.current = false;
      setState({
        isRunning: true,
        currentCardId: null,
        currentCardTitle: null,
        currentMode: "validate",
        currentPhase: "Sweep: preparing",
        processedCount: 0,
        error: null,
      });

      try {
        for (const colId of columnIds) {
          if (abortRef.current) break;

          while (!abortRef.current) {
            setState((s) => ({ ...s, currentPhase: `Sweep: Validate (${s.processedCount})` }));

            const { data, error } = await supabase.functions.invoke("process-board-task", {
              body: { source_column_id: colId, mode: "validate" },
            });

            if (error) { toast.error(error.message || "Edge function error"); break; }
            if (data?.error) { toast.error(data.error); break; }
            if (data?.done) { onRefetch(); break; }

            const cardId = data.processed_card_id;
            const cardTitle = data.card_title || "card";

            setState((s) => ({
              ...s,
              currentCardId: cardId,
              currentCardTitle: cardTitle,
              processedCount: s.processedCount + 1,
            }));

            if (data.validation_status === "fail") {
              toast.error(`🔍 Failed validation: ${cardTitle} → Errors`);
            } else {
              toast.success(`🔍 Validated: ${cardTitle}`);
            }

            onRefetch();
            await new Promise((r) => setTimeout(r, 2000));

            // Run Six Sigma on this card if it didn't fail validation
            if (data.validation_status !== "fail") {
              setState((s) => ({ ...s, currentPhase: `Sweep: Six Sigma` }));
              const { ok, data: ssData } = await runSinglePhase(cardId, "sixsigma");
              if (ok) {
                if (ssData?.passed === false) {
                  toast.warning(`🔬 Six Sigma blocked (${ssData.score}%): ${cardTitle}`);
                } else {
                  toast.success(`🔬 Six Sigma passed: ${cardTitle}`);
                }
              } else {
                toast.error(`🔬 Six Sigma failed for: ${cardTitle}`);
              }
              onRefetch();
              await new Promise((r) => setTimeout(r, 2000));
            }
          }
        }

        if (!abortRef.current) {
          toast.success("🧹 Sweep complete — validation columns cleared!");
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
    [onRefetch, runSinglePhase]
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
        if (mode === "full") {
          const srcCol = columnMap?.clarify || sourceColumnId;
          await runFullPipelineE2E(srcCol);

          if (!abortRef.current) {
            toast.success("🎯 Full pipeline complete — all cards processed end-to-end!");
          }
        } else {
          await runPhase(sourceColumnId, mode as "clarify" | "execute" | "validate" | "sixsigma", PHASE_LABELS[mode] || mode);
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
    [runPhase, runFullPipelineE2E]
  );

  return { ...state, execute, sweep, stop };
}
