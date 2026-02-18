import { supabase } from "@/integrations/supabase/client";

const BUCKET = "board-screenshots";

/**
 * Upload a File/Blob to Supabase storage and return the public URL.
 */
export async function uploadScreenshotFile(
  file: File | Blob,
  cardId: string,
  label: string = "proof"
): Promise<string | null> {
  const timestamp = Date.now();
  const ext = file.type?.includes("png") ? "png" : file.type?.includes("webp") ? "webp" : "jpg";
  const path = `cards/${cardId}/${label}-${timestamp}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type || "image/png",
      upsert: true,
    });

  if (uploadError) {
    console.error("Screenshot upload error:", uploadError);
    return null;
  }

  const { data: urlData, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 86400 * 7); // 7-day expiry

  if (signError || !urlData?.signedUrl) {
    console.error("Signed URL error:", signError);
    return null;
  }

  return urlData.signedUrl;
}

/**
 * Upload a screenshot and append it to a card's screenshots array in DB.
 * Returns the new full screenshots array.
 */
export async function uploadAndAttachScreenshot(
  file: File | Blob,
  cardId: string,
  existingScreenshots: string[] = [],
  label: string = "proof"
): Promise<{ url: string; screenshots: string[] } | null> {
  const url = await uploadScreenshotFile(file, cardId, label);
  if (!url) return null;

  const updated = [...existingScreenshots, url];
  await (supabase.from("board_cards" as any) as any)
    .update({ screenshots: updated })
    .eq("id", cardId);

  return { url, screenshots: updated };
}
