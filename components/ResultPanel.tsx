"use client";
import type { SimulationOutput } from "@/engine/facade";
import { pct, asInt01 } from "@/lib/format";

function pick(o: any, key: string) {
  // supporte out.key OU out.kpis.key
  return o?.[key] ?? o?.kpis?.[key] ?? null;
}

export default function ResultPanel({ out }: { out: SimulationOutput | null }) {
  // si pas de résultat encore
  if (!out) {
    return (
      <div className="rounded border p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Résultats</div>
          <div className="text-xs text-gray-400">—</div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded border p-2">
            <div className="text-xs text-gray-500">Max DD total</div>
            <div className="font-medium">—</div>
          </div>
          <div className="rounded border p-2">
            <div className="text-xs text-gray-500">Max DD daily</div>
            <div className="font-medium">—</div>
          </div>
          <div className="rounded border p-2">
            <div className="text-xs text-gray-500">Viol. daily</div>
            <div className="font-medium">—</div>
          </div>
          <div className="rounded border p-2">
            <div className="text-xs text-gray-500">Viol. total</div>
            <div className="font-medium">—</div>
          </div>
        </div>
      </div>
    );
  }

  const max_dd_total = pick(out, "max_dd_total");
  const max_dd_daily = pick(out, "max_dd_daily");
  const vd = asInt01(pick(out, "violations_daily"));
  const vt = asInt01(pick(out, "violations_total"));

  const pass = vd != null && vt != null ? vd === 0 && vt === 0 : null;

  return (
    <div className="rounded border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Résultats</div>
        <div className="text-xs">
          {pass == null ? (
            <span className="text-gray-400">—</span>
          ) : pass ? (
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700">FTMO PASS</span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700">FTMO FAIL</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded border p-2">
          <div className="text-xs text-gray-500">Max DD total</div>
          <div className="font-medium">{pct(max_dd_total)}</div>
        </div>
        <div className="rounded border p-2">
          <div className="text-xs text-gray-500">Max DD daily</div>
          <div className="font-medium">{pct(max_dd_daily)}</div>
        </div>

        <div className="rounded border p-2">
          <div className="text-xs text-gray-500">Viol. daily</div>
          <div className="font-medium">{vd ?? "—"}</div>
        </div>
        <div className="rounded border p-2">
          <div className="text-xs text-gray-500">Viol. total</div>
          <div className="font-medium">{vt ?? "—"}</div>
        </div>
      </div>

      {out?.notes && (
        <div className="text-xs text-gray-500 whitespace-pre-wrap">{out.notes}</div>
      )}
    </div>
  );
}
