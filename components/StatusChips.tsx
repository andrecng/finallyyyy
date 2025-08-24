"use client";

function fmtPct(x?: number) {
  if (typeof x !== "number" || Number.isNaN(x)) return "—";
  return `${(x * 100).toFixed(2)}%`;
}

export function Chip({ label, value, ok }: { label: string; value?: number | string | boolean; ok?: boolean }) {
  const txt = typeof value === "boolean" ? (value ? "OK" : "NO") : (value ?? "—");
  const color = ok === undefined ? "border-gray-300" : ok ? "border-green-500 text-green-700" : "border-red-500 text-red-700";
  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${color}`}>{label}: {txt}</span>
  );
}

export function ChipPct({
  label,
  val,       // décimal ex 0.0561
  limit,     // décimal ex 0.10
}: { label: string; val?: number; limit: number }) {
  // Ne JAMAIS sanctionner quand val est undefined
  let cls = "border-gray-300 text-gray-600";
  if (typeof val === "number") {
    const ratio = limit > 0 ? val / limit : 1;
    if (ratio >= 1) cls = "border-red-500 text-red-700";          // dépassement
    else if (ratio >= 0.8) cls = "border-amber-500 text-amber-700"; // proche des limites
    else cls = "border-green-600 text-green-700";                   // OK
  }
  return <span className={`text-xs px-2 py-1 rounded-full border ${cls}`}>
    {label}: {fmtPct(val)}
  </span>;
}

export default function StatusChips({ r }: { r?: any }) {
  if (!r) return null;
  const d = r.diag ?? {};
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Chip label="Kelly hits" value={d.kelly_cap_hits} />
      <Chip label="CPPI freezes" value={d.cppi_freeze_events} />
      {/* si on a ajouté ces modules */}
      <Chip label="Session blocks" value={d.session_gate?.blocks_total} />
      <Chip label="Nested hits" value={d.nestedcppi_hits} />
      <Chip label="No-upsize" value={d.no_upsize_after_loss === true} ok={d.no_upsize_after_loss === true} />
      <Chip label="Modules" value={(d.modules_active || []).length} />
    </div>
  );
}
