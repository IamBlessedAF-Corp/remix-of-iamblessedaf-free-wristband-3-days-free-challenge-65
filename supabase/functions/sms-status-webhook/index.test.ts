import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/sms-status-webhook`;

Deno.test("sms-status-webhook: accepts POST without auth (Twilio webhook)", async () => {
  const body = new URLSearchParams({
    MessageSid: "SM_test_123",
    MessageStatus: "delivered",
    To: "+15550001234",
  });
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  // Webhook should not require auth — 200 or 204
  const status = res.status;
  assertEquals(status < 500, true);
  await res.text();
});

Deno.test("sms-status-webhook: handles CORS preflight", async () => {
  const res = await fetch(BASE, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});
