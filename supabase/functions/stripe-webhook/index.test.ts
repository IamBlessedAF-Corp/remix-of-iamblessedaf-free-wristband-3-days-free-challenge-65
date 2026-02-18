import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/stripe-webhook`;

Deno.test("stripe-webhook: rejects request without stripe-signature", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ type: "checkout.session.completed" }),
  });
  assertEquals(res.status, 400);
  const body = await res.text();
  assertExists(body);
});

Deno.test("stripe-webhook: rejects invalid signature", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "stripe-signature": "t=12345,v1=invalid_sig,v0=invalid",
    },
    body: JSON.stringify({ type: "checkout.session.completed" }),
  });
  assertEquals(res.status, 400);
  const body = await res.text();
  assertExists(body);
});

Deno.test("stripe-webhook: handles CORS preflight", async () => {
  const res = await fetch(BASE, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});
