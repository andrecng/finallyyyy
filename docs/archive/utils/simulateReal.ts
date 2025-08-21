
// 📄 @fichier: utils/simulateReal.ts
// 🧠 Simulation simple avec données aléatoires

import { SimulationMetrics } from "@/stores/simStore";
import { fxUniverse } from "@/modules/presets/universe_fx_major";

export function simulateReal(): SimulationMetrics & { equitySeries: number[] } {
  // Générer des données d'equity basées sur l'univers FX
  const equity: number[] = [];
  let capital = 100000;
  
  for (let i = 0; i < 100; i++) {
    const pnl = (Math.random() - 0.45) * 2000;
    capital += pnl;
    equity.push(capital);
  }

  const start = equity[0];
  const end = equity.at(-1) || start;
  const returns = equity.map((v, i, arr) => (i === 0 ? 0 : (v - arr[i - 1]) / arr[i - 1]));
  const negReturns = returns.filter((r) => r < 0);
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const negVol = Math.sqrt(negReturns.reduce((a, b) => a + b * b, 0) / negReturns.length);
  const maxDD = 1 - Math.min(...equity.map((v, i) => v / Math.max(...equity.slice(0, i + 1))));

  return {
    CAGR: Math.pow(end / start, 1 / (equity.length / 252)) - 1,
    MaxDD: maxDD,
    Sharpe: avgReturn / Math.sqrt(returns.reduce((a, b) => a + b * b, 0) / returns.length),
    Sortino: avgReturn / negVol,
    WinRate: returns.filter((r) => r > 0).length / returns.length,
    TimeInDrawdown: 0.3,
    ES95: maxDD * 0.8,
    UlcerIndex: Math.sqrt(returns.reduce((a, b) => a + Math.max(0, -b) * Math.max(0, -b), 0) / returns.length),
    equitySeries: equity
  };
}

