// Fichier : lib/simulateReal.ts
import { useSimStore } from '@/stores/simStore';
import { SimResult } from '@/lib/types';

export function simulateReal(): SimResult {
  const state = useSimStore.getState(); // ✅ Remplace l'ancien import de get()

  // Exemple de logique (à adapter à votre besoin réel)
  const equitySeries = Array.from({ length: 100 }, (_, i) => ({
    t: i,
    value: state.capital * (1 + Math.sin(i / 10) * 0.05),
  }));

  const result: SimResult = {
    cagr: 12.0, // 12% en décimal
    maxDrawdown: 15.0, // 15% en décimal
    sortino: 1.8,
    winRate: 58.0, // 58% en décimal
    equitySeries,
    trades: [],
    riskLogs: [],
  };

  return result;
}
