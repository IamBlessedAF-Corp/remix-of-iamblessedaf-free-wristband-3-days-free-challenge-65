import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { cardId, imageBase64, label, contentType } = await req.json();

    if (!cardId || !imageBase64) {
      return new Response(JSON.stringify({ error: "cardId and imageBase64 required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decode base64 to Uint8Array
    const binaryString = atob(imageBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const timestamp = Date.now();
    const ext = contentType?.includes("webp") ? "webp" : "png";
    const path = `cards/${cardId}/${label || "proof"}-${timestamp}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("board-screenshots")
      .upload(path, bytes, {
        contentType: contentType || "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: uploadError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("board-screenshots")
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;

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
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
