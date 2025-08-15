// 📄 @fichier: components/ConfigPanel.tsx
// 🎛️ Panneau de configuration simulation

"use client";
import { useState } from "react";

export function ConfigPanel() {
  const [capital, setCapital] = useState(100000);
  const [portfolioCaps, setPortfolioCaps] = useState({
    globalCap: 1.0,
    perInstrumentCap: 0.3,
    perClusterCap: 0.6,
  });

  return (
    <div className="space-y-4 p-4 max-w-md bg-gray-800 rounded-xl">
      <h2 className="text-white text-lg font-semibold">⚙️ Paramètres de simulation</h2>

      <div>
        <label className="text-gray-300 text-sm">💰 Capital de départ :</label>
        <input
          type="number"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={capital}
          onChange={(e) => setCapital(Number(e.target.value))}
        />
      </div>

      <div>
        <label className="text-gray-300 text-sm">📊 Cap global (% capital) :</label>
        <input
          type="number"
          step="0.01"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={portfolioCaps.globalCap}
          onChange={(e) => setPortfolioCaps({ ...portfolioCaps, globalCap: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="text-gray-300 text-sm">📈 Cap par actif :</label>
        <input
          type="number"
          step="0.01"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={portfolioCaps.perInstrumentCap}
          onChange={(e) => setPortfolioCaps({ ...portfolioCaps, perInstrumentCap: Number(e.target.value) })}
        />
      </div>

      <div>
        <label className="text-gray-300 text-sm">📉 Cap par cluster :</label>
        <input
          type="number"
          step="0.01"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={portfolioCaps.perClusterCap}
          onChange={(e) => setPortfolioCaps({ ...portfolioCaps, perClusterCap: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
