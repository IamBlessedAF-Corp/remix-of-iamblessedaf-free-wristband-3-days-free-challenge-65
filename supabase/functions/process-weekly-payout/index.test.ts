import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/process-weekly-payout`;

Deno.test("process-weekly-payout: rejects unknown action", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action: "invalid_action_xyz" }),
  });
  assertEquals(res.status, 400);
  const body = await res.json();
  assertExists(body.error);
});

Deno.test("process-weekly-payout: freeze action runs without crashing", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action: "freeze" }),
  });
  // Expects 200 (ok:true, possibly no clips) or 401/403 (if protected)
  const status = res.status;
  assertEquals(status < 500, true);
  await res.json();
});

Deno.test("process-weekly-payout: handles CORS preflight", async () => {
  const res = await fetch(BASE, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});
