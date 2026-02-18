import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Pencil, Save, X, Clock, Radio, Zap, Smartphone, Globe, Mail, Send, Share2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tag knowledge base ───
type TagInfo = {
  explanation: string;
  editable?: { label: string; field: string }[];
};

function getTagInfo(tag: string): TagInfo {
  const t = tag.toLowerCase().trim();

  // Channel tags
  if (t === "sms") return { explanation: "Mensaje de texto enviado vía Twilio. Límite: 160 chars por segmento. Requiere opt-in y registro A2P 10DLC.", editable: [{ label: "Canal", field: "channel" }] };
  if (t === "sms + mms") return { explanation: "Mensaje multimedia (texto + imagen) vía Twilio. Mayor engagement (+3×) pero mayor costo (~$0.03/msg).", editable: [{ label: "Canal", field: "channel" }] };
  if (t === "email") return { explanation: "Email transaccional o de marketing enviado vía Resend. Open rate promedio: 35-45%.", editable: [{ label: "Canal", field: "channel" }] };
  if (t === "whatsapp") return { explanation: "Mensaje de WhatsApp vía Twilio. Requiere template aprobado por Meta para mensajes proactivos.", editable: [{ label: "Canal", field: "channel" }] };
  if (t === "web") return { explanation: "Texto mostrado directamente en la interfaz web. Se actualiza en tiempo real al guardar cambios.", editable: [] };
  if (t === "web + email") return { explanation: "Texto mostrado en web Y enviado por email. Los cambios afectan ambos canales simultáneamente.", editable: [] };
  if (t === "social") return { explanation: "Texto usado para compartir en redes sociales (Twitter, IG, TikTok). Se copia al portapapeles del usuario.", editable: [] };

  // Frequency patterns
  if (t.includes("sends/day") || t.includes("send/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `Se envían aproximadamente ${num} mensajes por día. Volumen basado en promedios de los últimos 7 días.`, editable: [{ label: "Frecuencia diaria", field: "frequency" }] };
  }
  if (t.includes("sends/friday") || t.includes("send/friday")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `Se envían ~${num} mensajes cada viernes. Parte del programa TGF (Thank God it's Friday).`, editable: [{ label: "Frecuencia semanal", field: "frequency" }] };
  }
  if (t.includes("views/day") || t.includes("view/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `Esta sección recibe ~${num} vistas por día. Cambios aquí impactan a un alto volumen de usuarios.`, editable: [] };
  }
  if (t.includes("clicks/day") || t.includes("click/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} clics diarios en este elemento. Alto engagement indica que el copy actual funciona bien.`, editable: [] };
  }
  if (t.includes("shares/day") || t.includes("share/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} compartidos por día. Métrica de viralidad — cada share amplifica el alcance orgánico.`, editable: [] };
  }
  if (t.includes("impressions/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} impresiones diarias. Scroll-depth triggered — solo se muestra cuando el usuario llega a esa sección.`, editable: [] };
  }
  if (t.includes("triggers/day") || t.includes("trigger/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `Se activa ~${num} veces por día. Basado en acciones del usuario (no automático).`, editable: [] };
  }
  if (t.includes("triggers/month") || t.includes("trigger/month")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `Se activa ~${num} veces por mes. Evento raro — alto valor de cada instancia.`, editable: [] };
  }
  if (t === "weekly") return { explanation: "Se envía una vez por semana. Día y hora configurables.", editable: [{ label: "Día de envío", field: "day" }, { label: "Hora de envío", field: "time" }] };

  // Trigger patterns
  if (t.includes("cron")) {
    const timeMatch = t.match(/cron\s+(.*)/i)?.[1] || t;
    return { explanation: `Tarea programada automática: ${timeMatch}. Se ejecuta vía cron job del servidor sin intervención manual.`, editable: [{ label: "Horario", field: "schedule" }] };
  }
  if (t === "page load") return { explanation: "Se muestra al cargar la página. Primera impresión del usuario — optimizar para impacto inmediato.", editable: [] };
  if (t === "user click") return { explanation: "Se activa cuando el usuario hace clic. Intent-driven — el usuario ya mostró interés.", editable: [] };
  if (t === "user action") return { explanation: "Se activa por una acción del usuario (compartir, invitar, etc.). Señal de engagement alto.", editable: [] };
  if (t === "user signup") return { explanation: "Se dispara al registrarse un nuevo usuario. Momento de máxima atención — open rate ~70%.", editable: [] };
  if (t === "post-purchase") return { explanation: "Se muestra después de una compra exitosa. Momento de máxima satisfacción — ideal para viralización.", editable: [] };
  if (t === "scroll depth") return { explanation: "Aparece cuando el usuario llega a cierto punto de scroll (~60-70%). Indica interés real en el contenido.", editable: [{ label: "Profundidad (%)", field: "scroll_depth" }] };
  if (t === "exit-intent") return { explanation: "Se activa cuando el usuario mueve el cursor hacia arriba (desktop) o inactivo 30s (mobile). Último intento de retención.", editable: [{ label: "Delay (seg)", field: "exit_delay" }] };
  if (t.includes("streak trigger")) return { explanation: "Se activa al alcanzar un hito de streak. Refuerza el hábito y celebra el progreso.", editable: [] };
  if (t.includes("milestone")) return { explanation: "Activado por hito de views o engagement. Evento especial que refuerza la motivación.", editable: [] };
  if (t.includes("tier unlock")) return { explanation: "Se dispara al subir de tier de afiliado. Momento de celebración — refuerza el programa.", editable: [] };
  if (t.includes("first share")) return { explanation: "Se activa la primera vez que el usuario comparte algo. Momento clave para establecer el hábito viral.", editable: [] };
  if (t.includes("5th share")) return { explanation: "Se activa en el 5to share. Identidad de 'Ambassador' — refuerzo de label social.", editable: [] };
  if (t.includes("expert signup")) return { explanation: "Se dispara al registrarse un experto/influencer. Canal de alto valor — personalizar la bienvenida.", editable: [] };
  if (t.includes("nm signup")) return { explanation: "Se dispara al registrarse un Network Marketer. Audiencia de alto potencial de distribución.", editable: [] };
  if (t.includes("waitlist join")) return { explanation: "Se dispara al unirse a la waitlist del Smart Wristband. Leads calificados de producto futuro.", editable: [] };

  // Char count patterns
  if (t.includes("/") && t.includes("chars")) {
    const parts = t.match(/(\d+)\s*\/\s*(\d+)/);
    if (parts) {
      const current = parseInt(parts[1]);
      const limit = parseInt(parts[2]);
      const pct = Math.round((current / limit) * 100);
      return { explanation: `${current} de ${limit} caracteres usados (${pct}%). ${pct > 90 ? "⚠️ Cerca del límite — algunos dispositivos pueden cortar el texto." : pct > 70 ? "Buen uso del espacio disponible." : "Hay espacio para añadir más detalle."}`, editable: [{ label: "Límite de caracteres", field: "charLimit" }] };
    }
  }

  // Generic fallback
  return { explanation: `Tag: "${tag}". Metadata del sistema para clasificación y filtrado.`, editable: [] };
}

const TAG_ICONS: Record<string, typeof Globe> = {
  sms: Smartphone,
  "sms + mms": Smartphone,
  email: Mail,
  whatsapp: Send,
  web: Globe,
  "web + email": Globe,
  social: Share2,
};

function getTagIcon(tag: string) {
  const t = tag.toLowerCase().trim();
  if (TAG_ICONS[t]) return TAG_ICONS[t];
  if (t.includes("sends") || t.includes("views") || t.includes("clicks") || t.includes("shares") || t.includes("impressions") || t.includes("triggers") || t === "weekly") return TrendingUp;
  if (t.includes("cron") || t === "page load" || t.includes("signup") || t.includes("purchase") || t.includes("trigger") || t.includes("milestone") || t.includes("share") || t.includes("intent") || t.includes("scroll") || t === "user click" || t === "user action") return Zap;
  if (t.includes("chars")) return Clock;
  return Radio;
}

type SmartTagBadgeProps = {
  tag: string;
  className?: string;
  onEdit?: (field: string, value: string) => void;
};

export default function SmartTagBadge({ tag, className, onEdit }: SmartTagBadgeProps) {
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const info = getTagInfo(tag);
  const Icon = getTagIcon(tag);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "text-[9px] gap-1 cursor-help hover:bg-primary/10 hover:border-primary/30 transition-colors",
            className
          )}
        >
          <Icon className="w-2.5 h-2.5" />
          {tag}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start" side="top">
        <div className="p-3 space-y-2.5">
          <div className="flex items-start gap-2">
            <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-[11px] text-foreground/90 leading-relaxed">{info.explanation}</p>
          </div>

          {info.editable && info.editable.length > 0 && onEdit && (
            <div className="border-t border-border/20 pt-2 space-y-2">
              {!isEditing ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px] gap-1 w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="w-3 h-3" /> Editar configuración
                </Button>
              ) : (
                <div className="space-y-2">
                  {info.editable.map(ed => (
                    <div key={ed.field} className="space-y-1">
                      <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{ed.label}</label>
                      <Input
                        className="h-7 text-[11px]"
                        placeholder={tag}
                        value={editValues[ed.field] || ""}
                        onChange={(e) => setEditValues(prev => ({ ...prev, [ed.field]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      className="h-6 text-[10px] gap-1 flex-1"
                      onClick={() => {
                        Object.entries(editValues).forEach(([field, value]) => {
                          if (value) onEdit(field, value);
                        });
                        setIsEditing(false);
                        setEditValues({});
                      }}
                    >
                      <Save className="w-3 h-3" /> Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-[10px]"
                      onClick={() => { setIsEditing(false); setEditValues({}); }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
