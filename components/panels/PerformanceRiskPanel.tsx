"use client";
import { pct, fmt, toNum } from "@/lib/format";
import { adaptKpis } from "@/app/lib/kpiAdapter";

export default function PerformanceRiskPanel({ out }: { out: any }) {
  const k = adaptKpis(out);
  const rows: { label: string; val: any; kind: "pct" | "num" }[] = [
    { label: "CAGR", val: k.cagr, kind: "pct" },
    { label: "Vol réalisée", val: k.vol_realized, kind: "pct" },
    { label: "Sharpe", val: k.sharpe, kind: "num" },
    { label: "Sortino", val: k.sortino, kind: "num" },
    { label: "Profit factor", val: k.profit_factor, kind: "num" },
    { label: "Win rate", val: k.win_rate, kind: "pct" },
    { label: "Max pertes consécutives", val: k.max_consec_losses, kind: "num" },
    { label: "Best day", val: k.best_day, kind: "pct" },
    { label: "Worst day", val: k.worst_day, kind: "pct" },
    { label: "Jours recov. après max DD", val: k.days_to_recover, kind: "num" }
  ];

  const any = rows.some(r => toNum(r.val) != null);

  if (!any) return null;

  return (
    <div className="rounded border p-3 space-y-2">
      <div className="text-sm font-semibold">Performance & Risque</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="rounded border p-2">
            <div className="text-xs text-gray-500">{r.label}</div>
            <div className="font-medium">
              {r.kind === "pct" ? pct(r.val) : fmt(r.val, 3)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
