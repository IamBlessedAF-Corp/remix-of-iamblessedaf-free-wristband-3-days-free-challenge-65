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

  const { data: urlData, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 86400 * 7); // 7-day expiry

  if (signError || !urlData?.signedUrl) {
    console.error("Signed URL error:", signError);
    return null;
  }

  return urlData.signedUrl;
}
