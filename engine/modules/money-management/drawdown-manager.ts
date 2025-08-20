/**
 * Drawdown Manager - Gestion des paliers dynamiques
 * 
 * Gère les seuils de drawdown et applique des réductions de position
 * selon des paliers configurables
 * 
 * @author 2048 Asset Management
 * @version 2.0.0
 */

export interface DrawdownThreshold {
  level: number;          // Niveau de drawdown en % (ex: 10, 20, 30)
  reduction: number;      // Réduction de position en % (ex: 0.5 = 50%)
  action: 'reduce' | 'freeze' | 'close'; // Action à effectuer
  description: string;    // Description de l'action
}

export interface DrawdownState {
  currentDrawdown: number;    // Drawdown actuel en %
  maxDrawdown: number;        // Drawdown maximum historique en %
  activeThresholds: string[]; // Seuils actuellement actifs
  lastBreach: Date | null;    // Dernière violation de seuil
  breachCount: number;        // Nombre total de violations
  isFrozen: boolean;          // Position gelée
}

export class DrawdownManager {
  private thresholds: DrawdownThreshold[];
  private state: DrawdownState;
  private resetOnHWM: boolean;

  constructor(thresholds: DrawdownThreshold[], resetOnHWM = true) {
    this.thresholds = this.sortThresholds(thresholds);
    this.resetOnHWM = resetOnHWM;
    this.state = {
      currentDrawdown: 0,
      maxDrawdown: 0,
      activeThresholds: [],
      lastBreach: null,
      breachCount: 0,
      isFrozen: false
    };
  }

  /**
   * Met à jour le drawdown actuel et vérifie les seuils
   */
  updateDrawdown(currentEquity: number, peakEquity: number): {
    currentDrawdown: number;
    breachedThresholds: DrawdownThreshold[];
    actions: string[];
  } {
    if (peakEquity <= 0) {
      throw new Error('Le capital de pointe doit être positif');
    }

    // Calcul du drawdown actuel
    const currentDrawdown = ((peakEquity - currentEquity) / peakEquity) * 100;
    
    // Mise à jour de l'état
    this.state.currentDrawdown = currentDrawdown;
    this.state.maxDrawdown = Math.max(this.state.maxDrawdown, currentDrawdown);

    // Vérification des seuils
    const breachedThresholds = this.checkThresholds(currentDrawdown);
    const actions = this.generateActions(breachedThresholds);

    // Mise à jour des seuils actifs
    this.updateActiveThresholds(breachedThresholds);

    return {
      currentDrawdown,
      breachedThresholds,
      actions
    };
  }

  /**
   * Vérifie quels seuils sont violés
   */
  private checkThresholds(currentDrawdown: number): DrawdownThreshold[] {
    return this.thresholds.filter(threshold => 
      currentDrawdown >= threshold.level
    );
  }

  /**
   * Génère les actions à effectuer
   */
  private generateActions(breachedThresholds: DrawdownThreshold[]): string[] {
    const actions: string[] = [];
    
    for (const threshold of breachedThresholds) {
      switch (threshold.action) {
        case 'reduce':
          actions.push(`Réduire la position de ${(threshold.reduction * 100).toFixed(1)}% (DD: ${threshold.level}%)`);
          break;
        case 'freeze':
          actions.push(`Geler la position (DD: ${threshold.level}%)`);
          this.state.isFrozen = true;
          break;
        case 'close':
          actions.push(`Fermer toutes les positions (DD: ${threshold.level}%)`);
          break;
      }
    }

    return actions;
  }

  /**
   * Met à jour les seuils actifs
   */
  private updateActiveThresholds(breachedThresholds: DrawdownThreshold[]): void {
    this.state.activeThresholds = breachedThresholds.map(t => `${t.level}%`);
    
    if (breachedThresholds.length > 0) {
      this.state.lastBreach = new Date();
      this.state.breachCount += breachedThresholds.length;
    }
  }

  /**
   * Calcule la réduction de position totale
   */
  calculatePositionReduction(): number {
    const activeThresholds = this.thresholds.filter(t => 
      this.state.currentDrawdown >= t.level && t.action === 'reduce'
    );

    if (activeThresholds.length === 0) return 1; // Pas de réduction

    // Application de la réduction la plus forte
    const maxReduction = Math.max(...activeThresholds.map(t => t.reduction));
    return 1 - maxReduction;
  }

  /**
   * Vérifie si la position doit être gelée
   */
  shouldFreezePosition(): boolean {
    return this.thresholds.some(t => 
      this.state.currentDrawdown >= t.level && t.action === 'freeze'
    );
  }

  /**
   * Vérifie si toutes les positions doivent être fermées
   */
  shouldCloseAllPositions(): boolean {
    return this.thresholds.some(t => 
      this.state.currentDrawdown >= t.level && t.action === 'close'
    );
  }

  /**
   * Réinitialise le drawdown si nouveau HWM atteint
   */
  checkNewHWM(currentEquity: number, peakEquity: number): boolean {
    if (currentEquity > peakEquity && this.resetOnHWM) {
      this.resetDrawdown();
      return true;
    }
    return false;
  }

  /**
   * Réinitialise le drawdown
   */
  resetDrawdown(): void {
    this.state.currentDrawdown = 0;
    this.state.activeThresholds = [];
    this.state.isFrozen = false;
  }

  /**
   * Ajoute un nouveau seuil
   */
  addThreshold(threshold: DrawdownThreshold): void {
    this.validateThreshold(threshold);
    this.thresholds.push(threshold);
    this.thresholds = this.sortThresholds(this.thresholds);
  }

  /**
   * Supprime un seuil
   */
  removeThreshold(level: number): void {
    this.thresholds = this.thresholds.filter(t => t.level !== level);
  }

  /**
   * Obtient l'état actuel
   */
  getState(): DrawdownState {
    return { ...this.state };
  }

  /**
   * Obtient les seuils configurés
   */
  getThresholds(): DrawdownThreshold[] {
    return [...this.thresholds];
  }

  /**
   * Obtient le niveau de réduction recommandé
   */
  getRecommendedReduction(): number {
    return this.calculatePositionReduction();
  }

  /**
   * Vérifie si un seuil spécifique est violé
   */
  isThresholdBreached(level: number): boolean {
    return this.state.currentDrawdown >= level;
  }

  /**
   * Trie les seuils par niveau croissant
   */
  private sortThresholds(thresholds: DrawdownThreshold[]): DrawdownThreshold[] {
    return [...thresholds].sort((a, b) => a.level - b.level);
  }

  /**
   * Valide un seuil
   */
  private validateThreshold(threshold: DrawdownThreshold): void {
    if (threshold.level < 0 || threshold.level > 100) {
      throw new Error('Le niveau de drawdown doit être entre 0% et 100%');
    }
    if (threshold.reduction < 0 || threshold.reduction > 1) {
      throw new Error('La réduction doit être entre 0 et 1');
    }
  }
}

// Export par défaut
export default DrawdownManager;
