// 📄 @fichier: modules/drawdown-manager.ts
// 📉 Module Drawdown Manager selon la logique GPT

import { DrawdownManager } from '../lib/interfaces/risk-management';

export class SoftBarrierDrawdownPalier implements DrawdownManager {
  private paliers: Record<string, number>;
  private hwm: number;
  private lastMultiplier: number;
  private hysteresis: number;

  constructor(paliers?: Record<string, number>, hysteresis: number = 0.01) {
    this.paliers = paliers || { "-0.1": 0.6, "-0.2": 0.4, "-0.3": 0.2 };
    this.hwm = 1.0;
    this.lastMultiplier = 1.0;
    this.hysteresis = hysteresis;
  }

  getMultiplier(equity: number): number {
    if (equity > this.hwm) {
      this.hwm = equity;
      this.lastMultiplier = 1.0;
      return 1.0;
    }

    const drawdown = (equity - this.hwm) / this.hwm;
    const applicable = Object.entries(this.paliers)
      .filter(([threshold]) => drawdown <= parseFloat(threshold))
      .map(([, multiplier]) => multiplier);

    const newMultiplier = applicable.length > 0 ? Math.min(...applicable) : 1.0;

    if (Math.abs(newMultiplier - this.lastMultiplier) > this.hysteresis) {
      this.lastMultiplier = newMultiplier;
    }

    return this.lastMultiplier;
  }
}
