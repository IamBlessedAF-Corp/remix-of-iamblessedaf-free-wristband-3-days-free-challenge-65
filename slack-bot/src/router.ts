/**
 * Smart Topic Router — zero API calls, pure keyword matching.
 * Classifies user messages to load only the relevant KB section.
 */

export type Topic = "offer" | "leads" | "money" | "ops" | "general";

const TOPIC_KEYWORDS: Record<Topic, string[]> = {
  offer: [
    "offer", "oferta", "precio", "pricing", "value equation",
    "grand slam", "garantía", "guarantee", "bonus", "scarcity",
    "urgency", "naming", "cobrar", "charge", "package",
    "bundle", "stack", "dream outcome", "commodity", "premium",
    "descuento", "discount", "propuesta", "proposal", "vender",
    "sell", "cierre", "close", "objeción", "objection",
  ],
  leads: [
    "lead", "leads", "outreach", "content", "ads", "paid ads",
    "referral", "affiliate", "cold", "warm", "dm", "dms",
    "funnel", "embudo", "tráfico", "traffic", "followers",
    "seguidores", "audiencia", "audience", "magnet", "lead magnet",
    "instagram", "tiktok", "youtube", "linkedin", "email",
    "prospect", "prospecto", "cliente potencial", "acquisition",
    "adquisición", "cpa", "cac", "roas", "campaign", "campaña",
  ],
  money: [
    "money model", "revenue", "ingreso", "upsell", "downsell",
    "continuity", "recurring", "recurrente", "suscripción",
    "subscription", "ltv", "lifetime value", "churn", "retention",
    "retención", "profit", "ganancia", "margin", "margen",
    "attraction offer", "backend", "frontend", "monetiz",
    "modelo de negocio", "business model", "pricing model",
  ],
  ops: [
    "eos", "rock", "scorecard", "l10", "meeting", "reunión",
    "quarter", "trimestre", "accountability", "hire", "contratar",
    "firing", "despedir", "sop", "process", "proceso", "kpi",
    "metric", "métrica", "team", "equipo", "gwc", "people analyzer",
    "v/to", "vto", "ids", "issue", "integrator", "visionary",
    "org chart", "organigrama",
  ],
  general: [],
};

export function classifyTopic(message: string): Topic {
  const lower = message.toLowerCase();
  const scores: Record<Topic, number> = {
    offer: 0,
    leads: 0,
    money: 0,
    ops: 0,
    general: 0,
  };

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS) as [Topic, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[topic]++;
    }
  }

  const best = Object.entries(scores)
    .filter(([t]) => t !== "general")
    .sort((a, b) => b[1] - a[1])[0];

  // If no strong match (0 or 1 keyword), return general
  return best[1] >= 1 ? (best[0] as Topic) : "general";
}
