import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, niche } = await req.json();

    if (!email) throw new Error("Email is required");

    const greeting = name ? `Hey ${name} —` : "Hey —";
    const nicheNote = niche
      ? `<p>We see you're in <strong style="color:#ffffff;">${niche}</strong>. Perfect — the wristband funnel works incredibly well in your space. We'll tailor everything to your audience.</p>`
      : "";

    const emailResponse = await resend.emails.send({
      from: "IamBlessedAF <noreply@iamblessedaf.com>",
      to: [email],
      subject: "You're about to 2.7x your leads 🚀",
      headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0a0a0a;
      color: #e5e5e5;
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.7;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      padding: 48px 24px;
    }
    p {
      margin: 0 0 20px 0;
      font-size: 16px;
    }
    .highlight {
      color: #ffffff;
      font-weight: bold;
    }
    .stat-box {
      background: #111;
      border: 1px solid #222;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
      text-align: center;
    }
    .stat-number {
      font-size: 36px;
      font-weight: 900;
      color: #ef4444;
      display: block;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .steps {
      background: #111;
      border: 1px solid #222;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .step {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
    }
    .step:last-child { margin-bottom: 0; }
    .step-num {
      background: #ef4444;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .signature {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #222;
      color: #888;
      font-size: 14px;
    }
    .preview-text {
      display: none;
      max-height: 0;
      overflow: hidden;
      mso-hide: all;
    }
  </style>
</head>
<body>
  <div class="preview-text">Your custom wristband funnel is coming. Here's what happens next.</div>
  <div class="container">
    <p>${greeting}</p>

    <p>Welcome to the <span class="highlight">Neuro-Hackers Movement</span>.</p>

    <p>You just enrolled in something that's going to change how you capture leads forever.</p>

    ${nicheNote}

    <div class="stat-box">
      <span class="stat-number">2.7x</span>
      <span class="stat-label">Average Lead Capture Increase</span>
    </div>

    <p>Here's the science: when someone receives a <span class="highlight">real, physical gift</span> — a gratitude wristband backed by Dr. Huberman's neuroscience research — the reciprocity effect kicks in. They don't just become a lead. They become a <em>committed</em> lead.</p>

    <p><span class="highlight">What happens next:</span></p>

    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div>
          <strong style="color:#fff;">We build your custom funnel</strong><br>
          <span style="color:#aaa;font-size:14px;">Your branded wristband page, challenge automation, and viral loop — done for you within 48 hours.</span>
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div>
          <strong style="color:#fff;">You drive traffic</strong><br>
          <span style="color:#aaa;font-size:14px;">Send your audience to your new funnel. They claim a FREE wristband (shipping only).</span>
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div>
          <strong style="color:#fff;">Watch the magic</strong><br>
          <span style="color:#aaa;font-size:14px;">Higher show-up rates. More booked calls. Built-in referral loop. Zero extra cost.</span>
        </div>
      </div>
    </div>

    <p>We'll reach out within the next 24 hours to get your funnel started. Keep an eye on your inbox.</p>

    <p>Welcome to the movement. 🙏</p>

    <div class="signature">
      — The IamBlessedAF Team<br>
      <span style="font-size:12px;color:#666;">Backed by Dr. Huberman · Dr. Dispenza · Harvard Grant Study</span>
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log("Expert welcome email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending expert welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
