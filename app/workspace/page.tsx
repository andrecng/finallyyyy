"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useState, useRef, useMemo, useEffect } from "react";
import type { PresetV1, SimulationOutput } from "@/engine/facade";
import { engine } from "@/engine/facade";
import ActionsBar from "@/components/panels/ActionsBar";
import PresetEditor from "@/components/panels/PresetEditor";
import ResultPanel from "@/components/ResultPanel";
import EquityChart from "@/components/charts/EquityChart";

import PerformanceRiskPanel from "@/components/panels/PerformanceRiskPanel";
import DiagnosticsPanel from "@/components/panels/DiagnosticsPanel";
import McPanel from "./components/McPanel";
const RunJournalPanel = dynamic(() => import("@/components/RunJournalPanel"), { ssr: false });
import { simulate, simulateMc } from "./lib/api";
import { normalizePreset } from "./lib/normalize";
import { mapToBackend } from "./lib/buildPayload";
import { getWorkspacePayload } from "@/app/lib/workspacePayload";
import { Input } from "@/components/core/Input";
import InputPercent from "@/components/core/InputPercent";
import { Chip } from "@/components/StatusChips";
import CollapsibleCard from "@/components/CollapsibleCard";
import AutoPresetSelect from "@/components/AutoPresetSelect";
import KpiBox from "@/components/KpiBox";
import NestedCPPISettings from "@/app/workspace/components/NestedCPPISettings";
import SessionGateSettings from "@/app/workspace/components/SessionGateSettings";
import McSummaryChips from "@/components/McSummaryChips";
import FtmoBadge from "@/components/FtmoBadge";
import StatusChips from "@/components/StatusChips";

