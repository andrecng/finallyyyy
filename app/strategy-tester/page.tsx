"use client";
import { useState } from "react";
// Recharts minimal, déjà dans le stack
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type SimResult = {
  kpis: { CAGR:number; MaxDD:number; ES95:number; ruin_prob:number };
  series: { equity_curve:number[]; risk_effectif:number[]; sizing:number[] };
  logs: any[];
  compliance?: { violations: Array<{rule:string; t:number; value?:number}> };
  run_id?: string;
};

export default function StrategyTesterPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function runSim() {
    setLoading(true); setErr(null);
    try {
      const body = {
        preset: {
          capital_initial: 100000,
          modules: [
            { id: "bayes", enabled: true, params: { p: 0.55, k: 0.1, cap: 0.02 } },
            { id: "vol_target", enabled: true, params: { target_vol: 0.1, vol_est: 0.1, scale: 0.1, max_risk: 0.02 } },
            { id: "cppi", enabled: true, params: { multiplier: 1.0, cap: 0.02 } },
            { id: "drawdown_manager", enabled: true, params: { bands: [[5,0.02],[10,0.01],[20,0.0]] } }
          ],
          gating: {
            risk_cap: 0.02,
            news_blackouts_steps: [[10,13],[30,32]],
            session_mask: { day_len: 24, allow: [[7,12],[14,18]] }
          },
          risk_limits: { max_dd: 10, daily_dd: 5, freeze_cushion_pct: 5 }
        },
        seeds: [42],
        horizon: 150,
        market_model: { type: "MC", params: { mu: 0.0, sigma: 0.01 } }
      };
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";
      const res = await fetch(`${base}/simulate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e:any) {
      setErr(e?.message ?? "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  const data = (result?.series?.equity_curve ?? []).map((eq, i) => ({
    i,
    equity: eq,
    risk: result?.series?.risk_effectif?.[i] ?? null,
    size: result?.series?.sizing?.[i] ?? null,
  }));

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Strategy Tester</h1>
        <button
          className="px-4 py-2 rounded-xl shadow bg-black text-white disabled:opacity-50"
          onClick={runSim}
          disabled={loading}
        >
          {loading ? "Run..." : "Run Simulation"}
        </button>
      </div>

      {err && <div className="text-red-600 text-sm">Erreur: {err}</div>}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* KPIs */}
          <div className="p-4 rounded-2xl shadow border">
            <h2 className="font-medium mb-2">KPIs</h2>
            <ul className="text-sm space-y-1">
              <li>CAGR: {result.kpis?.CAGR.toFixed?.(4)}</li>
              <li>MaxDD: {result.kpis?.MaxDD.toFixed?.(2)} %</li>
              <li>ES95: {result.kpis?.ES95.toFixed?.(4)}</li>
              <li>Ruin Prob: {result.kpis?.ruin_prob.toFixed?.(4)}</li>
            </ul>
            {result.run_id && <p className="text-xs mt-2 opacity-70">Run ID: {result.run_id}</p>}
          </div>

          {/* Equity chart */}
          <div className="p-4 rounded-2xl shadow border md:col-span-2">
            <h2 className="font-medium mb-2">Equity Curve</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="i" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="equity" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk chart */}
          <div className="p-4 rounded-2xl shadow border">
            <h2 className="font-medium mb-2">Risk Effectif</h2>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="i" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="risk" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sizing chart */}
          <div className="p-4 rounded-2xl shadow border">
            <h2 className="font-medium mb-2">Sizing</h2>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="i" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="size" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Violations */}
          <div className="p-4 rounded-2xl shadow border md:col-span-3">
            <h2 className="font-medium mb-2">Compliance Violations</h2>
            {result?.compliance?.violations?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-1 pr-4">t</th>
                      <th className="py-1 pr-4">rule</th>
                      <th className="py-1 pr-4">value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.compliance.violations.map((v, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-1 pr-4">{v.t}</td>
                        <td className="py-1 pr-4">{v.rule}</td>
                        <td className="py-1 pr-4">{v.value ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm opacity-70">Aucune violation détectée.</p>
            )}
          </div>

          {/* Logs (aperçu court) */}
          <div className="p-4 rounded-2xl shadow border md:col-span-3">
            <h2 className="font-medium mb-2">Logs (aperçu)</h2>
            <pre className="text-xs whitespace-pre-wrap max-h-64 overflow-auto">
              {JSON.stringify(result.logs?.slice?.(0, 50) ?? [], null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
