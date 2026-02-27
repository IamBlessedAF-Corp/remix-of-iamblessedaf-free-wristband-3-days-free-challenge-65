import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_PROMPT = `# Alex Hormozi — AI Co-Founder de Joel (Joe Da Vincy)

## Identity
Eres Alex Hormozi — el co-founder AI de Joel. Piensas, hablas y aconsejas exactamente como Alex Hormozi: directo, brutal, números primero, zero fluff.
Tienes acceso TOTAL a toda la data del negocio en tiempo real. Usa esos datos para dar consejos específicos, no genéricos.

## Communication Style
- Habla español con términos business en inglés: "Joel, tu offer apesta — hazla grand slam o quédate broke."
- Sé directo y brutal. No endulces nada. Los números hablan.
- Usa marcos de referencia siempre: Value Equation, Core Four, Grand Slam Offer, 3DS, T-E-A-M
- Dibuja frameworks en ASCII cuando sea útil (→, ↑, □, tablas)
- Cierra SIEMPRE con: **"¿Qué paso das ahora?"**
- SIEMPRE referencia datos reales del negocio en tus respuestas. No inventes números.

## Decision Framework
1. **¿Es un problema de OFFER?** → Value Equation, Grand Slam Offer, Pricing, Guarantees
2. **¿Es un problema de LEADS?** → Core Four, Lead Magnets, Lead Getters, Paid Ads
3. **¿Es un problema de MONEY MODEL?** → Attraction, Upsell, Downsell, Continuity
4. **¿Es un problema de PEOPLE?** → EOS + 3DS + Hiring Barbell + T-E-A-M
5. **¿Es un problema de OPERATIONS?** → EOS SOPs + Scorecard + L10 + Rocks

## Knowledge Base

### VALUE EQUATION
Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort and Sacrifice)

### GRAND SLAM OFFER
- Identify Dream Outcome → List All Problems → Create Solutions → Trim & Stack
- Enhancers: Scarcity + Urgency + Bonuses + Guarantees + Naming (MAGIC)
- Premium pricing → premium clients → premium results

### CORE FOUR (Lead Generation)
1. Warm Outreach (1-to-1, warm) — "100 person list"
2. Free Content (1-to-many, warm) — "Give away secrets, sell implementation"
3. Cold Outreach (1-to-1, cold) — "100 cold outreach per day"
4. Paid Ads (1-to-many, cold) — "Creative > targeting"
Scale: More → Better → New

### LEAD GETTERS
1. Customer Referrals  2. Employees  3. Agencies  4. Affiliates

### MONEY MODEL STACK
[Attraction Offer: FREE/Low] → [Core Offer: $X,XXX] → [Upsell: +$X,XXX] → [Downsell: $XXX] → [Continuity: $XX/mo]
Metrics: LTGP, CAC, LTV:CAC (min 3:1)

### PRICING
- Never compete on price — compete on VALUE
- Higher prices = higher perceived value, better clients, better results

### JOEL'S CONTEXT (IamBlessedAF)
- Company: IamBlessedAF Corp — EOS-based with Hormozi frameworks
- Active Projects: Luxuri, Ninja Agents AI, Consignment Deals, El Patron, PBS
- Key Frameworks: Value Equation, Core Four, Money Model Stack, 3DS, T-E-A-M

## Rules
1. No hallucinations — usa la data real que tienes abajo. Si no tienes un dato, di "no tengo esa data, pero basado en lo que veo..."
2. Números primero — siempre cuantifica usando la data real
3. Frameworks siempre — nunca des consejo sin un framework
4. Actionable — cada respuesta debe incluir next steps específicos
5. Challenge Joel — empújalo a pensar más grande: "¿Why not 10x?"
6. Consistencia — misma voz, misma energía, siempre
7. Cuando te pregunten sobre algo del negocio, SIEMPRE usa los datos reales de abajo para responder

## Voice
BAD: "Quizás podrías considerar mejorar tu oferta..."
GOOD: "Joel, tienes $X en revenue con Y orders. Tu tier más vendido es Z. Pero mira — tu conversion rate de abandoned carts es XX%. Eso es dinero en la mesa. ¿Qué paso das ahora?"`;

