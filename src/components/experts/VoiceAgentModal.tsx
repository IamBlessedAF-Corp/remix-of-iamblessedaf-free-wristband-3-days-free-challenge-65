import { useState, useCallback, useRef, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Loader2, Volume2, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Framework, HeroProfile } from "@/data/expertFrameworks";

interface TranscriptMsg {
  role: string;
  text: string;
}

interface VoiceAgentModalProps {
  frameworks: Framework[];
  sectionTitle: string;
  onClose: () => void;
  agentId: string;
  existingProfile?: HeroProfile | null;
  onTranscriptProcessed?: (result: {
    profileUpdates: Record<string, string>;
    updatedFields: string[];
    mergedProfile: HeroProfile;
  }) => void;
}

const VoiceAgentModal = ({
  frameworks,
  sectionTitle,
  onClose,
  agentId,
  existingProfile,
  onTranscriptProcessed,
}: VoiceAgentModalProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<{
    updatedFields: string[];
    summary: string;
  } | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMsg[]>([]);
  const transcriptRef = useRef<TranscriptMsg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep ref in sync
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs agent");
      toast.success("Voice agent connected! Start speaking.");
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs agent");
      // Auto-process transcript when conversation ends
      if (transcriptRef.current.length > 0 && !isProcessing && !processResult) {
        processTranscript(transcriptRef.current);
      }
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

  const processTranscript = useCallback(
    async (msgs: TranscriptMsg[]) => {
      if (msgs.length === 0) return;
      setIsProcessing(true);

      try {
        const { data, error } = await supabase.functions.invoke(
          "process-voice-transcript",
          {
            body: {
              transcript: msgs,
              sectionId: frameworks[0]?.section || "unknown",
              existingProfile: existingProfile || {},
            },
          }
        );

        if (error) {
          throw new Error(error.message || "Processing failed");
        }

        if (data?.updatedFields?.length > 0) {
          setProcessResult({
            updatedFields: data.updatedFields,
            summary: data.transcriptSummary,
          });

          toast.success(
            `Updated ${data.updatedFields.length} profile fields from your interview!`
          );

          onTranscriptProcessed?.({
            profileUpdates: data.profileUpdates,
            updatedFields: data.updatedFields,
            mergedProfile: data.mergedProfile,
          });
        } else {
          setProcessResult({
            updatedFields: [],
            summary: "No new profile data was detected in the conversation.",
          });
          toast.info("No new profile updates detected.");
        }
      } catch (err) {
        console.error("Transcript processing error:", err);
        toast.error("Failed to process transcript. Your conversation was still recorded.");
      } finally {
        setIsProcessing(false);
      }
    },
    [existingProfile, frameworks, onTranscriptProcessed]
  );

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
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-[200px] max-h-[400px]"
        >
          {transcript.length === 0 && conversation.status !== "connected" && !isProcessing && !processResult && (
            <div className="text-center py-8 text-muted-foreground">
              <Mic className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-xs">Press the mic button to start the voice interview.</p>
              <p className="text-[10px] mt-1">
                The agent will ask you questions and your answers will automatically update your Hero Profile.
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

          {/* Processing indicator */}
          {isProcessing && (
            <motion.div
              className="flex justify-center py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs font-medium text-foreground">
                  Analyzing transcript & updating your profile...
                </span>
              </div>
            </motion.div>
          )}

          {/* Processing result */}
          {processResult && (
            <motion.div
              className="py-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-accent border border-primary/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-bold text-foreground">Interview Processed!</span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">{processResult.summary}</p>
                {processResult.updatedFields.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {processResult.updatedFields.map((field) => (
                      <span
                        key={field}
                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="px-4 py-4 border-t border-border/30 flex items-center justify-center gap-4">
          {conversation.status === "disconnected" && !isProcessing ? (
            processResult ? (
              <Button onClick={handleClose} className="gap-2 rounded-full px-6">
                <Check className="w-4 h-4" />
                Done
              </Button>
            ) : (
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
                ) : transcript.length > 0 ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Process Transcript
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Start Voice Interview
                  </>
                )}
              </Button>
            )
          ) : isProcessing ? (
            <Button disabled className="gap-2 rounded-full px-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
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
