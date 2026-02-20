import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

async function testCors(fnName: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fnName}`, { method: "OPTIONS" });
  assertEquals(res.status, 200, `${fnName} CORS preflight failed`);
  await res.text();
}

async function testMissingBody(fnName: string) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fnName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });
  const status = res.status;
  // Should not 500-crash on empty body
  assertEquals(status < 500, true, `${fnName} crashed with 500 on empty body`);
  await res.text();
}

// ─── send-welcome-email ───────────────────────────────────────
Deno.test("send-welcome-email: handles CORS preflight", async () => {
  await testCors("send-welcome-email");
});

Deno.test("send-welcome-email: rejects empty body gracefully", async () => {
  await testMissingBody("send-welcome-email");
});

// ─── send-expert-welcome ─────────────────────────────────────
Deno.test("send-expert-welcome: handles CORS preflight", async () => {
  await testCors("send-expert-welcome");
});

Deno.test("send-expert-welcome: rejects empty body gracefully", async () => {
  await testMissingBody("send-expert-welcome");
});

// ─── send-wristband-welcome ───────────────────────────────────
Deno.test("send-wristband-welcome: handles CORS preflight", async () => {
  await testCors("send-wristband-welcome");
});

Deno.test("send-wristband-welcome: rejects empty body gracefully", async () => {
  await testMissingBody("send-wristband-welcome");
});

// ─── send-network-marketer-welcome ───────────────────────────
Deno.test("send-network-marketer-welcome: handles CORS preflight", async () => {
  await testCors("send-network-marketer-welcome");
});

Deno.test("send-network-marketer-welcome: rejects empty body gracefully", async () => {
  await testMissingBody("send-network-marketer-welcome");
});

// ─── send-tier-milestone-email ────────────────────────────────
Deno.test("send-tier-milestone-email: handles CORS preflight", async () => {
  await testCors("send-tier-milestone-email");
});

Deno.test("send-tier-milestone-email: rejects empty body gracefully", async () => {
  await testMissingBody("send-tier-milestone-email");
});

// ─── clip-approved-notification ──────────────────────────────
Deno.test("clip-approved-notification: handles CORS preflight", async () => {
  await testCors("clip-approved-notification");
});

Deno.test("clip-approved-notification: rejects empty body gracefully", async () => {
  await testMissingBody("clip-approved-notification");
});

// ─── send-weekly-digest ──────────────────────────────────────
Deno.test("send-weekly-digest: handles CORS preflight", async () => {
  await testCors("send-weekly-digest");
});

Deno.test("send-weekly-digest: runs as scheduled function", async () => {
  await testMissingBody("send-weekly-digest");
});

// ─── schedule-challenge-messages ─────────────────────────────
Deno.test("schedule-challenge-messages: handles CORS preflight", async () => {
  await testCors("schedule-challenge-messages");
});

Deno.test("schedule-challenge-messages: rejects empty body gracefully", async () => {
  await testMissingBody("schedule-challenge-messages");
});

// ─── send-followup-sequences ─────────────────────────────────
Deno.test("send-followup-sequences: handles CORS preflight", async () => {
  await testCors("send-followup-sequences");
});

Deno.test("send-followup-sequences: runs as scheduled function", async () => {
  await testMissingBody("send-followup-sequences");
});

// ─── send-scheduled-messages ─────────────────────────────────
Deno.test("send-scheduled-messages: handles CORS preflight", async () => {
  await testCors("send-scheduled-messages");
});

Deno.test("send-scheduled-messages: runs as scheduled function", async () => {
  await testMissingBody("send-scheduled-messages");
});

// ─── card-blocker-notify ─────────────────────────────────────
Deno.test("card-blocker-notify: handles CORS preflight", async () => {
  await testCors("card-blocker-notify");
});

Deno.test("card-blocker-notify: rejects empty body gracefully", async () => {
  await testMissingBody("card-blocker-notify");
});

// ─── tgf-friday ──────────────────────────────────────────────
Deno.test("tgf-friday: handles CORS preflight", async () => {
  await testCors("tgf-friday");
});

Deno.test("tgf-friday: runs as scheduled function", async () => {
  await testMissingBody("tgf-friday");
});
