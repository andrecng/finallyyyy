// 🔧 modules/risk-control/position-sizer.ts
// 🎯 Orchestrateur principal pour le calcul de la taille de position

import { RiskModule } from '../../lib/registry/module-registry';

export interface PositionSizerInput {
  capital: number;
  hwm: number;
  pWins: number;
  R: number;
  realizedVol: number;
  regimeScore: number;
  instrumentExposure: number;
}

export interface PositionSizerModule {
  adjust(inputs: PositionSizerInput): number;
}

export class PositionSizer implements RiskModule {
  id = "position_sizer";
  name = "Position Sizer Orchestrator";
  version = "1.0.0";
  isEnabled = true;
  priority = 1; // Priorité la plus élevée - orchestrateur principal

  constructor(private modules: PositionSizerModule[]) {}

  compute(inputs: PositionSizerInput): number {
    let size = 1.0;
    
    // Application séquentielle de tous les modules
    for (const mod of this.modules) {
      size *= mod.adjust(inputs);
    }
    
    // Cap final entre 0 et 1 (100% du capital)
    return Math.max(0, Math.min(size, 1));
  }

  // Méthode d'ajustement pour l'interface RiskModule
  adjust(inputs: PositionSizerInput): number {
    return this.compute(inputs);
  }

  // Ajout/suppression dynamique de modules
  addModule(module: PositionSizerModule): void {
    this.modules.push(module);
  }

  removeModule(moduleIndex: number): void {
    if (moduleIndex >= 0 && moduleIndex < this.modules.length) {
      this.modules.splice(moduleIndex, 1);
    }
  }

  // Récupération des modules actifs
  getModules(): PositionSizerModule[] {
    return [...this.modules];
  }
}
