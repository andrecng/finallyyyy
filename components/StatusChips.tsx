"use client";

function fmtPct(x?: number) {
  if (typeof x !== "number" || Number.isNaN(x)) return "—";
  return `${(x * 100).toFixed(2)}%`;
}

export function Chip({ label, v }: { label: string; v?: number }) {
  // vert si 0, rouge si >0, neutre si undefined
  let cls = "border-gray-300 text-gray-600";
  if (typeof v === "number") cls = v > 0 ? "border-red-500 text-red-700" : "border-green-600 text-green-700";
  return <span className={`text-xs px-2 py-1 rounded-full border ${cls}`}>{label}: {v ?? "—"}</span>;
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
