// ✅ MOTEUR : simulateReal (Monte Carlo)
// 📍 /lib/simulation/simulateReal.ts

import { SimResult } from '@/lib/types';
import { getRandomNormal, calculateMaxDrawdown, calculateCAGR } from '@/lib/utils';
import { useSimStore } from '@/stores/simStore';

export function simulateReal(): SimResult {
  // Utilise le store directement dans le composant
  const { capital, nbSimulations, volatilityTarget } = useSimStore.getState();

  const n = 252; // 252 jours de trading par an
  const equity = [capital];

  // Simulation Monte Carlo avec marche aléatoire
  for (let i = 1; i < n; i++) {
    const rand = getRandomNormal();
    const ret = (rand * volatilityTarget) / 100;
    equity.push(equity[i - 1] * (1 + ret));
  }

  // Calcul des métriques de performance
  const final = equity[equity.length - 1];
  const cagr = calculateCAGR(capital, final, n / 252);
  const maxDD = calculateMaxDrawdown(equity);
  const sortino = (cagr / (volatilityTarget || 1)).toFixed(2);
  const winRate = 50 + (Math.random() * 20 - 10); // Simplifié pour l'instant

  return {
    cagr: parseFloat(cagr.toFixed(2)),
    maxDrawdown: parseFloat(maxDD.toFixed(2)),
    sortino: parseFloat(sortino),
    winRate: parseFloat(winRate.toFixed(2)),
    equitySeries: equity.map((value, index) => ({ t: index, value })),
    trades: [],
    riskLogs: [],
  };
}

/**
 * Version avancée avec gestion des trades et du risque
 */
export function simulateRealAdvanced(): SimResult {
  const { capital, nbSimulations, volatilityTarget } = useSimStore.getState();
  
  const n = 252;
  const equity = [capital];
  const trades: any[] = [];
  const riskLogs: any[] = [];

  // Simulation avec génération de trades
  for (let i = 1; i < n; i++) {
    const rand = getRandomNormal();
    const ret = (rand * volatilityTarget) / 100;
    const newEquity = equity[i - 1] * (1 + ret);
    
    equity.push(newEquity);
    
    // Génération de trades aléatoires
    if (Math.random() < 0.1) { // 10% de chance de trade
      trades.push({
        id: `trade_${i}`,
        timestamp: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        pnl: ret * equity[i - 1],
        side: ret > 0 ? 'buy' : 'sell'
      });
    }
    
    // Log de risque si drawdown > 5%
    const currentDD = (Math.max(...equity.slice(0, i + 1)) - newEquity) / Math.max(...equity.slice(0, i + 1));
    if (currentDD > 0.05) {
      riskLogs.push({
        day: i,
        drawdown: currentDD * 100,
        equity: newEquity
      });
    }
  }

  const final = equity[equity.length - 1];
  const cagr = calculateCAGR(capital, final, n / 252);
  const maxDD = calculateMaxDrawdown(equity);
  const sortino = (cagr / (volatilityTarget || 1)).toFixed(2);
  const winRate = trades.filter(t => t.pnl > 0).length / trades.length * 100 || 50;

  return {
    cagr: parseFloat(cagr.toFixed(2)),
    maxDrawdown: parseFloat(maxDD.toFixed(2)),
    sortino: parseFloat(sortino),
    winRate: parseFloat(winRate.toFixed(2)),
    equitySeries: equity.map((value, index) => ({ t: index, value })),
    trades,
    riskLogs,
  };
}
