"use client";

export default function KpiBar({ kpis }: { kpis?: any }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
      <div className="card">
        <div className="opacity-70">Max DD</div>
        <div className="font-semibold">{kpis?.max_dd ?? "-"}</div>
      </div>
      <div className="card">
        <div className="opacity-70">Pass FTMO</div>
        <div className="font-semibold">{kpis?.pass_ftmo ? "✅" : "❌"}</div>
      </div>
    </div>
  );
}
