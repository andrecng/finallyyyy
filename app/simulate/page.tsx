"use client";

import { useState } from "react";
import { runSimulation } from "@/lib/api";
import KPICards from "@/components/KPICards";
import Sparkline from "@/components/Sparkline";
import RiskSummary from "@/components/RiskSummary";
import InputForm, { InputState } from "@/components/InputForm";
import { POLICIES } from "@/lib/policies";

const DEFAULT: InputState = {
  profile: "student_t_jumps_ewma",
  seed: 123,
  steps_per_day: 24,
  horizon_days: 20,
  initial_equity: 100000,
  modules: POLICIES["ftmo-daily-first"].modules,
  params: {
    ...POLICIES["ftmo-daily-first"].params
  }
};

export default function SimulatePage() {
  const [state, setState] = useState<InputState>(DEFAULT);
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function onRun() {
    setLoading(true); 
    setOut(null);
    try {
      const payload = {
        profile: state.profile,
        preset: "FTMO-lite",
        modules: state.modules,
        params: state.params,
        seed: state.seed,
        steps_per_day: state.steps_per_day,
        horizon_days: state.horizon_days,
        initial_equity: state.initial_equity
      };
      const res = await runSimulation(payload);
      setOut(res);
    } catch (e:any) {
      setOut({ error: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Simulation</h1>
          <div className="mt-3 flex gap-2 items-center">
            <label className="text-sm">Preset</label>
            <select
              className="rounded-md border p-2 text-sm"
              defaultValue="ftmo-daily-first"
              onChange={(e)=>{
                const key = e.target.value;
                const pol = POLICIES[key];
                if (!pol) return;
                setState(s=>({
                  ...s,
                  modules: pol.modules,
                  params: { ...s.params, ...pol.params } // conserve seed/steps/horizon/equity
                }));
              }}
            >
              {Object.entries(POLICIES).map(([k,p])=>(
                <option key={k} value={k}>{p.label}</option>
              ))}
            </select>
            <button
              className="rounded-md border px-3 py-2 text-sm"
              onClick={()=>{
                const pol = POLICIES["ftmo-daily-first"];
                setState(s=>({
                  ...s,
                  modules: pol.modules,
                  params: { ...s.params, ...pol.params }
                }));
              }}
            >
              Charger
            </button>
          </div>
        </div>

        <button onClick={onRun} disabled={loading}
          className="h-10 rounded-lg px-4 py-2 bg-black text-white disabled:opacity-50">
          {loading ? "Exécution..." : "Lancer"}
        </button>
      </div>

      <InputForm state={state} onChange={setState} />

      {out?.series?.equity && (
        <div className="space-y-3">
          <div className="text-sm font-medium">Equity (sparkline)</div>
          <Sparkline data={out.series.equity} />
        </div>
      )}

      <KPICards kpis={out?.kpis} ftmo={out?.ftmo} />
      <RiskSummary out={out} />

      {out && (
        <details className="rounded-md border p-3 text-sm">
          <summary className="cursor-pointer font-medium">JSON d'entrée envoyé & JSON de sortie</summary>
          <pre className="overflow-auto max-h-[50vh] text-xs">
{JSON.stringify({
  sent: {
    profile: state.profile,
    preset: "FTMO-lite",
    modules: state.modules,
    params: state.params,
    seed: state.seed,
    steps_per_day: state.steps_per_day,
    horizon_days: state.horizon_days,
    initial_equity: state.initial_equity
  },
  received: out
}, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
