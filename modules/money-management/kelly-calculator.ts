/**
 * Kelly Calculator - Gestion du capital selon la formule de Kelly
 * 
 * La formule de Kelly optimise la taille de position basée sur :
 * - Win Rate (probabilité de gain)
 * - R-ratio (rendement moyen gain / perte)
 * 
 * @author 2048 Asset Management
 * @version 2.0.0
 */

export interface KellyParams {
  winRate: number;        // Probabilité de gain (0-1)
  rRatio: number;         // Ratio rendement gain/perte
  fractionCap?: number;   // Fraction maximale (défaut: 0.25)
  globalCap?: number;     // Cap global en % du capital (défaut: 0.05)
}

export interface KellyResult {
  kellyFraction: number;  // Fraction Kelly pure
  cappedFraction: number; // Fraction avec cap appliqué
  positionSize: number;   // Taille de position en % du capital
  riskLevel: 'conservative' | 'balanced' | 'aggressive';
  confidence: number;     // Niveau de confiance (0-1)
}

export class KellyCalculator {
  private defaultFractionCap = 0.25;
  private defaultGlobalCap = 0.05;

  /**
   * Calcule la fraction Kelly optimale
   * @param params Paramètres de calcul
   * @returns Résultat du calcul Kelly
   */
  calculate(params: KellyParams): KellyResult {
    const { winRate, rRatio, fractionCap = this.defaultFractionCap, globalCap = this.defaultGlobalCap } = params;

    // Validation des paramètres
    this.validateParams(params);

    // Formule de Kelly : f = (bp - q) / b
    // où b = r-ratio, p = winRate, q = 1 - winRate
    const kellyFraction = (winRate * rRatio - (1 - winRate)) / rRatio;

    // Application des caps
    const cappedFraction = Math.min(kellyFraction, fractionCap, globalCap);

    // Calcul de la taille de position finale
    const positionSize = Math.max(0, cappedFraction);

    // Détermination du niveau de risque
    const riskLevel = this.determineRiskLevel(positionSize);

    // Calcul du niveau de confiance
    const confidence = this.calculateConfidence(params);

    return {
      kellyFraction,
      cappedFraction,
      positionSize,
      riskLevel,
      confidence
    };
  }

  /**
   * Valide les paramètres d'entrée
   */
  private validateParams(params: KellyParams): void {
    if (params.winRate < 0 || params.winRate > 1) {
      throw new Error('Win Rate doit être entre 0 et 1');
    }
    if (params.rRatio <= 0) {
      throw new Error('R-Ratio doit être positif');
    }
    if (params.fractionCap && (params.fractionCap <= 0 || params.fractionCap > 1)) {
      throw new Error('Fraction Cap doit être entre 0 et 1');
    }
    if (params.globalCap && (params.globalCap <= 0 || params.globalCap > 1)) {
      throw new Error('Global Cap doit être entre 0 et 1');
    }
  }

  /**
   * Détermine le niveau de risque basé sur la taille de position
   */
  private determineRiskLevel(positionSize: number): KellyResult['riskLevel'] {
    if (positionSize <= 0.1) return 'conservative';
    if (positionSize <= 0.25) return 'balanced';
    return 'aggressive';
  }

  /**
   * Calcule le niveau de confiance basé sur la qualité des données
   */
  private calculateConfidence(params: KellyParams): number {
    // Plus le win rate est proche de 0.5, plus la confiance est faible
    // Plus le r-ratio est stable, plus la confiance est élevée
    const winRateConfidence = 1 - Math.abs(params.winRate - 0.5) * 2;
    const rRatioConfidence = Math.min(params.rRatio / 2, 1);
    
    return (winRateConfidence + rRatioConfidence) / 2;
  }

  /**
   * Calcule la taille de position pour un capital donné
   */
  calculatePositionSize(params: KellyParams, capital: number): number {
    const result = this.calculate(params);
    return capital * result.positionSize;
  }

  /**
   * Ajuste la taille de position selon le drawdown actuel
   */
  adjustForDrawdown(basePosition: number, currentDrawdown: number, maxDrawdown: number): number {
    if (currentDrawdown >= maxDrawdown) {
      return 0; // Pas de position si drawdown max atteint
    }

    const drawdownRatio = currentDrawdown / maxDrawdown;
    const reductionFactor = 1 - drawdownRatio;
    
    return basePosition * reductionFactor;
  }

  /**
   * Calcule le capital de risque optimal
   */
  calculateRiskCapital(params: KellyParams, totalCapital: number): number {
    const result = this.calculate(params);
    return totalCapital * result.positionSize;
  }
}

// Export par défaut
export default KellyCalculator;
