import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Send, Sparkles, Play, Loader2, Zap, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ChatAttachment {
  name: string;
  type: string;
  dataUrl: string; // base64 data URL
  preview?: string; // thumbnail preview URL
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  attachments?: ChatAttachment[];
}

interface SuggestedStep {
  title: string;
  description: string;
  can_auto_execute: boolean;
  blocker_reason?: string;
  priority: "high" | "medium" | "low";
}

interface CardAIChatProps {
  cardId: string;
  cardTitle: string;
  disabled?: boolean;
}

export default function CardAIChat({ cardId, cardTitle, disabled }: CardAIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestedSteps, setSuggestedSteps] = useState<SuggestedStep[]>([]);
  const [executingStepIdx, setExecutingStepIdx] = useState<number | null>(null);
  const [executedSteps, setExecutedSteps] = useState<Set<number>>(new Set());
  const [executingAll, setExecutingAll] = useState(false);
  const [stepsExpanded, setStepsExpanded] = useState(true);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large (max 10MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            dataUrl,
            preview: file.type.startsWith("image/") ? dataUrl : undefined,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (message: string, action?: string) => {
    if (loading) return;

    const currentAttachments = [...attachments];

    const userMsg: ChatMessage = {
      role: "user",
      content:
        action === "suggest_next"
          ? "💡 Suggest next steps"
          : action === "execute"
          ? `🚀 Execute: ${message || "Run master prompt"}`
          : action === "execute_step"
          ? `⚡ Executing step: ${message}`
          : action === "execute_all_steps"
          ? "🔥 Executing all steps..."
          : message,
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachments([]);
    setLoading(true);

    try {
      const imageAttachments = currentAttachments
        .filter((a) => a.type.startsWith("image/"))
        .map((a) => ({ data_url: a.dataUrl, name: a.name }));

      const { data, error } = await supabase.functions.invoke("card-ai-chat", {
        body: { card_id: cardId, message, action, images: imageAttachments.length > 0 ? imageAttachments : undefined },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Handle structured steps response
      if (data?.type === "structured_steps" && data.structured_steps) {
        setSuggestedSteps(data.structured_steps);
        setExecutedSteps(new Set());
        setStepsExpanded(true);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply || "Here are the suggested next steps:" },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Error: ${err.message || "Failed to get response"}` },
      ]);
    }

    setLoading(false);
  };

  const executeStep = async (step: SuggestedStep, index: number) => {
    if (executingStepIdx !== null || loading) return;
    setExecutingStepIdx(index);

    try {
      const { data, error } = await supabase.functions.invoke("card-ai-chat", {
        body: {
          card_id: cardId,
          message: `Step: ${step.title}\n\n${step.description}`,
          action: "execute_step",
          step_index: index,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        { role: "user", content: `⚡ Execute: ${step.title}` },
        { role: "assistant", content: data.reply },
      ]);
      setExecutedSteps((prev) => new Set([...prev, index]));

      if (data.reply?.toLowerCase().includes("blocked")) {
        toast.warning(`Step "${step.title}" hit a blocker — notification sent to you.`);
      } else {
        toast.success(`Step "${step.title}" completed`);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Step failed: ${err.message}` },
      ]);
      toast.error(`Step "${step.title}" failed`);
    }

    setExecutingStepIdx(null);
  };

  const executeAllSteps = async () => {
    if (executingAll || loading || suggestedSteps.length === 0) return;
    setExecutingAll(true);

    // Build combined prompt
    const stepsText = suggestedSteps
      .map((s, i) => `${i + 1}. [${s.priority.toUpperCase()}] ${s.title}: ${s.description}`)
      .join("\n\n");

    setMessages((prev) => [...prev, { role: "user", content: "🔥 Execute ALL steps sequentially" }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("card-ai-chat", {
        body: {
          card_id: cardId,
          message: stepsText,
          action: "execute_all_steps",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setExecutedSteps(new Set(suggestedSteps.map((_, i) => i)));

      if (data.reply?.toLowerCase().includes("blocked")) {
        toast.warning("Some steps hit blockers — notification sent to you via email & WhatsApp.");
      } else {
        toast.success("All steps executed successfully!");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Batch execution failed: ${err.message}` },
      ]);
    }

    setLoading(false);
    setExecutingAll(false);
  };

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;
    sendMessage(input.trim());
  };

  const priorityColor = (p: string) =>
    p === "high" ? "text-red-400 border-red-500/30 bg-red-500/10" :
    p === "medium" ? "text-amber-400 border-amber-500/30 bg-amber-500/10" :
    "text-muted-foreground border-border bg-muted/30";

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="w-full gap-2"
        disabled={disabled}
      >
        <Bot className="w-4 h-4" />
        AI Assistant
      </Button>
    );
  }

  return (
    <div className="border border-border rounded-xl bg-muted/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold">AI Assistant</span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setIsOpen(false)}>
          Minimize
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-1.5 p-2 border-b border-border overflow-x-auto">
        <button
          type="button"
          className="inline-flex items-center cursor-pointer hover:bg-primary/10 whitespace-nowrap text-[10px] flex-shrink-0 border border-border rounded-full px-2 py-0.5 text-foreground transition-colors"
          onClick={() => sendMessage("", "suggest_next")}
          disabled={loading}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Suggest Next Steps
        </button>
        <button
          type="button"
          className="inline-flex items-center cursor-pointer hover:bg-primary/10 whitespace-nowrap text-[10px] flex-shrink-0 border border-border rounded-full px-2 py-0.5 text-foreground transition-colors"
          onClick={() => sendMessage("", "execute")}
          disabled={loading}
        >
          <Play className="w-3 h-3 mr-1" />
          Execute Task
        </button>
      </div>

      {/* Structured Steps Panel */}
      {suggestedSteps.length > 0 && (
        <div className="border-b border-border bg-card/50">
          <button
            onClick={() => setStepsExpanded(!stepsExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                Next Steps ({executedSteps.size}/{suggestedSteps.length} done)
              </span>
            </div>
            {stepsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {stepsExpanded && (
            <div className="px-3 pb-3 space-y-2">
              {suggestedSteps.map((step, i) => {
                const isDone = executedSteps.has(i);
                const isRunning = executingStepIdx === i;

                return (
                  <div
                    key={i}
                    className={`rounded-lg border p-2.5 transition-all ${
                      isDone
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          ) : !step.can_auto_execute ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          )}
                          <span className="text-xs font-semibold text-foreground truncate">{step.title}</span>
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${priorityColor(step.priority)}`}>
                            {step.priority}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed ml-5">
                          {step.description}
                        </p>
                        {!step.can_auto_execute && step.blocker_reason && (
                          <p className="text-[10px] text-amber-400 ml-5 mt-1 italic">
                            ⚠️ {step.blocker_reason}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 text-[10px] flex-shrink-0 gap-1 ${
                          isDone ? "border-emerald-500/30 text-emerald-400" : ""
                        }`}
                        onClick={() => executeStep(step, i)}
                        disabled={isDone || isRunning || executingAll || loading}
                      >
                        {isRunning ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Running</>
                        ) : isDone ? (
                          <><CheckCircle2 className="w-3 h-3" /> Done</>
                        ) : (
                          <><Play className="w-3 h-3" /> Execute</>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Execute All Button */}
              <Button
                onClick={executeAllSteps}
                disabled={executingAll || loading || executedSteps.size === suggestedSteps.length}
                className="w-full gap-2 mt-1"
                size="sm"
              >
                {executingAll ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Executing All Steps...</>
                ) : executedSteps.size === suggestedSteps.length ? (
                  <><CheckCircle2 className="w-4 h-4" /> All Steps Complete</>
                ) : (
                  <><Zap className="w-4 h-4" /> Execute All Steps ({suggestedSteps.length})</>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="h-[200px]">
        <div ref={scrollRef} className="p-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-6">
              Ask me anything about this card, or use the quick actions above.
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-xs whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {msg.attachments.map((att, ai) =>
                      att.preview ? (
                        <img key={ai} src={att.preview} alt={att.name} className="w-16 h-16 rounded object-cover border border-border/30" />
                      ) : (
                        <div key={ai} className="flex items-center gap-1 bg-background/20 rounded px-1.5 py-0.5 text-[10px]">
                          <Paperclip className="w-2.5 h-2.5" />
                          <span className="truncate max-w-[80px]">{att.name}</span>
                        </div>
                      )
                    )}
                  </div>
                )}
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex gap-1.5 px-2 pt-2 flex-wrap">
          {attachments.map((att, i) => (
            <div key={i} className="relative group">
              {att.preview ? (
                <img src={att.preview} alt={att.name} className="w-12 h-12 rounded object-cover border border-border" />
              ) : (
                <div className="w-12 h-12 rounded border border-border bg-muted flex items-center justify-center">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <button
                onClick={() => removeAttachment(i)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-1.5 p-2 border-t border-border">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.txt,.md,.csv"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || disabled}
          title="Attach files or images"
        >
          <Paperclip className="w-3.5 h-3.5" />
        </Button>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this card or type a prompt..."
          rows={1}
          className="flex-1 min-h-[32px] text-xs resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={loading || disabled}
        />
        <Button
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={handleSend}
          disabled={(!input.trim() && attachments.length === 0) || loading || disabled}
        >
          <Send className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
