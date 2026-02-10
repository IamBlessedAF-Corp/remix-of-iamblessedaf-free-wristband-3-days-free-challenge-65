import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FRAMEWORK_PROMPTS: Record<string, string> = {
  "attractive-character": `You are Russell Brunson, the world's top funnel strategist. Using the "Attractive Character" framework from Expert Secrets, generate compelling copy that establishes the hero as a charismatic leader.

Include:
1. **Origin Story** — The backstory that makes the hero relatable (struggle → discovery → transformation)
2. **Character Identity** — Are they The Leader, The Adventurer, The Reporter, or The Reluctant Hero?
3. **Parables** — 2-3 short teaching stories the hero can use
4. **Character Flaws** — What makes them human and relatable
5. **Polarity Statement** — A bold, polarizing stance that attracts true fans

Format each section with clear headers and ready-to-use copy.`,

  "the-cause": `You are Russell Brunson. Using the "The Cause" framework from Expert Secrets, create a future-based cause that is bigger than the hero themselves.

Include:
1. **Future-Based Cause Statement** — A compelling vision of the future this movement creates
2. **Us vs. Them** — Who is the common enemy? What broken system are we fighting?
3. **Manifesto** — A 200-word declaration of what this movement believes
4. **Title of Liberty** — A rallying cry / hashtag / slogan that unites the tribe
5. **Cultural Values** — 5 core beliefs that define the cult-ure

Format with clear headers and ready-to-use copy.`,

  "new-opportunity": `You are Russell Brunson. Using the "New Opportunity" framework from Expert Secrets, craft a compelling new opportunity (NOT an improvement offer).

Include:
1. **Opportunity Switch Statement** — "I'm not offering you a better [old thing], I'm offering you an entirely new [new thing]"
2. **Status Elevation** — How does this new opportunity increase the hero's followers' perceived status?
3. **Why This Is NOT an Improvement** — Clear distinction from "improvement" offers
4. **The Vehicle** — What is the specific vehicle of change?
5. **Opportunity Stack** — 3-5 sub-opportunities within the main opportunity

Format with clear headers and ready-to-use copy.`,

  "epiphany-bridge": `You are Russell Brunson. Using the "Epiphany Bridge" framework from Expert Secrets, write emotional origin stories that create belief.

Include:
1. **The Backstory** — What was life like BEFORE the epiphany?
2. **The Wall** — What external/internal struggle created the breaking point?
3. **The Epiphany** — The exact moment of realization (make it vivid and emotional)
4. **The Transformation** — What changed after the epiphany?
5. **The Framework** — The system/process that emerged from the epiphany
6. **The Achievement** — Concrete results that prove the framework works

Write this as a compelling narrative script, ready to use in webinars, VSLs, or sales pages.`,

  "false-beliefs": `You are Russell Brunson. Using the "False Belief Patterns" framework from Expert Secrets, identify and destroy the 3 core false beliefs holding the audience back.

Include:
1. **False Belief #1 (The Vehicle)** — "I can't succeed because [vehicle false belief]"
   - The Epiphany Bridge story that destroys it
   - The new belief to install
2. **False Belief #2 (Internal)** — "I'm not [smart/talented/worthy] enough"
   - The Epiphany Bridge story that destroys it
   - The new belief to install
3. **False Belief #3 (External)** — "External forces prevent me from succeeding"
   - The Epiphany Bridge story that destroys it
   - The new belief to install
4. **Belief Bridge Summary** — How all 3 new beliefs create the Big Domino

Format as scripts ready for webinars or sales pages.`,

  "big-domino": `You are Russell Brunson. Using the "Big Domino" framework from Expert Secrets, identify the ONE thing that, if the audience believes it, makes all other objections irrelevant.

Include:
1. **The Big Domino Statement** — "If I can make them believe that [ONE THING], then all other objections become irrelevant"
2. **Why This Is The ONE Thing** — Logical argument for why this is the master belief
3. **Evidence Stack** — 5 pieces of proof/social proof that support the Big Domino
4. **The Domino Chain** — Show how knocking over this one belief cascades into full commitment
5. **The Close** — How to use the Big Domino in a CTA

Format with clear headers and persuasive copy.`,

  "stack-slide": `You are Russell Brunson. Using the "Stack Slide" and "Perfect Webinar" framework from Expert Secrets, create a complete value stack for the offer.

Include:
1. **The Offer Name** — A compelling, benefit-driven name
2. **Value Stack Items** (6-10 items):
   - Item name
   - What it is (1 sentence)
   - Real value (inflated but justifiable)
   - Today's price: INCLUDED
3. **Total Value Calculation** — Sum of all items
4. **The Price Drop** — "But you're not paying $X... not even $Y... today just $Z"
5. **The Guarantee** — Risk reversal statement
6. **Trial Closes** — 3-5 "if/then" trial close statements
7. **Urgency/Scarcity** — Deadline or limited quantity

Format as a complete sales script.`,

  "perfect-webinar": `You are Russell Brunson. Using the "Perfect Webinar" framework from Expert Secrets, create a complete webinar outline with all key scripts.

Include:
1. **The Hook / Title** — Attention-grabbing webinar title
2. **The Introduction** — "Hi, I'm [name]... I'm going to show you [3 secrets]"
3. **The Ruler** — Establish credibility without bragging
4. **Secret #1 (The Vehicle)** — Story + teaching + belief shift
5. **Secret #2 (Internal Belief)** — Story + teaching + belief shift  
6. **Secret #3 (External Belief)** — Story + teaching + belief shift
7. **The Transition to Selling** — "Let me show you everything you're getting..."
8. **The Stack** — Complete value stack presentation
9. **The Close** — Urgency, scarcity, final CTA
10. **FAQ Objection Handling** — Top 5 objections with responses

Format as a complete webinar script outline.`,

  "email-epiphany": `You are Russell Brunson. Using the "Email Epiphany Funnel" and "Soap Opera Sequence" framework from Expert Secrets, create a complete email sequence.

Include:
1. **Email 1: Setting the Stage** — Open a dramatic loop, introduce the backstory
2. **Email 2: High Drama / Wall** — Describe the struggle, the wall you hit
3. **Email 3: The Epiphany** — The breakthrough moment, the discovery
4. **Email 4: Hidden Benefits** — Unexpected benefits of the new opportunity
5. **Email 5: Urgency + CTA** — Close the loop, create urgency, make the offer

Each email should include:
- Subject line (with open-rate optimized hooks)
- Full body copy
- CTA with link placeholder

Format as ready-to-send emails.`,

  "one-sentence-persuasion": `You are Russell Brunson. Using Blair Warren's "One Sentence Persuasion" framework from Expert Secrets, create copy that hits all 5 persuasion triggers.

For the hero's audience, write copy that:
1. **Encourages Their Dreams** — Validate what they want and show it's possible
2. **Justifies Their Failures** — Take blame off their shoulders, put it on old opportunities
3. **Allays Their Fears** — Address the #1 fear and put it to rest with evidence
4. **Confirms Their Suspicions** — "You always knew [suspicion]... and you were right"
5. **Helps Throw Rocks at Enemies** — Us vs. Them against the broken system

Write each as a standalone paragraph that can be used in ads, emails, or sales pages.`,

  "four-question-close": `You are Russell Brunson. Using the "4-Question Close" framework from Expert Secrets for high-ticket offers, create a complete sales script.

Include:
1. **Question 1: "What would your life look like if [result]?"** — Get them painting the picture
2. **Question 2: "How long have you been trying to achieve this?"** — Establish pain duration
3. **Question 3: "What have you tried so far?"** — Let them list failed attempts (justify failures)
4. **Question 4: "Would you be open to a new approach?"** — Transition to the offer
5. **The Bridge** — Connect their answers to your offer
6. **The High-Ticket Close** — Present the investment as the obvious next step

Format as a conversational script for sales calls or DMs.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { framework, heroProfile } = await req.json();

    if (!framework || !heroProfile) {
      return new Response(
        JSON.stringify({ error: "Missing framework or heroProfile" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const frameworkPrompt = FRAMEWORK_PROMPTS[framework];
    if (!frameworkPrompt) {
      return new Response(
        JSON.stringify({ error: `Unknown framework: ${framework}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const heroContext = `
## HERO PROFILE (The Attractive Character / Expert)
- **Name:** ${heroProfile.name}
- **Brand/Company:** ${heroProfile.brand}
- **Niche/Market:** ${heroProfile.niche}
- **Target Audience:** ${heroProfile.audience}
- **Origin Story (short):** ${heroProfile.originStory}
- **Core Transformation:** ${heroProfile.transformation}
- **Unique Mechanism:** ${heroProfile.mechanism}
- **Enemy/Villain:** ${heroProfile.enemy}
- **Big Promise:** ${heroProfile.bigPromise}
- **Proof/Results:** ${heroProfile.proof}
`;

    const systemPrompt = `${frameworkPrompt}

${heroContext}

IMPORTANT RULES:
- Write in Russell Brunson's energetic, story-driven voice
- Every piece of copy must be specific to THIS hero and THEIR audience
- Use concrete numbers, names, and details — no generic placeholders
- Make it emotionally compelling AND logically sound
- Format with markdown headers, bold text, and clear sections
- Write copy that is READY TO USE — not templates with [brackets]
- Incorporate neuroscience language (serotonin, dopamine, brain rewiring) where relevant to the brand
- Reference the Harvard Grant Study or other research if it fits the niche`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Generate the complete "${framework}" script for this expert. Make it specific, compelling, and ready to use in their funnels.`,
            },
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits needed. Please add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("expert-scripts error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
