"use client";
import { useState } from "react";
import type { PresetV1, SimulationOutput } from "@/engine/facade";
import { engine } from "@/engine/facade";
import ActionsBar from "@/components/panels/ActionsBar";
import PresetEditor from "@/components/panels/PresetEditor";
import ResultPanel from "@/components/ResultPanel";
import EquityChart from "@/components/charts/EquityChart";

import PerformanceRiskPanel from "@/components/panels/PerformanceRiskPanel";
import DiagnosticsPanel from "@/components/panels/DiagnosticsPanel";
import McPanel from "./components/McPanel";
import { simulate, simulateMc } from "./lib/api";
import { normalizePreset } from "./lib/normalize";
import { mapToBackend } from "./lib/buildPayload";

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
  const [out, setOut] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [mc, setMc] = useState<any>(null);

  const resetBaseline = () => { setPreset(defaultPreset); setOut(null); };

  // Fonction pour appliquer un preset complet
  function applyPreset(presetObj: any) {
    try {
      // IMPORTANT: on doit setter l'objet complet,
      // pas {id,name} ni seulement quelques champs.
      const normalized = normalizePreset(presetObj);
      setPreset(normalized);
      setOut(null);
      setMc(null);
    } catch (e) {
      alert("Preset invalide: vérifie % (doivent être en décimal), booléens et nombres.");
      console.error(e);
    }
  }

  // Fonction pour parser un preset JSON manuel
  function onPastePreset(text: string) {
    try {
      // Interdire les commentaires // et trailing %, sinon on sanitize avant
      const obj = JSON.parse(text);
      applyPreset(obj);
    } catch {
      alert("JSON invalide (pas de // commentaires, pas de % dans les nombres).");
    }
  }

  async function run() {
    try {
      setBusy(true);
      
      // 1) MAP - Mapping UI → backend avec log visuel
      const payload = mapToBackend(preset);
      console.log("simulate payload →", payload);
      
      // 2) VÉRIFIER - Bloquer si aucun sizer actif (VT/CPPI)
      const hasSizer = payload.use_vt || payload.use_cppi;
      if (!hasSizer) {
        alert("Aucune exposition envoyée (active VolatilityTarget ou CPPI).");
        return;
      }
      
      // 3) FETCH - Simulation principale
      const res = await simulate(payload);
      setOut(res);
      
      // Appel Monte-Carlo avec le même payload
      try {
        const mcRes = await simulateMc(payload, 100, 777);
        setMc(mcRes.mc);
      } catch (mcError) {
        console.error("Erreur Monte-Carlo:", mcError);
      }
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

      <ActionsBar preset={preset} onRun={run} onReset={resetBaseline} setPreset={setPreset} busy={busy} />
      <PresetEditor preset={preset} setPreset={setPreset} />

      {/* Alerte exposition par défaut */}
      {out?.diag?.used_default_expo && (
        <div className="p-3 rounded-lg bg-yellow-100 border border-yellow-300 text-yellow-800">
          ⚠️ <strong>Aucune exposition envoyée</strong> (tous modules OFF ou champs non mappés).
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ResultPanel out={out} />
        <EquityChart series={out?.series?.equity ?? []} />
      </div>

      <PerformanceRiskPanel out={out} />
      <DiagnosticsPanel out={out} />

      {/* Panneau Monte-Carlo moderne */}
      <McPanel mc={mc} />
    </main>
  );
}
