export type ModuleResult = { name: string; risk_eff: number; logs?: any };

export function positionSizer(results: ModuleResult[]): { risk_final: number; details: ModuleResult[] } {
  const risk_final = Math.max(0, Math.min(...results.map(r => r.risk_eff)));
  return { risk_final, details: results };
}
