import { supabase } from "@/integrations/supabase/client";

const BUCKET = "board-screenshots";

/**
 * Generate a fallback "metadata card" image when html2canvas fails.
 * Creates a simple canvas with card info as proof-of-work placeholder.
 */
export function generateFallbackImage(
  cardTitle: string,
  label: string
): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 340;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(null); return; }

      // Background
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, 600, 340);

      // Accent bar
      ctx.fillStyle = "#e94560";
      ctx.fillRect(0, 0, 600, 6);

      // Icon area
      ctx.font = "48px serif";
      ctx.fillText("📸", 24, 70);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px system-ui, sans-serif";
      const titleLines = wrapText(ctx, cardTitle, 500);
      titleLines.forEach((line, i) => {
        ctx.fillText(line, 24, 120 + i * 26);
      });

      // Label badge
      const labelY = 120 + titleLines.length * 26 + 20;
      ctx.fillStyle = "#e94560";
      ctx.font = "bold 13px system-ui, sans-serif";
      const badgeText = `Phase: ${label.toUpperCase()}`;
      const badgeW = ctx.measureText(badgeText).width + 20;
      roundRect(ctx, 24, labelY - 14, badgeW, 24, 4);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(badgeText, 34, labelY + 2);

      // Timestamp
      ctx.fillStyle = "#8888aa";
      ctx.font = "12px system-ui, sans-serif";
      ctx.fillText(
        `Captured: ${new Date().toLocaleString()}`,
        24,
        labelY + 40
      );

      // Watermark
      ctx.fillStyle = "#333355";
      ctx.font = "11px system-ui, sans-serif";
      ctx.fillText("Fallback proof — html2canvas unavailable", 24, 320);

      canvas.toBlob((blob) => resolve(blob), "image/webp", 0.85);
    } catch {
      resolve(null);
    }
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
    if (lines.length >= 3) { current += "…"; break; }
  }
  if (current) lines.push(current);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Upload a blob to Supabase storage and return the public URL.
 */
async function uploadBlob(
  blob: Blob,
  cardId: string,
  label: string
): Promise<string | null> {
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

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Capture a screenshot of the current page or a specific element,
 * upload it to Supabase storage, and return the public URL.
 * Falls back to a metadata card image if html2canvas fails.
 */
export async function captureAndUploadScreenshot(
  cardId: string,
  label: string = "proof",
  cardTitle: string = "Board Card"
): Promise<string | null> {
  try {
    // Small delay to let any iframe/page settle
    await new Promise((r) => setTimeout(r, 1500));

    // Dynamically import html2canvas to avoid SSR issues
    const html2canvas = (await import("html2canvas")).default;

    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
      scale: 1,
      width: window.innerWidth,
      height: Math.min(document.body.scrollHeight, 2000),
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      logging: false,
    });

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.8)
    );

    if (!blob) {
      console.warn("html2canvas blob failed — using fallback image");
      return await captureWithFallback(cardId, label, cardTitle);
    }

    return await uploadBlob(blob, cardId, label);
  } catch (err) {
    console.warn("html2canvas capture failed — using fallback:", err);
    return await captureWithFallback(cardId, label, cardTitle);
  }
}

/**
 * Generate and upload a fallback metadata image.
 */
async function captureWithFallback(
  cardId: string,
  label: string,
  cardTitle: string
): Promise<string | null> {
  const fallbackBlob = await generateFallbackImage(cardTitle, label);
  if (!fallbackBlob) return null;
  return await uploadBlob(fallbackBlob, cardId, `${label}-fallback`);
}

/**
 * Upload a screenshot URL to a card's screenshots array.
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

/**
 * Auto-capture a screenshot for a card and persist it.
 * Used when cards transition to review/error columns.
 */
export async function autoCaptureForCard(
  cardId: string,
  cardTitle: string,
  existingScreenshots: string[] = [],
  phase: string = "review"
): Promise<string | null> {
  const url = await captureAndUploadScreenshot(cardId, phase, cardTitle);
  if (url) {
    await addScreenshotToCard(cardId, url, existingScreenshots);
  }
  return url;
}
