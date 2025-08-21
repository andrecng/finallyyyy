// Stub pour SoftBarrier - à implémenter plus tard
export interface SoftBarrierConfig {
  levels: [number, number][];
}

export class SoftBarrier {
  constructor(config: SoftBarrierConfig) {
    // TODO: Implémenter
  }
  
  step(equity: number, base_risk: number) {
    return { mult: 1.0 }; // Placeholder
  }
}
