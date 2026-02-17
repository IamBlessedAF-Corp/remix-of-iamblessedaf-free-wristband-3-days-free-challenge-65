import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const THRESHOLDS = [
  { pct: 100, label: "🔴 HARD FREEZE", level: "critical" },
  { pct: 95, label: "🟠 SOFT THROTTLE", level: "warning" },
  { pct: 80, label: "🟡 WARNING", level: "caution" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get current cycle
    const now = new Date();
    const day = now.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - diff);
    monday.setUTCHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    sunday.setUTCHours(23, 59, 59, 999);

    const { data: cycles } = await supabase
      .from("budget_cycles")
      .select("*")
      .gte("start_date", monday.toISOString())
      .lte("start_date", sunday.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    const cycle = cycles?.[0];
    if (!cycle) {
      return new Response(JSON.stringify({ ok: true, message: "No active cycle" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get segments and their cycle data
    const { data: segments } = await supabase.from("budget_segments").select("*").eq("is_active", true);
    const { data: segCycles } = await supabase.from("budget_segment_cycles").select("*").eq("cycle_id", cycle.id);

    if (!segments || !segCycles) {
      return new Response(JSON.stringify({ ok: true, message: "No segments" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get admin emails
    const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    const adminEmails: string[] = [];
    if (adminRoles) {
      for (const role of adminRoles) {
        const { data: profile } = await supabase
          .from("creator_profiles")
          .select("email")
          .eq("user_id", role.user_id)
          .single();
        if (profile?.email) adminEmails.push(profile.email);
      }
    }

    if (adminEmails.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: "No admin emails found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const alerts: { segment: string; pct: number; level: string; label: string }[] = [];

    for (const seg of segments) {
      const sc = segCycles.find((s: any) => s.segment_id === seg.id);
      if (!sc) continue;

      const spentPct = Math.round((sc.spent_cents / seg.weekly_limit_cents) * 100);

      for (const threshold of THRESHOLDS) {
        if (spentPct >= threshold.pct) {
          alerts.push({
            segment: seg.name,
            pct: spentPct,
            level: threshold.level,
            label: threshold.label,
          });

          // Auto-throttle at 95%, auto-kill at 100%
          if (spentPct >= 100 && sc.status !== "killed") {
            await supabase
              .from("budget_segment_cycles")
              .update({ status: "killed" })
              .eq("id", sc.id);
          } else if (spentPct >= 95 && sc.status === "approved") {
            await supabase
              .from("budget_segment_cycles")
              .update({ status: "throttled" })
              .eq("id", sc.id);
          }

          break; // Only trigger highest threshold
        }
      }
    }

    // Also check global budget
    const { data: allSegCycles } = await supabase
      .from("budget_segment_cycles")
      .select("spent_cents")
      .eq("cycle_id", cycle.id);

    const totalSpent = (allSegCycles || []).reduce((s: number, c: any) => s + (c.spent_cents || 0), 0);
    const globalPct = Math.round((totalSpent / cycle.global_weekly_limit_cents) * 100);

    for (const threshold of THRESHOLDS) {
      if (globalPct >= threshold.pct) {
        alerts.push({
          segment: "GLOBAL",
          pct: globalPct,
          level: threshold.level,
          label: threshold.label,
        });
        break;
      }
    }

    if (alerts.length === 0) {
      return new Response(JSON.stringify({ ok: true, message: "No alerts" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build email
    const alertRows = alerts
      .map((a) => `<tr><td style="padding:8px;border-bottom:1px solid #333">${a.label}</td><td style="padding:8px;border-bottom:1px solid #333"><strong>${a.segment}</strong></td><td style="padding:8px;border-bottom:1px solid #333">${a.pct}%</td></tr>`)
      .join("");

    const html = `
      <div style="font-family:sans-serif;background:#111;color:#eee;padding:24px;border-radius:12px;max-width:600px">
        <h2 style="color:#f59e0b;margin:0 0 16px">⚠️ Budget Alert — IamBlessedAF</h2>
        <p style="color:#999;font-size:14px;margin:0 0 16px">The following segments have triggered budget thresholds:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="color:#888;text-transform:uppercase;font-size:11px">
            <th style="text-align:left;padding:8px;border-bottom:2px solid #333">Level</th>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #333">Segment</th>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #333">Spent</th>
          </tr>
          ${alertRows}
        </table>
        <p style="color:#666;font-size:12px;margin:16px 0 0">Review in Admin → Budget Control</p>
      </div>
    `;

    // Send via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "IamBlessedAF Alerts <alerts@iamblessedaf.com>",
        to: adminEmails,
        subject: `🚨 Budget Alert: ${alerts.length} threshold(s) triggered`,
        html,
      }),
    });

    const emailData = await emailRes.json();

    // Log the alerts
    for (const alert of alerts) {
      await supabase.from("budget_events_log").insert({
        action: `budget_alert_${alert.level}`,
        after_state: { segment: alert.segment, pct: alert.pct },
        impacted_segments: [alert.segment],
        notes: `${alert.label}: ${alert.segment} at ${alert.pct}%`,
      });
    }

    return new Response(
      JSON.stringify({ ok: true, alertsSent: alerts.length, emailId: emailData?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
