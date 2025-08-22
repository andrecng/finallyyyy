"use client";
import { useState } from "react";
import type { PresetV1, SimulationOutput } from "@/engine/facade";
import { engine } from "@/engine/facade";
import { pct, toNum, asInt01 } from "@/lib/format";

function pick(o: any, key: string) {
  // supporte out.key OU out.kpis.key
  return o?.[key] ?? o?.kpis?.[key] ?? null;
}

export default function MonteCarloPanel({ basePreset }: { basePreset: PresetV1 }) {
  const [iterations, setIterations] = useState<number>(100);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<{
    pass_rate: number | null;
    dd_p50: number | null;
    dd_p95: number | null;
    runs: number;
  } | null>(null);

  async function runMC() {
    try {
      setBusy(true);
      const N = Math.max(1, Math.floor(iterations));
      const results: SimulationOutput[] = [];

      for (let i = 0; i < N; i++) {
        const preset = { ...basePreset, seed: (basePreset.seed ?? 0) + i + 1 };
        const out = await engine.simulate(preset);
        results.push(out);
      }

      let passCount = 0;
      const dds: number[] = [];

      for (const r of results) {
        // READ violations en racine ou kpis, et tolérer bool/str/num
        const vd = asInt01(pick(r, "violations_daily"));
        const vt = asInt01(pick(r, "violations_total"));
        // Ne JAMAIS compter PASS si une info manque
        if (vd === 0 && vt === 0) passCount += 1;

        // READ max_dd_total où qu'il soit, même en string
        const dd = toNum(pick(r, "max_dd_total"));
        if (dd != null) dds.push(dd);
      }

      dds.sort((a, b) => a - b);
      const q = (p: number): number | null => {
        if (!dds.length) return null;
        const idx = Math.min(dds.length - 1, Math.max(0, Math.floor((dds.length - 1) * p)));
        return dds[idx];
        // (simple index quantile; suffisant ici)
      };

      setSummary({
        pass_rate: results.length ? passCount / results.length : 0,
        dd_p50: q(0.5),
        dd_p95: q(0.95),
        runs: results.length,
      });
    } catch (e) {
      console.error(e);
      alert("Erreur Monte Carlo: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Monte Carlo</div>
        <div className="text-xs text-gray-500">{busy ? "Running…" : "Ready"}</div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <label className="text-xs text-gray-600">Iterations</label>
        <input
          className="rounded border px-2 py-1 w-24"
          type="number"
          min={1}
          step={1}
          value={iterations}
          onChange={(e) => setIterations(parseInt(e.target.value || "0", 10))}
        />
        <button
          onClick={runMC}
          disabled={busy}
          className={`px-3 py-1 rounded border ${busy ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Lancer N runs
        </button>
      </div>

      <div className="text-xs text-gray-500">
        Pass rate = **FTMO (DD daily & total)** uniquement. La cible de profit n'est pas incluse.
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="rounded border p-2">
            <div className="text-xs text-gray-500">Pass rate</div>
            <div className="font-medium">{pct(summary.pass_rate)}</div>
            <div className="text-[10px] text-gray-500">({summary.runs} runs)</div>
          </div>
          <div className="rounded border p-2">
            <div className="text-xs text-gray-500">DD p50</div>
            <div className="font-medium">{pct(summary.dd_p50)}</div>
          </div>
          <div className="rounded border p-2">
            <div className="text-xs text-gray-500">DD p95</div>
            <div className="font-medium">{pct(summary.dd_p95)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
