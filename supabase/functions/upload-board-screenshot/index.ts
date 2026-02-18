import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const InputSchema = z.object({
  cardId: z.string().uuid(),
  imageBase64: z.string().max(10 * 1024 * 1024), // 10MB limit
  label: z.string().regex(/^[a-z0-9_-]+$/i).max(50).optional().default("proof"),
  contentType: z.enum(["image/png", "image/jpeg", "image/webp"]).optional().default("image/png"),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Auth check — require admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claimsData.claims.sub;
    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate input
    let input: z.infer<typeof InputSchema>;
    try {
      input = InputSchema.parse(await req.json());
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid input", details: e instanceof z.ZodError ? e.errors : "Validation failed" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { cardId, imageBase64, label, contentType } = input;

    // Decode base64 to Uint8Array
    const binaryString = atob(imageBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const timestamp = Date.now();
    const ext = contentType?.includes("webp") ? "webp" : contentType?.includes("jpeg") ? "jpg" : "png";
    const path = `cards/${cardId}/${label}-${timestamp}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("board-screenshots")
      .upload(path, bytes, {
        contentType: contentType || "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Upload failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get signed URL (bucket is private)
    const { data: urlData, error: signError } = await supabase.storage
      .from("board-screenshots")
      .createSignedUrl(path, 86400 * 7); // 7-day expiry

    if (signError || !urlData?.signedUrl) {
      console.error("Signed URL error:", signError);
      return new Response(JSON.stringify({ error: "Failed to generate URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const publicUrl = urlData.signedUrl;

    // Update card screenshots array
    const { data: card } = await supabase
      .from("board_cards")
      .select("screenshots")
      .eq("id", cardId)
      .single();

    const existing = (card?.screenshots as string[]) || [];
    const updated = [...existing, publicUrl];

    await supabase
      .from("board_cards")
      .update({ screenshots: updated })
      .eq("id", cardId);

    return new Response(JSON.stringify({ url: publicUrl, screenshots: updated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
