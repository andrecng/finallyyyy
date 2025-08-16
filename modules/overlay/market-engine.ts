// 🔧 modules/overlay/market-engine.ts
// 🌍 Moteur de marché pour ajustement selon le régime

import { RiskModule } from '../../lib/registry/module-registry';

export interface MarketEngineInput {
  regimeScore: number;
}

export interface MarketConfig {
  boost: number;
  haircut: number;
  neutralThreshold?: number;
}

export class MarketEngine implements RiskModule {
  private boost: number;
  private haircut: number;
  private neutralThreshold: number;

  constructor(boost: number, haircut: number, neutralThreshold: number = 0.2) {
    this.boost = Math.max(0, Math.min(0.5, boost));
    this.haircut = Math.max(0, Math.min(0.5, haircut));
    this.neutralThreshold = Math.max(0.1, Math.min(0.5, neutralThreshold));
  }

  adjust({ regimeScore }: MarketEngineInput): number {
    // Régime haussier : boost
    if (regimeScore > this.neutralThreshold) {
      return 1 + this.boost;
    }
    
    // Régime baissier : haircut
    if (regimeScore < -this.neutralThreshold) {
      return 1 - this.haircut;
    }
    
    // Régime neutre : pas d'ajustement
    return 1;
  }

  // Configuration dynamique
  setBoost(boost: number): void {
    this.boost = Math.max(0, Math.min(0.5, boost));
  }

  setHaircut(haircut: number): void {
    this.haircut = Math.max(0, Math.min(0.5, haircut));
  }

  setNeutralThreshold(threshold: number): void {
    this.neutralThreshold = Math.max(0.1, Math.min(0.5, threshold));
  }

  // Récupération de la configuration
  getConfig(): MarketConfig {
    return {
      boost: this.boost,
      haircut: this.haircut,
      neutralThreshold: this.neutralThreshold
    };
  }

  // Analyse du régime de marché
  getRegimeType(regimeScore: number): 'bullish' | 'bearish' | 'neutral' {
    if (regimeScore > this.neutralThreshold) return 'bullish';
    if (regimeScore < -this.neutralThreshold) return 'bearish';
    return 'neutral';
  }

  // Calcul de l'ajustement en pourcentage
  getAdjustmentPercentage(regimeScore: number): number {
    const adjustment = this.adjust({ regimeScore });
    return ((adjustment - 1) * 100);
  }

  // Vérification si l'ajustement est significatif
  isSignificantAdjustment(regimeScore: number): boolean {
    const adjustment = this.adjust({ regimeScore });
    return Math.abs(adjustment - 1) > 0.05; // 5% de seuil
  }
}
