// 📄 @fichier: components/CSVExportButton.tsx
// 📤 Bouton d'export CSV des résultats

"use client";
import { useSimStore } from "@/stores/simStore";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";

export function CSVExportButton() {
  const { equitySeries } = useSimStore();

  const downloadCSV = () => {
    if (!equitySeries?.length) return;

    const headers = "Index,Equity";
    const rows = equitySeries.map((value, index) => `${index},${value}`).join("\n");
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "equity_series.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={downloadCSV} className="flex items-center gap-2">
      <DownloadIcon size={16} />
      Export CSV
    </Button>
  );
}
