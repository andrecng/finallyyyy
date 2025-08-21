"use client";
import React from "react";
import { simulate, type SimOutput, ping, mcSimulate, type MCOutput } from "@/lib/api";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import KpiBar from "@/components/KpiBar";
import ParamForm, { DEFAULT_PARAMS, SimParams } from "@/components/ParamForm";
import MCPanel from "@/components/MCPanel";
import ModuleToggles, { ModuleFlags } from "@/components/ModuleToggles";
import TelemetryStrip from "@/components/TelemetryStrip";
import PresetsBar from "@/components/PresetsBar";
import { extractTelemetry, type Telemetry } from "@/lib/telemetry";

export default function WorkspaceClient() {
  const [params, setParams] = React.useState<SimParams>({ ...DEFAULT_PARAMS });
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<SimOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [mcLoading, setMcLoading] = React.useState(false);
  const [mc, setMc] = React.useState<MCOutput | null>(null);
  const [mods, setMods] = React.useState<ModuleFlags>({ FTMOGate:true, CPPI:true, VolTarget:true, SoftBarrier:true });
  const [health, setHealth] = React.useState<string>("checking…");
  const [telemetry, setTelemetry] = React.useState<Telemetry>({});

  React.useEffect(() => {
    (async () => {
      try {
        const h = await ping();
        setHealth(h.ok ? `API OK (${h.base})` : `API KO (${h.base})`);
      } catch {
        setHealth("API KO");
      }
    })();
  }, []);

  async function onRun() {
    setLoading(true); setError(null);
    try {
      const modules = Object.entries(mods).filter(([,v])=>v).map(([k])=>k);
      const out = await simulate({ preset: "default", modules, params });
      // garde une forme sûre pour le graphe
      const series = Array.isArray(out.series) ? out.series : [];
      setData({ ...out, series });
      setMc(null); // reset MC si on relance la simu
      // Extraire la télémetrie depuis les logs
      setTelemetry(extractTelemetry(out.logs));
    } catch (e: any) {
      console.error(e);
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function onRunMC() {
    setMcLoading(true); setError(null);
    try {
      const out = await mcSimulate({
        params: { ...params, steps_per_day: params.steps_per_day ?? 1 },
        n_runs: 200, seed: 42, quantiles: [0.05, 0.5, 0.95]
      });
      setMc(out);
    } catch (e: any) {
      console.error(e);
      setError(String(e?.message || e));
    } finally {
      setMcLoading(false);
    }
  }

  const series = Array.isArray(data?.series) ? data!.series : [];

  // Calcul de l'échelle Y pour éviter l'effet "courbe plate"
  const getYDomain = () => {
    if (series.length < 2) return ['auto', 'auto'];
    
    const values = series.map(p => p.eq);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min;
    
    if (span < 0.001) {
      // Si la variation est très faible, force une échelle visible
      const center = (min + max) / 2;
      const padding = center * 0.001; // 0.1% de padding
      return [min - padding, max + padding];
    }
    
    // Échelle automatique avec un petit padding
    const padding = span * 0.05; // 5% de padding
    return [min - padding, max + padding];
  };

  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between">
        <div className="text-sm opacity-70">Statut API : <span className="font-medium">{health}</span></div>
        {error && <div className="text-sm text-red-600 truncate max-w-md">Erreur: {error}</div>}
      </div>

      <PresetsBar
        params={params}
        toggles={mods}
        onLoadPreset={({ params: p, toggles: t }) => {
          setParams(p);
          setMods(t);
        }}
      />

      <ParamForm params={params} onCommit={setParams} onRun={onRun} loading={loading || mcLoading} />

      <ModuleToggles mods={mods} onChange={setMods} disabled={loading || mcLoading} />

      <TelemetryStrip t={telemetry} />

      <div className="flex gap-2">
        <button className="btn" onClick={onRun} disabled={loading || mcLoading}>
          {loading ? "Simulation..." : "Lancer la simulation"}
        </button>
        <button className="btn" onClick={onRunMC} disabled={loading || mcLoading}>
          {mcLoading ? "Monte Carlo..." : "Lancer Monte Carlo (200 runs)"}
        </button>
      </div>

      <div className="h-72 w-full card">
        {series.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="t" />
              <YAxis domain={getYDomain()} allowDecimals />
              <Tooltip 
                formatter={(value: number) => [value.toFixed(6), 'Equity']}
                labelFormatter={(label) => `Step ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="eq" 
                dot={false} 
                stroke="#6366f1"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center opacity-70 text-sm">
            {loading ? "Simulation en cours..." : "Aucune donnée — cliquez \"Lancer la simulation\"."}
          </div>
        )}
      </div>

      <KpiBar kpis={data?.kpis} />
      <MCPanel data={mc} />
    </div>
  );
}
