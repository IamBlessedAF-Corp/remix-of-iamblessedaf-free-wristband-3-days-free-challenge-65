import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WelcomeRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    const greeting = name ? `Hey ${name} —` : "Hey —";

    const emailResponse = await resend.emails.send({
      from: "IamBlessedAF <noreply@iamblessedaf.com>",
      to: [email],
      subject: "You're early.",
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(),
      },
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
  <div class="preview-text">Most people wait. You didn't.</div>
  <div class="container">
    <p>${greeting}</p>

    <p>You just did something most people won't.</p>

    <p>You didn't scroll past. You didn't bookmark it for later. You decided.</p>

    <p>That says more about you than any email we could write.</p>

    <p>Here's what we'll tell you right now: <span class="highlight">IamBlessedAF isn't a reminder to be grateful.</span> It's what happens when gratitude stops being something you do — and becomes something you are.</p>

    <p>We're building this for a specific kind of person. You already know if that's you.</p>

    <p>More is coming. Not today. Not because we're holding back — because it's not ready to be rushed. When it lands, you'll understand why you were early.</p>

    <p>Until then — you're in.</p>

    <div class="signature">
      — IamBlessedAF
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log("Welcome email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
