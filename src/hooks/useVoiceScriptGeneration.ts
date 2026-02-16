import { useCallback, useRef, useState } from "react";
import { FRAMEWORKS, HeroProfile } from "@/data/expertFrameworks";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GenerationProgress {
  frameworkId: string;
  frameworkName: string;
  status: "pending" | "generating" | "done" | "error";
  output?: string;
}

export const useVoiceScriptGeneration = (
  saveOutput: (frameworkId: string, output: string, profile: HeroProfile) => void
) => {
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [generationQueue, setGenerationQueue] = useState<GenerationProgress[]>([]);
  const abortRef = useRef(false);

  const autoGenerateForSection = useCallback(
    async (
      sectionId: string,
      mergedProfile: HeroProfile,
      existingOutputs: Record<string, string>
    ) => {
      const sectionFrameworks = FRAMEWORKS.filter(
        (f) => f.section === sectionId && !existingOutputs[f.id]
      );

      if (sectionFrameworks.length === 0) {
        toast.info("All scripts in this section are already generated!");
        return;
      }

      abortRef.current = false;
      setIsAutoGenerating(true);

      const queue: GenerationProgress[] = sectionFrameworks.map((fw) => ({
        frameworkId: fw.id,
        frameworkName: `${fw.secret}: ${fw.name}`,
        status: "pending",
      }));
      setGenerationQueue(queue);

      toast.success(
        `Auto-generating ${sectionFrameworks.length} scripts from your voice interview...`
      );

      for (let i = 0; i < sectionFrameworks.length; i++) {
        if (abortRef.current) break;

        const fw = sectionFrameworks[i];

        setGenerationQueue((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "generating" } : item
          )
        );

        try {
          const { data: { session } } = await supabase.auth.getSession();
          const accessToken = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
          const resp = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/expert-scripts`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                framework: fw.id,
                heroProfile: mergedProfile,
              }),
            }
          );

          if (!resp.ok || !resp.body) {
            throw new Error(`Generation failed: ${resp.status}`);
          }

          // Stream and collect the full output
          const reader = resp.body.getReader();
          const decoder = new TextDecoder();
          let fullOutput = "";
          let textBuffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            textBuffer += decoder.decode(value, { stream: true });

            let newlineIndex: number;
            while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
              let line = textBuffer.slice(0, newlineIndex);
              textBuffer = textBuffer.slice(newlineIndex + 1);

              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (line.startsWith(":") || line.trim() === "") continue;
              if (!line.startsWith("data: ")) continue;

              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") break;

              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) fullOutput += content;
              } catch {
                textBuffer = line + "\n" + textBuffer;
                break;
              }
            }
          }

          if (fullOutput.trim()) {
            saveOutput(fw.id, fullOutput, mergedProfile);

            setGenerationQueue((prev) =>
              prev.map((item, idx) =>
                idx === i ? { ...item, status: "done", output: fullOutput } : item
              )
            );
          } else {
            throw new Error("Empty output");
          }
        } catch (err) {
          console.error(`Failed to generate ${fw.id}:`, err);
          setGenerationQueue((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: "error" } : item
            )
          );
        }
      }

      const doneCount = sectionFrameworks.length;
      toast.success(`Generated ${doneCount} scripts from your voice interview!`);
      setIsAutoGenerating(false);
    },
    [saveOutput]
  );

  const cancelGeneration = useCallback(() => {
    abortRef.current = true;
    setIsAutoGenerating(false);
  }, []);

  return {
    isAutoGenerating,
    generationQueue,
    autoGenerateForSection,
    cancelGeneration,
  };
};
