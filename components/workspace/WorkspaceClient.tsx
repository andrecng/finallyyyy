"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useWorkspace } from "@/stores/workspace";
import InputForm from "@/components/InputForm";
import { POLICIES } from "@/lib/policies";
import { runSimulation } from "@/lib/api";
import KPICards from "@/components/KPICards";
import Sparkline from "@/components/Sparkline";
import RiskSummary from "@/components/RiskSummary";
import ResultsPanel from "@/components/workspace/ResultsPanel";
import Field from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export default function WorkspaceClient() {
  const sp = useSearchParams();
  const initialStep = sp.get("step") ?? "configure";
  const [step, setStep] = useState(initialStep);
  const { state, setState, loadPolicy } = useWorkspace();
  const [out, setOut] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const steps = useMemo(
    () => ["configure", "modules", "simulate", "results"] as const,
    []
  );

  async function onRun() {
    setLoading(true); 
    setOut(null); 
    setStep("results");
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
    <main className="min-h-dvh p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Workspace</h1>
        <nav className="flex gap-2">
          {steps.map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`px-3 py-1 rounded-full border border-base ${
                step === s ? "bg-elev" : "hover:bg-card"
              }`}
            >
              {s}
            </button>
          ))}
        </nav>
      </header>

      {/* Preset Loader */}
      <div className="mb-6 p-4 border border-base rounded-lg bg-card">
        <div className="flex items-center gap-4">
          <label className="text-sm">Preset FTMO</label>
          <select
            className="rounded-md border border-base bg-elev p-2 text-sm"
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
            className="rounded-md border border-base bg-elev px-3 py-2 text-sm hover:bg-card"
            onClick={()=> loadPolicy(POLICIES["ftmo-daily-first"])}
          >
            Charger preset
          </button>

          {binderTop && (
            <span
              className="ml-2 inline-flex items-center gap-2 rounded-full border border-base px-3 py-1 text-xs cursor-pointer bg-elev hover:bg-card"
              onClick={()=> setStep("modules")}
              title="Aller régler le module"
            >
              Binder dominant: <b>{binderTop[0]}</b> {binderTop[1]}%
            </span>
          )}
        </div>
      </div>

      <section className="grid gap-4">
        {step === "configure" && (
          <div className="rounded-2xl border border-base p-4 bg-card">
            <h2 className="text-lg font-medium mb-2">Configurer</h2>
            <p className="text-muted mb-4">
              Sélectionne un preset, ajuste les paramètres de base, puis passe à <button onClick={() => setStep("modules")} className="underline">Modules</button>.
            </p>

            <div className="grid gap-5">
              <Field
                label="Plancher CPPI (α)"
                subtitle="floor = HWM·(1−α)"
                htmlFor="cppi-alpha"
              >
                <Input id="cppi-alpha" type="number" placeholder="ex: 0.20" variant="light" />
              </Field>

              <Field
                label="Horizon (jours)"
                subtitle="Fenêtre de simulation / rebalancement"
                htmlFor="horizon-days"
              >
                <Input
                  id="horizon-days"
                  type="number"
                  placeholder="20"
                  variant="light"
                />
              </Field>
            </div>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setStep("modules")} 
                className="btn-accent hover:opacity-90 px-4 py-2 rounded-lg"
              >
                Suivant : Modules →
              </button>
            </div>
          </div>
        )}

        {step === "modules" && (
          <div className="rounded-2xl border border-base p-4 bg-card">
            <h2 className="text-lg font-medium mb-4">Modules & paramètres</h2>

            <div className="grid gap-5">
              <Field
                label="Vol cible (ann.)"
                subtitle="Ex: 0.10 = 10% de volatilité annualisée"
                htmlFor="vol-target"
              >
                <Input id="vol-target" type="number" placeholder="ex: 0.10" variant="light" />
              </Field>

              <Field
                label="FTMOGate — Daily max loss"
                subtitle="Budget journalier avant total (daily‑first)"
                htmlFor="ftmo-daily"
              >
                <Input id="ftmo-daily" type="number" placeholder="ex: 0.005 = 0.5%" variant="light" />
              </Field>

              <Field
                label="FTMOGate — Total max loss"
                subtitle="Arrêt si drawdown total atteint"
                htmlFor="ftmo-total"
              >
                <Input id="ftmo-total" type="number" placeholder="ex: 0.10 = 10%" variant="light" />
              </Field>

              <Field
                label="FTMOGate — Spend rate"
                subtitle="Pacing intraday: fraction du budget jour par heure"
                htmlFor="ftmo-spend"
              >
                <Input id="ftmo-spend" type="number" placeholder="ex: 0.20 = 20%" variant="light" />
              </Field>

              <Field
                label="FTMOGate — lmax (vol‑aware)"
                subtitle="Plafond réduit si vol > vol de référence"
                htmlFor="ftmo-lmax"
              >
                <Input id="ftmo-lmax" type="number" placeholder="ex: 1.00" variant="light" />
              </Field>

              <Field
                label="Vol de référence"
                subtitle="Calibration de lmax (ex: 0.10 = 10%)"
                htmlFor="ftmo-refvol"
              >
                <Input id="ftmo-refvol" type="number" placeholder="ex: 0.10" variant="light" />
              </Field>
            </div>
            
            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => setStep("configure")} 
                className="border border-base px-4 py-2 rounded-lg hover:bg-elev"
              >
                ← Retour
              </button>
              <button 
                onClick={() => setStep("simulate")} 
                className="btn-accent hover:opacity-90 px-4 py-2 rounded-lg"
              >
                Suivant : Simuler →
              </button>
            </div>
          </div>
        )}

        {step === "simulate" && (
          <div className="rounded-2xl border border-base p-4 bg-card">
            <h2 className="text-lg font-medium mb-4">Simuler</h2>
            <div className="text-center space-y-4">
              <p className="text-muted">
                Lancer une simulation Monte Carlo avec les paramètres configurés
              </p>
              <button 
                onClick={onRun} 
                disabled={loading}
                className="btn-accent hover:opacity-90 disabled:opacity-50 px-6 py-3 rounded-lg text-lg"
              >
                {loading ? "Simulation en cours..." : "🚀 Lancer Simulation"}
              </button>
              
              <div className="border-t border-base pt-4">
                <p className="text-muted text-sm mb-3">
                  Test rapide FTMOGate (daily-first + pacing)
                </p>
                <button
                  className="px-4 py-2 rounded-lg border border-base hover:bg-elev text-sm"
                  onClick={async () => {
                    // TODO: appeler backend; pour l'instant on simule une réponse
                    const mock = { requested: 0.012, allowed: 0.009, freeze: false, reasons: ["clipped"] };
                    alert(`FTMOGate → requested=${mock.requested}, allowed=${mock.allowed}, freeze=${mock.freeze}\n${mock.reasons.join(", ")}`);
                  }}
                >
                  🧪 Lancer FTMOGate (mock)
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "results" && (
          <div className="rounded-2xl border border-base p-4 bg-card">
            <h2 className="text-lg font-medium mb-2">Résultats</h2>
            <p className="text-muted mb-3">
              KPIs, séries, logs, binder% par module. Clique "Voir JSON" pour les détails bruts.
            </p>
            <div className="mb-4">
              <ResultsPanel />
            </div>
            <button className="mt-3 px-4 py-2 rounded-lg hover:bg-elev border border-base">
              Voir JSON
            </button>
          </div>
        )}
      </section>

      <footer className="mt-8 text-muted text-center">
        <Link href="/workspace" className="underline link-accent">/workspace</Link>
      </footer>
    </main>
  );
}
