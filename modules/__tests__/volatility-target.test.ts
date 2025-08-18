import { describe, it, expect } from 'vitest';
import { VolatilityTarget } from '../volatility-target';

describe('VolatilityTarget', () => {
  const vt = new VolatilityTarget();

  it('adjusts position size based on realized volatility', () => {
    const adjusted = vt.adjustSize(100, 0.2);
    expect(adjusted).toBeCloseTo(50);
  });

  it('returns current size when volatility is missing or zero', () => {
    expect(vt.adjustSize(100, 0)).toBe(100);
    expect(vt.adjustSize(100, null as any)).toBe(100);
    expect(vt.adjustSize(100, undefined as any)).toBe(100);
  });

  it('computes volatility when enough data is provided', () => {
    const returns = Array(20).fill(0.01);
    const vol = vt.computeVolatility(returns);
    expect(vol).toBe(0);
  });

  it('returns null when insufficient data', () => {
    const vol = vt.computeVolatility([0.01, -0.01]);
    expect(vol).toBeNull();
  });
});
