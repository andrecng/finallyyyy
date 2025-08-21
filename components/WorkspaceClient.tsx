"use client";
import React from "react";
import { simulate, type SimOutput } from "@/lib/api";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import KpiBar from "@/components/KpiBar";
import ParamForm, { DEFAULT_PARAMS, SimParams } from "@/components/ParamForm";

export default function WorkspaceClient() {
  const [params, setParams] = React.useState<SimParams>({ ...DEFAULT_PARAMS });
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<SimOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onRun() {
    setLoading(true); setError(null);
    try {
      const out = await simulate({ 
        preset: "default", 
        modules: ["FTMOGate","CPPI","VolTarget","SoftBarrier"], 
        params 
      });
      setData(out);
    } catch (e: any) {
      setError(e?.message || "simulate failed");
    } finally {
      setLoading(false);
    }
  }

  const series = data?.series ?? [];

  return (
    <div className="space-y-4">
      <ParamForm params={params} onChange={setParams} onRun={onRun} loading={loading} />

      <div className="h-72 w-full card">
        {series.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="t" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="eq" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center opacity-70 text-sm">
            Aucune donnée — cliquez "Lancer la simulation".
          </div>
        )}
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
      <KpiBar kpis={data?.kpis} />

      {/* Debug léger (optionnel) */}
      {/* <pre className="text-xs opacity-70 overflow-auto">{JSON.stringify(data?.kpis, null, 2)}</pre> */}
    </div>
  );
}
