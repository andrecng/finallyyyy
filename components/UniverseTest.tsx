// ✅ COMPOSANT : UniverseTest.tsx
// 📍 Emplacement : /components/UniverseTest.tsx
// 🧪 Test des imports d'univers FX et Equity

'use client';

import { fxUniverse } from '@/modules/presets/universe_fx_major';
import { equityUniverse } from '@/modules/presets/universe_equity';

export default function UniverseTest() {
  return (
    <div className="p-6 bg-gray-800 rounded-lg text-white">
      <h2 className="text-2xl font-bold mb-4">🧪 Test des Univers</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-3 text-blue-400">🌍 FX Universe</h3>
          <div className="space-y-2">
            {fxUniverse.map((asset) => (
              <div key={asset.symbol} className="bg-gray-700 p-3 rounded">
                <span className="font-bold text-green-400">{asset.symbol}</span>
                <div className="text-sm text-gray-300">
                  Vol: {asset.vol}, Spread: {asset.spread}, Slippage: {asset.slippage}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-3 text-purple-400">📈 Equity Universe</h3>
          <div className="space-y-2">
            {equityUniverse.map((asset) => (
              <div key={asset.symbol} className="bg-gray-700 p-3 rounded">
                <span className="font-bold text-yellow-400">{asset.symbol}</span>
                <div className="text-sm text-gray-300">
                  Vol: {asset.vol}, Spread: {asset.spread}, Slippage: {asset.slippage}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-green-900 rounded text-center">
        <p className="text-green-200">
          ✅ {fxUniverse.length + equityUniverse.length} actifs chargés avec succès
        </p>
      </div>
    </div>
  );
}
