// 🔧 modules/simulation/engine.ts
// 🚀 Moteur de simulation avec position sizing

import { PositionSizer } from '../risk-control/position-sizer';

export interface Trade {
  id: string;
  capital: number;
  hwm: number;
  pWins: number;
  R: number;
  realizedVol: number;
  regimeScore: number;
  instrumentExposure: number;
}

export interface EngineResult {
  id: string;
  originalSize: number;
  adjustedSize: number;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
}

export class SimulationEngine {
  constructor(private sizer: PositionSizer) {}

  run(trades: Trade[]): EngineResult[] {
    return trades.map(trade => {
      const size = this.sizer.compute({
        capital: trade.capital,
        hwm: trade.hwm,
        pWins: trade.pWins,
        R: trade.R,
        realizedVol: trade.realizedVol,
        regimeScore: trade.regimeScore,
        instrumentExposure: trade.instrumentExposure
      });

      return {
        id: trade.id,
        originalSize: 1.0, // Taille de base
        adjustedSize: size,
        riskLevel: this.calculateRiskLevel(size),
        timestamp: new Date().toISOString()
      };
    });
  }

  // Calcul du niveau de risque
  private calculateRiskLevel(size: number): 'low' | 'medium' | 'high' {
    if (size <= 0.3) return 'low';
    if (size <= 0.7) return 'medium';
    return 'high';
  }

  // Simulation avec métriques
  runWithMetrics(trades: Trade[]): {
    results: EngineResult[];
    metrics: {
      averageSize: number;
      totalRisk: number;
      riskDistribution: Record<string, number>;
    };
  } {
    const results = this.run(trades);
    
    const averageSize = results.reduce((sum, r) => sum + r.adjustedSize, 0) / results.length;
    const totalRisk = results.reduce((sum, r) => sum + r.adjustedSize, 0);
    
    const riskDistribution = results.reduce((acc, r) => {
      acc[r.riskLevel] = (acc[r.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      results,
      metrics: {
        averageSize,
        totalRisk,
        riskDistribution
      }
    };
  }

  // Simulation par batch
  runBatch(trades: Trade[], batchSize: number = 100): EngineResult[][] {
    const batches: Trade[][] = [];
    
    for (let i = 0; i < trades.length; i += batchSize) {
      batches.push(trades.slice(i, i + batchSize));
    }

    return batches.map(batch => this.run(batch));
  }

  // Validation des trades
  validateTrades(trades: Trade[]): { valid: Trade[]; invalid: Trade[] } {
    const valid: Trade[] = [];
    const invalid: Trade[] = [];

    trades.forEach(trade => {
      if (this.isValidTrade(trade)) {
        valid.push(trade);
      } else {
        invalid.push(trade);
      }
    });

    return { valid, invalid };
  }

  private isValidTrade(trade: Trade): boolean {
    return (
      trade.capital > 0 &&
      trade.hwm > 0 &&
      trade.pWins >= 0 && trade.pWins <= 1 &&
      trade.R > 0 &&
      trade.realizedVol >= 0 &&
      trade.regimeScore >= -1 && trade.regimeScore <= 1 &&
      trade.instrumentExposure >= 0
    );
  }
}