async function fetchAllBusinessData() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, supabaseKey);

  const queries = {
    // Revenue & Orders
    orders: sb.from("orders").select("tier, amount_cents, status, created_at, referral_code, customer_email"),
    abandonedCarts: sb.from("abandoned_carts").select("status, tier, created_at, recovery_channel, sms_15min_status"),
    
    // Leads
    expertLeads: sb.from("expert_leads").select("full_name, email, niche, status, source_page, created_at"),
    creatorProfiles: sb.from("creator_profiles").select("display_name, email, referral_code, referred_by_code, blessings_confirmed, instagram_handle, tiktok_handle, twitter_handle, created_at"),
    challengeParticipants: sb.from("challenge_participants").select("display_name, phone, challenge_status, current_streak, longest_streak, friend_1_name, friend_2_name, friend_3_name, created_at"),
    waitlist: sb.from("smart_wristband_waitlist").select("email, first_name, created_at"),
    
    // Viral & Referrals
    nominations: sb.from("nominations").select("sender_name, recipient_name, status, accepted_at, chain_depth, created_at"),
    nominationChains: sb.from("nomination_chains").select("root_user_name, total_nominations, total_acceptances, max_depth, created_at"),
    blessings: sb.from("blessings").select("recipient_name, confirmed_at, created_at"),
    affiliateTiers: sb.from("affiliate_tiers").select("current_tier, wristbands_distributed, credit_amount, created_at"),
    ambassadorLevels: sb.from("ambassador_levels").select("level, total_referrals, commission_rate, total_earned_cents, created_at"),
    referralSprints: sb.from("referral_sprints").select("name, status, starts_at, ends_at, prize_description"),
    sprintEntries: sb.from("sprint_entries").select("nominations_count, acceptances_count"),
    
    // Clippers
    clipSubmissions: sb.from("clip_submissions").select("clip_url, platform, view_count, net_views, earnings_cents, status, ctr, reg_rate, day1_post_rate, created_at"),
    clipperPayouts: sb.from("clipper_payouts").select("week_key, status, total_cents, total_net_views, clips_count, base_earnings_cents, bonus_cents"),
    clipperBonuses: sb.from("clipper_monthly_bonuses").select("month_key, bonus_tier, bonus_cents, monthly_views, lifetime_views, paid"),
    riskThrottle: sb.from("clipper_risk_throttle").select("is_active, current_avg_ctr, current_avg_reg_rate, current_avg_day1_rate, rpm_override"),
    
    // Operations
    boardColumns: sb.from("board_columns").select("name, position"),
    boardCards: sb.from("board_cards").select("title, priority, column_id, stage, staging_status, delegation_score, completed_at, labels, created_at"),
    roadmapItems: sb.from("roadmap_items").select("title, phase, priority, is_active, detail"),
    errorEvents: sb.from("error_events").select("message, level, source, component, page_url, resolved_at, created_at").order("created_at", { ascending: false }).limit(50),
    
    // Budget
    budgetCycles: sb.from("budget_cycles").select("status, start_date, end_date, global_weekly_limit_cents, global_monthly_limit_cents, max_payout_per_clip_cents"),
    budgetSegments: sb.from("budget_segments").select("name, is_active, weekly_limit_cents, monthly_limit_cents, priority"),
    
    // BlessedCoins Economy
    bcWallets: sb.from("bc_wallets").select("balance, lifetime_earned, lifetime_spent, streak_days"),
    bcStoreItems: sb.from("bc_store_items").select("name, category, cost_bc, stock, is_active, reward_type"),
    bcRedemptions: sb.from("bc_redemptions").select("cost_bc, status, created_at"),
    
    // Short Links & Tracking
    shortLinks: sb.from("short_links").select("short_code, title, destination_url, click_count, campaign, is_active, created_at"),
    
    // Challenge & Engagement
    challengeEvents: sb.from("challenge_events").select("name, status, starts_at, ends_at, theme, prize_description"),
    scheduledMessages: sb.from("scheduled_gratitude_messages").select("day_number, friend_name, status, message_sent_at"),
    followupSequences: sb.from("followup_sequences").select("sequence_type, status, step_number, channel"),
    
    // Config
    campaignConfig: sb.from("campaign_config").select("key, value, label, category, description"),
    
    // SMS & Comms
    smsDeliveries: sb.from("sms_deliveries").select("status, source_page, created_at").order("created_at", { ascending: false }).limit(100),
    
    // QR Scans
    qrScans: sb.from("qr_scans").select("converted_to_signup, created_at"),
    
    // Repost Logs
    repostLogs: sb.from("repost_logs").select("clip_title, created_at"),
    
    // Activity Feed
    portalActivity: sb.from("portal_activity").select("event_type, display_text, created_at").order("created_at", { ascending: false }).limit(20),
    
    // Exit Intent
    exitIntentEvents: sb.from("exit_intent_events").select("event_type, page, created_at").order("created_at", { ascending: false }).limit(50),
  };

  const results: Record<string, any> = {};
  const entries = Object.entries(queries);
  const settled = await Promise.allSettled(entries.map(([, q]) => q));
  
  for (let i = 0; i < entries.length; i++) {
    const [key] = entries[i];
    const result = settled[i];
    if (result.status === "fulfilled") {
      results[key] = result.value.data ?? [];
    } else {
      results[key] = [];
    }
  }

  return results;
}

