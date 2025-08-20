export default function KPICards({ kpis, ftmo }: { kpis: any; ftmo: any }) {
  if (!kpis) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="rounded-xl border p-3">
        <div className="text-xs text-neutral-500">CAGR (approx)</div>
        <div className="text-lg font-semibold">{(kpis.cagr*100).toFixed(2)}%</div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="text-xs text-neutral-500">Sortino</div>
        <div className="text-lg font-semibold">{kpis.sortino?.toFixed(2)}</div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="text-xs text-neutral-500">Max DD</div>
        <div className="text-lg font-semibold">{(kpis.max_dd*100).toFixed(2)}%</div>
      </div>
      <div className="rounded-xl border p-3">
        <div className="text-xs text-neutral-500">FTMO (daily)</div>
        <div className={`text-lg font-semibold ${ftmo?.pass ? "text-emerald-600" : "text-red-600"}`}>
          {ftmo?.pass ? "OK" : "NOK"}
        </div>
      </div>
    </div>
  );
}
