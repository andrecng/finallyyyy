// 📄 @fichier: components/MarketRegimeTag.tsx
// 🧠 Affiche le régime de marché courant

"use client";
import { useSimStore } from "@/stores/simStore";

export function MarketRegimeTag() {
  const { equitySeries } = useSimStore();
  
  // Déterminer le régime basé sur l'equity series
  let regime = "inconnu";
  if (equitySeries.length > 10) {
    const recent = equitySeries.slice(-10);
    const trend = recent[recent.length - 1] - recent[0];
    if (trend > 0) regime = "bull";
    else if (trend < 0) regime = "bear";
    else regime = "sideways";
  }

  const colorMap: Record<string, string> = {
    bull: "bg-green-500 text-white",
    bear: "bg-red-500 text-white",
    sideways: "bg-yellow-500 text-black",
    inconnu: "bg-gray-500 text-white",
  };

  return (
    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${colorMap[regime]}`}>
      📊 {regime.toUpperCase()}
    </div>
  );
}
