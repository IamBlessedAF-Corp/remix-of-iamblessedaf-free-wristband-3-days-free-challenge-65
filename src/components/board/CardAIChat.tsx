import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Send, Sparkles, Play, Loader2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (message: string, action?: string) => {
    if (loading) return;

    const userMsg: ChatMessage = { role: "user", content: action === "suggest_next" ? "💡 Suggest next steps" : action === "execute" ? `🚀 Execute: ${message || "Run master prompt"}` : message };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("card-ai-chat", {
        body: { card_id: cardId, message, action },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `❌ Error: ${err.message || "Failed to get response"}` }]);
    }

    setLoading(false);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
  };

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
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Suggest Next Steps
        </button>
        <button
          type="button"
          className="inline-flex items-center cursor-pointer hover:bg-primary/10 whitespace-nowrap text-[10px] flex-shrink-0 border border-border rounded-full px-2 py-0.5 text-foreground transition-colors"
          onClick={() => sendMessage("", "execute")}
        >
          <Play className="w-3 h-3 mr-1" />
          Execute Task
        </button>
      </div>

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
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}>
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

      {/* Input */}
      <div className="flex gap-2 p-2 border-t border-border">
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
          disabled={!input.trim() || loading || disabled}
        >
          <Send className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
