/**
 * Configuration Centralisée - Tous les modules
 * 
 * Configuration unifiée pour tous les modules du système
 * 
 * @author 2048 Asset Management
 * @version 2.0.0
 */

// Configuration Kelly Calculator
export const KELLY_CONFIG = {
  defaultFractionCap: 0.25,
  defaultGlobalCap: 0.05,
  minWinRate: 0.1,
  maxWinRate: 0.9,
  minRRatio: 0.1,
  maxRRatio: 10.0,
} as const;

// Configuration Volatility Targeter
export const VOLATILITY_CONFIG = {
  defaultTargetVol: 15,
  minVol: 5,
  maxVol: 50,
  fallbackVol: 10,
  adjustmentSpeed: 0.1,
  drawdownThresholds: {
    low: 0.3,      // < 30% du max drawdown
    medium: 0.6,   // 30-60% du max drawdown
    high: 0.8,     // > 80% du max drawdown
  },
} as const;

// Configuration Drawdown Manager
export const DRAWDOWN_CONFIG = {
  defaultThresholds: [
    {
      level: 10,
      reduction: 0.2,
      action: 'reduce' as const,
      description: 'Réduction modérée à 10% de DD'
    },
    {
      level: 20,
      reduction: 0.5,
      action: 'reduce' as const,
      description: 'Réduction importante à 20% de DD'
    },
    {
      level: 30,
      reduction: 0.8,
      action: 'freeze' as const,
      description: 'Gel des positions à 30% de DD'
    },
    {
      level: 50,
      reduction: 1.0,
      action: 'close' as const,
      description: 'Fermeture totale à 50% de DD'
    }
  ],
  resetOnHWM: true,
  maxDrawdown: 50,
} as const;

// Configuration Sequence Manager
export const SEQUENCE_CONFIG = {
  antiMartingale: {
    type: 'anti_martingale' as const,
    stepUp: 1.5,
    stepDown: 0.8,
    capSeq: 5,
    initialSize: 1,
    maxSize: 3,
  },
  antiMartingaleBornee: {
    type: 'anti_martingale_bornee' as const,
    stepUp: 1.3,
    stepDown: 0.85,
    capSeq: 3,
    initialSize: 1,
    maxSize: 2.5,
  },
  martingale: {
    type: 'martingale' as const,
    stepUp: 2.0,
    stepDown: 0.5,
    capSeq: 4,
    initialSize: 1,
    maxSize: 4,
  },
} as const;

// Configuration Portfolio
export const PORTFOLIO_CONFIG = {
  maxPositions: 10,
  maxConcentration: 0.25,    // 25% max par instrument
  correlationThreshold: 0.7,  // Seuil de corrélation
  rebalanceFrequency: 'daily' as const,
  riskBudget: {
    conservative: 0.02,       // 2% par trade
    balanced: 0.05,           // 5% par trade
    aggressive: 0.1,          // 10% par trade
  },
} as const;

// Configuration Simulation
export const SIMULATION_CONFIG = {
  defaultCapital: 100000,
  defaultTimeframe: 'daily' as const,
  defaultPeriod: 252,         // Jours de trading
  monteCarlo: {
    defaultSimulations: 1000,
    minSimulations: 100,
    maxSimulations: 10000,
  },
  stressTest: {
    scenarios: ['normal', 'crisis', 'recovery'] as const,
    volatilityShock: 2.0,     // Multiplicateur de volatilité
    correlationShock: 0.9,    // Corrélation en crise
  },
} as const;

// Configuration des Univers d'actifs
export const UNIVERSE_CONFIG = {
  fx: {
    majors: ['EURUSD', 'USDJPY', 'GBPUSD', 'USDCHF', 'AUDUSD'],
    volatility: {
      EURUSD: 0.08,
      USDJPY: 0.07,
      GBPUSD: 0.09,
      USDCHF: 0.06,
      AUDUSD: 0.08,
    },
    spreads: {
      EURUSD: 0.1,
      USDJPY: 0.12,
      GBPUSD: 0.15,
      USDCHF: 0.10,
      AUDUSD: 0.12,
    },
  },
  equity: {
    indices: ['SPX', 'NDX', 'DAX', 'FTSE', 'NIKKEI'],
    volatility: {
      SPX: 0.18,
      NDX: 0.22,
      DAX: 0.20,
      FTSE: 0.16,
      NIKKEI: 0.19,
    },
  },
  crypto: {
    majors: ['BTC', 'ETH', 'BNB', 'ADA', 'SOL'],
    volatility: {
      BTC: 0.80,
      ETH: 0.85,
      BNB: 0.70,
      ADA: 0.90,
      SOL: 0.95,
    },
  },
} as const;

// Configuration des Presets
export const PRESET_CONFIG = {
  conservative: {
    name: 'Conservateur',
    description: 'Stratégie à faible risque pour capital préservation',
    capital: 50000,
    volatilityTarget: 10,
    kellyFraction: 0.1,
    maxDrawdown: 15,
    sequenceType: 'anti_martingale' as const,
  },
  balanced: {
    name: 'Équilibré',
    description: 'Stratégie équilibrée risque/rendement',
    capital: 100000,
    volatilityTarget: 15,
    kellyFraction: 0.2,
    maxDrawdown: 25,
    sequenceType: 'anti_martingale_bornee' as const,
  },
  aggressive: {
    name: 'Agressif',
    description: 'Stratégie à haut risque pour maximiser le rendement',
    capital: 200000,
    volatilityTarget: 25,
    kellyFraction: 0.3,
    maxDrawdown: 40,
    sequenceType: 'anti_martingale' as const,
  },
} as const;

// Configuration des Validations
export const VALIDATION_CONFIG = {
  minCapital: 1000,
  maxCapital: 10000000,
  minVolatility: 1,
  maxVolatility: 100,
  minSimulations: 10,
  maxSimulations: 100000,
  maxPositions: 50,
  maxDrawdown: 90,
} as const;

// Export de toutes les configurations
export const ALL_CONFIG = {
  kelly: KELLY_CONFIG,
  volatility: VOLATILITY_CONFIG,
  drawdown: DRAWDOWN_CONFIG,
  sequence: SEQUENCE_CONFIG,
  portfolio: PORTFOLIO_CONFIG,
  simulation: SIMULATION_CONFIG,
  universe: UNIVERSE_CONFIG,
  presets: PRESET_CONFIG,
  validation: VALIDATION_CONFIG,
} as const;

// Types d'export
export type KellyConfig = typeof KELLY_CONFIG;
export type VolatilityConfig = typeof VOLATILITY_CONFIG;
export type DrawdownConfig = typeof DRAWDOWN_CONFIG;
export type SequenceConfig = typeof SEQUENCE_CONFIG;
export type PortfolioConfig = typeof PORTFOLIO_CONFIG;
export type SimulationConfig = typeof SIMULATION_CONFIG;
export type UniverseConfig = typeof UNIVERSE_CONFIG;
export type PresetConfig = typeof PRESET_CONFIG;
export type ValidationConfig = typeof VALIDATION_CONFIG;
export type AllConfig = typeof ALL_CONFIG;
