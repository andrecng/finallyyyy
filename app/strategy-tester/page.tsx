"use client";

import { useState } from "react";

export default function StrategyTesterPage() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  async function runSim() {
    setLoading(true); setErr(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8001";
      const body = { preset: "FTMO-lite", seed: 42 }; // payload simple
      const res = await fetch(`${base}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} — ${text.slice(0,200)}`);
      }
      const json = await res.json();
      setData(json);
    } catch (e:any) {
      setErr(e?.message ?? "Load failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-accent text-xl font-semibold">Strategy Tester</h1>

      <div className="panel">
        <p className="opacity-80 text-sm mb-3">Test rapide : POST /simulate</p>
        <button className="btn-primary" onClick={runSim} disabled={loading}>
          {loading ? "Running…" : "Run Simulation"}
        </button>
        {err && <p className="mt-2 text-sm" style={{color:"#fca5a5"}}>Erreur: {err}</p>}
      </div>

      {data && (
        <div className="panel">
          <h2 className="text-sm font-semibold text-accent mb-2">KPIs</h2>
          <pre className="text-xs overflow-x-auto">{JSON.stringify(data?.kpis ?? data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
