// 📄 @fichier: modules/kelly-calculator.ts
// 🧮 Module Kelly Calculator selon la logique GPT

import { RiskCalculator, Trade, RiskResult } from '../lib/interfaces/risk-management';

export class KellyCalculator implements RiskCalculator {
  private fCap: number;

  constructor(fCap: number = 0.2) {
    this.fCap = fCap;
  }

  calculateRisk(trade: Trade): RiskResult {
    const { pWins, R } = trade;
    
    // Formule de Kelly fractionnée avec cap
    const kelly = pWins - (1 - pWins) / R;
    const cappedKelly = Math.max(0, Math.min(kelly, this.fCap));
    
    return {
      risk: cappedKelly,
      confidence: 0.8,
      modules: ['Kelly'],
      notes: `Kelly: ${(cappedKelly * 100).toFixed(2)}%`
    };
  }
}
