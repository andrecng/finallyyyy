// 📄 @fichier: components/TradeHistoryTable.tsx
// 📋 Tableau de l'historique des trades

"use client";
import { useSimStore } from "@/stores/simStore";

export const TradeHistoryTable = () => {
  const { equitySeries } = useSimStore();

  if (!equitySeries || equitySeries.length === 0) {
    return (
      <div className="p-4 bg-gray-800 rounded-xl">
        <p className="text-gray-400">Aucun historique de trades disponible.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-xl">
      <h2 className="text-lg font-semibold mb-4 text-white">📋 Historique des Trades</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left p-2 text-gray-300">Index</th>
              <th className="text-left p-2 text-gray-300">Equity</th>
              <th className="text-left p-2 text-gray-300">Variation</th>
            </tr>
          </thead>
          <tbody>
            {equitySeries.map((value, index) => {
              const prevValue = index > 0 ? equitySeries[index - 1] : value;
              const variation = ((value - prevValue) / prevValue * 100);
              const isPositive = variation >= 0;
              
              return (
                <tr key={index} className="border-b border-gray-700">
                  <td className="p-2 text-white">{index}</td>
                  <td className="p-2 text-white">{value.toFixed(2)}</td>
                  <td className={`p-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{variation.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
