"use client";
export default function FtmoBadge({ r }: { r?: any }) {
  // r = résultat de /simulate (kpis + diagnostics)
  if (!r) return null;

  // Limites envoyées au backend (en décimaux). Sers-toi du payload si tu l'as dans le state,
  // sinon on lit ce que le backend renvoie en echo (si dispo).
  const dailyLimit  = r?.limits?.daily_limit  ?? r?.kpis?.daily_limit  ?? 0.05;
  const totalLimit  = r?.limits?.total_limit  ?? r?.kpis?.total_limit  ?? 0.10;

  const ddDaily = r?.max_dd_daily ?? r?.kpis?.max_dd_daily ?? 0;
  const ddTotal = r?.max_dd_total ?? r?.kpis?.max_dd_total ?? 0;

  const vDaily = r?.violations_daily ?? 0;
  const vTotal = r?.violations_total ?? 0;

  // Optionnel : target_pass, days_to_target si ton backend les calcule
  const targetPass = r?.kpis?.target_pass;
  const passFTMO = vDaily === 0 && vTotal === 0 && ddDaily <= dailyLimit && ddTotal <= totalLimit;
  const passFull = passFTMO && (targetPass !== false); // si target_pass true/false présent

  const label = passFull ? "FTMO PASS (Full)" : passFTMO ? "FTMO PASS" : "FTMO FAIL";
  const color = passFTMO ? "bg-green-600" : "bg-red-600";

  return (
    <span className={`${color} text-white text-xs px-2.5 py-1 rounded-full`}>
      {label}
    </span>
  );
}
