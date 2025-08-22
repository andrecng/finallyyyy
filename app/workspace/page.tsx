"use client";
import { useState } from "react";
import type { PresetV1, SimulationOutput } from "@/engine/facade";
import { engine } from "@/engine/facade";
import ActionsBar from "@/components/panels/ActionsBar";
import PresetEditor from "@/components/panels/PresetEditor";
import ResultPanel from "@/components/ResultPanel";
import EquityChart from "@/components/charts/EquityChart";
import MonteCarloPanel from "@/components/panels/MonteCarloPanel";
import PresetLibrary from "@/components/panels/PresetLibrary";

const defaultPreset: PresetV1 = {
  schema_version: "1.0",
  name: "baseline-daily-first",
  seed: 1337,
  total_steps: 2000,
  mu: 0.0,
  fees_per_trade: 0.0002,
  modules: {
    VolatilityTarget: { vt_target_vol: 0.10, vt_halflife: 16 },
    CPPIFreeze:      { alpha: 0.20, freeze_frac: 0.05 },
    KellyCap:        { cap_mult: 0.50 },
    SoftBarrier:     { enabled: true, steps: [1,2,3], haircuts: [0.7,0.5,0.3] },
    FTMOGate:        { enabled: true, daily_limit: 0.02, total_limit: 0.10, spend_rate: 0.35, lmax_vol_aware: "p50" }
  }
};

export default function Workspace() {
  const [preset, setPreset] = useState<PresetV1>(defaultPreset);
  const [out, setOut] = useState<SimulationOutput | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => { setPreset(defaultPreset); setOut(null); };

  async function run() {
    try {
      setBusy(true);
      const res = await engine.simulate(preset);
      setOut(res);
    } catch (e) {
      console.error(e);
      alert("Erreur simulate(): " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Workspace</h1>
        <div className="text-xs text-gray-500">{busy ? "Running..." : "Ready"}</div>
      </div>

      <ActionsBar preset={preset} onRun={run} onReset={reset} setPreset={setPreset} busy={busy} />
      <PresetEditor preset={preset} setPreset={setPreset} />

      <PresetLibrary current={preset} setPreset={setPreset} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ResultPanel out={out} />
        <EquityChart series={out?.series?.equity ?? []} />
      </div>

      <MonteCarloPanel basePreset={preset} />
    </main>
  );
}
