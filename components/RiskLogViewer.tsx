// 📄 @fichier: components/RiskLogViewer.tsx
// 📋 Visualiseur des logs de risque

"use client";
import { useSimStore } from "@/stores/simStore";

export function RiskLogViewer() {
  const { riskLog } = useSimStore();

  if (!riskLog || riskLog.length === 0) {
    return (
      <div className="p-4 bg-gray-800 rounded-xl">
        <p className="text-gray-400">Aucun log de risque disponible.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-xl">
      <h2 className="text-lg font-semibold mb-4 text-white">📋 Logs de Risque</h2>
      <div className="space-y-3">
        {riskLog.map((log, index) => (
          <div key={index} className="bg-gray-700 p-3 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-white">{log.tradeId}</span>
              <span className="text-sm text-red-400">{log.riskPct}%</span>
            </div>
            <div className="text-sm text-gray-300 mb-2">
              <strong>Modules:</strong> {log.modules.join(", ")}
            </div>
            {log.notes && (
              <div className="text-sm text-gray-400">
                <strong>Notes:</strong> {log.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
