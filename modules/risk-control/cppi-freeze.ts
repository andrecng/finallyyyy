// 🔧 modules/risk-control/cppi-freeze.ts
// 🛡️ Gestionnaire CPPI avec seuil de gel automatique

import { RiskModule } from '../../lib/registry/module-registry';

export interface CPPIInput {
  capital: number;
  hwm: number;
}

export class CPPIManager implements RiskModule {
  private floorRatio: number;
  private freezeThreshold: number;

  constructor(floorRatio: number = 0.9, freezeThreshold: number = 0.05) {
    this.floorRatio = floorRatio;
    this.freezeThreshold = freezeThreshold;
  }

  adjust({ capital, hwm }: CPPIInput): number {
    const floor = hwm * this.floorRatio;
    const cushion = capital - floor;
    
    // Gel automatique si le cushion est trop faible
    if (cushion <= this.freezeThreshold * hwm) {
      return 0; // Aucun risque autorisé
    }
    
    return 1; // Risque normal autorisé
  }

  // Configuration dynamique des seuils
  setFloorRatio(ratio: number): void {
    this.floorRatio = Math.max(0.5, Math.min(0.99, ratio));
  }

  setFreezeThreshold(threshold: number): void {
    this.freezeThreshold = Math.max(0.01, Math.min(0.2, threshold));
  }

  // Récupération de la configuration actuelle
  getConfig(): { floorRatio: number; freezeThreshold: number } {
    return {
      floorRatio: this.floorRatio,
      freezeThreshold: this.freezeThreshold
    };
  }

  // Calcul du plancher actuel
  getCurrentFloor(hwm: number): number {
    return hwm * this.floorRatio;
  }

  // Calcul du cushion actuel
  getCurrentCushion(capital: number, hwm: number): number {
    const floor = this.getCurrentFloor(hwm);
    return capital - floor;
  }

  // Vérification si le risque est gelé
  isFrozen(capital: number, hwm: number): boolean {
    const cushion = this.getCurrentCushion(capital, hwm);
    return cushion <= this.freezeThreshold * hwm;
  }
}
