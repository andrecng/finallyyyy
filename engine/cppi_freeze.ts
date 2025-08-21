// Stub pour CPPIFreeze - à implémenter plus tard
export interface CPPIFreezeConfig {
  alpha: number;
  freeze_frac: number;
}

export class CPPIFreeze {
  constructor(config: CPPIFreezeConfig) {
    // TODO: Implémenter
  }
  
  step(equity: number) {
    return { cap_mult: 1.0, freeze: false }; // Placeholder
  }
}
