// 📄 @fichier: lib/factories/risk-factory.ts
// 🏭 Factory pour l'injection de dépendances

import { RiskCalculator, DrawdownManager, VolatilityTargeter, PositionSizer, RiskLogger } from '../interfaces/risk-management';
// import { KellyCalculator } from '../../modules/kelly-calculator';
// import { SoftBarrierDrawdownPalier } from '../../modules/drawdown-manager';
// import { VolatilityTarget } from '../../modules/volatility-target';
// import { RiskLoggerImpl } from '../../modules/risk-logger';

export class RiskFactory {
  static createKellyCalculator(): RiskCalculator {
    // return new KellyCalculator();
    throw new Error("TODO: Implémenter KellyCalculator");
  }

  static createDrawdownManager(): DrawdownManager {
    // return new SoftBarrierDrawdownPalier();
    throw new Error("TODO: Implémenter SoftBarrierDrawdownPalier");
  }

  static createVolatilityTargeter(): VolatilityTargeter {
    // return new VolatilityTarget();
    throw new Error("TODO: Implémenter VolatilityTarget");
  }

  static createPositionSizer(
    riskCalculator: RiskCalculator,
    drawdownManager: DrawdownManager,
    volatilityTargeter?: VolatilityTargeter
  ): PositionSizer {
    return new PositionSizerImpl(riskCalculator, drawdownManager, volatilityTargeter);
  }

  static createRiskLogger(): RiskLogger {
    // return new RiskLoggerImpl();
    throw new Error("TODO: Implémenter RiskLoggerImpl");
  }

  // Configuration par défaut
  static createDefaultRiskSystem(): {
    positionSizer: PositionSizer;
    riskLogger: RiskLogger;
  } {
    const kelly = this.createKellyCalculator();
    const drawdown = this.createDrawdownManager();
    const volatility = this.createVolatilityTargeter();
    
    return {
      positionSizer: this.createPositionSizer(kelly, drawdown, volatility),
      riskLogger: this.createRiskLogger()
    };
  }
}

// Implémentation concrète qui respecte l'interface
class PositionSizerImpl implements PositionSizer {
  constructor(
    private riskCalculator: RiskCalculator,
    private drawdownManager: DrawdownManager,
    private volatilityTargeter?: VolatilityTargeter
  ) {}

  computeSize(trade: any, context: any): number {
    // Logique existante de GPT préservée
    const baseRisk = this.riskCalculator.calculateRisk(trade).risk;
    const ddMultiplier = this.drawdownManager.getMultiplier(context.equity);
    
    let finalRisk = baseRisk * ddMultiplier;
    
    if (this.volatilityTargeter) {
      finalRisk = this.volatilityTargeter.adjustSize(finalRisk, trade.realizedVol);
    }
    
    return finalRisk;
  }
}
