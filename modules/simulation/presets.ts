// 🔧 modules/simulation/presets.ts
// ⚙️ Presets de configuration pour différents profils de risque

export interface RiskPreset {
  kellyCap: number;
  volTarget: number;
  sequenceMax: number;
  cppiFloorRatio: number;
  cppiFreezeThreshold: number;
  marketBoost: number;
  marketHaircut: number;
  portfolioCaps: {
    global: number;
    instrument: number;
    cluster?: number;
  };
}

export const Presets: Record<string, RiskPreset> = {
  conservateur: {
    kellyCap: 0.1,
    volTarget: 0.08,
    sequenceMax: 1,
    cppiFloorRatio: 0.95,
    cppiFreezeThreshold: 0.03,
    marketBoost: 0.1,
    marketHaircut: 0.2,
    portfolioCaps: {
      global: 0.8,
      instrument: 0.15,
      cluster: 0.3
    }
  },
  
  agressif: {
    kellyCap: 0.3,
    volTarget: 0.15,
    sequenceMax: 3,
    cppiFloorRatio: 0.85,
    cppiFreezeThreshold: 0.08,
    marketBoost: 0.25,
    marketHaircut: 0.15,
    portfolioCaps: {
      global: 1.0,
      instrument: 0.25,
      cluster: 0.5
    }
  },

  equilibre: {
    kellyCap: 0.2,
    volTarget: 0.12,
    sequenceMax: 2,
    cppiFloorRatio: 0.9,
    cppiFreezeThreshold: 0.05,
    marketBoost: 0.15,
    marketHaircut: 0.2,
    portfolioCaps: {
      global: 0.9,
      instrument: 0.2,
      cluster: 0.4
    }
  },

  scalping: {
    kellyCap: 0.15,
    volTarget: 0.06,
    sequenceMax: 1,
    cppiFloorRatio: 0.98,
    cppiFreezeThreshold: 0.02,
    marketBoost: 0.05,
    marketHaircut: 0.3,
    portfolioCaps: {
      global: 0.7,
      instrument: 0.1,
      cluster: 0.2
    }
  }
};

// Preset personnalisé
export function createCustomPreset(config: Partial<RiskPreset>): RiskPreset {
  const base = Presets.equilibre;
  
  return {
    ...base,
    ...config,
    // Validation des valeurs
    kellyCap: Math.max(0.01, Math.min(0.5, config.kellyCap || base.kellyCap)),
    volTarget: Math.max(0.02, Math.min(0.3, config.volTarget || base.volTarget)),
    sequenceMax: Math.max(1, Math.min(5, config.sequenceMax || base.sequenceMax)),
    cppiFloorRatio: Math.max(0.8, Math.min(0.99, config.cppiFloorRatio || base.cppiFloorRatio)),
    cppiFreezeThreshold: Math.max(0.01, Math.min(0.15, config.cppiFreezeThreshold || base.cppiFreezeThreshold)),
    marketBoost: Math.max(0, Math.min(0.4, config.marketBoost || base.marketBoost)),
    marketHaircut: Math.max(0, Math.min(0.4, config.marketHaircut || base.marketHaircut))
  };
}

// Validation des presets
export function validatePreset(preset: RiskPreset): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (preset.kellyCap <= 0 || preset.kellyCap > 0.5) {
    errors.push('Kelly cap doit être entre 0 et 0.5');
  }

  if (preset.volTarget <= 0 || preset.volTarget > 0.3) {
    errors.push('Vol target doit être entre 0 et 0.3');
  }

  if (preset.sequenceMax < 1 || preset.sequenceMax > 5) {
    errors.push('Sequence max doit être entre 1 et 5');
  }

  if (preset.cppiFloorRatio < 0.8 || preset.cppiFloorRatio > 0.99) {
    errors.push('CPPI floor ratio doit être entre 0.8 et 0.99');
  }

  if (preset.cppiFreezeThreshold < 0.01 || preset.cppiFreezeThreshold > 0.15) {
    errors.push('CPPI freeze threshold doit être entre 0.01 et 0.15');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
