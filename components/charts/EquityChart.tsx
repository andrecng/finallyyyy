"use client";
import { cn, formatPct } from "@/lib/utils";

type Props = { className?: string; height?: number; series?: number[] };

export default function EquityChart({ className, height = 220, series = [] }: Props) {
  if (!Array.isArray(series) || series.length === 0) {
    return <div className={cn("rounded border p-3 text-sm text-gray-500", className)}>
      Aucune donnée d'équité disponible.
    </div>;
  }
  const last = series.at(-1) ?? 0;
  return (
    <div className={cn("rounded border p-3", className)} style={{ height }}>
      <div className="text-sm font-medium">Equity (points)</div>
      <div className="text-xs">Δ: {formatPct((last - series[0]) / (Math.abs(series[0]) || 1), 2)}</div>
      <pre className="text-[10px] bg-gray-50 rounded mt-2 p-2 overflow-auto">
        {JSON.stringify(series.slice(-50))}
      </pre>
    </div>
  );
}
