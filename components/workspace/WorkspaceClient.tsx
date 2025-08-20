"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import Field from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import ResultsPanel from "@/components/workspace/ResultsPanel";
import EquityChart from "@/components/charts/EquityChart";
import { runLocalSim } from "@/lib/sim/localRun";

export default function WorkspaceClient() {
  const sp = useSearchParams();
  const initialStep = sp.get("step") ?? "configure";
  const [step, setStep] = useState(initialStep);

  // Params de base
  const [initialCapital, setInitialCapital] = useState<number | "">(10000);
  const [horizonDays, setHorizonDays] = useState<number | "">(20);
  const [volAnn, setVolAnn] = useState<number | "">(0.10);
  const [dailyMaxLoss, setDailyMaxLoss] = useState<number | "">(0.005);
  const [totalMaxLoss, setTotalMaxLoss] = useState<number | "">(0.10);

  // Résultats
  const [chartData, setChartData] = useState<{ day: number; eq: number }[] | null>(null);
  const [kpis, setKpis] = useState<{ passDaily: boolean; passTotal: boolean; dailyViolations: number; maxDD: number } | null>(null);

  const steps = useMemo(
    () => ["configure", "modules", "simulate", "results"] as const,
    []
  );

  const runSim = () => {
    if ([initialCapital, horizonDays, volAnn, dailyMaxLoss, totalMaxLoss].some(v => v === "")) return;
    const out = runLocalSim({
      initialCapital: Number(initialCapital),
      horizonDays: Number(horizonDays),
      volAnn: Number(volAnn),
      dailyMaxLoss: Number(dailyMaxLoss),
      totalMaxLoss: Number(totalMaxLoss),
    });
    const data = out.equityPct.map((eq, i) => ({ day: i, eq }));
    setChartData(data);
    setKpis({
      passDaily: out.passDaily,
      passTotal: out.passTotal,
      dailyViolations: out.dailyViolations,
      maxDD: out.maxDrawdownPct,
    });
    setStep("results");
  };

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
            <h2 className="text-lg font-medium mb-2">Simuler</h2>
            <p className="text-muted">Run local (random walk) pour retrouver les **graphiques** et un **check FTMO** basique.</p>
            <button className="mt-3 btn-accent hover:opacity-90 px-6 py-3 rounded-lg text-lg" onClick={runSim}>
              Lancer simulation locale
            </button>
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
