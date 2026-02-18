import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
    const status = hasErrors ? "failure" : anomalies.length > 0 ? "warning" : "success";

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
        alert_sent: hasErrors,
        notes: hasErrors
          ? `${anomalies.filter((a) => a.severity === "error").length} critical anomalies detected`
          : null,
      });

    if (insertError) {
      console.error("Failed to log verification:", insertError.message);
    }

    // ─── Send alert email if errors found ───
    if (hasErrors) {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Backup Monitor <alerts@iamblessedaf.com>",
              to: ["admin@iamblessedaf.com"],
              subject: `⚠️ DB Backup Verification FAILED — ${anomalies.filter((a) => a.severity === "error").length} issues`,
              html: `
                <h2>Backup Verification Alert</h2>
                <p>Status: <strong>${status}</strong></p>
                <p>Tables checked: ${CRITICAL_TABLES.length}</p>
                <p>Total rows: ${totalRows.toLocaleString()}</p>
                <p>Duration: ${durationMs}ms</p>
                <h3>Anomalies:</h3>
                <ul>
                  ${anomalies.map((a) => `<li><strong>[${a.severity}]</strong> ${a.table}: ${a.message}</li>`).join("")}
                </ul>
              `,
            }),
          });
        } catch (emailErr) {
          console.error("Alert email failed:", emailErr);
        }
      }
    }

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
