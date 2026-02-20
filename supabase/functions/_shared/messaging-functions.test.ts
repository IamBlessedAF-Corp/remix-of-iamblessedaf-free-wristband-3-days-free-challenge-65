import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

// ─── send-email-otp ──────────────────────────────────────────
Deno.test("send-email-otp: rejects missing email", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });
  const status = res.status;
  assertEquals(status >= 400 && status < 600, true);
  await res.text();
});

Deno.test("send-email-otp: handles CORS preflight", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email-otp`, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});

// ─── sms-router ──────────────────────────────────────────────
Deno.test("sms-router: rejects unauthenticated requests", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/sms-router`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: "+15550001234", message: "test", type: "otp" }),
  });
  const status = res.status;
  assertEquals(status === 401 || status === 403, true);
  await res.text();
});

Deno.test("sms-router: handles CORS preflight", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/sms-router`, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});

// ─── send-whatsapp-invite ─────────────────────────────────────
Deno.test("send-whatsapp-invite: rejects missing fields", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-whatsapp-invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });
  const status = res.status;
  assertEquals(status >= 400 && status < 600, true);
  await res.text();
});

Deno.test("send-whatsapp-invite: handles CORS preflight", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-whatsapp-invite`, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});

// ─── process-voice-transcript ─────────────────────────────────
Deno.test("process-voice-transcript: rejects unauthenticated requests", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/process-voice-transcript`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript: "test transcript" }),
  });
  const status = res.status;
  assertEquals(status === 401 || status === 403, true);
  await res.text();
});

Deno.test("process-voice-transcript: handles CORS preflight", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/process-voice-transcript`, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});
