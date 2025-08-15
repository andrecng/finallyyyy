'use client';

import React, { useState } from 'react';
import { fxUniverse, fxCaps } from '../modules/presets/universe_fx_major';
import { runMultiAssetSimulation } from '../modules/main_simulation_multi';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function SimulateurMulti() {
  const [results, setResults] = useState<Record<string, number[]>>({});

  const lancer = () => {
    const equity = runMultiAssetSimulation(fxUniverse, fxCaps);
    setResults(equity);
  };

  return (
    <div className="p-4 space-y-6">
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={lancer}>
        🚀 Lancer Simulation Multi-Actifs
      </button>

      {Object.keys(results).length > 0 && (
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-2">📈 Courbe d'Équity</h2>
          <LineChart width={800} height={400} data={transformResults(results)}>
            <XAxis dataKey="index" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(results).map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={['#0070f3', '#1db954', '#ff4d4f'][i % 3]}
                dot={false}
              />
            ))}
          </LineChart>
        </div>
      )}
    </div>
  );
}

function transformResults(results: Record<string, number[]>): any[] {
  const length = Math.max(...Object.values(results).map(arr => arr.length));
  const merged: any[] = [];

  for (let i = 0; i < length; i++) {
    const point: any = { index: i };
    for (const asset of Object.keys(results)) {
      point[asset] = results[asset][i];
    }
    merged.push(point);
  }

  return merged;
}
