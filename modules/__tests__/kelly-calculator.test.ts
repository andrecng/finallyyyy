import { describe, it, expect } from 'vitest';
import { KellyCalculator } from '../kelly-calculator';
import type { Trade } from '../../lib/interfaces/risk-management';

describe('KellyCalculator', () => {
  const calculator = new KellyCalculator();
  const baseTrade: Trade = {
    pWins: 0.6,
    pLosses: 0.4,
    R: 2,
    realizedVol: 0,
    outcome: 0,
    lastResult: 'win',
    cluster: 'default',
    marketContext: 'normal',
  };

  it('caps Kelly fraction at fCap', () => {
    const result = calculator.calculateRisk(baseTrade);
    expect(result.risk).toBeCloseTo(0.2, 5);
  });

  it('returns zero when Kelly fraction is negative', () => {
    const trade: Trade = { ...baseTrade, pWins: 0.4, pLosses: 0.6, R: 1 };
    const result = calculator.calculateRisk(trade);
    expect(result.risk).toBe(0);
  });
});
