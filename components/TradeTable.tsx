// 📄 @fichier: components/TradeTable.tsx
// 📋 Tableau détaillé des trades simulés

"use client";
import { useSimStore } from "@/stores/simStore";

export function TradeTable() {
  const { equitySeries } = useSimStore();

  if (!equitySeries || equitySeries.length === 0) {
    return (
      <div className="p-4 bg-gray-800 rounded-xl">
        <p className="text-gray-400">Aucun trade disponible. Lancez une simulation pour voir les résultats.</p>
      </div>
    );
  }

  // Créer des trades fictifs basés sur l'equity series
  const trades = equitySeries.map((equity, index) => ({
    n: index + 1,
    instrument: "EURUSD",
    size_pct: 0.3,
    kelly_cap: 0.5,
    seq_mult: 1.0,
    R: index > 0 ? (equity - equitySeries[index - 1]) / equitySeries[index - 1] : 0,
    fees: 0.001
  }));

  return (
    <div className="p-4 bg-gray-800 rounded-xl">
      <h2 className="text-lg font-semibold mb-4 text-white">📋 Détail des Trades</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left p-2 text-gray-300">#</th>
              <th className="text-left p-2 text-gray-300">Instrument</th>
              <th className="text-left p-2 text-gray-300">Taille %</th>
              <th className="text-left p-2 text-gray-300">Kelly Cap</th>
              <th className="text-left p-2 text-gray-300">R</th>
              <th className="text-left p-2 text-gray-300">Frais</th>
            </tr>
          </thead>
          <tbody>
            {trades.slice(0, 20).map((trade) => (
              <tr key={trade.n} className="border-b border-gray-700">
                <td className="p-2 text-white">{trade.n}</td>
                <td className="p-2 text-white">{trade.instrument}</td>
                <td className="p-2 text-white">{(trade.size_pct * 100).toFixed(1)}%</td>
                <td className="p-2 text-white">{(trade.kelly_cap * 100).toFixed(1)}%</td>
                <td className={`p-2 ${trade.R >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(trade.R * 100).toFixed(2)}%
                </td>
                <td className="p-2 text-white">{(trade.fees * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {trades.length > 20 && (
        <p className="text-sm text-gray-400 mt-2">
          Affichage des 20 premiers trades sur {trades.length} au total
        </p>
      )}
    </div>
  );
}
