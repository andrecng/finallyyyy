// 📄 @fichier: components/MonteCarloSlider.tsx
// 🎲 Contrôle du nombre d'itérations Monte Carlo

"use client";
import { useState } from "react";

export function MonteCarloSlider() {
  const [count, setCount] = useState(100);

  return (
    <div className="p-4 bg-white dark:bg-black rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2">🎲 Itérations Monte Carlo</h2>
      <div className="mb-3">
        <label className="block mb-1 font-medium">Nombre d'itérations : {count}</label>
        <input
          type="range"
          min={100}
          max={10000}
          step={100}
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Plus d'itérations = plus de précision, mais plus de temps de calcul
      </div>
    </div>
  );
}
