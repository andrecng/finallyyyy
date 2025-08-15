// ✅ COMPOSANT : KPIReport.tsx
// 📍 Emplacement : /components/KPIReport.tsx
// 📊 Affiche toutes les métriques en détail

'use client';

import { useSimStore } from '@/stores/simStore';

export default function KPIReport() {
  const metrics = useSimStore((s) => s.metrics);

  return (
    <div className="p-4 space-y-2 text-white">
      <h2 className="text-xl font-bold">Détail des KPIs</h2>
      {Object.entries(metrics).map(([key, val]) => (
        <div key={key} className="flex justify-between border-b border-gray-700 py-1">
          <span>{key}</span>
          <span>{typeof val === 'number' ? val.toFixed(4) : val}</span>
        </div>
      ))}
    </div>
  );
}
