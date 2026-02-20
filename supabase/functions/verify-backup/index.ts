import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Tables to verify with expected minimum row counts */
const CRITICAL_TABLES = [
  { name: "orders", minRows: 0 },
  { name: "creator_profiles", minRows: 0 },
  { name: "clip_submissions", minRows: 0 },
  { name: "short_links", minRows: 0 },
  { name: "link_clicks", minRows: 0 },
  { name: "challenge_participants", minRows: 0 },
  { name: "sms_deliveries", minRows: 0 },
  { name: "board_cards", minRows: 0 },
  { name: "bc_wallets", minRows: 0 },
  { name: "affiliate_tiers", minRows: 0 },
  { name: "abandoned_carts", minRows: 0 },
  { name: "backup_verifications", minRows: 0 },
] as const;

interface TableDetail {
  table: string;
  rowCount: number;
  status: "ok" | "warning" | "error";
  message: string;
}

interface Anomaly {
  type: string;
  table: string;
  message: string;
  severity: "warning" | "error";
}

const ANOMALY_THRESHOLD = 0; // Send alert email even if 0 anomalies (daily summary)

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startMs = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const tableDetails: TableDetail[] = [];
    const anomalies: Anomaly[] = [];
    let totalRows = 0;

    // ─── Check each critical table ───
    for (const { name, minRows } of CRITICAL_TABLES) {
      try {
        const { count, error } = await supabase
          .from(name)
          .select("*", { count: "exact", head: true });

        if (error) {
          tableDetails.push({
            table: name,
            rowCount: 0,
            status: "error",
            message: `Query failed: ${error.message}`,
          });
          anomalies.push({
            type: "query_error",
            table: name,
            message: error.message,
            severity: "error",
          });
          continue;
        }

        const rowCount = count ?? 0;
        totalRows += rowCount;

        if (rowCount < minRows) {
          tableDetails.push({
            table: name,
            rowCount,
            status: "warning",
            message: `Below minimum threshold (${minRows})`,
          });
          anomalies.push({
            type: "low_row_count",
            table: name,
            message: `Expected ≥${minRows} rows, found ${rowCount}`,
            severity: "warning",
          });
        } else {
          tableDetails.push({
            table: name,
            rowCount,
            status: "ok",
            message: "Healthy",
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        tableDetails.push({
          table: name,
          rowCount: 0,
          status: "error",
          message: msg,
        });
        anomalies.push({
          type: "exception",
          table: name,
          message: msg,
          severity: "error",
        });
      }
    }

    // ─── Compare with last verification for row-count drops ───
    const { data: lastCheck } = await supabase
      .from("backup_verifications")
      .select("total_rows_snapshot, table_details")
      .order("verified_at", { ascending: false })
      .limit(1)
      .single();

    if (lastCheck) {
      const prevDetails = (lastCheck.table_details as TableDetail[]) ?? [];
      for (const current of tableDetails) {
        const prev = prevDetails.find((p) => p.table === current.table);
        if (prev && prev.rowCount > 0 && current.rowCount < prev.rowCount * 0.5) {
          anomalies.push({
            type: "row_count_drop",
            table: current.table,
            message: `Dropped from ${prev.rowCount} to ${current.rowCount} (>50% loss)`,
            severity: "error",
          });
          current.status = "error";
          current.message = `Row count dropped >50% since last check`;
        }
      }
    }

    const durationMs = Date.now() - startMs;
    const hasErrors = anomalies.some((a) => a.severity === "error");
    const hasWarnings = anomalies.some((a) => a.severity === "warning");
    const status = hasErrors ? "failure" : hasWarnings ? "warning" : "success";

    // ─── Log the verification result ───
    const { error: insertError } = await supabase
      .from("backup_verifications")
      .insert({
        status,
        total_tables_checked: CRITICAL_TABLES.length,
        total_rows_snapshot: totalRows,
        table_details: tableDetails,
        anomalies,
        duration_ms: durationMs,
        alert_sent: true, // always send daily summary
        notes: hasErrors
          ? `${anomalies.filter((a) => a.severity === "error").length} critical anomalies detected`
          : hasWarnings
          ? `${anomalies.filter((a) => a.severity === "warning").length} warnings`
          : "All systems healthy",
      });

    if (insertError) {
      console.error("Failed to log verification:", insertError.message);
    }

    // ─── Fetch all admin + developer + super_admin emails from user_roles ───
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      try {
        // Get user IDs of admins and developers
        const { data: roleRows } = await supabase
          .from("user_roles")
          .select("user_id")
          .in("role", ["admin", "super_admin", "developer"]);

        const adminUserIds = (roleRows ?? []).map((r) => r.user_id);

        // Fetch emails from creator_profiles
        let recipientEmails: string[] = [];
        if (adminUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from("creator_profiles")
            .select("email")
            .in("user_id", adminUserIds);
          recipientEmails = (profiles ?? []).map((p) => p.email).filter(Boolean);
        }

        // Always include fallback admin email
        if (!recipientEmails.includes("joecury@gmail.com")) {
          recipientEmails.push("joecury@gmail.com");
        }

        const statusEmoji = hasErrors ? "🔴" : hasWarnings ? "🟡" : "🟢";
        const statusLabel = hasErrors ? "FAILED" : hasWarnings ? "WARNING" : "HEALTHY";
        const now = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "short" });

        const tableRows = tableDetails
          .map((t) => {
            const icon = t.status === "ok" ? "✅" : t.status === "warning" ? "⚠️" : "❌";
            return `
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:8px 12px;font-family:monospace;font-size:13px;">${t.table}</td>
                <td style="padding:8px 12px;text-align:right;font-weight:600;">${t.rowCount.toLocaleString()}</td>
                <td style="padding:8px 12px;">${icon} ${t.message}</td>
              </tr>`;
          })
          .join("");

        const anomalySection =
          anomalies.length > 0
            ? `<h3 style="color:#dc2626;margin-top:24px;">🚨 Anomalies Detected (${anomalies.length})</h3>
               <ul style="color:#dc2626;">
                 ${anomalies.map((a) => `<li><strong>[${a.severity.toUpperCase()}]</strong> <code>${a.table}</code>: ${a.message}</li>`).join("")}
               </ul>`
            : `<p style="color:#16a34a;font-weight:600;margin-top:16px;">✅ No anomalies detected. All tables healthy.</p>`;

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "I Am Blessed AF — DB Monitor <alerts@iamblessedaf.com>",
            to: recipientEmails,
            subject: `${statusEmoji} Daily DB Backup Report — ${statusLabel} | ${now}`,
            html: `
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#fff;">
                <div style="background:${hasErrors ? "#fef2f2" : hasWarnings ? "#fffbeb" : "#f0fdf4"};border-left:4px solid ${hasErrors ? "#dc2626" : hasWarnings ? "#d97706" : "#16a34a"};padding:16px 20px;border-radius:8px;margin-bottom:24px;">
                  <h1 style="margin:0;font-size:20px;color:${hasErrors ? "#dc2626" : hasWarnings ? "#92400e" : "#15803d"};">
                    ${statusEmoji} Database Backup Report — ${statusLabel}
                  </h1>
                  <p style="margin:8px 0 0;color:#555;font-size:14px;">${now}</p>
                </div>

                <div style="display:flex;gap:16px;margin-bottom:24px;">
                  <div style="flex:1;background:#f8fafc;padding:16px;border-radius:8px;text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:#1e293b;">${CRITICAL_TABLES.length}</div>
                    <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Tables Checked</div>
                  </div>
                  <div style="flex:1;background:#f8fafc;padding:16px;border-radius:8px;text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:#1e293b;">${totalRows.toLocaleString()}</div>
                    <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Total Rows</div>
                  </div>
                  <div style="flex:1;background:#f8fafc;padding:16px;border-radius:8px;text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:${hasErrors ? "#dc2626" : "#16a34a"};">${anomalies.length}</div>
                    <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Anomalies</div>
                  </div>
                  <div style="flex:1;background:#f8fafc;padding:16px;border-radius:8px;text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:#1e293b;">${durationMs}ms</div>
                    <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.5px;">Duration</div>
                  </div>
                </div>

                <h3 style="margin-bottom:8px;color:#1e293b;">📊 Table Status</h3>
                <table style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                  <thead>
                    <tr style="background:#f1f5f9;">
                      <th style="padding:10px 12px;text-align:left;color:#475569;font-weight:600;">Table</th>
                      <th style="padding:10px 12px;text-align:right;color:#475569;font-weight:600;">Rows</th>
                      <th style="padding:10px 12px;text-align:left;color:#475569;font-weight:600;">Status</th>
                    </tr>
                  </thead>
                  <tbody>${tableRows}</tbody>
                </table>

                ${anomalySection}

                <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:32px;border-top:1px solid #f1f5f9;padding-top:16px;">
                  Automated report from I Am Blessed AF Backup Monitor · Sent to admins & developers only
                </p>
              </div>
            `,
          }),
        });

        console.log(`[verify-backup] Daily report sent to: ${recipientEmails.join(", ")}`);
      } catch (emailErr) {
        console.error("[verify-backup] Alert email failed:", emailErr);
      }
    }

    // ─── Log to portal activity ───
    try {
      await supabase.rpc("log_portal_activity", {
        p_event_type: "backup",
        p_display_text: `🗄️ Daily DB backup verified — ${status} (${anomalies.length} anomalies)`,
        p_icon_name: hasErrors ? "alert-triangle" : "database",
      });
    } catch (_) { /* non-critical */ }

    return new Response(
      JSON.stringify({ status, tables: CRITICAL_TABLES.length, totalRows, anomalies: anomalies.length, durationMs }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Backup verification error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

