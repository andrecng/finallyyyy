"use client";
import React from "react";
import { simulate, type SimOutput, ping } from "@/lib/api";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import KpiBar from "@/components/KpiBar";
import ParamForm, { DEFAULT_PARAMS, SimParams } from "@/components/ParamForm";

export default function WorkspaceClient() {
  const [params, setParams] = React.useState<SimParams>({ ...DEFAULT_PARAMS });
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<SimOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [health, setHealth] = React.useState<string>("checking…");

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
      const modules = ["FTMOGate","CPPI","VolTarget","SoftBarrier"];
      const out = await simulate({ preset: "default", modules, params });
      // garde une forme sûre pour le graphe
      const series = Array.isArray(out.series) ? out.series : [];
      setData({ ...out, series });
    } catch (e: any) {
      console.error(e);
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
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

      <ParamForm params={params} onChange={setParams} onRun={onRun} loading={loading} />

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
    </div>
  );
}
