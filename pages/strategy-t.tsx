import { useState } from "react";

export default function StrategyT() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true); setErr(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8001";
      const res = await fetch(`${base}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANT: preset en objet pour éviter 422 sur l'API actuelle
        body: JSON.stringify({ preset: { name: "FTMO-lite" }, seed: 42 })
      });
      if (!res.ok) {
        const t = await res.text().catch(()=> "");
        throw new Error(`HTTP ${res.status} ${res.statusText} — ${t.slice(0,200)}`);
      }
      setData(await res.json());
    } catch (e:any) {
      setErr(e?.message ?? "Load failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Strategy Tester (basic)</h1>
      <button onClick={run} disabled={loading}>{loading ? "Running…" : "Run Simulation"}</button>
      {err && <p style={{color:"crimson"}}>Erreur: {err}</p>}
      {data && (
        <>
          <h3>KPIs</h3>
          <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(data?.kpis ?? {}, null, 2)}</pre>
          <h3>Violations</h3>
          <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(data?.violations ?? [], null, 2)}</pre>
        </>
      )}
    </main>
  );
}
