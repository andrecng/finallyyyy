// 📄 @fichier: lib/modules/index.ts
// 🗂️ Point d'entrée unifié pour tous les modules

// Modules de risk management (existants)
export { KellyCalculator } from '../../modules/kelly-calculator';
export { SoftBarrierDrawdownPalier } from '../../modules/drawdown-manager';
export { VolatilityTarget } from '../../modules/volatility-target';
export { RiskLoggerImpl } from '../../modules/risk-logger';

// Nouveaux modules de risk control
export { PositionSizer } from '../../modules/risk-control/position-sizer';
export { CPPIManager } from '../../modules/risk-control/cppi-freeze';
export { PortfolioCaps } from '../../modules/risk-control/portfolio-caps';

// Nouveaux modules overlay
export { MarketEngine } from '../../modules/overlay/market-engine';

// Nouveaux modules simulation
export { SimulationEngine } from '../../modules/simulation/engine';
export { Presets, createCustomPreset, validatePreset } from '../../modules/simulation/presets';
export * from '../../modules/simulation/validators';

// Types et interfaces
export type { Trade, TradeContext, RiskResult } from '../interfaces/risk-management';
export type { SimulationResult, SimulationMetrics } from '../interfaces/simulation';

// Factory et registry
export { RiskFactory } from '../factories/risk-factory';
export { moduleRegistry } from '../registry/module-registry';
