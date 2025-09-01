"use client";
import React, { useMemo } from "react";

export default function EquityChart({
  series,
  className = "",
}: {
  series?: number[] | null;
  className?: string;
}) {
  // Défense: si on nous passe autre chose qu'un number[], on essaye de récupérer depuis la fenêtre (debug)
  let arr: number[] = Array.isArray(series) ? series as number[] : [];

  // fallback debug (ne casse rien si absent)
  if (!Array.isArray(arr) || arr.length === 0) {
    const win: any = typeof window !== "undefined" ? window : {};
    const candidates: any[] = [
      win.__lastOut?.series?.equity,
      win.__norm?.series?.equity,
      win.__raw?.series?.equity,
      win.__raw?.equity,
    ].filter(Boolean);
    const best = candidates.find((c) => Array.isArray(c) && typeof c[0] === "number");
    if (Array.isArray(best)) arr = best;
  }

  console.log("EquityChart props", {
    type: Array.isArray(arr) ? typeof arr[0] : typeof arr,
    length: Array.isArray(arr) ? arr.length : 0,
    preview: Array.isArray(arr) ? arr.slice(0, 3) : [],
  });

  const n = arr?.length ?? 0;
  if (!arr || n < 2) {
    return (
      <div className={"rounded border p-3 text-sm text-gray-500 " + className}>
        <div className="flex items-center justify-between">
          <div className="font-semibold">Equity</div>
          <div className="text-xs text-gray-400">X: Steps · Y: Equity (index)</div>
        </div>
        <div className="mt-2">Aucune donnée d'équité.</div>
      </div>
    );
  }

  // bornes + métriques basiques
  const { min, max, totalReturn } = useMemo(() => {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const first = arr[0];
    const last = arr[n - 1];
    const totalReturn = first !== 0 ? last / first - 1 : 0;
    return { min, max, totalReturn };
  }, [arr, n]);

  // SVG simple
  const W = 560, H = 220, pad = 20;
  const x = (i: number) => pad + (i / (n - 1)) * (W - 2 * pad);
  const y = (v: number) => {
    const ymin = min, ymax = max === min ? min + 1e-9 : max;
    return pad + (1 - (v - ymin) / (ymax - ymin)) * (H - 2 * pad);
  };
  const points = arr.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  const pct = (v: number) =>
    (v >= 0 ? "+" : "") + (v * 100).toFixed(2).replace(/\.00$/, "") + " %";

  return (
    <div className={"rounded border p-3 space-y-2 " + className}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Equity (index)</div>
        <div className="text-xs text-gray-500">X: Steps · Y: Equity (index)</div>
      </div>

      <div className="text-xs text-gray-600">
        Min: <span className="font-medium">{min.toFixed(3)}</span> ·{" "}
        Max: <span className="font-medium">{max.toFixed(3)}</span> ·{" "}
        Perf cumulée: <span className="font-medium">{pct(totalReturn)}</span>
      </div>

      <svg width={W} height={H} className="w-full h-auto">
        <rect x={0.5} y={0.5} width={W - 1} height={H - 1} fill="white" stroke="#e5e7eb" />
        <polyline fill="none" stroke="#111827" strokeWidth="1.5" points={points} />
        <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="#6b7280">Steps</text>
        <text x={12} y={12} textAnchor="start" fontSize="10" fill="#6b7280">Equity (index)</text>
      </svg>
    </div>
  );
}
