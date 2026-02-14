import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, niche } = await req.json();
    if (!email) throw new Error("Email is required");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");

    const greeting = name ? `Hey ${name}` : "Hey";
    const nicheTag = niche || "Network Marketing";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin:0; padding:0; background:#0a0a0a; color:#e5e5e5; font-family:Georgia,'Times New Roman',serif; line-height:1.7; }
    .container { max-width:540px; margin:0 auto; padding:48px 24px; }
    p { margin:0 0 18px; font-size:16px; }
    .hl { color:#fff; font-weight:bold; }
    .red { color:#ef4444; font-weight:bold; }
    .box { background:#111; border:1px solid #222; border-radius:12px; padding:20px; margin:24px 0; }
    .script-box { background:#111; border:1px solid #222; border-radius:12px; padding:20px; margin:16px 0; }
    .script-title { font-size:14px; font-weight:bold; color:#ef4444; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; }
    .dm-text { font-size:14px; color:#ccc; line-height:1.7; white-space:pre-wrap; background:#0d0d0d; border:1px solid #1a1a1a; border-radius:8px; padding:16px; margin-bottom:8px; }
    .tip { font-size:12px; color:#888; font-style:italic; margin-top:4px; }
    .cta-btn { display:inline-block; background:#ef4444; color:#fff; padding:14px 32px; border-radius:12px; text-decoration:none; font-weight:900; font-size:16px; margin:8px 0; }
    .divider { border:0; border-top:1px solid #222; margin:32px 0; }
    .sig { margin-top:40px; padding-top:24px; border-top:1px solid #222; color:#888; font-size:14px; }
    .preview { display:none; max-height:0; overflow:hidden; mso-hide:all; }
  </style>
</head>
<body>
  <div class="preview">Your 5 copy-paste DM scripts + clip library are inside 🎁</div>
  <div class="container">
    <p>${greeting} — welcome to the <span class="hl">Gratitude Gifting Engine</span> 🔥</p>

    <p>You're one of the first network marketers to get access to this system. Below are your <span class="red">5 copy-paste DM ice-breaker scripts</span> — one for each platform — plus your clip library link.</p>

    <p>The strategy is simple: <span class="hl">Lead with a gift, not a pitch.</span></p>

    <hr class="divider">

    <!-- SCRIPT 1: INSTAGRAM DM -->
    <div class="script-box">
      <div class="script-title">📸 Script #1 — Instagram DM</div>
      <div class="dm-text">Hey [NAME]! 👋 I saw your post about [TOPIC] — love your energy!

Random question: have you heard about gratitude neuroscience? There's this wild study showing it rewires your brain for happiness 27x faster than meditation.

I'm part of a movement that gifts FREE "I Am Blessed AF" wristbands to people who inspire me. Want me to send you one? No catch — they also donate 11 meals to Feeding America when you claim it 🙏

Just thought of you! 💛</div>
      <p class="tip">💡 Tip: Comment on their recent story FIRST, then send this DM 30 min later. Warm touch = 4x more replies.</p>
    </div>

    <!-- SCRIPT 2: TIKTOK COMMENT → DM -->
    <div class="script-box">
      <div class="script-title">🎵 Script #2 — TikTok Comment → DM</div>
      <p style="font-size:13px; color:#aaa; margin-bottom:8px;"><strong style="color:#fff;">Step 1 — Comment on their video:</strong></p>
      <div class="dm-text">This is so good 🔥 You'd love the neuroscience behind this — DM me "BLESSED" and I'll send you a free gratitude wristband 🙏</div>
      <p style="font-size:13px; color:#aaa; margin:12px 0 8px;"><strong style="color:#fff;">Step 2 — When they DM you:</strong></p>
      <div class="dm-text">Hey!! So glad you reached out 🙌

So basically Dr. Huberman proved that RECEIVING gratitude triggers a dopamine + serotonin cascade in your brain — way more powerful than journaling alone.

We make these wristbands that remind you to give AND receive gratitude daily. I'd love to send you a free one!

Here's the link to claim yours (you just cover $9.95 shipping and it feeds 11 people through Feeding America): [YOUR LINK]

Let me know when you claim it! 🎁</div>
      <p class="tip">💡 Tip: Pin a "DM me BLESSED for a free wristband" comment on your viral reposts.</p>
    </div>

    <!-- SCRIPT 3: FACEBOOK MESSENGER -->
    <div class="script-box">
      <div class="script-title">💬 Script #3 — Facebook Messenger</div>
      <div class="dm-text">Hey [NAME]! Hope you're having an amazing week 🌟

So I've been diving deep into gratitude neuroscience (the science behind WHY some people just seem happier) and I joined this movement that gifts free "I Am Blessed AF" wristbands.

I immediately thought of you because [PERSONAL REASON — "you always spread positivity" / "your posts about family always inspire me"].

Would you want one? It's totally free — shipping is $9.95 and it donates 11 meals to families in need. Win-win-win 🙏

Here's the link if you're interested: [YOUR LINK]

No pressure at all! Just wanted to bless you today 💛</div>
      <p class="tip">💡 Tip: Use voice messages on Messenger for 2x more engagement. Record yourself saying the first 2 sentences.</p>
    </div>

    <!-- SCRIPT 4: LINKEDIN -->
    <div class="script-box">
      <div class="script-title">💼 Script #4 — LinkedIn (Professional Angle)</div>
      <div class="dm-text">Hi [NAME],

I came across your profile and really admire [SPECIFIC THING — their business, a post, their mission].

I'm part of a neuroscience-backed gratitude initiative (backed by research from Dr. Andrew Huberman at Stanford). We gift free "I Am Blessed AF" wristbands as a daily reminder to practice received gratitude — the #1 driver of serotonin production.

I'd love to send you one, complimentary. Each wristband also triggers a donation of 11 meals through Feeding America.

If you're open to it, here's where you can claim yours: [YOUR LINK]

Would love to connect either way. Keep doing amazing work! 🙏</div>
      <p class="tip">💡 Tip: Perfect for B2B & professional networks. The "Stanford research" angle builds instant credibility.</p>
    </div>

    <!-- SCRIPT 5: WHATSAPP / TEXT -->
    <div class="script-box">
      <div class="script-title">📱 Script #5 — WhatsApp / Text (Re-engage Old Contacts)</div>
      <div class="dm-text">Hey [NAME]! It's [YOUR NAME] 👋

I know it's been a minute since we talked, but I thought of you today!

I recently joined this gratitude movement — they make these dope "I Am Blessed AF" wristbands backed by neuroscience research. The cool part? They give them away FREE (you just pay shipping) and every one donated feeds 11 families.

I wanted to send you one because honestly, you're one of the people I'm most grateful for. 

Here's the link: [YOUR LINK]

Hope you're doing amazing! Would love to catch up 💛</div>
      <p class="tip">💡 Tip: THE list reactivator. Send to your entire contact list. 30-40% will reply — that's 30-40 warm conversations from ONE text blast.</p>
    </div>

    <hr class="divider">

    <div class="box" style="text-align:center;">
      <p style="font-size:12px; color:#ef4444; text-transform:uppercase; letter-spacing:2px; margin-bottom:8px; font-weight:bold;">YOUR CLIP LIBRARY</p>
      <p style="margin-bottom:16px;">Access your library of viral neuroscience & gratitude clips with CTA overlay templates ready to repost:</p>
      <a href="https://iamblessedaf.com/network-marketers#clip-library" class="cta-btn">🎬 Access Your Clip Library</a>
    </div>

    <div class="box" style="text-align:center;">
      <p style="font-size:12px; color:#ef4444; text-transform:uppercase; letter-spacing:2px; margin-bottom:8px; font-weight:bold;">YOUR FREE WRISTBAND LINK</p>
      <p style="margin-bottom:16px;">Claim your personal free wristband first — experience the product before gifting it:</p>
      <a href="https://iamblessedaf.com/FREE-neuro-hacker-wristband" class="cta-btn">🎁 Claim YOUR Free Wristband</a>
    </div>

    <hr class="divider">

    <p><span class="hl">Quick start plan:</span></p>
    <p>1️⃣ Claim your own wristband (link above)<br>
    2️⃣ Repost 1 clip from the library today<br>
    3️⃣ Send Script #5 to 20 old contacts<br>
    4️⃣ Reply to every "BLESSED" DM with Script #1 or #2<br>
    5️⃣ Watch warm leads flood your inbox 🔥</p>

    <p>You're in the <span class="red">${nicheTag}</span> space — this strategy is going to be a game-changer for you.</p>

    <p>Welcome to the movement. 🙏</p>

    <div class="sig">
      — The IamBlessedAF Team<br>
      <span style="font-size:12px;color:#666;">Backed by Dr. Huberman · Dr. Dispenza · Harvard Grant Study</span>
    </div>
  </div>
</body>
</html>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "IamBlessedAF <hello@iamblessedaf.com>",
        to: [email],
        subject: `${greeting}, your 5 DM scripts + clip library are ready 🎬🔥`,
        html,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error("Resend error:", err);
      throw new Error("Failed to send email");
    }

    console.log("Network marketer welcome email sent to:", email);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
