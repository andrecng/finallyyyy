// 📄 @fichier: modules/volatility-target.ts
// 📊 Module Volatility Target selon la logique GPT

import { VolatilityTargeter } from '../lib/interfaces/risk-management';

export class VolatilityTarget implements VolatilityTargeter {
  private targetVol: number;
  private lookback: number;
  private capMultiplier: number;

  constructor(targetVol: number = 0.1, lookback: number = 20, capMultiplier: number = 2.0) {
    this.targetVol = targetVol;
    this.lookback = lookback;
    this.capMultiplier = capMultiplier;
  }

  adjustSize(currentSize: number, realizedVol: number): number {
    if (realizedVol === 0 || realizedVol === null || realizedVol === undefined) {
      return currentSize;
    }

    const rawAdjustment = this.targetVol / realizedVol;
    const cappedAdjustment = Math.min(rawAdjustment, this.capMultiplier);
    
    return currentSize * cappedAdjustment;
  }

  computeVolatility(returns: number[]): number | null {
    if (returns.length < this.lookback) {
      return null;
    }

    const recentReturns = returns.slice(-this.lookback);
    const mean = recentReturns.reduce((sum, r) => sum + r, 0) / recentReturns.length;
    
    const variance = recentReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / recentReturns.length;
    const dailyVol = Math.sqrt(variance);
    
    return dailyVol * Math.sqrt(252); // Annualisation
  }
}
