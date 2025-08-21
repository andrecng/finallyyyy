// Stub pour VolatilityTarget - à implémenter plus tard
export interface VolatilityTargetConfig {
  target_vol: number;
  halflife: number;
}

export class VolatilityTarget {
  constructor(config: VolatilityTargetConfig) {
    // TODO: Implémenter
  }
  
  step(realized_vol: number) {
    return { cap: 1.0 }; // Placeholder
  }
}
