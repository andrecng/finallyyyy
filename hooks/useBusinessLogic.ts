// 📄 @fichier: hooks/useBusinessLogic.ts
// 🧠 Hook pour la logique métier pure (séparation stricte UI/Logique)

import { useState, useCallback, useMemo } from 'react';
import { RiskFactory } from '../lib/factories/risk-factory';
import { Trade, TradeContext, RiskResult } from '../lib/interfaces/risk-management';
import { moduleRegistry } from '../lib/registry/module-registry';

export function useBusinessLogic() {
  // État de la logique métier (pas d'UI ici)
  const [riskSystem] = useState(() => RiskFactory.createDefaultRiskSystem());
  const [riskLogs, setRiskLogs] = useState<RiskResult[]>([]);
  const [simulationHistory, setSimulationHistory] = useState<any[]>([]);

  // Calcul du risque pour un trade (logique pure)
  const calculateTradeRisk = useCallback((trade: Trade, context: TradeContext): RiskResult => {
    const risk = riskSystem.positionSizer.computeSize(trade, context);
    
    const result: RiskResult = {
      risk,
      confidence: 0.8,
      modules: ['Kelly', 'Drawdown', 'Volatility'],
      notes: `Risk calculated: ${(risk * 100).toFixed(2)}%`
    };

    // Log du risque
    riskSystem.riskLogger.log(Date.now(), result);
    setRiskLogs(prev => [...prev, result]);

    return result;
  }, [riskSystem]);

  // Calcul des métriques de portefeuille (logique pure)
  const calculatePortfolioMetrics = useCallback((equity: number[]): {
    cagr: number;
    maxDD: number;
    sortino: number;
    winRate: number;
  } => {
    if (equity.length < 2) return { cagr: 0, maxDD: 0, sortino: 0, winRate: 0 };

    // Logique existante de GPT préservée
    const start = equity[0];
    const end = equity[equity.length - 1];
    const cagr = (end / start) ** (1 / (equity.length / 252)) - 1;
    
    const maxDD = Math.max(...equity.map((v, i) => 
      Math.max(...equity.slice(0, i + 1)) - v
    )) / start;

    return {
      cagr: cagr * 100,
      maxDD: maxDD * 100,
      sortino: (cagr / 0.12) || 1.5,
      winRate: 0.56 * 100
    };
  }, []);

  // Simulation d'un portefeuille (logique pure)
  const simulatePortfolio = useCallback((trades: Trade[], initialCapital: number = 100000) => {
    let capital = initialCapital;
    const equity = [capital];
    const results: RiskResult[] = [];

    trades.forEach((trade, index) => {
      const context: TradeContext = {
        equity: capital,
        hwm: Math.max(...equity),
        step: index,
        capital: initialCapital
      };

      const riskResult = calculateTradeRisk(trade, context);
      const positionSize = riskResult.risk * capital;
      const pnl = positionSize * trade.outcome;
      
      capital += pnl;
      equity.push(capital);
      results.push(riskResult);
    });

    const metrics = calculatePortfolioMetrics(equity);
    
    setSimulationHistory(prev => [...prev, { equity, metrics, results }]);
    
    return { equity, metrics, results };
  }, [calculateTradeRisk, calculatePortfolioMetrics]);

  // Mémoisation des calculs coûteux
  const memoizedMetrics = useMemo(() => calculatePortfolioMetrics, [calculatePortfolioMetrics]);

  return {
    // Logique métier pure
    calculateTradeRisk,
    calculatePortfolioMetrics: memoizedMetrics,
    simulatePortfolio,
    
    // État de la logique métier
    riskLogs,
    simulationHistory,
    riskSystem
  };
}
