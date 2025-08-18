"use client";
import { useState } from "react";

export default function FtmoPage() {
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function runFtmo() {
    setLoading(true); setErr(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";
      const body = {
        preset: {
          capital_initial: 100000,
          modules: [
            { id: "bayes", enabled: true, params: { p: 0.55, k: 0.1, cap: 0.02 } },
            { id: "vol_target", enabled: true, params: { target_vol: 0.1, vol_est: 0.1, scale: 0.1, max_risk: 0.02 } },
            { id: "cppi", enabled: true, params: { multiplier: 1.0, cap: 0.02 } },
            { id: "drawdown_manager", enabled: true, params: { bands: [[5,0.02],[10,0.01],[20,0.0]] } }
          ],
          gating: { risk_cap: 0.02 },
          risk_limits: { max_dd: 10, daily_dd: 5, freeze_cushion_pct: 5 }
        },
        market_model: { type: "MC", params: { mu: 0.0, sigma: 0.01 } },
        horizon: 100,
        rules: { profit_target_pct: 10, max_total_dd_pct: 10, max_daily_dd_pct: 5, min_trading_steps: 5, time_limit_steps: 100 },
        parallel: 3,
        trials: 50,
        seed: 42
      };
      const r = await fetch(`${base}/ftmo_multi`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setRes(data);
    } catch (e:any) {
      setErr(e.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">FTMO Multi</h1>
      <button onClick={runFtmo} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15"
        disabled={loading}>{loading ? "Run..." : "Run FTMO Multi"}</button>

      {err && <div className="text-red-400 text-sm">{err}</div>}

      {res && (
        <div className="grid gap-4">
          <div className="p-4 rounded-2xl border border-white/10">
            <div className="text-sm">p_any ≈ <b>{(res.estimate?.p_any*100).toFixed(1)}%</b></div>
            <div className="text-xs opacity-70">CI95 = [{(res.estimate?.ci95?.[0]*100).toFixed(1)}%, {(res.estimate?.ci95?.[1]*100).toFixed(1)}%] • trials={res.estimate?.trials} • parallel={res.estimate?.parallel}</div>
          </div>
          <pre className="text-xs p-4 rounded-2xl border border-white/10 overflow-auto max-h-80">
            {JSON.stringify(res.example ?? res, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}