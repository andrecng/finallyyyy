/**
 * Volatility Target - Gestion de la volatilité cible avec fallback
 * 
 * Gère la volatilité cible et applique des ajustements automatiques
 * selon les conditions de marché et le drawdown
 * 
 * @author 2048 Asset Management
 * @version 2.0.0
 */

export interface VolatilityConfig {
  targetVol: number;      // Volatilité cible en % (ex: 15%)
  minVol: number;         // Volatilité minimale en %
  maxVol: number;         // Volatilité maximale en %
  fallbackVol: number;    // Volatilité de fallback en %
  adjustmentSpeed: number; // Vitesse d'ajustement (0-1)
}

export interface VolatilityState {
  currentVol: number;     // Volatilité actuelle
  targetVol: number;      // Volatilité cible
  adjustedVol: number;    // Volatilité ajustée
  isFallback: boolean;    // Mode fallback actif
  lastAdjustment: Date;   // Dernier ajustement
  adjustmentCount: number; // Nombre d'ajustements
}

export class VolatilityTargeter {
  private config: VolatilityConfig;
  private state: VolatilityState;

  constructor(config: VolatilityConfig) {
    this.config = config;
    this.state = {
      currentVol: config.targetVol,
      targetVol: config.targetVol,
      adjustedVol: config.targetVol,
      isFallback: false,
      lastAdjustment: new Date(),
      adjustmentCount: 0
    };
  }

  /**
   * Met à jour la volatilité cible
   */
  setTargetVolatility(targetVol: number): void {
    this.validateVolatility(targetVol);
    this.state.targetVol = targetVol;
    this.state.currentVol = targetVol;
    this.state.adjustedVol = targetVol;
    this.state.isFallback = false;
  }

  /**
   * Ajuste la volatilité selon les conditions de marché
   */
  adjustVolatility(marketConditions: {
    currentDrawdown: number;
    maxDrawdown: number;
    marketVolatility: number;
    trendStrength: number;
  }): number {
    const { currentDrawdown, maxDrawdown, marketVolatility, trendStrength } = marketConditions;

    // Vérification du mode fallback
    if (this.shouldActivateFallback(currentDrawdown, maxDrawdown)) {
      return this.activateFallback();
    }

    // Calcul de l'ajustement basé sur le drawdown
    const drawdownAdjustment = this.calculateDrawdownAdjustment(currentDrawdown, maxDrawdown);
    
    // Ajustement basé sur la volatilité du marché
    const marketAdjustment = this.calculateMarketAdjustment(marketVolatility);
    
    // Ajustement basé sur la force de la tendance
    const trendAdjustment = this.calculateTrendAdjustment(trendStrength);

    // Application des ajustements
    const totalAdjustment = drawdownAdjustment + marketAdjustment + trendAdjustment;
    const newVol = this.state.targetVol + totalAdjustment;

    // Validation et application
    const adjustedVol = this.clampVolatility(newVol);
    
    this.updateState(adjustedVol);
    
    return adjustedVol;
  }

  /**
   * Détermine si le mode fallback doit être activé
   */
  private shouldActivateFallback(currentDrawdown: number, maxDrawdown: number): boolean {
    const drawdownRatio = currentDrawdown / maxDrawdown;
    return drawdownRatio > 0.8; // Fallback si > 80% du drawdown max
  }

  /**
   * Active le mode fallback
   */
  private activateFallback(): number {
    this.state.isFallback = true;
    this.state.adjustedVol = this.config.fallbackVol;
    this.state.currentVol = this.config.fallbackVol;
    this.state.lastAdjustment = new Date();
    this.state.adjustmentCount++;
    
    return this.config.fallbackVol;
  }

  /**
   * Calcule l'ajustement basé sur le drawdown
   */
  private calculateDrawdownAdjustment(currentDrawdown: number, maxDrawdown: number): number {
    if (maxDrawdown === 0) return 0;
    
    const drawdownRatio = currentDrawdown / maxDrawdown;
    
    if (drawdownRatio < 0.3) {
      // Drawdown faible : augmentation modérée de la volatilité
      return this.config.targetVol * 0.1;
    } else if (drawdownRatio < 0.6) {
      // Drawdown modéré : maintien de la volatilité
      return 0;
    } else {
      // Drawdown élevé : réduction de la volatilité
      return -this.config.targetVol * 0.2;
    }
  }

  /**
   * Calcule l'ajustement basé sur la volatilité du marché
   */
  private calculateMarketAdjustment(marketVolatility: number): number {
    const volDifference = marketVolatility - this.state.targetVol;
    return volDifference * 0.1; // Ajustement de 10% de la différence
  }

  /**
   * Calcule l'ajustement basé sur la force de la tendance
   */
  private calculateTrendAdjustment(trendStrength: number): number {
    // trendStrength: -1 (tendance baissière forte) à +1 (tendance haussière forte)
    if (Math.abs(trendStrength) < 0.3) {
      return 0; // Pas de tendance claire
    }
    
    // Augmentation de la volatilité en cas de tendance forte
    return this.config.targetVol * 0.05 * Math.sign(trendStrength);
  }

  /**
   * Limite la volatilité dans les bornes configurées
   */
  private clampVolatility(vol: number): number {
    return Math.max(this.config.minVol, Math.min(this.config.maxVol, vol));
  }

  /**
   * Met à jour l'état interne
   */
  private updateState(newVol: number): void {
    this.state.currentVol = newVol;
    this.state.adjustedVol = newVol;
    this.state.lastAdjustment = new Date();
    this.state.adjustmentCount++;
  }

  /**
   * Valide la volatilité
   */
  private validateVolatility(vol: number): void {
    if (vol < 0 || vol > 100) {
      throw new Error('La volatilité doit être entre 0% et 100%');
    }
  }

  /**
   * Réinitialise à la volatilité cible
   */
  resetToTarget(): void {
    this.state.currentVol = this.state.targetVol;
    this.state.adjustedVol = this.state.targetVol;
    this.state.isFallback = false;
  }

  /**
   * Obtient l'état actuel
   */
  getState(): VolatilityState {
    return { ...this.state };
  }

  /**
   * Obtient la volatilité actuelle
   */
  getCurrentVolatility(): number {
    return this.state.currentVol;
  }

  /**
   * Vérifie si le mode fallback est actif
   */
  isInFallbackMode(): boolean {
    return this.state.isFallback;
  }
}

// Export par défaut
export default VolatilityTargeter;
