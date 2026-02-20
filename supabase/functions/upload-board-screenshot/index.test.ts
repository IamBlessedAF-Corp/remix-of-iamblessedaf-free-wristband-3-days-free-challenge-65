import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const BASE = `${SUPABASE_URL}/functions/v1/upload-board-screenshot`;

Deno.test("upload-board-screenshot: rejects unauthenticated requests", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardId: "test", imageData: "base64data" }),
  });
  const status = res.status;
  assertEquals(status === 401 || status === 403, true);
  await res.text();
});

Deno.test("upload-board-screenshot: rejects missing imageData", async () => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ cardId: "test" }),
  });
  const status = res.status;
  assertEquals(status >= 400 && status < 600, true);
  await res.text();
});

Deno.test("upload-board-screenshot: handles CORS preflight", async () => {
  const res = await fetch(BASE, { method: "OPTIONS" });
  assertEquals(res.status, 200);
  await res.text();
});
