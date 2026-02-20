import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Heart, ArrowRight, Check, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ContactPicker, { type ContactEntry } from "./ContactPicker";

type FlowStep = "write" | "pick" | "sending" | "done";

interface NominationFlowProps {
  referralCode: string;
  displayName: string;
  onComplete?: () => void;
  onSkip?: () => void;
}

/**
 * NominationFlow — The core "11:11 Gratitude Challenge" nomination engine.
 * 3-step flow: Write gratitude messages → Pick contacts → Send nominations.
 * Ice Bucket Challenge-inspired public nomination mechanic.
 */
export default function NominationFlow({
  referralCode,
  displayName,
  onComplete,
  onSkip,
}: NominationFlowProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<FlowStep>("write");
  const [contacts, setContacts] = useState<ContactEntry[]>([
    { name: "", phone: "" },
    { name: "", phone: "" },
    { name: "", phone: "" },
  ]);
  const [messages, setMessages] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Array<{ name: string; success: boolean }>>([]);

  const senderName = displayName || "Someone special";
  const referralLink = `https://iamblessedaf.com/r/${referralCode}`;

  const validContacts = contacts.filter((c) => c.name.trim() && c.phone.trim());

  const getNominationMessage = (friendName: string, personalMsg: string) =>
    `🙏 ${senderName} te nominó para el 11:11 Gratitude Challenge!\n\n"${personalMsg || `${friendName}, gracias por estar en mi vida. ❤️`}"\n\n— Ese es un mensaje real de ${senderName} para ti.\n\nTU TURNO: Nombra 3 personas por las que estés agradecido/a.\nTienes 11 horas y 11 minutos. ⏱️\n\nAcepta el challenge: ${referralLink}\n\n✅ También recibes un wristband "I Am Blessed AF" GRATIS\n✅ Cada challenge completado = 22 comidas donadas\n\n— I Am Blessed AF | #1111GratitudeChallenge`;

  const handleSend = async () => {
    if (validContacts.length < 1) {
      toast.error("Nomina al menos 1 amigo");
      return;
    }

    setStep("sending");

    try {
      // Create nomination chain
      let chainId: string | undefined;
      if (user) {
        const { data: chain } = await supabase
          .from("nomination_chains")
          .insert({
            root_user_id: user.id,
            root_user_name: senderName,
            total_nominations: validContacts.length,
          })
          .select("id")
          .single();
        chainId = chain?.id;
      }

      // Save nominations to DB
      if (user) {
        const nominations = validContacts.map((c, idx) => ({
          sender_id: user.id,
          sender_name: senderName,
          recipient_name: c.name.trim(),
          recipient_phone: c.phone.trim(),
          gratitude_message: messages[idx] || `${c.name}, gracias por estar en mi vida. ❤️`,
          nomination_message: getNominationMessage(c.name, messages[idx] || ""),
          referral_code: referralCode,
          chain_id: chainId,
          chain_depth: 0,
        }));

        await supabase.from("nominations").insert(nominations);
      }

      // Send via WhatsApp
      const { data, error } = await supabase.functions.invoke("send-whatsapp-invite", {
        body: {
          friends: validContacts.map((c, idx) => ({
            name: c.name.trim(),
            phone: c.phone.trim(),
            message: getNominationMessage(c.name, messages[idx] || ""),
          })),
          senderName,
          referralLink,
        },
      });

      if (error) throw error;

      const sendResults = (data?.results || []).map((r: any) => ({
        name: r.name,
        success: r.success,
      }));
      setResults(sendResults);

      const successCount = sendResults.filter((r: any) => r.success).length;
      if (successCount > 0) {
        toast.success(`🎉 ${successCount} nominación(es) enviada(s)!`);
      }

      setStep("done");
    } catch (err) {
      console.error("Nomination error:", err);
      toast.error("Error al enviar. Intenta de nuevo.");
      setStep("pick");
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {/* STEP 1: Write gratitude messages */}
        {step === "write" && (
          <motion.div
            key="write"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-black text-foreground">
                ¿Por quién estás agradecido/a? 🙏
              </h3>
              <p className="text-sm text-muted-foreground">
                Escribe un mensaje de gratitud para cada persona que nomines
              </p>
            </div>

            <div className="space-y-3">
              {contacts.map((contact, idx) => (
                <div key={idx} className="bg-card border border-border/40 rounded-xl p-4 space-y-2">
                  <Input
                    placeholder={`Nombre del amigo ${idx + 1}`}
                    value={contact.name}
                    onChange={(e) => {
                      const updated = [...contacts];
                      updated[idx] = { ...updated[idx], name: e.target.value };
                      setContacts(updated);
                    }}
                    className="h-10 text-sm rounded-lg"
                    maxLength={50}
                  />
                  {contact.name && (
                    <Textarea
                      placeholder={`¿Por qué estás agradecido/a por ${contact.name}?`}
                      value={messages[idx] || ""}
                      onChange={(e) => setMessages({ ...messages, [idx]: e.target.value })}
                      className="text-sm rounded-lg resize-none"
                      rows={2}
                      maxLength={300}
                    />
                  )}
                </div>
              ))}
            </div>

            {contacts.filter((c) => c.name.trim()).length >= 1 && (
              <Button
                onClick={() => setStep("pick")}
                className="w-full h-12 font-bold rounded-xl gap-2"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </Button>
            )}

            {onSkip && (
              <button
                onClick={onSkip}
                className="w-full text-xs text-muted-foreground/60 hover:text-muted-foreground text-center"
              >
                Saltar por ahora →
              </button>
            )}
          </motion.div>
        )}

        {/* STEP 2: Pick contacts / add phone numbers */}
        {step === "pick" && (
          <motion.div
            key="pick"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-black text-foreground">
                Agrega los teléfonos 📱
              </h3>
              <p className="text-sm text-muted-foreground">
                Tus amigos recibirán tu mensaje de gratitud + nominación
              </p>
            </div>

            <ContactPicker
              contacts={contacts.filter((c) => c.name.trim())}
              onChange={(updated) => {
                setContacts(updated);
              }}
              max={10}
              min={1}
            />

            {/* Message preview */}
            {validContacts.length > 0 && (
              <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
                <p className="text-[10px] text-muted-foreground mb-1 font-medium">Vista previa del mensaje:</p>
                <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                  {getNominationMessage(validContacts[0].name, messages[0] || "").substring(0, 200)}...
                </p>
              </div>
            )}

            <Button
              onClick={handleSend}
              disabled={validContacts.length < 1}
              className="w-full h-12 font-bold rounded-xl gap-2 btn-glow"
            >
              <Send className="w-4 h-4" />
              Enviar {validContacts.length} Nominación(es)
            </Button>
          </motion.div>
        )}

        {/* STEP 3: Sending */}
        {step === "sending" && (
          <motion.div
            key="sending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 space-y-4"
          >
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Enviando nominaciones...</p>
          </motion.div>
        )}

        {/* STEP 4: Done */}
        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-black text-foreground">
              🎉 ¡Nominaciones Enviadas!
            </h3>
            <p className="text-sm text-muted-foreground">
              Tus amigos tienen 11 horas y 11 minutos para aceptar el challenge
            </p>

            {/* Results */}
            <div className="space-y-2">
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    r.success
                      ? "bg-primary/5 border-primary/20"
                      : "bg-destructive/5 border-destructive/20"
                  }`}
                >
                  <Check className={`w-4 h-4 ${r.success ? "text-primary" : "text-destructive"}`} />
                  <span className="text-sm font-medium text-foreground">{r.name}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={onComplete}
              className="w-full h-12 font-bold rounded-xl"
            >
              Ver mi Portal 🚀
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
