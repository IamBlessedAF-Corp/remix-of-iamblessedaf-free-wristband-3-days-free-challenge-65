import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/send-sms`;

Deno.test("send-sms: rejects unauthenticated requests", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: "+15550001234", message: "test" }),
  });
  const status = res.status;
  // Should reject unauthorized
  assertEquals(status === 401 || status === 403, true);
  await res.text();
});

Deno.test("send-sms: rejects missing fields", async () => {
  const res = await fetch(BASE, {
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

Deno.test("send-sms: handles CORS preflight", async () => {
  const res = await fetch(BASE, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});
