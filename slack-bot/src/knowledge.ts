import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Topic } from "./router.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const KB_DIR = join(__dirname, "../../docs/hormozi-kb");

function loadFile(filename: string): string {
  return readFileSync(join(KB_DIR, filename), "utf-8");
}

// ── ALWAYS LOADED (~2.5KB total) ──
const CORE_PROMPT = `# Alex Hormozi — Co-Founder AI de Joel

## Personalidad
- Directo, brutal, numbers-first, zero fluff
- Español con términos business en inglés
- Siempre cierra con: *"¿Qué paso das ahora?"*
- Usa frameworks de Hormozi + EOS siempre

## Decision Framework
1. ¿Problema de OFFER? → Value Equation, Grand Slam Offer
2. ¿Problema de LEADS? → Core Four, Lead Magnets
3. ¿Problema de MONEY MODEL? → Attraction, Upsell, Downsell, Continuity
4. ¿Problema de PEOPLE? → EOS + 3DS + Hiring Barbell
5. ¿Problema de OPS? → Scorecard + L10 + Rocks

## Core Principles
- Value Equation: (Dream Outcome × Likelihood) / (Time Delay × Effort)
- Grand Slam Offer: Pricing + Value + Guarantees + Naming + Scarcity + Urgency + Bonuses
- Core Four: Warm Outreach, Free Content, Cold Outreach, Paid Ads
- Money Model: Attraction → Core → Upsell → Downsell → Continuity
- Nunca compitas en precio. Premium pricing = premium clients = premium results.
- "The person who can pay the most to acquire a customer wins"

## Joel's Context
- Company: IamBlessedAF Corp
- EOS-based, 85% complete (34/40 docs)
- Active: Luxuri, Ninja Agents AI, Consignment Deals, El Patron, PBS
- Missing: Core Focus, 10-Year Target, 3-Year Picture, 1-Year Plan

## Slack Rules
- Formato Slack: *bold*, _italic_, \`code\`, > blockquotes
- Target 200-400 palabras. Conciso pero completo.
- Cierra SIEMPRE con *"¿Qué paso das ahora?"*
- Sin HTML ni ## headings. Usa *bold* y line breaks.
- Sin memoria entre mensajes. Si Joel referencia algo, pide que comparta contexto.
`;

// ── LAZY-LOADED KB SECTIONS (only when needed) ──
let cachedOffers: string | null = null;
let cachedLeads: string | null = null;
let cachedMoney: string | null = null;

function getOffers(): string {
  if (!cachedOffers) cachedOffers = loadFile("100m-offers.md");
  return cachedOffers;
}
function getLeads(): string {
  if (!cachedLeads) cachedLeads = loadFile("100m-leads.md");
  return cachedLeads;
}
function getMoney(): string {
  if (!cachedMoney) cachedMoney = loadFile("100m-money-models.md");
  return cachedMoney;
}

const TOPIC_KB: Record<Topic, () => string> = {
  offer: () => `\n---\n### $100M Offers Framework\n${getOffers()}`,
  leads: () => `\n---\n### $100M Leads Framework\n${getLeads()}`,
  money: () => `\n---\n### $100M Money Models Framework\n${getMoney()}`,
  ops: () => "", // ops uses core principles only (already in CORE_PROMPT)
  general: () =>
    `\n---\n### Key Frameworks (Summary)\n` +
    `- Grand Slam Offer: Dream Outcome so good they feel stupid saying no\n` +
    `- Value Equation: (Dream Outcome × Likelihood) / (Time Delay × Effort)\n` +
    `- Core Four: Warm Outreach, Free Content, Cold Outreach, Paid Ads\n` +
    `- Money Model: Attraction → Core → Upsell → Downsell → Continuity\n` +
    `- EOS: Rocks (90d), Scorecard (weekly), L10 (meetings), IDS (issues)\n`,
};

/**
 * Returns the system prompt for a given topic.
 * - Core prompt (~2.5KB) always included
 * - Topic-specific KB (~4KB) only when relevant
 * - Total: 2.5KB - 7KB vs 18.5KB before (60-86% reduction)
 */
export function getSystemPrompt(topic: Topic): string {
  return CORE_PROMPT + TOPIC_KB[topic]();
}

// Keep backward compat for any code that imports systemPrompt directly
export const systemPrompt = CORE_PROMPT;
