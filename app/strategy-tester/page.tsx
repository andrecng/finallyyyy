"use client";
import { useState } from "react";

export default function StrategyTesterPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function runSim() {
    setLoading(true);
    try {
      const body = {
        preset: {
          capital_initial: 100000,
          modules: [
            { id: "bayes", enabled: true, params: {} },
            { id: "vol_target", enabled: true, params: {} },
            { id: "cppi", enabled: true, params: { freeze_cushion_pct: 5 } },
            { id: "drawdown_manager", enabled: true, params: {} }
          ],
          gating: { fees_bps: 0, sessions: [], news_blackouts: [] },
          risk_limits: { max_dd: 10, daily_dd: 5, freeze_cushion_pct: 5 }
        },
        seeds: [42],
        horizon: 500,
        market_model: { type: "MC", params: {} }
      };
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";
      const res = await fetch(`${base}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Strategy Tester</h1>
      <button
        className="px-4 py-2 rounded-xl shadow bg-black text-white disabled:opacity-50"
        onClick={runSim}
        disabled={loading}
      >
        {loading ? "Run..." : "Run Simulation"}
      </button>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl shadow border">
            <h2 className="font-medium mb-2">KPIs</h2>
            <ul className="text-sm space-y-1">
              <li>CAGR: {result.kpis?.CAGR}</li>
              <li>MaxDD: {result.kpis?.MaxDD}</li>
              <li>ES95: {result.kpis?.ES95}</li>
              <li>Ruin Prob: {result.kpis?.ruin_prob}</li>
            </ul>
          </div>
          <div className="p-4 rounded-2xl shadow border md:col-span-2">
            <h2 className="font-medium mb-2">Mini-chart sizing (placeholder)</h2>
            <div className="h-40 border rounded-xl flex items-center justify-center">
              <span className="text-xs opacity-60">Chart TBD</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl shadow border md:col-span-3">
            <h2 className="font-medium mb-2">Logs</h2>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(result.logs?.slice?.(0, 10) ?? [], null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
