import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/utils/csvExport";

interface ExportCsvButtonProps {
  data: Record<string, any>[];
  filename: string;
  columns?: string[];
  label?: string;
}

function escCsv(val: any): string {
  if (val == null) return "";
  const s = String(val);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

export default function ExportCsvButton({ data, filename, columns, label = "Export CSV" }: ExportCsvButtonProps) {
  const handleExport = () => {
    if (!data.length) return;
    const keys = columns || Object.keys(data[0]);
    const header = keys.join(",");
    const rows = data.map((row) =>
      keys.map((k) => escCsv(row[k])).join(",")
    );
    downloadCsv([header, ...rows].join("\n"), filename);
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5 text-xs h-8"
      onClick={handleExport}
      disabled={!data.length}
    >
      <Download className="w-3.5 h-3.5" />
      {label}
    </Button>
  );
}
