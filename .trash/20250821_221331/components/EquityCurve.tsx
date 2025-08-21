// 📄 @fichier: components/EquityCurve.tsx
// 📈 Courbe d'equity simplifiée

"use client";
import { useSimStore } from "@/stores/simStore";

export const EquityCurve = () => {
  const { equitySeries } = useSimStore();

  if (!equitySeries || equitySeries.length === 0) return null;

  return (
    <div className="p-4 bg-white dark:bg-black rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2">📈 Courbe d'Equity</h2>
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
        <p className="text-gray-500">Graphique d'equity - {equitySeries.length} points</p>
      </div>
    </div>
  );
};
