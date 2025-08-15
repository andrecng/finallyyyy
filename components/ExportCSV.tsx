// 📄 @fichier: components/ExportCSV.tsx
// 📤 Export CSV des résultats de simulation

"use client";
import { useSimStore } from "@/stores/simStore";
import { Button } from "@/components/ui/button";

export function ExportCSV() {
  const { equitySeries } = useSimStore();

  const handleExport = () => {
    if (!equitySeries || equitySeries.length === 0) return;

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
    <Button onClick={handleExport} disabled={!equitySeries || equitySeries.length === 0}>
      📤 Exporter CSV
    </Button>
  );
}
