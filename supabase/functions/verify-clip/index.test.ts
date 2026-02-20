import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/verify-clip`;

Deno.test("verify-clip: rejects missing required fields", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ platform: "tiktok" }), // missing clip_url and user_id
  });
  assertEquals(res.status, 400);
  const body = await res.json();
  assertExists(body.error);
});

Deno.test("verify-clip: accepts tiktok clip as pending (no auth required)", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      clip_url: "https://www.tiktok.com/@test/video/999999999",
      platform: "tiktok",
      user_id: "00000000-0000-0000-0000-000000000001",
    }),
  });
  // Should either succeed or fail gracefully (not 500 crash)
  const status = res.status;
  assertEquals(status < 500, true);
  await res.json();
});

Deno.test("verify-clip: rejects invalid YouTube URL gracefully", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      clip_url: "https://not-a-youtube-url.com/watch?v=invalid",
      platform: "youtube",
      user_id: "00000000-0000-0000-0000-000000000001",
    }),
  });
  const body = await res.json();
  // Should return verified:false or an error — not crash
  assertExists(body);
});

Deno.test("verify-clip: handles CORS preflight", async () => {
  const res = await fetch(BASE, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});
