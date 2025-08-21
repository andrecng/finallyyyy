export type PresetV1 = {
  schema_version: "1.0";
  seed: number; total_steps: number; mu: number; fees_per_trade: number;
  modules: Record<string, unknown>;
};

export type SimulationOutput = {
  kpis: {
    pass_rate?: number; days_to_target?: number;
    max_dd_total?: number; max_dd_daily?: number;
    mar?: number; sortino?: number; omega?: number;
  };
  series?: { equity?: number[]; risk_effective?: number[]; cushion?: number[]; budget_daily?: number[] };
  logs?: Array<{ t:number; module:string; decision:string; note?: string }>;
  modules_active?: string[];
};

export interface EngineFacade { 
  simulate(p: PresetV1): Promise<SimulationOutput>; 
}

// Par défaut: passer par l'API Next (mock ou proxy → voir §3)
export const engine: EngineFacade = {
  async simulate(preset) {
    const r = await fetch("/api/simulate", {
      method: "POST", 
      headers: { "content-type": "application/json" },
      body: JSON.stringify(preset),
    });
    if (!r.ok) throw new Error(`simulate failed: ${r.status}`);
    return r.json();
  }
};
