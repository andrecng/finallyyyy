export type PresetV1 = {
  schema_version: "1.0";
  seed: number; total_steps: number; mu: number; fees_per_trade: number;
  modules: Record<string, unknown>;
};
export type SimulationOutput = {
  kpis: { pass_rate?: number; days_to_target?: number; max_dd_total?: number; max_dd_daily?: number; mar?: number; sortino?: number; omega?: number; };
  series?: { equity?: number[]; risk_effective?: number[]; cushion?: number[]; budget_daily?: number[] };
  logs?: Array<{ t: number; module: string; decision: string; note?: string }>;
  modules_active?: string[];
};
export interface EngineFacade { simulate(preset: PresetV1): Promise<SimulationOutput>; }
export const engine: EngineFacade = {
  async simulate(preset) {
    // TODO: brancher la vraie simu. Mock minimal pour faire tourner l'UI.
    const equity = Array.from({ length: 120 }, (_, i) => i + (Math.sin(i/6) * 5));
    return { kpis: { max_dd_total: 0.05, max_dd_daily: 0.02 }, series: { equity } };
  }
};
