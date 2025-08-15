// 📄 @fichier: components/RiskLoggerTable.tsx
// 📋 Tableau des logs de risque

"use client";
import { useSimStore } from "@/stores/simStore";

export const RiskLoggerTable = () => {
  const { riskLog } = useSimStore();

  if (!riskLog || riskLog.length === 0) return null;

  return (
    <div className="p-4 bg-white dark:bg-black rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2">📋 Logs de Risque</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Trade ID</th>
              <th className="text-left p-2">Risque %</th>
              <th className="text-left p-2">Modules</th>
              <th className="text-left p-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {riskLog.map((log, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{log.tradeId}</td>
                <td className="p-2">{log.riskPct}%</td>
                <td className="p-2">{log.modules.join(", ")}</td>
                <td className="p-2">{log.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
