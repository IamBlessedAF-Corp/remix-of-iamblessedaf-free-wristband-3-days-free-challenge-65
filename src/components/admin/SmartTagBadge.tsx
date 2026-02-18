import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Pencil, Save, X, Clock, Radio, Zap, Smartphone, Globe, Mail, Send, Share2, TrendingUp, Box, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tag knowledge base ───
type TagInfo = {
  explanation: string;
  editable?: { label: string; field: string }[];
};

function getTagInfo(tag: string): TagInfo {
  const t = tag.toLowerCase().trim();

  // ─── Channel tags ───
  if (t === "sms") return { explanation: "Mensaje de texto enviado vía Twilio. Límite: 160 chars por segmento. Requiere opt-in y registro A2P 10DLC.", editable: [{ label: "Canal", field: "channel" }] };
  if (t === "sms + mms") return { explanation: "Mensaje multimedia (texto + imagen) vía Twilio. Mayor engagement (+3×) pero mayor costo (~$0.03/msg).", editable: [{ label: "Canal", field: "channel" }] };
  if (t === "email") return { explanation: "Email transaccional o de marketing enviado vía Resend. Open rate promedio: 35-45%.", editable: [{ label: "Canal", field: "channel" }] };
  if (t === "whatsapp") return { explanation: "Mensaje de WhatsApp vía Twilio. Requiere template aprobado por Meta para mensajes proactivos.", editable: [{ label: "Canal", field: "channel" }] };
  if (t === "web") return { explanation: "Texto mostrado directamente en la interfaz web. Se actualiza en tiempo real al guardar cambios.", editable: [] };
  if (t === "web + email") return { explanation: "Texto mostrado en web Y enviado por email. Los cambios afectan ambos canales simultáneamente.", editable: [] };
  if (t === "social") return { explanation: "Texto usado para compartir en redes sociales (Twitter, IG, TikTok). Se copia al portapapeles del usuario.", editable: [] };

  // ─── Block Categories ───
  if (t === "content") return { explanation: "Bloque de contenido editorial: citas, investigación, storytelling. Diseñado para educar y generar autoridad.", editable: [] };
  if (t === "product") return { explanation: "Bloque de producto: muestra wristbands, shirts, o bundles con galerías y pricing. Clave para conversión.", editable: [] };
  if (t === "cta") return { explanation: "Call-to-Action: botón principal de conversión. Cada variante (Grok/GPT) usa diferente tono y estrategia de copy.", editable: [] };
  if (t === "hero") return { explanation: "Sección hero: primera impresión del visitante. Incluye headline, sub-copy y CTA primario. Alto impacto en bounce rate.", editable: [] };
  if (t === "trust") return { explanation: "Bloque de confianza: testimonios, garantías, y señales de credibilidad. Reduce friction pre-compra.", editable: [] };
  if (t === "urgency") return { explanation: "Bloque de urgencia: timers, stock counters, exit-intent modals. Acelera la decisión de compra.", editable: [] };
  if (t === "viral") return { explanation: "Bloque viral: share nudges, impact counters, gamification. Amplifica alcance orgánico post-interacción.", editable: [] };
  if (t === "value stack") return { explanation: "Value Stack: lista visual de beneficios con precio tachado. Ancla el valor percibido vs precio real.", editable: [] };
  if (t === "system") return { explanation: "Bloque de sistema: componente conectado a datos en tiempo real (clips, payouts, actividad). Se actualiza automáticamente.", editable: [] };

  // ─── Live value patterns (e.g. "3 quotes × 3 variants", "0 orders", "27× multiplier") ───
  if (t.includes("orders")) {
    const num = t.match(/(\d+)/)?.[1] || "0";
    return { explanation: `${num} órdenes registradas en la base de datos. Este bloque se usa en páginas de producto.`, editable: [] };
  }
  if (t.includes("quotes") || t.includes("variants")) return { explanation: "Múltiples variantes de copy para A/B testing. Cada variante se muestra según el embudo (Grok, GPT, etc.).", editable: [] };
  if (t.includes("multiplier") || t.includes("×")) return { explanation: "Cifra de impacto basada en la escala de Hawkins. Dato científico usado como ancla persuasiva.", editable: [] };
  if (t.includes("clips")) {
    const num = t.match(/(\d+)/)?.[1] || "0";
    return { explanation: `${num} clips en esta categoría. Los clips se verifican automáticamente antes de activarse.`, editable: [] };
  }
  if (t.includes("clippers")) {
    const num = t.match(/(\d+)/)?.[1] || "0";
    return { explanation: `${num} creadores de contenido registrados en el programa de clippers.`, editable: [] };
  }
  if (t.includes("segments")) return { explanation: "Segmentos de presupuesto activos. Controlan la distribución de payouts por categoría de clipper.", editable: [] };
  if (t.includes("cycle")) return { explanation: "Estado del ciclo de presupuesto actual. Los ciclos controlan límites semanales y mensuales de pago.", editable: [] };

  // ─── Frequency patterns ───
  if (t.includes("sends/day") || t.includes("send/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `Se envían ~${num} mensajes/día. Volumen basado en promedios de los últimos 7 días.`, editable: [{ label: "Frecuencia diaria", field: "frequency" }] };
  }
  if (t.includes("sends/friday") || t.includes("send/friday")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} mensajes cada viernes. Parte del programa TGF (Thank God it's Friday).`, editable: [{ label: "Frecuencia semanal", field: "frequency" }] };
  }
  if (t.includes("views/day") || t.includes("view/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} vistas/día. Cambios aquí impactan alto volumen de usuarios.`, editable: [] };
  }
  if (t.includes("clicks/day") || t.includes("click/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} clics/día. Alto engagement indica que el copy funciona bien.`, editable: [] };
  }
  if (t.includes("shares/day") || t.includes("share/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} compartidos/día. Cada share amplifica el alcance orgánico.`, editable: [] };
  }
  if (t.includes("impressions/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} impresiones/día. Scroll-depth triggered.`, editable: [] };
  }
  if (t.includes("triggers/day") || t.includes("trigger/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} activaciones/día. Basado en acciones del usuario.`, editable: [] };
  }
  if (t.includes("triggers/month") || t.includes("trigger/month")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} activaciones/mes. Evento raro — alto valor por instancia.`, editable: [] };
  }
  if (t === "weekly") return { explanation: "Se envía una vez por semana. Día y hora configurables.", editable: [{ label: "Día de envío", field: "day" }, { label: "Hora de envío", field: "time" }] };

  // ─── Trigger patterns ───
  if (t.includes("cron")) {
    const timeMatch = t.match(/cron\s+(.*)/i)?.[1] || t;
    return { explanation: `Tarea programada automática: ${timeMatch}. Se ejecuta vía cron job sin intervención.`, editable: [{ label: "Horario", field: "schedule" }] };
  }
  if (t === "page load") return { explanation: "Se muestra al cargar la página. Primera impresión — optimizar para impacto inmediato.", editable: [] };
  if (t === "user click") return { explanation: "Se activa por clic del usuario. Intent-driven — el usuario ya mostró interés.", editable: [] };
  if (t === "user action") return { explanation: "Se activa por acción del usuario (compartir, invitar, etc.). Señal de engagement alto.", editable: [] };
  if (t === "user signup") return { explanation: "Se dispara al registrarse un nuevo usuario. Open rate ~70%.", editable: [] };
  if (t === "post-purchase") return { explanation: "Después de compra exitosa. Momento de máxima satisfacción — ideal para viralización.", editable: [] };
  if (t === "scroll depth") return { explanation: "Aparece al llegar a cierto punto de scroll (~60-70%). Indica interés real.", editable: [{ label: "Profundidad (%)", field: "scroll_depth" }] };
  if (t === "exit-intent") return { explanation: "Se activa cuando el cursor sale del viewport (desktop) o inactivo 30s (mobile).", editable: [{ label: "Delay (seg)", field: "exit_delay" }] };
  if (t.includes("streak trigger")) return { explanation: "Se activa al alcanzar un hito de streak. Refuerza el hábito.", editable: [] };
  if (t.includes("milestone")) return { explanation: "Activado por hito de views o engagement.", editable: [] };
  if (t.includes("tier unlock")) return { explanation: "Se dispara al subir de tier de afiliado.", editable: [] };
  if (t.includes("first share")) return { explanation: "Primera vez que el usuario comparte. Momento clave para hábito viral.", editable: [] };
  if (t.includes("5th share")) return { explanation: "5to share — refuerzo de identidad 'Ambassador'.", editable: [] };
  if (t.includes("expert signup")) return { explanation: "Registro de experto/influencer. Canal de alto valor.", editable: [] };
  if (t.includes("nm signup")) return { explanation: "Registro de Network Marketer. Alto potencial de distribución.", editable: [] };
  if (t.includes("waitlist join")) return { explanation: "Unión a waitlist del Smart Wristband. Leads calificados.", editable: [] };

  // ─── Char count patterns ───
  if (t.includes("/") && t.includes("chars")) {
    const parts = t.match(/(\d+)\s*\/\s*(\d+)/);
    if (parts) {
      const current = parseInt(parts[1]);
      const limit = parseInt(parts[2]);
      const pct = Math.round((current / limit) * 100);
      return { explanation: `${current}/${limit} chars (${pct}%). ${pct > 90 ? "⚠️ Cerca del límite." : pct > 70 ? "Buen uso del espacio." : "Espacio disponible."}`, editable: [{ label: "Límite", field: "charLimit" }] };
    }
  }

  // ─── Numeric-only values (live counts) ───
  if (/^\d+$/.test(t)) {
    return { explanation: `Valor actual en tiempo real: ${t}. Se actualiza automáticamente desde la base de datos.`, editable: [] };
  }

  // ─── Generic fallback ───
  return { explanation: `"${tag}" — Metadata de clasificación del sistema.`, editable: [] };
}

const TAG_ICONS: Record<string, typeof Globe> = {
  sms: Smartphone, "sms + mms": Smartphone, email: Mail, whatsapp: Send,
  web: Globe, "web + email": Globe, social: Share2,
  content: Box, product: Box, cta: Tag, hero: Tag, trust: Tag,
  urgency: Clock, viral: TrendingUp, "value stack": Tag, system: Zap,
};

function getTagIcon(tag: string) {
  const t = tag.toLowerCase().trim();
  if (TAG_ICONS[t]) return TAG_ICONS[t];
  if (t.includes("sends") || t.includes("views") || t.includes("clicks") || t.includes("shares") || t.includes("impressions") || t.includes("triggers") || t === "weekly") return TrendingUp;
  if (t.includes("cron") || t === "page load" || t.includes("signup") || t.includes("purchase") || t.includes("trigger") || t.includes("milestone") || t.includes("share") || t.includes("intent") || t.includes("scroll") || t === "user click" || t === "user action") return Zap;
  if (t.includes("chars")) return Clock;
  if (t.includes("orders") || t.includes("clips") || t.includes("clippers")) return TrendingUp;
  if (/^\d+$/.test(t)) return TrendingUp;
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
      <PopoverContent className="w-72 p-0 z-50" align="start" side="top">
        <div className="p-3 space-y-2.5">
          <div className="flex items-start gap-2">
            <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-[11px] text-foreground/90 leading-relaxed">{info.explanation}</p>
          </div>

          {info.editable && info.editable.length > 0 && onEdit && (
            <div className="border-t border-border/20 pt-2 space-y-2">
              {!isEditing ? (
                <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => setIsEditing(true)}>
                  <Pencil className="w-3 h-3" /> Editar configuración
                </Button>
              ) : (
                <div className="space-y-2">
                  {info.editable.map(ed => (
                    <div key={ed.field} className="space-y-1">
                      <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{ed.label}</label>
                      <Input className="h-7 text-[11px]" placeholder={tag} value={editValues[ed.field] || ""} onChange={(e) => setEditValues(prev => ({ ...prev, [ed.field]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="flex gap-1.5">
                    <Button size="sm" className="h-6 text-[10px] gap-1 flex-1" onClick={() => { Object.entries(editValues).forEach(([field, value]) => { if (value) onEdit(field, value); }); setIsEditing(false); setEditValues({}); }}>
                      <Save className="w-3 h-3" /> Guardar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => { setIsEditing(false); setEditValues({}); }}>
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
