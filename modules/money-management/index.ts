/**
 * Money Management Modules - Index
 * 
 * Export centralisé de tous les modules de gestion du capital
 * 
 * @author 2048 Asset Management
 * @version 2.0.0
 */

// Kelly Calculator
export { KellyCalculator, type KellyParams, type KellyResult } from './kelly-calculator';

// Volatility Targeter
export { VolatilityTargeter, type VolatilityConfig, type VolatilityState } from './volatility-target';

// Drawdown Manager
export { DrawdownManager, type DrawdownThreshold, type DrawdownState } from './drawdown-manager';

// Sequence Manager
export { SequenceManager, type SequenceConfig, type SequenceState, type SequenceType } from './sequence-manager';

// Export par défaut de tous les modules
export default {
  KellyCalculator: require('./kelly-calculator').default,
  VolatilityTargeter: require('./volatility-target').default,
  DrawdownManager: require('./drawdown-manager').default,
  SequenceManager: require('./sequence-manager').default,
};
