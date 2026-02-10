import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Copy, Check, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Framework, HeroProfile } from "@/data/expertFrameworks";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ScriptGeneratorModalProps {
  framework: Framework;
  heroProfile: HeroProfile;
  onClose: () => void;
  existingOutput?: string;
  onOutputGenerated: (frameworkId: string, output: string) => void;
}

const ScriptGeneratorModal = ({
  framework,
  heroProfile,
  onClose,
  existingOutput,
  onOutputGenerated,
}: ScriptGeneratorModalProps) => {
  const [answers, setAnswers] = useState<string[]>(framework.questions.map(() => ""));
  const [output, setOutput] = useState(existingOutput || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQuestions, setShowQuestions] = useState(!existingOutput);

  const canGenerate = answers.every((a) => a.trim().length > 0);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    setOutput("");
    setShowQuestions(false);

    const enrichedProfile = {
      ...heroProfile,
      // Append the framework-specific answers to relevant fields
      originStory: heroProfile.originStory + "\n\nAdditional context:\n" + 
        framework.questions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join("\n"),
    };

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/expert-scripts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            framework: framework.id,
            heroProfile: enrichedProfile,
          }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json();
        toast.error(err.error || "Generation failed");
        setIsGenerating(false);
        setShowQuestions(true);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullOutput = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullOutput += content;
              setOutput(fullOutput);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      onOutputGenerated(framework.id, fullOutput);
      setIsGenerating(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate script");
      setIsGenerating(false);
      setShowQuestions(true);
    }
  }, [answers, framework, heroProfile, onOutputGenerated]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        className="bg-background border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {framework.secret}
            </span>
            <h2 className="text-lg font-bold text-foreground">{framework.name}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence mode="wait">
            {showQuestions && (
              <motion.div
                key="questions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Answer these framework-specific questions to generate tailored copy:
                </p>
                {framework.questions.map((q, i) => (
                  <div key={i}>
                    <Label className="text-sm font-medium text-foreground">{q}</Label>
                    <Input
                      value={answers[i]}
                      onChange={(e) => {
                        const newAnswers = [...answers];
                        newAnswers[i] = e.target.value;
                        setAnswers(newAnswers);
                      }}
                      placeholder="Your answer..."
                      className="mt-1.5"
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Output */}
          {(output || isGenerating) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border border-border/50 rounded-xl p-5"
            >
              {isGenerating && !output && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Russell Brunson is writing your scripts...
                </div>
              )}
              {output && (
                <div className="prose prose-sm max-w-none text-foreground">
                  <ReactMarkdown>{output}</ReactMarkdown>
                </div>
              )}
              {isGenerating && output && (
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Generating...
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border/50 flex gap-3">
          {showQuestions ? (
            <Button
              onClick={generate}
              disabled={!canGenerate || isGenerating}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Script
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCopy}
                disabled={!output || isGenerating}
                variant="outline"
                className="gap-2 rounded-xl"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy All"}
              </Button>
              <Button
                onClick={() => setShowQuestions(true)}
                variant="outline"
                className="gap-2 rounded-xl"
              >
                <RotateCcw className="w-4 h-4" />
                Re-generate
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ScriptGeneratorModal;
