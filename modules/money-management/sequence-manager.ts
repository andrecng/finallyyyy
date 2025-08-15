/**
 * Sequence Manager - Gestion des séquences anti-martingale
 * 
 * Gère les séquences de trading avec augmentation/diminution
 * progressive de la taille de position
 * 
 * @author 2048 Asset Management
 * @version 2.0.0
 */

export type SequenceType = 'martingale' | 'anti_martingale' | 'anti_martingale_bornee';

export interface SequenceConfig {
  type: SequenceType;
  stepUp: number;         // Multiplicateur en cas de gain (ex: 1.5)
  stepDown: number;       // Multiplicateur en cas de perte (ex: 0.8)
  capSeq: number;         // Nombre maximum de séquences
  initialSize: number;    // Taille initiale de la position
  maxSize: number;        // Taille maximale autorisée
}

export interface SequenceState {
  currentSequence: number;    // Séquence actuelle (0 = pas de séquence)
  currentMultiplier: number;  // Multiplicateur actuel
  lastResult: 'win' | 'loss' | null; // Résultat du dernier trade
  consecutiveWins: number;    // Gains consécutifs
  consecutiveLosses: number;  // Pertes consécutives
  isActive: boolean;          // Séquence active
  lastUpdate: Date;           // Dernière mise à jour
}

export class SequenceManager {
  private config: SequenceConfig;
  private state: SequenceState;

  constructor(config: SequenceConfig) {
    this.config = config;
    this.state = {
      currentSequence: 0,
      currentMultiplier: 1,
      lastResult: null,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      isActive: false,
      lastUpdate: new Date()
    };
  }

  /**
   * Enregistre le résultat d'un trade et met à jour la séquence
   */
  recordTradeResult(result: 'win' | 'loss'): {
    newMultiplier: number;
    sequenceAction: string;
    shouldContinue: boolean;
  } {
    this.state.lastResult = result;
    this.state.lastUpdate = new Date();

    if (result === 'win') {
      return this.handleWin();
    } else {
      return this.handleLoss();
    }
  }

  /**
   * Gère un gain
   */
  private handleWin(): {
    newMultiplier: number;
    sequenceAction: string;
    shouldContinue: boolean;
  } {
    this.state.consecutiveWins++;
    this.state.consecutiveLosses = 0;

    let newMultiplier = this.state.currentMultiplier;
    let sequenceAction = 'Maintien de la taille';
    let shouldContinue = true;

    switch (this.config.type) {
      case 'martingale':
        // Martingale : diminue la taille après un gain
        newMultiplier = Math.max(0.5, this.state.currentMultiplier * this.config.stepDown);
        sequenceAction = `Réduction de la taille (${newMultiplier.toFixed(2)}x)`;
        break;

      case 'anti_martingale':
        // Anti-martingale : augmente la taille après un gain
        newMultiplier = Math.min(this.config.maxSize, this.state.currentMultiplier * this.config.stepUp);
        sequenceAction = `Augmentation de la taille (${newMultiplier.toFixed(2)}x)`;
        break;

      case 'anti_martingale_bornee':
        // Anti-martingale bornée : augmente avec limite
        if (this.state.currentSequence < this.config.capSeq) {
          newMultiplier = Math.min(this.config.maxSize, this.state.currentMultiplier * this.config.stepUp);
          sequenceAction = `Augmentation bornée (${newMultiplier.toFixed(2)}x)`;
        } else {
          sequenceAction = 'Limite de séquence atteinte';
          shouldContinue = false;
        }
        break;
    }

    this.updateState(newMultiplier, shouldContinue);
    
    return {
      newMultiplier,
      sequenceAction,
      shouldContinue
    };
  }

  /**
   * Gère une perte
   */
  private handleLoss(): {
    newMultiplier: number;
    sequenceAction: string;
    shouldContinue: boolean;
  } {
    this.state.consecutiveLosses++;
    this.state.consecutiveWins = 0;

    let newMultiplier = this.state.currentMultiplier;
    let sequenceAction = 'Maintien de la taille';
    let shouldContinue = true;

    switch (this.config.type) {
      case 'martingale':
        // Martingale : augmente la taille après une perte
        if (this.state.currentSequence < this.config.capSeq) {
          newMultiplier = Math.min(this.config.maxSize, this.state.currentMultiplier * this.config.stepUp);
          sequenceAction = `Augmentation de la taille (${newMultiplier.toFixed(2)}x)`;
        } else {
          sequenceAction = 'Limite de séquence atteinte';
          shouldContinue = false;
        }
        break;

      case 'anti_martingale':
        // Anti-martingale : diminue la taille après une perte
        newMultiplier = Math.max(0.5, this.state.currentMultiplier * this.config.stepDown);
        sequenceAction = `Réduction de la taille (${newMultiplier.toFixed(2)}x)`;
        break;

      case 'anti_martingale_bornee':
        // Anti-martingale bornée : diminue après une perte
        newMultiplier = Math.max(0.5, this.state.currentMultiplier * this.config.stepDown);
        sequenceAction = `Réduction bornée (${newMultiplier.toFixed(2)}x)`;
        break;
    }

    this.updateState(newMultiplier, shouldContinue);
    
    return {
      newMultiplier,
      sequenceAction,
      shouldContinue
    };
  }

  /**
   * Met à jour l'état de la séquence
   */
  private updateState(newMultiplier: number, shouldContinue: boolean): void {
    this.state.currentMultiplier = newMultiplier;
    
    if (shouldContinue) {
      this.state.currentSequence++;
      this.state.isActive = true;
    } else {
      this.state.isActive = false;
    }
  }

  /**
   * Calcule la taille de position pour la séquence actuelle
   */
  calculatePositionSize(baseSize: number): number {
    return baseSize * this.state.currentMultiplier;
  }

  /**
   * Réinitialise la séquence
   */
  resetSequence(): void {
    this.state = {
      currentSequence: 0,
      currentMultiplier: 1,
      lastResult: null,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      isActive: false,
      lastUpdate: new Date()
    };
  }

  /**
   * Vérifie si la séquence est active
   */
  isSequenceActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Obtient l'état actuel de la séquence
   */
  getState(): SequenceState {
    return { ...this.state };
  }

  /**
   * Obtient la configuration de la séquence
   */
  getConfig(): SequenceConfig {
    return { ...this.config };
  }

  /**
   * Met à jour la configuration de la séquence
   */
  updateConfig(newConfig: Partial<SequenceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.resetSequence(); // Réinitialise pour la nouvelle config
  }

  /**
   * Obtient le multiplicateur actuel
   */
  getCurrentMultiplier(): number {
    return this.state.currentMultiplier;
  }

  /**
   * Obtient le numéro de séquence actuel
   */
  getCurrentSequence(): number {
    return this.state.currentSequence;
  }

  /**
   * Vérifie si la limite de séquence est atteinte
   */
  isSequenceLimitReached(): boolean {
    return this.state.currentSequence >= this.config.capSeq;
  }

  /**
   * Obtient des statistiques de la séquence
   */
  getStatistics(): {
    totalTrades: number;
    winRate: number;
    averageMultiplier: number;
    maxSequence: number;
  } {
    const totalTrades = this.state.consecutiveWins + this.state.consecutiveLosses;
    const winRate = totalTrades > 0 ? this.state.consecutiveWins / totalTrades : 0;
    
    return {
      totalTrades,
      winRate,
      averageMultiplier: this.state.currentMultiplier,
      maxSequence: this.state.currentSequence
    };
  }
}

// Export par défaut
export default SequenceManager;
