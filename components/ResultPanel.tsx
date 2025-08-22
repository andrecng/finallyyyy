"use client";
import type { SimulationOutput } from "@/engine/facade";

export default function ResultPanel({ out }: { out: SimulationOutput | null }) {
  if (!out) return (
    <div className="rounded border p-3 text-sm text-gray-500">Aucun résultat. Lance une simulation.</div>
  );
  const { kpis = {}, modules_active = [] } = out;
  return (
    <div className="rounded border p-3 space-y-2">
      <div className="text-sm font-semibold">Résultats</div>
      <pre className="text-[11px] bg-gray-50 rounded p-2 overflow-auto">{JSON.stringify(kpis, null, 2)}</pre>
      {modules_active.length > 0 && (
        <div className="text-xs text-gray-600">Modules actifs: {modules_active.join(", ")}</div>
      )}
    </div>
  );
}
