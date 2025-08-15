// 📄 @fichier: hooks/useRiskManagement.ts
// 🧠 Hook pour la logique métier du risk management

import { useState, useCallback, useMemo } from 'react';
import { RiskFactory } from '../lib/factories/risk-factory';
import { Trade, TradeContext, RiskResult } from '../lib/interfaces/risk-management';

export function useRiskManagement() {
  const [riskSystem] = useState(() => RiskFactory.createDefaultRiskSystem());
  const [riskLogs, setRiskLogs] = useState<RiskResult[]>([]);

  // Calcul du risque pour un trade
  const calculateTradeRisk = useCallback((trade: Trade, context: TradeContext): RiskResult => {
    const risk = riskSystem.positionSizer.computeSize(trade, context);
    
    const result: RiskResult = {
      risk,
      confidence: 0.8, // À calculer selon la logique GPT
      modules: ['Kelly', 'Drawdown', 'Volatility'],
      notes: `Risk calculated: ${(risk * 100).toFixed(2)}%`
    };

    // Log du risque
    riskSystem.riskLogger.log(Date.now(), result);
    setRiskLogs(prev => [...prev, result]);

    return result;
  }, [riskSystem]);

  // Calcul des métriques de portefeuille
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

  // Mémoisation des calculs coûteux
  const memoizedMetrics = useMemo(() => {
    return calculatePortfolioMetrics;
  }, [calculatePortfolioMetrics]);

  return {
    calculateTradeRisk,
    calculatePortfolioMetrics: memoizedMetrics,
    riskLogs,
    riskSystem
  };
}
