"use client";

export default function MCPanel({ data }: { data: any }) {
  if (!data) return null;
  
  const m = data.metrics || {};
  const fmt = (x: number | undefined, pct=false) =>
    x == null || Number.isNaN(x) ? "-" : (pct ? (x*100).toFixed(2)+"%" : x.toFixed(4));

  const dd = m.max_dd || {};
  const fe = m.final_eq || {};
  const so = m.sortino || {};
  const ca = m.calmar || {};

  const q = (obj: Record<string, number>, key: string) =>
    obj && typeof obj[key] === "number" ? obj[key] : undefined;

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-70">Monte Carlo</div>
        <div className="text-sm">Runs: <b>{data.n_runs}</b> • Seed: <b>{data.seed}</b></div>
      </div>

      <div className="grid md:grid-cols-4 gap-3 text-sm">
        <div className="card">
          <div className="opacity-70">Pass %</div>
          <div className="text-xl font-semibold">{data.pass_pct?.toFixed?.(2) ?? "-" }%</div>
        </div>
        <div className="card">
          <div className="opacity-70">MaxDD (p05 / p50 / p95)</div>
          <div className="font-semibold">
            {fmt(q(dd,"p05"), true)} / {fmt(q(dd,"p50"), true)} / {fmt(q(dd,"p95"), true)}
          </div>
        </div>
        <div className="card">
          <div className="opacity-70">Final Eq (p05 / p50 / p95)</div>
          <div className="font-semibold">
            {fmt(q(fe,"p05"))} / {fmt(q(fe,"p50"))} / {fmt(q(fe,"p95"))}
          </div>
        </div>
        <div className="card">
          <div className="opacity-70">Ratios (Sortino / Calmar) [med]</div>
          <div className="font-semibold">
            {fmt(q(so,"p50"))} / {fmt(q(ca,"p50"))}
          </div>
        </div>
      </div>
    </div>
  );
}
