// 📄 @fichier: lib/modules/index.ts
// 🗂️ Point d'entrée unifié pour tous les modules

// Modules de risk management
export { KellyCalculator } from '../../modules/kelly-calculator';
export { SoftBarrierDrawdownPalier } from '../../modules/drawdown-manager';
export { VolatilityTarget } from '../../modules/volatility-target';
export { RiskLoggerImpl } from '../../modules/risk-logger';

// Types et interfaces
export type { Trade, TradeContext, RiskResult } from '../interfaces/risk-management';
export type { SimulationResult, SimulationMetrics } from '../interfaces/simulation';

// Factory et registry
export { RiskFactory } from '../factories/risk-factory';
export { moduleRegistry } from '../registry/module-registry';
