"use client";
import { pct } from "@/lib/format";

export default function EquityChart({ series }: { series: number[] }) {
  const n = series?.length ?? 0;
  if (!series || n < 2) {
    return (
      <div className="rounded border p-3 text-sm text-gray-500">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Equity</div>
          <div className="text-xs text-gray-400">X: Steps · Y: Equity (index)</div>
        </div>
        <div className="mt-2">Aucune donnée d'équité.</div>
      </div>
    );
  }

  const min = Math.min(...series);
  const max = Math.max(...series);
  const first = series[0];
  const last = series[n - 1];
  const totalReturn = first !== 0 ? (last / first - 1) : 0;

  // Simple SVG polyline
  const W = 560, H = 220, pad = 20;
  const x = (i: number) => pad + (i / (n - 1)) * (W - 2 * pad);
  const y = (v: number) => {
    const ymin = min, ymax = max === min ? min + 1e-9 : max;
    // inversé car SVG y=0 en haut
    return pad + (1 - (v - ymin) / (ymax - ymin)) * (H - 2 * pad);
  };
  const points = series.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  return (
    <div className="rounded border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Equity (index)</div>
        <div className="text-xs text-gray-500">X: Steps · Y: Equity (index)</div>
      </div>

      <div className="text-xs text-gray-600">
        Min: <span className="font-medium">{min.toFixed(3)}</span> ·
        Max: <span className="font-medium">{max.toFixed(3)}</span> ·
        Perf cumulée: <span className="font-medium">{pct(totalReturn)}</span>
      </div>

      <svg width={W} height={H} className="w-full h-auto">
        {/* cadre */}
        <rect x={0.5} y={0.5} width={W - 1} height={H - 1} fill="white" stroke="#e5e7eb" />
        {/* polyline */}
        <polyline fill="none" stroke="#111827" strokeWidth="1.5" points={points} />
        {/* axes labels (texte simple) */}
        <text x={W/2} y={H - 4} textAnchor="middle" fontSize="10" fill="#6b7280">Steps</text>
        <text x={12} y={12} textAnchor="start" fontSize="10" fill="#6b7280">Equity (index)</text>
      </svg>
    </div>
  );
}
