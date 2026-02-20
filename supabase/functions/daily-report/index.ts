import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendKey = Deno.env.get("RESEND_API_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayISO = yesterday.toISOString();

    // ── 1. Fetch last 24h changelog entries ──
    const { data: changelog } = await supabase
      .from("changelog_entries")
      .select("prompt_summary, affected_areas, created_at, tags")
      .gte("created_at", yesterdayISO)
      .order("created_at", { ascending: false });

    // ── 2. Fetch unresolved fatal errors ──
    const { data: fatalErrors } = await supabase
      .from("error_events")
      .select("message, level, component, page_url, created_at, stack")
      .in("level", ["fatal", "error"])
      .is("resolved_at", null)
      .order("created_at", { ascending: false })
      .limit(20);

    // ── 3. Fetch roadmap critical items not completed ──
    const { data: roadmapItems } = await supabase
      .from("roadmap_items")
      .select("title, detail, priority, phase")
      .eq("is_active", true)
      .eq("priority", "critical");

    const { data: completions } = await supabase
      .from("roadmap_completions")
      .select("item_title, phase");

    const completedSet = new Set((completions || []).map((c: { item_title: string; phase: string }) => `${c.phase}::${c.item_title}`));
    const criticalPending = (roadmapItems || []).filter(
      (i: { title: string; phase: string }) => !completedSet.has(`${i.phase}::${i.title}`)
    );

    // ── 4. Fetch admin + developer emails ──
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "super_admin", "developer"]);

    const adminUserIds = (adminRoles || []).map((r: { user_id: string }) => r.user_id);
    if (adminUserIds.length === 0) {
      console.log("[daily-report] No admin users found — skipping email send");
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get emails from auth.users via service role
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const adminEmails = (authUsers?.users || [])
      .filter((u: { id: string }) => adminUserIds.includes(u.id))
      .map((u: { email?: string }) => u.email)
      .filter(Boolean) as string[];

    if (adminEmails.length === 0) {
      console.log("[daily-report] No admin emails resolved");
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ── 5. Detect breaking errors (fatal unresolved) ──
    const breakingErrors = (fatalErrors || []).filter((e: { level: string }) => e.level === "fatal");
    const hasBreakingErrors = breakingErrors.length > 0;

    // ── 6. Build email HTML ──
    const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const changelogHtml = (changelog || []).length > 0
      ? (changelog || []).map((c: { prompt_summary: string; affected_areas: string[]; created_at: string }) => `
          <div style="border-left:3px solid #22c55e;padding:8px 12px;margin-bottom:8px;background:#0f1f0f;">
            <p style="margin:0;font-size:13px;color:#e5e5e5;">${c.prompt_summary}</p>
            <p style="margin:4px 0 0;font-size:10px;color:#666;">${(c.affected_areas || []).join(", ")} · ${new Date(c.created_at).toLocaleTimeString()}</p>
          </div>`).join("")
      : '<p style="color:#666;font-size:13px;">No changes logged in the last 24 hours.</p>';

    const criticalHtml = criticalPending.length > 0
      ? criticalPending.map((i: { title: string; detail: string; phase: string }) => `
          <div style="border-left:3px solid #ef4444;padding:8px 12px;margin-bottom:8px;background:#1f0f0f;">
            <p style="margin:0;font-size:13px;color:#fca5a5;font-weight:bold;">${i.title}</p>
            <p style="margin:4px 0 0;font-size:11px;color:#888;">${i.phase} · ${i.detail}</p>
          </div>`).join("")
      : '<p style="color:#22c55e;font-size:13px;">✅ No critical roadmap items pending.</p>';

    const breakingHtml = hasBreakingErrors
      ? breakingErrors.map((e: { message: string; component: string; page_url: string; stack: string }) => `
          <div style="border-left:3px solid #dc2626;padding:8px 12px;margin-bottom:8px;background:#1f0a0a;">
            <p style="margin:0;font-size:13px;color:#f87171;font-weight:bold;">🔴 ${e.message}</p>
            <p style="margin:4px 0 0;font-size:11px;color:#888;">Component: ${e.component || "unknown"} · Page: ${e.page_url || "unknown"}</p>
            ${e.stack ? `<pre style="font-size:9px;color:#666;margin:4px 0 0;overflow:auto;max-height:80px;">${e.stack.slice(0, 300)}</pre>` : ""}
            <p style="margin:8px 0 0;font-size:11px;color:#f87171;"><strong>Suggested fix:</strong> Check Error Monitor tab → resolve or add try/catch + captureError() + ErrorBoundary wrapping</p>
          </div>`).join("")
      : "";

    const subject = hasBreakingErrors
      ? `🚨 [BREAKING] IamBlessedAF Daily Report — ${breakingErrors.length} fatal error(s) require immediate action`
      : `📊 IamBlessedAF Daily Report — ${dateStr}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e5e5e5;">
  <div style="max-width:640px;margin:0 auto;padding:40px 24px;">

    ${hasBreakingErrors ? `
    <div style="background:#1f0a0a;border:2px solid #dc2626;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:20px;font-weight:bold;color:#f87171;">🚨 BREAKING ISSUE DETECTED</p>
      <p style="margin:8px 0 0;font-size:13px;color:#fca5a5;">${breakingErrors.length} fatal error(s) are unresolved and may be breaking the app.</p>
    </div>` : ""}

    <div style="text-align:center;margin-bottom:32px;">
      <p style="font-size:11px;letter-spacing:3px;color:#666;text-transform:uppercase;margin:0 0 4px;">Daily Intelligence Report</p>
      <h1 style="font-size:22px;font-weight:bold;color:#fff;margin:0;">${dateStr}</h1>
      <p style="font-size:12px;color:#888;margin:4px 0 0;">Sent at 5:55 PM EST · IamBlessedAF Growth OS</p>
    </div>

    <!-- Changes in last 24h -->
    <div style="margin-bottom:32px;">
      <h2 style="font-size:15px;font-weight:bold;color:#22c55e;margin:0 0 12px;border-bottom:1px solid #1a2e1a;padding-bottom:8px;">
        ✅ Changes in the Last 24 Hours (${(changelog || []).length})
      </h2>
      ${changelogHtml}
    </div>

    ${hasBreakingErrors ? `
    <!-- Breaking errors -->
    <div style="margin-bottom:32px;">
      <h2 style="font-size:15px;font-weight:bold;color:#ef4444;margin:0 0 12px;border-bottom:1px solid #2e1a1a;padding-bottom:8px;">
        🚨 Breaking Issues — Immediate Action Required (${breakingErrors.length})
      </h2>
      ${breakingHtml}
    </div>` : ""}

    <!-- Critical roadmap actions for tomorrow -->
    <div style="margin-bottom:32px;">
      <h2 style="font-size:15px;font-weight:bold;color:#f59e0b;margin:0 0 12px;border-bottom:1px solid #2e2a1a;padding-bottom:8px;">
        🎯 Critical Actions for Tomorrow (${criticalPending.length})
      </h2>
      ${criticalHtml}
    </div>

    <!-- Stats summary -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:32px;">
      <div style="background:#111;border:1px solid #222;border-radius:10px;padding:16px;text-align:center;">
        <p style="font-size:24px;font-weight:bold;color:#22c55e;margin:0;">${(changelog || []).length}</p>
        <p style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:2px;margin:4px 0 0;">Changes</p>
      </div>
      <div style="background:#111;border:1px solid ${hasBreakingErrors ? "#dc2626" : "#222"};border-radius:10px;padding:16px;text-align:center;">
        <p style="font-size:24px;font-weight:bold;color:${hasBreakingErrors ? "#ef4444" : "#888"};margin:0;">${breakingErrors.length}</p>
        <p style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:2px;margin:4px 0 0;">Fatal Errors</p>
      </div>
      <div style="background:#111;border:1px solid #222;border-radius:10px;padding:16px;text-align:center;">
        <p style="font-size:24px;font-weight:bold;color:#f59e0b;margin:0;">${criticalPending.length}</p>
        <p style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:2px;margin:4px 0 0;">Critical Left</p>
      </div>
    </div>

    <div style="text-align:center;margin-top:24px;">
      <a href="https://funnel-architect-ai-30.lovable.app/admin" style="display:inline-block;background:#7c3aed;color:#fff;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;">
        Open Admin Hub →
      </a>
    </div>

    <p style="text-align:center;color:#444;font-size:10px;margin-top:32px;">
      IamBlessedAF Growth Intelligence OS · Automated Daily Report
    </p>
  </div>
</body>
</html>`;

    // ── 7. Send email to all admins ──
    let sentCount = 0;
    for (const email of adminEmails) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: "IamBlessedAF OS <noreply@iamblessedaf.com>",
            to: [email],
            subject,
            html,
          }),
        });

        if (res.ok) {
          sentCount++;
          console.log(`[daily-report] Sent to ${email}`);
        } else {
          const errText = await res.text();
          console.error(`[daily-report] Failed for ${email}:`, errText);
        }
      } catch (err) {
        console.error(`[daily-report] Error for ${email}:`, err);
      }
    }

    // ── 8. Log to changelog ──
    await supabase.from("changelog_entries").insert({
      prompt_summary: `Daily report sent to ${sentCount} admin(s) — ${(changelog || []).length} changes, ${breakingErrors.length} fatal errors, ${criticalPending.length} critical roadmap items`,
      affected_areas: ["reporting", "roadmap", "errors"],
      tags: ["automated", "daily-report"],
    });

    return new Response(
      JSON.stringify({ sent: sentCount, changes: (changelog || []).length, fatalErrors: breakingErrors.length, criticalPending: criticalPending.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[daily-report] Fatal error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
