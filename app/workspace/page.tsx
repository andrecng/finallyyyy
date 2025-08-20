"use client";

import { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "@/stores/workspace";
import InputForm from "@/components/InputForm";
import { POLICIES } from "@/lib/policies";
import { runSimulation } from "@/lib/api";
import KPICards from "@/components/KPICards";
import Sparkline from "@/components/Sparkline";
import RiskSummary from "@/components/RiskSummary";

export default function WorkbenchPage() {
  const { state, setState, loadPolicy } = useWorkspace();
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<"configure"|"modules"|"simulate"|"results">("configure");

  // Deep-link: #modules, #simulate, #results
  useEffect(() => {
    const hash = (typeof window !== "undefined" && window.location.hash.replace("#","")) || "";
    if (hash === "modules" || hash==="simulate" || hash==="results") setActive(hash as any);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.location.hash = active;
  }, [active]);

  async function onRun() {
    setLoading(true); setOut(null); setActive("results");
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

  const binderTop = useMemo(()=>{
    if (!out?.binder_pct) return null;
    const entries = Object.entries(out.binder_pct as Record<string, number>);
    if (!entries.length) return null;
    return entries.sort((a,b)=>b[1]-a[1])[0];
  }, [out]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b pb-3">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Workspace</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="text-sm">Preset</label>
              <select
                className="rounded-md border p-2 text-sm"
                defaultValue="ftmo-daily-first"
                onChange={(e)=>{
                  const key = e.target.value;
                  const pol = POLICIES[key];
                  if (pol) loadPolicy(pol);
                }}
              >
                {Object.entries(POLICIES).map(([k,p])=>(
                  <option key={k} value={k}>{p.label}</option>
                ))}
              </select>
              <button
                className="rounded-md border px-3 py-2 text-sm"
                onClick={()=> loadPolicy(POLICIES["ftmo-daily-first"])}
              >
                Charger preset
              </button>

              {binderTop && (
                <span
                  className="ml-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                  onClick={()=> setActive("modules")}
                  title="Aller régler le module"
                >
                  Binder dominant: <b>{binderTop[0]}</b> {binderTop[1]}%
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={()=>setActive("modules")} className="rounded-md border px-3 py-2 text-sm">Modifier modules</button>
            <button onClick={onRun} disabled={loading}
              className="h-10 rounded-lg px-4 py-2 bg-black text-white disabled:opacity-50">
              {loading ? "Exécution..." : "Lancer"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-3 flex gap-4 text-sm">
          {["configure","modules","simulate","results"].map(k=>(
            <button
              key={k}
              onClick={()=>setActive(k as any)}
              className={`pb-2 ${active===k ? "border-b-2 border-black font-medium" : "text-neutral-500"}`}
            >
              {k==="configure" ? "Configurer" : k==="modules" ? "Modules" : k==="simulate" ? "Simuler" : "Résultats"}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      {active==="configure" || active==="modules" ? (
        <InputForm
          state={state}
          onChange={(s)=> setState(s)}
        />
      ) : null}

      {active==="simulate" && (
        <div id="simulate" className="rounded-2xl border p-6">
          <h3 className="font-semibold mb-2">Simuler</h3>
          <p className="text-sm text-neutral-600 mb-4">
            Prépare tes paramètres, puis lance une simulation unitaire (batch MC viendra après).
          </p>
          <button onClick={onRun} disabled={loading}
            className="h-10 rounded-lg px-4 py-2 bg-black text-white disabled:opacity-50">
            {loading ? "Exécution..." : "Lancer"}
          </button>
        </div>
      )}

      {active==="results" && (
        <div id="results" className="space-y-6">
          {out?.series?.equity && (
            <div className="space-y-3">
              <div className="text-sm font-medium">Equity (sparkline)</div>
              <Sparkline data={out.series.equity} />
            </div>
          )}
          <KPICards kpis={out?.kpis} ftmo={out?.ftmo} />
          <RiskSummary out={out} />

          <details className="rounded-md border p-3 text-sm">
            <summary className="cursor-pointer font-medium">Voir JSON (entrée envoyée & sortie reçue)</summary>
            <pre className="overflow-auto max-h-[60vh] text-xs">
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
        </div>
      )}
    </div>
  );
}
