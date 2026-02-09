import type { LinkSummary, ClickRow } from "@/hooks/useLinkAnalytics";

function escCsv(val: string | null | undefined): string {
  if (val == null) return "";
  const s = String(val);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export function exportClicksCsv(clicks: ClickRow[], links: LinkSummary[]) {
  const linkMap = new Map(links.map((l) => [l.id, l]));

  const header = [
    "clicked_at",
    "short_code",
    "destination_url",
    "campaign",
    "device_type",
    "browser",
    "os",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "referrer",
  ];

  const rows = clicks.map((c) => {
    const link = linkMap.get(c.link_id);
    return [
      c.clicked_at,
      link?.short_code ?? "",
      link?.destination_url ?? "",
      link?.campaign ?? "",
      c.device_type,
      c.browser,
      c.os,
      c.utm_source,
      c.utm_medium,
      c.utm_campaign,
      c.referrer,
    ]
      .map(escCsv)
      .join(",");
  });

  return [header.join(","), ...rows].join("\n");
}

export function exportLinksCsv(links: LinkSummary[]) {
  const header = [
    "short_code",
    "destination_url",
    "campaign",
    "source_page",
    "click_count",
    "is_active",
    "created_at",
  ];

  const rows = links.map((l) =>
    [
      l.short_code,
      l.destination_url,
      l.campaign,
      l.source_page,
      String(l.click_count),
      String(l.is_active),
      l.created_at,
    ]
      .map(escCsv)
      .join(",")
  );

  return [header.join(","), ...rows].join("\n");
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
