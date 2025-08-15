// 📄 @fichier: components/CapsAdjuster.tsx
// 🎛️ Ajusteur de caps pour le portefeuille

"use client";
import { useState } from "react";
import { runMultiAssetSimulation } from "@/modules/main_simulation_multi";
import { fxUniverse } from "@/modules/presets/universe_fx_major";
import { useSimStore } from "@/stores/simStore";

export const CapsAdjuster = () => {
  const { equitySeries, setEquity } = useSimStore();
  const [globalCap, setGlobalCap] = useState(1.0);
  const [perInstrumentCap, setPerInstrumentCap] = useState(0.3);
  const [perClusterCap, setPerClusterCap] = useState(0.6);

  const handleAdjust = () => {
    // Simuler avec les nouveaux caps
    const results = runMultiAssetSimulation(fxUniverse, {
      globalCap,
      perInstrumentCap,
      perClusterCap,
    });

    // Convertir les résultats en série d'equity
    const equitySeries = Object.values(results)
      .reduce((acc: number[], val: number[]) => 
        acc.map((x, i) => x + (val[i] || 0)), 
        new Array(Math.max(...Object.values(results).map((v: number[]) => v.length))).fill(0)
      )
      .map(x => x / Object.keys(results).length);

    setEquity(equitySeries);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-xl space-y-4">
      <h3 className="text-lg font-semibold text-white">Ajustement des Caps</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Cap Global</label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={globalCap}
            onChange={(e) => setGlobalCap(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-sm text-gray-400">{globalCap.toFixed(1)}</span>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Cap par Instrument</label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={perInstrumentCap}
            onChange={(e) => setPerInstrumentCap(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-sm text-gray-400">{perInstrumentCap.toFixed(1)}</span>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Cap par Cluster</label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={perClusterCap}
            onChange={(e) => setPerClusterCap(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-sm text-gray-400">{perClusterCap.toFixed(1)}</span>
        </div>
      </div>

      <button
        onClick={handleAdjust}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Appliquer les Caps
      </button>
    </div>
  );
};
