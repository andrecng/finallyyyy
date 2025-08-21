"use client";
import React from "react";
import { simulate, type SimOutput } from "@/lib/api";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import KpiBar from "@/components/KpiBar";

export default function WorkspaceClient() {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<SimOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onRun() {
    setLoading(true); 
    setError(null);
    try {
      const out = await simulate({
        preset: "default",
        modules: ["FTMOGate", "CPPI"],
        params: { 
          desired_risk: 0.012, 
          daily_limit: 0.02, 
          total_steps: 200 
        }
      });
      setData(out);
    } catch (e: any) { 
      setError(e?.message || "simulate failed"); 
    } finally { 
      setLoading(false); 
    }
  }

  const series = (data?.series ?? []);
  
  return (
    <div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onRun} 
          disabled={loading} 
          className="btn"
        >
          {loading ? "Simulation..." : "Lancer la simulation"}
        </button>
        {error && (
          <span className="text-red-600 text-sm">{error}</span>
        )}
      </div>

      <div className="mt-4 h-64 w-full card">
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

      <KpiBar kpis={data?.kpis} />
    </div>
  );
}
