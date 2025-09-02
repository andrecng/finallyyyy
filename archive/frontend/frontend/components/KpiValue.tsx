"use client";

export default function KpiValue({ v, fmt="num", digits=2 }: { v?: number; fmt?: "num"|"pct"; digits?: number }) {
  if (v == null || Number.isNaN(v)) return <span className="text-gray-400">—</span>;
  const sign = Math.sign(v);
  const cls = sign > 0 ? "text-green-600" : sign < 0 ? "text-red-600" : "text-gray-700";
  const val = fmt === "pct" ? `${(v*100).toFixed(digits)}%` : v.toFixed(digits);
  return <span className={cls}>{val}</span>;
}
