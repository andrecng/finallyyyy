// 🔧 modules/risk-control/portfolio-caps.ts
// 📊 Gestionnaire des caps de portefeuille

import { RiskModule } from '../../lib/registry/module-registry';

export interface PortfolioCapsInput {
  size: number;
  instrumentExposure: number;
}

export interface CapsConfig {
  global: number;
  instrument: number;
  cluster?: number;
}

export class PortfolioCaps implements RiskModule {
  id = "portfolio_caps";
  name = "Portfolio Caps Manager";
  version = "1.0.0";
  isEnabled = true;
  priority = 2; // Priorité élevée pour la gestion des caps

  private caps: CapsConfig;

  constructor(caps: CapsConfig) {
    this.caps = {
      global: Math.max(0, Math.min(1, caps.global)),
      instrument: Math.max(0, Math.min(1, caps.instrument)),
      cluster: caps.cluster ? Math.max(0, Math.min(1, caps.cluster)) : undefined
    };
  }

  adjust({ size, instrumentExposure }: PortfolioCapsInput): number {
    // Cap par instrument
    let adjustedSize = Math.min(size, this.caps.instrument);
    
    // Cap global
    adjustedSize = Math.min(adjustedSize, this.caps.global - instrumentExposure);
    
    // Cap par cluster (si configuré)
    if (this.caps.cluster !== undefined) {
      adjustedSize = Math.min(adjustedSize, this.caps.cluster);
    }
    
    return Math.max(0, adjustedSize);
  }

  // Configuration dynamique des caps
  setGlobalCap(cap: number): void {
    this.caps.global = Math.max(0, Math.min(1, cap));
  }

  setInstrumentCap(cap: number): void {
    this.caps.instrument = Math.max(0, Math.min(1, cap));
  }

  setClusterCap(cap: number): void {
    this.caps.cluster = Math.max(0, Math.min(1, cap));
  }

  // Récupération de la configuration
  getConfig(): CapsConfig {
    return { ...this.caps };
  }

  // Vérification si un cap est atteint
  isGlobalCapReached(totalExposure: number): boolean {
    return totalExposure >= this.caps.global;
  }

  isInstrumentCapReached(exposure: number): boolean {
    return exposure >= this.caps.instrument;
  }

  isClusterCapReached(clusterExposure: number): boolean {
    return this.caps.cluster !== undefined && clusterExposure >= this.caps.cluster;
  }

  // Calcul de l'espace restant
  getRemainingGlobalCapacity(totalExposure: number): number {
    return Math.max(0, this.caps.global - totalExposure);
  }

  getRemainingInstrumentCapacity(exposure: number): number {
    return Math.max(0, this.caps.instrument - exposure);
  }
}
