// ✅ COMPOSANT : UniverseSelector.tsx
// 📍 Emplacement : /components/UniverseSelector.tsx
// 📊 Sélecteur d'univers FX/Equity simulables

'use client';

import { useState } from 'react';
import { fxUniverse } from '@/modules/presets/universe_fx_major';
import { equityUniverse } from '@/modules/presets/universe_equity';

export default function UniverseSelector() {
  const [selected, setSelected] = useState<'fx' | 'equity'>('fx');
  const universe = selected === 'fx' ? fxUniverse : equityUniverse;

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-2">Univers simulable</h2>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setSelected('fx')}
          className={`px-4 py-2 rounded ${selected === 'fx' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          FX Majors
        </button>
        <button
          onClick={() => setSelected('equity')}
          className={`px-4 py-2 rounded ${selected === 'equity' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Equity
        </button>
      </div>
      <ul className="space-y-1">
        {universe.map((a) => (
          <li key={a.symbol} className="bg-gray-800 p-2 rounded">
            <span className="font-semibold">{a.symbol}</span> — vol: {a.vol}, spread: {a.spread}, slippage: {a.slippage}
          </li>
        ))}
      </ul>
    </div>
  );
}
