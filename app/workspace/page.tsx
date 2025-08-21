"use client";

import { useState } from "react";
import { engine, type PresetV1, type SimulationOutput } from "@/engine/facade";

export default function Workspace() {
  const [out, setOut] = useState<SimulationOutput | null>(null);

  async function run() {
    const preset: PresetV1 = {
      schema_version: "1.0",
      seed: 42, total_steps: 120, mu: 0, fees_per_trade: 0.0002,
      modules: {}
    };
    const res = await engine.simulate(preset);
    setOut(res);
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Workspace</h1>
      <button onClick={run} className="px-3 py-1 rounded border">Lancer simulation</button>
      <pre className="text-[11px] bg-gray-50 rounded p-2">{JSON.stringify(out?.kpis ?? {}, null, 2)}</pre>
    </main>
  );
}
