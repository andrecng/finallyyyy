// 🔧 modules/simulation/validators.ts
// ✅ Validation des données avec Zod

import { z } from 'zod';

// Validateur pour les presets
export const PresetValidator = z.object({
  kellyCap: z.number().min(0).max(1),
  volTarget: z.number().min(0),
  sequenceMax: z.number().int().min(1),
  cppiFloorRatio: z.number().min(0.8).max(0.99),
  cppiFreezeThreshold: z.number().min(0.01).max(0.15),
  marketBoost: z.number().min(0).max(0.4),
  marketHaircut: z.number().min(0).max(0.4),
  portfolioCaps: z.object({
    global: z.number().min(0).max(1),
    instrument: z.number().min(0).max(1),
    cluster: z.number().min(0).max(1).optional()
  })
});

// Validateur pour les trades
export const TradeValidator = z.object({
  id: z.string().min(1),
  capital: z.number().positive(),
  hwm: z.number().positive(),
  pWins: z.number().min(0).max(1),
  R: z.number().positive(),
  realizedVol: z.number().min(0),
  regimeScore: z.number().min(-1).max(1),
  instrumentExposure: z.number().min(0)
});

// Validateur pour les résultats de simulation
export const SimulationResultValidator = z.object({
  id: z.string(),
  originalSize: z.number().min(0).max(1),
  adjustedSize: z.number().min(0).max(1),
  riskLevel: z.enum(['low', 'medium', 'high']),
  timestamp: z.string().datetime()
});

// Validateur pour la configuration des modules
export const ModuleConfigValidator = z.object({
  kellyCap: z.number().min(0.01).max(0.5),
  volTarget: z.number().min(0.02).max(0.3),
  sequenceMax: z.number().int().min(1).max(5),
  cppiFloorRatio: z.number().min(0.8).max(0.99),
  cppiFreezeThreshold: z.number().min(0.01).max(0.15),
  marketBoost: z.number().min(0).max(0.4),
  marketHaircut: z.number().min(0).max(0.4),
  portfolioCaps: z.object({
    global: z.number().min(0.5).max(1),
    instrument: z.number().min(0.05).max(0.3),
    cluster: z.number().min(0.1).max(0.6).optional()
  })
});

// Validateur pour les métriques de simulation
export const SimulationMetricsValidator = z.object({
  averageSize: z.number().min(0).max(1),
  totalRisk: z.number().min(0),
  riskDistribution: z.record(z.string(), z.number().int().min(0))
});

// Validateur pour les inputs de position sizing
export const PositionSizerInputValidator = z.object({
  capital: z.number().positive(),
  hwm: z.number().positive(),
  pWins: z.number().min(0).max(1),
  R: z.number().positive(),
  realizedVol: z.number().min(0),
  regimeScore: z.number().min(-1).max(1),
  instrumentExposure: z.number().min(0)
});

// Types TypeScript dérivés des validateurs
export type PresetConfig = z.infer<typeof PresetValidator>;
export type Trade = z.infer<typeof TradeValidator>;
export type SimulationResult = z.infer<typeof SimulationResultValidator>;
export type ModuleConfig = z.infer<typeof ModuleConfigValidator>;
export type SimulationMetrics = z.infer<typeof SimulationMetricsValidator>;
export type PositionSizerInput = z.infer<typeof PositionSizerInputValidator>;

// Fonctions de validation utilitaires
export function validatePreset(data: unknown): PresetConfig {
  return PresetValidator.parse(data);
}

export function validateTrade(data: unknown): Trade {
  return TradeValidator.parse(data);
}

export function validateSimulationResult(data: unknown): SimulationResult {
  return SimulationResultValidator.parse(data);
}

export function validateModuleConfig(data: unknown): ModuleConfig {
  return ModuleConfigValidator.parse(data);
}

export function validatePositionSizerInput(data: unknown): PositionSizerInput {
  return PositionSizerInputValidator.parse(data);
}

// Validation sécurisée (retourne null si invalide)
export function safeValidatePreset(data: unknown): PresetConfig | null {
  try {
    return PresetValidator.parse(data);
  } catch {
    return null;
  }
}

export function safeValidateTrade(data: unknown): Trade | null {
  try {
    return TradeValidator.parse(data);
  } catch {
    return null;
  }
}
