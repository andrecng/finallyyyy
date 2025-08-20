// ✅ COMPOSANT : RiskSummary.tsx
// 📍 Emplacement : /components/RiskSummary.tsx
// 📊 Affiche les métriques issues de simStore avec design moderne

'use client';

import { useSimStore } from '@/stores/simStore';

export default function RiskSummary({ out }: { out: any }) {
  if (!out) return null;
  const mods = out?.input?.modules || [];
  const binderPct = out?.binder_pct || {};
  return (
    <div className="rounded-2xl p-4 border space-y-2">
      <div className="text-lg font-semibold">Risk Summary</div>
      <div className="text-sm">Modules actifs: {mods.join(", ")}</div>
      <div className="text-sm">Binder% (qui limite): {Object.keys(binderPct).length
        ? Object.entries(binderPct).map(([k,v])=>`${k}:${v}%`).join("  ")
        : "-"}</div>
      <div className="text-xs text-neutral-500">Logs: {out?.logs?.length ?? 0} derniers steps</div>
    </div>
  );
}
