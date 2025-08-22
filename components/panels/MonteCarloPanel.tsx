"use client";
import { useState } from "react";
import type { PresetV1, SimulationOutput } from "@/engine/facade";
import { engine } from "@/engine/facade";
import NumberInput from "@/components/core/NumberInput";

function quantile(xs: number[], q: number) {
  if (xs.length === 0) return NaN;
  const arr = [...xs].sort((a, b) => a - b);
  const pos = (arr.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return arr[base] + (arr[base + 1] - arr[base]) * (rest || 0);
}

export default function MonteCarloPanel({ basePreset }: { basePreset: PresetV1 }) {
  const [n, setN] = useState<number>(50);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<{ passRate: number; ddP50: number; ddP95: number; } | null>(null);

  async function runMC() {
    setBusy(true);
    const dds: number[] = [];
    let pass = 0;
    for (let i = 0; i < n; i++) {
      const p: PresetV1 = { ...basePreset, seed: (basePreset.seed ?? 42) + i };
      const out: SimulationOutput = await engine.simulate(p);
      const k = out.kpis ?? {};
      if ((k.violations_daily ?? 0) === 0 && (k.violations_total ?? 0) === 0) pass++;
      if (Number.isFinite(k.max_dd_total ?? NaN)) dds.push(k.max_dd_total as number);
    }
    setSummary({
      passRate: pass / n,
      ddP50: quantile(dds, 0.5),
      ddP95: quantile(dds, 0.95),
    });
    setBusy(false);
  }

  return (
    <div className="rounded border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Monte Carlo</div>
        <div className="text-xs text-gray-500">{busy ? "Running..." : "Ready"}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-32">
          <NumberInput value={n} onChange={setN} step={10} />
        </div>
        <button onClick={runMC} className="px-3 py-1 rounded border">▶ Lancer N runs</button>
      </div>
      {summary && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded border p-2">Pass rate: <b>{(summary.passRate * 100).toFixed(1)}%</b></div>
          <div className="rounded border p-2">DD p50: <b>{(summary.ddP50 * 100).toFixed(2)}%</b></div>
          <div className="rounded border p-2">DD p95: <b>{(summary.ddP95 * 100).toFixed(2)}%</b></div>
        </div>
      )}
    </div>
  );
}
