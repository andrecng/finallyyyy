"use client";
export default function McSummaryChips({ mc }:{ mc?: any }) {
  const chip = (label:string, v?: number) => (
    <span className="text-xs px-2 py-1 rounded-full border border-gray-300 text-gray-700">
      {label}: {typeof v==="number" ? (/rate/.test(label) ? (v*100).toFixed(1)+"%" : (v*100).toFixed(2)+"%") : "—"}
    </span>
  );
  if (!mc) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {chip("Pass rate", mc.pass_rate)}
      {chip("Pass (Full)", mc.pass_rate_full)}
      {chip("DD p50", mc.dd_p50)}
      {chip("DD p95", mc.dd_p95)}
    </div>
  );
}
