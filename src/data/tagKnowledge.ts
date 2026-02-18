import {
  Clock, Radio, Zap, Smartphone, Globe, Mail, Send, Share2,
  TrendingUp, Box, Tag, type LucideIcon,
} from "lucide-react";

// ─── Tag knowledge base ───
export interface TagInfo {
  explanation: string;
  editable?: { label: string; field: string }[];
}

export function getTagInfo(tag: string): TagInfo {
  const t = tag.toLowerCase().trim();

  // ─── Channel tags ───
  if (t === "sms") return { explanation: "Mensaje de texto vía Twilio. Límite: 160 chars por segmento.", editable: [{ label: "Canal", field: "channel" }] };
  if (t === "sms + mms") return { explanation: "Mensaje multimedia (texto + imagen) vía Twilio. Mayor engagement (+3×) pero mayor costo.", editable: [{ label: "Canal", field: "channel" }] };
  if (t === "email") return { explanation: "Email transaccional o de marketing vía Resend. Open rate promedio: 35-45%.", editable: [{ label: "Canal", field: "channel" }] };
  if (t === "whatsapp") return { explanation: "Mensaje de WhatsApp vía Twilio. Requiere template aprobado por Meta.", editable: [{ label: "Canal", field: "channel" }] };
  if (t === "web") return { explanation: "Texto mostrado directamente en la interfaz web. Se actualiza en tiempo real.", editable: [] };
  if (t === "web + email") return { explanation: "Texto mostrado en web Y enviado por email. Los cambios afectan ambos canales.", editable: [] };
  if (t === "social") return { explanation: "Texto para redes sociales (Twitter, IG, TikTok). Se copia al portapapeles.", editable: [] };

  // ─── Block Categories ───
  if (t === "content") return { explanation: "Bloque de contenido editorial: citas, investigación, storytelling.", editable: [] };
  if (t === "product") return { explanation: "Bloque de producto: muestra wristbands, shirts, o bundles con galerías y pricing.", editable: [] };
  if (t === "cta") return { explanation: "Call-to-Action: botón principal de conversión.", editable: [] };
  if (t === "hero") return { explanation: "Sección hero: primera impresión del visitante. Alto impacto en bounce rate.", editable: [] };
  if (t === "trust") return { explanation: "Bloque de confianza: testimonios, garantías, señales de credibilidad.", editable: [] };
  if (t === "urgency") return { explanation: "Bloque de urgencia: timers, stock counters, exit-intent modals.", editable: [] };
  if (t === "viral") return { explanation: "Bloque viral: share nudges, impact counters, gamification.", editable: [] };
  if (t === "value stack") return { explanation: "Value Stack: lista visual de beneficios con precio tachado.", editable: [] };
  if (t === "system") return { explanation: "Componente conectado a datos en tiempo real. Se actualiza automáticamente.", editable: [] };

  // ─── Live value patterns ───
  if (t.includes("orders")) return { explanation: `Órdenes registradas en la base de datos.`, editable: [] };
  if (t.includes("quotes") || t.includes("variants")) return { explanation: "Múltiples variantes de copy para A/B testing.", editable: [] };
  if (t.includes("multiplier") || t.includes("×")) return { explanation: "Cifra de impacto basada en la escala de Hawkins.", editable: [] };
  if (t.includes("clips")) return { explanation: "Clips en esta categoría. Se verifican automáticamente.", editable: [] };
  if (t.includes("clippers")) return { explanation: "Creadores de contenido registrados en el programa.", editable: [] };
  if (t.includes("segments")) return { explanation: "Segmentos de presupuesto activos.", editable: [] };
  if (t.includes("cycle")) return { explanation: "Estado del ciclo de presupuesto actual.", editable: [] };

  // ─── Frequency patterns ───
  if (t.includes("sends/day") || t.includes("send/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} mensajes/día. Volumen promedio últimos 7 días.`, editable: [{ label: "Frecuencia diaria", field: "frequency" }] };
  }
  if (t.includes("sends/friday") || t.includes("send/friday")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} mensajes cada viernes (programa TGF).`, editable: [{ label: "Frecuencia semanal", field: "frequency" }] };
  }
  if (t.includes("views/day") || t.includes("view/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} vistas/día. Cambios aquí impactan alto volumen.`, editable: [] };
  }
  if (t.includes("clicks/day") || t.includes("click/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} clics/día. Alto engagement indica copy efectivo.`, editable: [] };
  }
  if (t.includes("shares/day") || t.includes("share/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} compartidos/día. Cada share amplifica alcance orgánico.`, editable: [] };
  }
  if (t.includes("impressions/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} impresiones/día. Scroll-depth triggered.`, editable: [] };
  }
  if (t.includes("triggers/day") || t.includes("trigger/day")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} activaciones/día.`, editable: [] };
  }
  if (t.includes("triggers/month") || t.includes("trigger/month")) {
    const num = t.match(/~?(\d+)/)?.[1] || "?";
    return { explanation: `~${num} activaciones/mes. Evento raro — alto valor.`, editable: [] };
  }
  if (t === "weekly") return { explanation: "Se envía una vez por semana. Día y hora configurables.", editable: [{ label: "Día de envío", field: "day" }, { label: "Hora de envío", field: "time" }] };

  // ─── Trigger patterns ───
  if (t.includes("cron")) {
    const timeMatch = t.match(/cron\s+(.*)/i)?.[1] || t;
    return { explanation: `Tarea programada automática: ${timeMatch}.`, editable: [{ label: "Horario", field: "schedule" }] };
  }
  if (t === "page load") return { explanation: "Se muestra al cargar la página. Optimizar para impacto inmediato.", editable: [] };
  if (t === "user click") return { explanation: "Se activa por clic del usuario. Intent-driven.", editable: [] };
  if (t === "user action") return { explanation: "Se activa por acción del usuario (compartir, invitar, etc.).", editable: [] };
  if (t === "user signup") return { explanation: "Se dispara al registrarse un nuevo usuario. Open rate ~70%.", editable: [] };
  if (t === "post-purchase") return { explanation: "Después de compra exitosa. Momento ideal para viralización.", editable: [] };
  if (t === "scroll depth") return { explanation: "Aparece al ~60-70% de scroll. Indica interés real.", editable: [{ label: "Profundidad (%)", field: "scroll_depth" }] };
  if (t === "exit-intent") return { explanation: "Se activa cuando el cursor sale del viewport o inactivo 30s.", editable: [{ label: "Delay (seg)", field: "exit_delay" }] };
  if (t.includes("streak trigger")) return { explanation: "Se activa al alcanzar un hito de streak.", editable: [] };
  if (t.includes("milestone")) return { explanation: "Activado por hito de views o engagement.", editable: [] };
  if (t.includes("tier unlock")) return { explanation: "Se dispara al subir de tier de afiliado.", editable: [] };
  if (t.includes("first share")) return { explanation: "Primera vez que el usuario comparte.", editable: [] };
  if (t.includes("5th share")) return { explanation: "5to share — refuerzo de identidad 'Ambassador'.", editable: [] };
  if (t.includes("expert signup")) return { explanation: "Registro de experto/influencer. Canal de alto valor.", editable: [] };
  if (t.includes("nm signup")) return { explanation: "Registro de Network Marketer.", editable: [] };
  if (t.includes("waitlist join")) return { explanation: "Unión a waitlist del Smart Wristband.", editable: [] };

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

  // ─── Numeric-only values ───
  if (/^\d+$/.test(t)) return { explanation: `Valor actual en tiempo real: ${t}.`, editable: [] };

  // ─── Generic fallback ───
  return { explanation: `"${tag}" — Metadata de clasificación.`, editable: [] };
}

// ─── Tag icon mapping ───
const TAG_ICONS: Record<string, LucideIcon> = {
  sms: Smartphone, "sms + mms": Smartphone, email: Mail, whatsapp: Send,
  web: Globe, "web + email": Globe, social: Share2,
  content: Box, product: Box, cta: Tag, hero: Tag, trust: Tag,
  urgency: Clock, viral: TrendingUp, "value stack": Tag, system: Zap,
};

export function getTagIcon(tag: string): LucideIcon {
  const t = tag.toLowerCase().trim();
  if (TAG_ICONS[t]) return TAG_ICONS[t];
  if (t.includes("sends") || t.includes("views") || t.includes("clicks") || t.includes("shares") || t.includes("impressions") || t.includes("triggers") || t === "weekly") return TrendingUp;
  if (t.includes("cron") || t === "page load" || t.includes("signup") || t.includes("purchase") || t.includes("trigger") || t.includes("milestone") || t.includes("share") || t.includes("intent") || t.includes("scroll") || t === "user click" || t === "user action") return Zap;
  if (t.includes("chars")) return Clock;
  if (t.includes("orders") || t.includes("clips") || t.includes("clippers")) return TrendingUp;
  if (/^\d+$/.test(t)) return TrendingUp;
  return Radio;
}
