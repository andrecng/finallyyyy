import { describe, it, expect } from 'vitest';
import { SoftBarrierDrawdownPalier } from '../drawdown-manager';

describe('SoftBarrierDrawdownPalier', () => {
  it('reduces multiplier after drawdown and resets on new high', () => {
    const dd = new SoftBarrierDrawdownPalier();
    expect(dd.getMultiplier(1)).toBe(1);
    expect(dd.getMultiplier(0.85)).toBe(0.6);
    expect(dd.getMultiplier(1.05)).toBe(1);
  });
});