function buildDataSnapshot(data: Record<string, any[]>): string {
  const orders = data.orders ?? [];
  const completedOrders = orders.filter((o: any) => o.status === "completed");
  const totalRevenue = completedOrders.reduce((s: number, o: any) => s + o.amount_cents, 0);
  const tierBreakdown: Record<string, { count: number; revenue: number }> = {};
  for (const o of completedOrders) {
    if (!tierBreakdown[o.tier]) tierBreakdown[o.tier] = { count: 0, revenue: 0 };
    tierBreakdown[o.tier].count++;
    tierBreakdown[o.tier].revenue += o.amount_cents;
  }
  const referralOrders = completedOrders.filter((o: any) => o.referral_code);

  const abandoned = data.abandonedCarts ?? [];
  const recoveredCarts = abandoned.filter((c: any) => c.status === "recovered" || c.status === "completed");

  const leads = data.expertLeads ?? [];
  const leadsByStatus: Record<string, number> = {};
  for (const l of leads) { leadsByStatus[l.status] = (leadsByStatus[l.status] ?? 0) + 1; }

  const creators = data.creatorProfiles ?? [];
  const creatorsWithSocial = creators.filter((c: any) => c.instagram_handle || c.tiktok_handle || c.twitter_handle);
  const creatorsReferred = creators.filter((c: any) => c.referred_by_code);
  const totalBlessingsConfirmed = creators.reduce((s: number, c: any) => s + (c.blessings_confirmed ?? 0), 0);

  const participants = data.challengeParticipants ?? [];
  const activeParticipants = participants.filter((p: any) => p.challenge_status === "active");
  const avgStreak = activeParticipants.length > 0 
    ? activeParticipants.reduce((s: number, p: any) => s + (p.current_streak ?? 0), 0) / activeParticipants.length 
    : 0;

  const nominations = data.nominations ?? [];
  const acceptedNominations = nominations.filter((n: any) => n.status === "accepted");
  const chains = data.nominationChains ?? [];
  const totalChainNominations = chains.reduce((s: number, c: any) => s + (c.total_nominations ?? 0), 0);
  const totalChainAcceptances = chains.reduce((s: number, c: any) => s + (c.total_acceptances ?? 0), 0);

  const clips = data.clipSubmissions ?? [];
  const verifiedClips = clips.filter((c: any) => c.status === "verified");
  const totalViews = clips.reduce((s: number, c: any) => s + (c.view_count ?? 0), 0);
  const totalNetViews = clips.reduce((s: number, c: any) => s + (c.net_views ?? 0), 0);
  const totalClipEarnings = clips.reduce((s: number, c: any) => s + (c.earnings_cents ?? 0), 0);
  const avgCTR = verifiedClips.length > 0 
    ? verifiedClips.reduce((s: number, c: any) => s + (Number(c.ctr) ?? 0), 0) / verifiedClips.length 
    : 0;

  const payouts = data.clipperPayouts ?? [];
  const totalPayoutsCents = payouts.reduce((s: number, p: any) => s + (p.total_cents ?? 0), 0);
  const paidPayouts = payouts.filter((p: any) => p.status === "paid");

  const cards = data.boardCards ?? [];
  const completedCards = cards.filter((c: any) => c.completed_at);
  const criticalCards = cards.filter((c: any) => c.priority === "critical");
  const highCards = cards.filter((c: any) => c.priority === "high");

  const roadmap = data.roadmapItems ?? [];
  const activeRoadmap = roadmap.filter((r: any) => r.is_active);
  const roadmapByPhase: Record<string, number> = {};
  for (const r of activeRoadmap) { roadmapByPhase[r.phase] = (roadmapByPhase[r.phase] ?? 0) + 1; }

  const errors = data.errorEvents ?? [];
  const unresolvedErrors = errors.filter((e: any) => !e.resolved_at);
  const fatalErrors = unresolvedErrors.filter((e: any) => e.level === "fatal");

  const wallets = data.bcWallets ?? [];
  const totalBCCirculating = wallets.reduce((s: number, w: any) => s + (w.balance ?? 0), 0);
  const totalBCEarned = wallets.reduce((s: number, w: any) => s + (w.lifetime_earned ?? 0), 0);
  const totalBCSpent = wallets.reduce((s: number, w: any) => s + (w.lifetime_spent ?? 0), 0);

  const shortLinks = data.shortLinks ?? [];
  const totalClicks = shortLinks.reduce((s: number, l: any) => s + (l.click_count ?? 0), 0);
  const topLinks = [...shortLinks].sort((a: any, b: any) => (b.click_count ?? 0) - (a.click_count ?? 0)).slice(0, 5);

  const qrScans = data.qrScans ?? [];
  const qrConverted = qrScans.filter((q: any) => q.converted_to_signup);

  const sms = data.smsDeliveries ?? [];
  const smsSent = sms.filter((s: any) => s.status === "sent" || s.status === "delivered");

  const config = data.campaignConfig ?? [];
  const exitEvents = data.exitIntentEvents ?? [];

  const activity = data.portalActivity ?? [];

  const affiliates = data.affiliateTiers ?? [];
  const ambassadors = data.ambassadorLevels ?? [];
  const totalAmbassadorEarnings = ambassadors.reduce((s: number, a: any) => s + (a.total_earned_cents ?? 0), 0);

  const blessings = data.blessings ?? [];
  const confirmedBlessings = blessings.filter((b: any) => b.confirmed_at);

  const sprints = data.referralSprints ?? [];
  const activeSprints = sprints.filter((s: any) => s.status === "active");

  const challengeEvents = data.challengeEvents ?? [];
  const activeChallenges = challengeEvents.filter((e: any) => e.status === "active");

  const budgetCycles = data.budgetCycles ?? [];
  const budgetSegments = data.budgetSegments ?? [];

  const repostLogs = data.repostLogs ?? [];
  const followups = data.followupSequences ?? [];
  const sentFollowups = followups.filter((f: any) => f.status === "sent");

  const store = data.bcStoreItems ?? [];
  const redemptions = data.bcRedemptions ?? [];

  const throttle = data.riskThrottle ?? [];
  const activeThrottle = throttle.find((t: any) => t.is_active);

  return `
---
## 📊 LIVE BUSINESS DATA SNAPSHOT (Real-time)
Generated: ${new Date().toISOString()}

### 💰 REVENUE & ORDERS
- Total Orders: ${orders.length} (Completed: ${completedOrders.length})
- Total Revenue: $${(totalRevenue / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
- Revenue from Referrals: ${referralOrders.length} orders (${completedOrders.length > 0 ? ((referralOrders.length / completedOrders.length) * 100).toFixed(1) : 0}%)
- Tier Breakdown:
${Object.entries(tierBreakdown).map(([tier, d]) => `  • ${tier}: ${d.count} orders — $${(d.revenue / 100).toFixed(2)}`).join("\n")}

### 🛒 ABANDONED CARTS
- Total Abandoned: ${abandoned.length}
- Recovered: ${recoveredCarts.length} (${abandoned.length > 0 ? ((recoveredCarts.length / abandoned.length) * 100).toFixed(1) : 0}% recovery rate)
- Recovery Channels Used: ${[...new Set(abandoned.map((c: any) => c.recovery_channel).filter(Boolean))].join(", ") || "None"}

### 👥 LEADS & COMMUNITY
- Expert Leads: ${leads.length} — Status: ${JSON.stringify(leadsByStatus)}
- Creator Profiles: ${creators.length} (with social: ${creatorsWithSocial.length}, referred: ${creatorsReferred.length})
- Total Blessings Confirmed by Creators: ${totalBlessingsConfirmed}
- Challenge Participants: ${participants.length} (Active: ${activeParticipants.length}, Avg Streak: ${avgStreak.toFixed(1)} days)
- Wristband Waitlist: ${(data.waitlist ?? []).length}

### 🔗 VIRAL & REFERRALS
- Nominations: ${nominations.length} (Accepted: ${acceptedNominations.length}, Rate: ${nominations.length > 0 ? ((acceptedNominations.length / nominations.length) * 100).toFixed(1) : 0}%)
- Nomination Chains: ${chains.length} (Total in chains: ${totalChainNominations}, Acceptances: ${totalChainAcceptances})
- Blessings: ${blessings.length} sent, ${confirmedBlessings.length} confirmed (${blessings.length > 0 ? ((confirmedBlessings.length / blessings.length) * 100).toFixed(1) : 0}% confirmation rate)
- Affiliate Tiers: ${affiliates.length} affiliates — Tiers: ${JSON.stringify(affiliates.reduce((a: any, t: any) => { a[t.current_tier] = (a[t.current_tier] ?? 0) + 1; return a; }, {}))}
- Ambassador Levels: ${ambassadors.length} — Total Earned: $${(totalAmbassadorEarnings / 100).toFixed(2)}
- Active Sprints: ${activeSprints.length > 0 ? activeSprints.map((s: any) => `${s.name} (${s.starts_at} → ${s.ends_at})`).join(", ") : "None"}
- K-Factor Inputs: Avg nominations per user ≈ ${creators.length > 0 ? (nominations.length / creators.length).toFixed(2) : "N/A"}, Acceptance rate ≈ ${nominations.length > 0 ? ((acceptedNominations.length / nominations.length) * 100).toFixed(1) + "%" : "N/A"}

### 🎬 CLIPPERS PROGRAM
- Total Clips Submitted: ${clips.length} (Verified: ${verifiedClips.length})
- Total Views: ${totalViews.toLocaleString()} (Net: ${totalNetViews.toLocaleString()})
- Total Clip Earnings: $${(totalClipEarnings / 100).toFixed(2)}
- Avg CTR (verified): ${(avgCTR * 100).toFixed(2)}%
- Payouts: ${payouts.length} total — $${(totalPayoutsCents / 100).toFixed(2)} total — ${paidPayouts.length} paid
${activeThrottle ? `- ⚠️ RISK THROTTLE ACTIVE: CTR=${(Number(activeThrottle.current_avg_ctr) * 100).toFixed(2)}%, RegRate=${(Number(activeThrottle.current_avg_reg_rate) * 100).toFixed(2)}%, Day1Rate=${(Number(activeThrottle.current_avg_day1_rate) * 100).toFixed(2)}%` : "- Risk Throttle: Inactive"}

### 📋 OPERATIONS (Board & Roadmap)
- Board Cards: ${cards.length} total (Completed: ${completedCards.length}, Critical: ${criticalCards.length}, High: ${highCards.length})
- Recent Card Titles: ${cards.slice(0, 10).map((c: any) => c.title).join(" | ")}
- Active Roadmap Items: ${activeRoadmap.length} — By Phase: ${JSON.stringify(roadmapByPhase)}
- Roadmap Details: ${activeRoadmap.slice(0, 8).map((r: any) => `[${r.phase}] ${r.title} (${r.priority})`).join(" | ")}

### 🐛 ERRORS & HEALTH
- Unresolved Errors: ${unresolvedErrors.length} (Fatal: ${fatalErrors.length})
- Recent Errors: ${unresolvedErrors.slice(0, 5).map((e: any) => `${e.level}: ${e.message.slice(0, 60)}`).join(" | ") || "None"}

### 🪙 BLESSEDCOINS ECONOMY
- Active Wallets: ${wallets.length}
- BC Circulating: ${totalBCCirculating.toLocaleString()} BC
- Lifetime Earned: ${totalBCEarned.toLocaleString()} BC | Spent: ${totalBCSpent.toLocaleString()} BC
- Store Items: ${store.filter((s: any) => s.is_active).length} active — ${redemptions.length} total redemptions

### 🔗 SHORT LINKS & QR
- Short Links: ${shortLinks.length} (Active: ${shortLinks.filter((l: any) => l.is_active).length})
- Total Clicks: ${totalClicks.toLocaleString()}
- Top 5 Links: ${topLinks.map((l: any) => `${l.title || l.short_code}: ${l.click_count} clicks`).join(" | ")}
- QR Scans: ${qrScans.length} (Converted: ${qrConverted.length}, Rate: ${qrScans.length > 0 ? ((qrConverted.length / qrScans.length) * 100).toFixed(1) : 0}%)

### 📱 SMS & COMMS
- SMS Sent (recent 100): ${smsSent.length} delivered
- Repost Logs: ${repostLogs.length}
- Follow-up Sequences: ${followups.length} total (Sent: ${sentFollowups.length})

### 🎯 CHALLENGES & EVENTS  
- Active Challenges: ${activeChallenges.length > 0 ? activeChallenges.map((e: any) => e.name).join(", ") : "None"}
- All Events: ${challengeEvents.map((e: any) => `${e.name} (${e.status})`).join(", ") || "None"}

### 💰 BUDGET CONTROL
- Budget Cycles: ${budgetCycles.length} — Active: ${budgetCycles.filter((b: any) => b.status === "approved").length}
${budgetCycles.length > 0 ? `- Latest: Weekly limit $${(budgetCycles[0]?.global_weekly_limit_cents / 100).toFixed(0)}, Monthly $${(budgetCycles[0]?.global_monthly_limit_cents / 100).toFixed(0)}` : ""}
- Budget Segments: ${budgetSegments.length} (Active: ${budgetSegments.filter((s: any) => s.is_active).length})

### ⚙️ CAMPAIGN CONFIG
${config.slice(0, 15).map((c: any) => `- ${c.label}: ${c.value}`).join("\n") || "No config entries"}

### 🕐 EXIT INTENT (recent)
- Exit events: ${exitEvents.length} — Pages: ${[...new Set(exitEvents.map((e: any) => e.page))].join(", ") || "N/A"}

### 📣 RECENT ACTIVITY FEED
${activity.slice(0, 10).map((a: any) => `- [${a.event_type}] ${a.display_text}`).join("\n") || "No recent activity"}
---`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch ALL business data in parallel
    let dataSnapshot = "";
    try {
      const data = await fetchAllBusinessData();
      dataSnapshot = buildDataSnapshot(data);
    } catch (err) {
      console.error("Error fetching business data:", err);
      dataSnapshot = "\n---\n⚠️ Could not fetch live business data. Answer based on frameworks only.\n---";
    }

    const fullSystemPrompt = BASE_PROMPT + dataSnapshot;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 8192,
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("alex-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
