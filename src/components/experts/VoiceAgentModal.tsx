import { useState, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Framework } from "@/data/expertFrameworks";

interface VoiceAgentModalProps {
  frameworks: Framework[];
  sectionTitle: string;
  onClose: () => void;
  agentId: string;
}

const VoiceAgentModal = ({ frameworks, sectionTitle, onClose, agentId }: VoiceAgentModalProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([]);

  // Build questions list for the system prompt
  const allQuestions = frameworks.flatMap((fw) =>
    fw.questions.map((q) => `[${fw.secret}: ${fw.name}] ${q}`)
  );

  const questionsContext = allQuestions
    .map((q, i) => `${i + 1}. ${q}`)
    .join("\n");

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs agent");
      toast.success("Voice agent connected! Start speaking.");
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs agent");
    },
    onMessage: (message: any) => {
      if (message.type === "user_transcript" && message.user_transcription_event) {
        setTranscript((prev) => [
          ...prev,
          { role: "user", text: message.user_transcription_event.user_transcript },
        ]);
      }
      if (message.type === "agent_response" && message.agent_response_event) {
        setTranscript((prev) => [
          ...prev,
          { role: "agent", text: message.agent_response_event.agent_response },
        ]);
      }
    },
    onError: (error: any) => {
      console.error("Voice agent error:", error);
      toast.error("Voice connection error. Please try again.");
    },
  });

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const { data, error } = await supabase.functions.invoke(
        "elevenlabs-conversation-token",
        { body: { agentId } }
      );

      if (error || !data?.token) {
        throw new Error(error?.message || "No token received");
      }

      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to connect. Check microphone permissions.");
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, agentId]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const handleClose = useCallback(async () => {
    if (conversation.status === "connected") {
      await conversation.endSession();
    }
    onClose();
  }, [conversation, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClose}
    >
      <motion.div
        className="bg-card border border-border/40 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground truncate">🎙️ Voice Agent</h3>
            <p className="text-[10px] text-muted-foreground truncate">{sectionTitle}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Transcript area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-[200px] max-h-[400px]">
          {transcript.length === 0 && conversation.status !== "connected" && (
            <div className="text-center py-8 text-muted-foreground">
              <Mic className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-xs">Press the mic button to start the voice interview.</p>
              <p className="text-[10px] mt-1">
                The agent will ask you {allQuestions.length} questions from {frameworks.length} framework{frameworks.length !== 1 ? "s" : ""}.
              </p>
            </div>
          )}

          {transcript.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {conversation.status === "connected" && conversation.isSpeaking && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-xl px-3 py-2">
                <Volume2 className="w-4 h-4 text-primary animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="px-4 py-4 border-t border-border/30 flex items-center justify-center gap-4">
          {conversation.status === "disconnected" ? (
            <Button
              onClick={startConversation}
              disabled={isConnecting}
              className="gap-2 rounded-full px-6"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Start Voice Interview
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={stopConversation}
              variant="destructive"
              className="gap-2 rounded-full px-6"
            >
              <MicOff className="w-4 h-4" />
              End Conversation
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VoiceAgentModal;
