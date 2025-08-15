// 📄 @fichier: lib/registry/module-registry.ts
// 🗂️ Registry pattern pour une gestion efficace des modules

import { RiskCalculator, DrawdownManager, VolatilityTargeter } from '../interfaces/risk-management';

// Interface pour tous les modules
export interface RiskModule {
  id: string;
  name: string;
  version: string;
  isEnabled: boolean;
  priority: number; // Ordre d'exécution
}

// Registry pour les modules
export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private modules: Map<string, RiskModule> = new Map();
  private implementations: Map<string, any> = new Map();

  static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  // Enregistrer un module
  register<T extends RiskModule>(
    module: T,
    implementation: any
  ): void {
    this.modules.set(module.id, module);
    this.implementations.set(module.id, implementation);
  }

  // Récupérer un module
  get<T>(id: string): T | null {
    return this.implementations.get(id) || null;
  }

  // Récupérer tous les modules activés, triés par priorité
  getActiveModules(): RiskModule[] {
    return Array.from(this.modules.values())
      .filter(m => m.isEnabled)
      .sort((a, b) => a.priority - b.priority);
  }

  // Activer/désactiver un module
  toggleModule(id: string, enabled: boolean): void {
    const module = this.modules.get(id);
    if (module) {
      module.isEnabled = enabled;
    }
  }

  // Récupérer les métadonnées d'un module
  getModuleInfo(id: string): RiskModule | null {
    return this.modules.get(id) || null;
  }

  // Lister tous les modules
  listModules(): RiskModule[] {
    return Array.from(this.modules.values());
  }
}

// Singleton export
export const moduleRegistry = ModuleRegistry.getInstance();