const defaultPreset: PresetV1 = {
  schema_version: "1.0",
  name: "baseline-daily-first",
  seed: 1337,
  total_steps: 2000,
  mu: 0.0,
  fees_per_trade: 0.0002,
  sigma: 0.02,
  steps_per_day: 50,
  target_profit: 0.10,
  max_days: 30,
  daily_limit: 0.02,
  total_limit: 0.10,
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
  
  // Récupérer le payload du workspace au chargement
  useEffect(() => {
    const workspacePayload = getWorkspacePayload();
    if (workspacePayload) {
      try {
        // Essayer de normaliser et appliquer le payload
        const normalized = normalizePreset(workspacePayload);
        setPreset(normalized);
        // Nettoyer le localStorage après utilisation
        localStorage.removeItem("mm_workspace_payload_v1");
      } catch (e) {
        console.error("Erreur lors de l'application du payload workspace:", e);
      }
    }
  }, []);
  
  // États pour Monte Carlo manuel
  const [mcN, setMcN] = useState(100);
  const [mcData, setMcData] = useState<any | null>(null);
  const [mcStatus, setMcStatus] = useState<"ready" | "running" | "error">("ready");
  const [passRateFull, setPassRateFull] = useState(false);
  const [autoMC, setAutoMC] = useState(true);

  // Optionnel: annuler la requête précédente si l'utilisateur relance vite
  const mcAbortRef = useRef<AbortController | null>(null);
  const mcReqSeq = useRef(0);

  // helpers pour modifier le state imbriqué preset.modules.NestedCPPI / SessionGate
  const setNested = (key: string, val: any) =>
    setPreset(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        NestedCPPI: { ...(prev.modules?.NestedCPPI||{}), [key]: val }
      }
    }));

  const setSG = (key: string, val: any) =>
    setPreset(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        SessionGate: { ...(prev.modules?.SessionGate||{}), [key]: val }
      }
    }));

  // stringifier proprement le payload pour détecter les changements
  function stableStringify(x: any) {
    return JSON.stringify(x, Object.keys(x).sort());
  }

  const resetBaseline = () => { 
    setPreset(defaultPreset); 
    setOut(null); 
    setMc(null); 
    setMcData(null); 
    setMcStatus("ready"); 
  };

  // Fonction pour appliquer un preset complet
  function applyPreset(presetObj: any) {
    try {
      // IMPORTANT: on doit setter l'objet complet,
      // pas {id,name} ni seulement quelques champs.
      const normalized = normalizePreset(presetObj);
      setPreset(normalized);
      setOut(null);
      setMc(null);
      setMcData(null);
      setMcStatus("ready");
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

  // Fonction Monte Carlo avec contrôle d'annulation et refresh fiable
  async function runMc(nOverride?: number) {
    const n = nOverride ?? mcN;
    setMcStatus("running");

    // Annule l'ancien fetch s'il existe
    mcAbortRef.current?.abort();
    const ctl = new AbortController();
    mcAbortRef.current = ctl;

    const seq = ++mcReqSeq.current;

    try {
      const data = await simulateMc(payload, n, preset.seed, preset.name);

      // si entre temps un autre run est parti, on jette ce résultat
      if (seq !== mcReqSeq.current) return;

      // le backend peut renvoyer { n, mc: {...} } ou directement {...}
      const mc = data.mc ?? data;
      setMcData({
        pass_rate: mc.pass_rate,
        pass_rate_full: mc.pass_rate_full,
        dd_p50: mc.dd_p50,
        dd_p95: mc.dd_p95,
      });
      setMcStatus("ready");
    } catch (e) {
      if (seq !== mcReqSeq.current) return;
      console.error("Erreur Monte Carlo:", e);
      setMcStatus("error");
    }
  }

  // Détecter les changements de payload pour reset Monte Carlo
  const payload = mapToBackend(preset);
  const payloadKey = useMemo(() => stableStringify(payload), [payload]);

  // Quand le payload change (tu modifies un paramètre / un module), on remet le MC à zéro
  useEffect(() => {
    setMcData(null);
    setMcStatus("ready");
    // (si tu avais un auto-MC, déclenche-le ici avec runMc(); sinon on reste manuel)
  }, [payloadKey]);

  // Auto-run Monte-Carlo si activé
  useEffect(() => {
    if (!autoMC) return;
    const t = setTimeout(() => runMc(), 250); // petit debounce
    return () => clearTimeout(t);
  }, [payloadKey, mcN, autoMC]);

  // Fonction pour lancer la simulation avec Entrée
  const onEnterRun: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") run();
  };

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
      const res = await simulate(payload, preset.name);
      setOut(res);
      
      // Appel Monte-Carlo automatique COMMENTÉ
      // const AUTO_MC = false;
      // if (AUTO_MC) {
      //   try {
      //     const mcRes = await simulateMc(payload, 100, 777);
      //     setMc(mcRes.mc);
      //   } catch (mcError) {
      //     console.error("Erreur Monte-Carlo:", mcError);
      //   }
      // }
    } catch (e) {
      console.error(e);
      alert("Erreur simulate(): " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="p-6 space-y-4">
      {/* === HEADER collant en 2 rangées === */}
      <div className="sticky top-2 z-10 bg-white/80 backdrop-blur rounded-xl border p-2">
        {/* Rangée 1 : actions principales */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={run} 
            disabled={busy}
            className="btn"
          >
            {busy ? "⏳ Running..." : "▶︎ Run"}
          </button>
          <button onClick={resetBaseline} className="btn">↺ Reset</button>

          {/* Presets manuels */}
          <select className="border rounded px-2 py-1 text-sm">
            <option value="">Sélectionner un preset</option>
            {/* TODO: Ajouter la liste des presets manuels */}
          </select>

          <button className="btn">Delete (Library)</button>
          <button className="btn">Save As</button>
          <button className="btn">💾 Save (Quick)</button>
          <button className="btn">📂 Load (Quick)</button>
          <button className="btn">⬇︎ Export</button>
          <button className="btn">⬆︎ Import</button>

          {/* Statuts à droite */}
          <div className="ml-auto flex items-center gap-2">
            {/* Badge FTMO */}
            <FtmoBadge r={out} />
            <div className="text-xs text-gray-500">{busy ? "Running..." : "Ready"}</div>
          </div>
        </div>

        {/* Rangée 2 : Auto‑Search + Presets (Auto‑Search) */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {/* Bouton Auto‑Search existant */}
          <a href="/optimize" className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-sm">Auto‑Search</a>

          {/* Sélecteur Auto‑Search */}
          <AutoPresetSelect onApply={(p) => {
            setPreset(p);
            // Optionnel : lancer automatiquement la simulation
            // run();
          }} />

          {/* Lien Bibliothèque */}
          <a href="/presets" className="text-sm underline">Bibliothèque</a>

          {/* StatusChips à droite */}
          <div className="ml-auto">
            <StatusChips r={out} />
          </div>
        </div>
      </div>
      
      {/* ======= LAYOUT EN 2 COLONNES ======= */}
      <div className="grid gap-4 xl:grid-cols-12">
        {/* ========== COLONNE GAUCHE (7) ========== */}
        <div className="xl:col-span-7 space-y-4">
          {/* Rangée 1 : Paramètres (2×3) + Contraintes (2×2) */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* === Paramètres === */}
            <section className="mm-card p-4 compact-form">
              <h3 className="font-medium mb-2">Paramètres</h3>
              <div className="grid grid-cols-3 gap-3">
                {/* Total steps */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Total steps</label>
                  <Input
                    type="number"
                    compact
                    value={preset.total_steps}
                    onChange={(e) => setPreset({ ...preset, total_steps: Number(e.target.value) })}
                    onKeyDown={onEnterRun}
                  />
                </div>

                {/* Seed */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Seed</label>
                  <Input
                    type="number"
                    compact
                    value={preset.seed}
                    onChange={(e) => setPreset({ ...preset, seed: Number(e.target.value) })}
                    onKeyDown={onEnterRun}
                  />
                </div>

                {/* Drift μ */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Drift μ</label>
                  <Input
                    type="number"
                    compact
                    value={preset.mu}
                    onChange={(e) => setPreset({ ...preset, mu: Number(e.target.value) })}
                    onKeyDown={onEnterRun}
                  />
                </div>

                {/* Frais par trade */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Frais par trade</label>
                  <Input
                    type="number"
                    compact
                    value={preset.fees_per_trade}
                    onChange={(e) => setPreset({ ...preset, fees_per_trade: Number(e.target.value) })}
                    onKeyDown={onEnterRun}
                  />
                </div>

                {/* Sigma (volatilité) */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Sigma (volatilité)</label>
                  <Input
                    type="number"
                    compact
                    value={preset.sigma || 0.02}
                    onChange={(e) => setPreset({ ...preset, sigma: Number(e.target.value) })}
                    onKeyDown={onEnterRun}
                  />
                </div>

                {/* Steps par jour */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Steps par jour</label>
                  <Input
                    type="number"
                    compact
                    value={preset.steps_per_day || 50}
                    onChange={(e) => setPreset({ ...preset, steps_per_day: Number(e.target.value) })}
                    onKeyDown={onEnterRun}
                  />
                </div>
              </div>
            </section>

            {/* === Contraintes & Objectifs === */}
            <section className="mm-card p-4 compact-form">
              <h3 className="font-medium mb-2">Contraintes & Objectifs</h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Target profit */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Target profit</label>
                  <InputPercent
                    value={preset.target_profit || 0.10}
                    onCommit={(v) => setPreset({ ...preset, target_profit: v ?? 0.10 })}
                  />
                </div>

                {/* Max days */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Max days</label>
                  <Input
                    type="number"
                    compact
                    value={preset.max_days || 30}
                    onChange={(e) => setPreset({ ...preset, max_days: Number(e.target.value) })}
                    onKeyDown={onEnterRun}
                  />
                </div>

                {/* FTMO — daily */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Daily limit</label>
                  <InputPercent
                    value={preset.daily_limit || 0.02}
                    onCommit={(v) => setPreset({ ...preset, daily_limit: v ?? 0.02 })}
                  />
                </div>

                {/* FTMO — total */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">Total limit</label>
                  <InputPercent
                    value={preset.total_limit || 0.10}
                    onCommit={(v) => setPreset({ ...preset, total_limit: v ?? 0.10 })}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Rangée 2 : Modules (1) & Modules (2) côte à côte */}
          <div className="grid md:grid-cols-2 gap-4">
            <section className="mm-card p-4 compact-form">
              <h3 className="font-medium mb-2">Modules (1)</h3>
              {/* VolatilityTarget */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!preset.modules.VolatilityTarget}
                    onChange={(e) => {
                      const modules = { ...preset.modules };
                      if (e.target.checked) {
                        modules.VolatilityTarget = { vt_target_vol: 0.10, vt_halflife: 16 };
                      } else {
                        delete modules.VolatilityTarget;
                      }
                      setPreset({ ...preset, modules });
                    }}
                    className="rounded border-gray-300"
                  />
                  <label className="text-sm font-medium">Volatility Target</label>
                </div>
                {preset.modules.VolatilityTarget && (
                  <div className="grid grid-cols-2 gap-3 ml-6">
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600">Target vol</label>
                      <InputPercent
                        value={preset.modules.VolatilityTarget.vt_target_vol}
                        onCommit={(v) => {
                          const modules = { ...preset.modules };
                          if (modules.VolatilityTarget) {
                            modules.VolatilityTarget.vt_target_vol = v ?? 0.10;
                            setPreset({ ...preset, modules });
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600">Half-life</label>
                      <Input
                        type="number"
                        compact
                        value={preset.modules.VolatilityTarget.vt_halflife}
                        onChange={(e) => {
                          const modules = { ...preset.modules };
                          if (modules.VolatilityTarget) {
                            modules.VolatilityTarget.vt_halflife = Number(e.target.value);
                            setPreset({ ...preset, modules });
                          }
                        }}
                        onKeyDown={onEnterRun}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CPPI Freeze */}
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!preset.modules.CPPIFreeze}
                    onChange={(e) => {
                      const modules = { ...preset.modules };
                      if (e.target.checked) {
                        modules.CPPIFreeze = { alpha: 0.20, freeze_frac: 0.05 };
                      } else {
                        delete modules.CPPIFreeze;
                      }
                      setPreset({ ...preset, modules });
                    }}
                    className="rounded border-gray-300"
                  />
                  <label className="text-sm font-medium">CPPI Freeze</label>
                </div>
                {preset.modules.CPPIFreeze && (
                  <div className="grid grid-cols-2 gap-3 ml-6">
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600">Alpha</label>
                      <InputPercent
                        value={preset.modules.CPPIFreeze.alpha}
                        onCommit={(v) => {
                          const modules = { ...preset.modules };
                          if (modules.CPPIFreeze) {
                            modules.CPPIFreeze.alpha = v ?? 0.20;
                            setPreset({ ...preset, modules });
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600">Freeze frac</label>
                      <InputPercent
                        value={preset.modules.CPPIFreeze.freeze_frac}
                        onCommit={(v) => {
                          const modules = { ...preset.modules };
                          if (modules.CPPIFreeze) {
                            modules.CPPIFreeze.freeze_frac = v ?? 0.05;
                            setPreset({ ...preset, modules });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Kelly Cap */}
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!preset.modules.KellyCap}
                    onChange={(e) => {
                      const modules = { ...preset.modules };
                      if (e.target.checked) {
                        modules.KellyCap = { cap_mult: 0.50 };
                      } else {
                        delete modules.KellyCap;
                      }
                      setPreset({ ...preset, modules });
                    }}
                    className="rounded border-gray-300"
                  />
                  <label className="text-sm font-medium">Kelly Cap</label>
                </div>
                {preset.modules.KellyCap && (
                  <div className="ml-6">
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600">Cap</label>
                      <InputPercent
                        value={preset.modules.KellyCap.cap_mult}
                        onCommit={(v) => {
                          const modules = { ...preset.modules };
                          if (modules.KellyCap) {
                            modules.KellyCap.cap_mult = v ?? 0.50;
                            setPreset({ ...preset, modules });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* NestedCPPI */}
              <div className="mt-4 border-t pt-3">
                <NestedCPPISettings
                  use={!!preset.modules?.NestedCPPI?.use}
                  onUse={(b)=>setNested("use", b)}
                  emaHalfLife={preset.modules?.NestedCPPI?.ema_half_life ?? 16}
                  onEmaHalfLife={(n)=>setNested("ema_half_life", n)}
                  floorAlpha={preset.modules?.NestedCPPI?.floor_alpha ?? 0.10}
                  onFloorAlpha={(n)=>setNested("floor_alpha", n)}
                  freezeCushionMin={preset.modules?.NestedCPPI?.freeze_cushion_min ?? 0.05}
                  onFreezeCushionMin={(n)=>setNested("freeze_cushion_min", n)}
                />
              </div>
            </section>

            <section className="mm-card p-4 compact-form">
              <h3 className="font-medium mb-2">Modules (2)</h3>
              {/* Soft Barrier */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!preset.modules.SoftBarrier?.enabled}
                    onChange={(e) => {
                      const modules = { ...preset.modules };
                      if (e.target.checked) {
                        modules.SoftBarrier = { enabled: true, steps: [1,2,3], haircuts: [0.7,0.5,0.3] };
                      } else {
                        modules.SoftBarrier = { enabled: false, steps: [], haircuts: [] };
                      }
                      setPreset({ ...preset, modules });
                    }}
                    className="rounded border-gray-300"
                  />
                  <label className="text-sm font-medium">Soft Barrier</label>
                </div>
                {preset.modules.SoftBarrier?.enabled && (
                  <div className="ml-6">
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600">Barrier</label>
                      <InputPercent
                        value={0.02}
                        onCommit={(v) => {
                          // Note: soft_barrier n'est pas dans PresetV1, on utilise une valeur par défaut
                          console.log("Soft barrier value:", v);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* FTMO Gate */}
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!preset.modules.FTMOGate?.enabled}
                    onChange={(e) => {
                      const modules = { ...preset.modules };
                      if (e.target.checked) {
                        modules.FTMOGate = { enabled: true, daily_limit: 0.02, total_limit: 0.10, spend_rate: 0.35, lmax_vol_aware: "p50" };
                      } else {
                        modules.FTMOGate = { enabled: false, daily_limit: 0, total_limit: 0, spend_rate: 0, lmax_vol_aware: "p50" };
                      }
                      setPreset({ ...preset, modules });
                    }}
                    className="rounded border-gray-300"
                  />
                  <label className="text-sm font-medium">FTMO Gate</label>
                </div>
                {preset.modules.FTMOGate?.enabled && (
                  <div className="ml-6">
                    <div className="flex flex-col">
                      <label className="text-sm text-gray-600">Spend rate</label>
                      <InputPercent
                        value={preset.modules.FTMOGate.spend_rate}
                        onCommit={(v) => {
                          const modules = { ...preset.modules };
                          if (modules.FTMOGate) {
                            modules.FTMOGate.spend_rate = v ?? 0.35;
                            setPreset({ ...preset, modules });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SessionGate */}
              <div className="mt-4 border-t pt-3">
                <SessionGateSettings
                  use={!!preset.modules?.SessionGate?.use}
                  onUse={(b)=>setSG("use", b)}
                  preMin={preset.modules?.SessionGate?.news_pre_blackout_min ?? 0}
                  onPreMin={(n)=>setSG("news_pre_blackout_min", n)}
                  postMin={preset.modules?.SessionGate?.news_post_blackout_min ?? 0}
                  onPostMin={(n)=>setSG("news_post_blackout_min", n)}
                  ddFreezeThresh={preset.modules?.SessionGate?.dd_daily_freeze_threshold ?? 0.8}
                  onDdFreezeThresh={(n)=>setSG("dd_daily_freeze_threshold", n)}
                />
              </div>
            </section>
          </div>

          {/* === C. Monte-Carlo (même largeur que Modules 1+2) === */}
          <section className="mm-card p-4" id="montecarlo">
            <h3 className="font-medium mb-2">C. Monte-Carlo</h3>
            <div className="mt-4 space-y-4">
              <McPanel
                n={mcN}
                status={mcStatus}
                data={mcData}
                onRun={() => runMc()}
                passRateFull={passRateFull}
                onToggleFull={setPassRateFull}
                onNChange={setMcN}
                autoMC={autoMC}
                onToggleAutoMC={setAutoMC}
              />
            </div>
          </section>

        </div>

        {/* ========== COLONNE DROITE (5) ========== */}
        <div className="xl:col-span-5 space-y-4">
          {/* === A. Résultats & Graphiques (original, déplacé) === */}
          <section className="mm-card p-4 flex flex-col" id="results-and-charts">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">A. Résultats & Graphiques</h3>
              {/* Badge FTMO */}
              <FtmoBadge r={out} />
            </div>

            {/* Ligne unique de KPIs (en haut) */}
            <div className="mt-3 flex flex-wrap items-stretch gap-3">
              <KpiBox label="Max DD total" value={out?.kpis?.max_dd_total} fmt="pct" />
              <KpiBox label="Max DD daily" value={out?.kpis?.max_dd_daily} fmt="pct" />
              <KpiBox label="Viol. daily" value={out?.diagnostics?.violations_daily} />
              <KpiBox label="Viol. total" value={out?.diagnostics?.violations_total} />
            </div>

            {/* Résumé Monte Carlo */}
            <McSummaryChips mc={mc} />

            {/* Graphique — SUPPRIME l'espace mort : pas de min-height global ; fixe une hauteur au chart */}
            <div className="mt-3 h-[280px]">
              {/* ⬇️ colle ton composant graphique actuel (le même que l'ancien bloc A) */}
              {/* ex: <EquityChart data={results?.equity} className="h-full w-full" /> */}
              <EquityChart series={out?.series?.equity ?? []} />
            </div>
          </section>

          {/* === B. Performance & Risque (original, déplacé sous A) === */}
          <section className="mm-card p-4" id="perf-risk">
            <h3 className="font-medium mb-2">B. Performance & Risque</h3>
            {/* ⬇️ colle ici ton bloc B existant */}
            <div className="mt-4 space-y-4">
              <PerformanceRiskPanel out={out} />
              <DiagnosticsPanel out={out} />
            </div>
          </section>
        </div>
      </div>

      {/* Alerte exposition par défaut */}
      {out?.diag?.used_default_expo && (
        <div className="p-3 rounded-lg bg-yellow-100 border border-yellow-300 text-yellow-800">
          ⚠️ <strong>Aucune exposition envoyée</strong> (tous modules OFF ou champs non mappés).
        </div>
      )}



      {/* Journal des runs - Historique local des simulations et Monte-Carlo */}
      <details open className="rounded-2xl border p-4 shadow-sm">
        <summary className="text-lg font-medium cursor-pointer">D. Run Journal</summary>
        <Suspense fallback={<div className="text-sm text-gray-500">Chargement Journal…</div>}>
          <RunJournalPanel />
        </Suspense>
      </details>
    </main>
  );
}
