"use client";
import type { SimulationOutput } from "@/engine/facade";
import { formatPct } from "@/lib/utils";

export default function ResultPanel({ out }: { out: SimulationOutput | null }) {
  if (!out) return <div className="rounded border p-3 text-sm text-gray-500">Aucun résultat. Lance une simulation.</div>;
  const k = out.kpis ?? {};
  const pass = (k.violations_daily ?? 0) === 0 && (k.violations_total ?? 0) === 0;

  return (
    <div className="rounded border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Résultats</div>
        <span className={`text-xs px-2 py-0.5 rounded ${pass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {pass ? "FTMO PASS" : "FTMO FAIL"}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="rounded border p-2">Max DD total: <b>{formatPct(k.max_dd_total ?? NaN)}</b></div>
        <div className="rounded border p-2">Max DD daily: <b>{formatPct(k.max_dd_daily ?? NaN)}</b></div>
        <div className="rounded border p-2">Viol. daily: <b>{k.violations_daily ?? 0}</b></div>
        <div className="rounded border p-2">Viol. total: <b>{k.violations_total ?? 0}</b></div>
      </div>
      <pre className="text-[11px] bg-gray-50 rounded p-2 overflow-auto">{JSON.stringify(k, null, 2)}</pre>
    </div>
  );
}
