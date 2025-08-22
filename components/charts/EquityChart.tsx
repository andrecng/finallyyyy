"use client";
import { cn, formatNum } from "@/lib/utils";

export default function EquityChart({ series = [], className, height = 220 }: { series?: number[]; className?: string; height?: number; }) {
  if (!Array.isArray(series) || series.length < 2) {
    return <div className={cn("rounded border p-3 text-sm text-gray-500", className)}>Aucune donnée d'équité.</div>;
  }
  const w = 600;
  const h = height;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const norm = (v: number) => (h - ((v - min) / ((max - min) || 1)) * (h - 20)) - 10;
  const points = series.map((v, i) => `${(i / (series.length - 1)) * (w - 20) + 10},${norm(v)}`).join(" ");

  return (
    <div className={cn("rounded border p-3", className)}>
      <div className="text-sm font-medium">Equity</div>
      <div className="text-xs text-gray-600 mb-1">min {formatNum(min)} · max {formatNum(max)}</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} />
      </svg>
    </div>
  );
}
