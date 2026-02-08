import { supabase } from "@/integrations/supabase/client";

const BUCKET = "board-screenshots";

/**
 * Capture a screenshot of the current page or a specific element,
 * upload it to Supabase storage, and return the public URL.
 */
export async function captureAndUploadScreenshot(
  cardId: string,
  label: string = "proof"
): Promise<string | null> {
  try {
    // Dynamically import html2canvas to avoid SSR issues
    const html2canvas = (await import("html2canvas")).default;

    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
      scale: 1, // 1x for smaller file size
      width: window.innerWidth,
      height: Math.min(document.body.scrollHeight, 2000), // Cap at 2000px
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      logging: false,
    });

    // Convert to blob
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.8)
    );

    if (!blob) {
      console.warn("Failed to create screenshot blob");
      return null;
    }

    // Upload to storage
    const timestamp = Date.now();
    const path = `cards/${cardId}/${label}-${timestamp}.webp`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      console.error("Screenshot upload error:", uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    return urlData.publicUrl;
  } catch (err) {
    console.error("Screenshot capture error:", err);
    return null;
  }
}

/**
 * Upload a screenshot URL to a card's screenshots array
 */
export async function addScreenshotToCard(
  cardId: string,
  screenshotUrl: string,
  existingScreenshots: string[] = []
): Promise<void> {
  const updated = [...existingScreenshots, screenshotUrl];
  await (supabase.from("board_cards" as any) as any)
    .update({ screenshots: updated })
    .eq("id", cardId);
}
