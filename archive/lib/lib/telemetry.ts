export type RawLog = Record<string, any>;

export type Telemetry = {
  cppi_cap_mult?: number | null;
  cppi_freeze?: boolean | null;
  vt_sigma?: number | null;
  vt_cap?: number | null;
  sb_dd?: number | null;
  sb_mult?: number | null;
  ftmo_lmax_dyn?: number | null;
  ftmo_budget_day_left?: number | null;
};

export function extractTelemetry(logs?: RawLog[]): Telemetry {
  if (!logs || logs.length === 0) return {};
  const last = logs[logs.length - 1] || {};
  
  // Extraire les données des modules depuis la structure des logs
  const modules = last.modules || [];
  let telemetry: Telemetry = {};
  
  for (const module_log of modules) {
    const module_name = module_log.module;
    const module_data = module_log.data || {};
    
    switch (module_name) {
      case 'CPPI':
        telemetry.cppi_cap_mult = num(module_data.cap_mult);
        telemetry.cppi_freeze = bool(module_data.freeze);
        break;
      case 'VolTarget':
        telemetry.vt_sigma = num(module_data.sigma_hat);
        telemetry.vt_cap = num(module_data.cap);
        break;
      case 'SoftBarrier':
        telemetry.sb_dd = num(module_data.dd);
        telemetry.sb_mult = num(module_data.mult);
        break;
      case 'FTMOGate':
        // FTMO data peut être dans module_data ou dans last directement
        telemetry.ftmo_lmax_dyn = num(module_data.lmax_dyn) ?? num(last.ftmo_lmax_dyn);
        telemetry.ftmo_budget_day_left = num(module_data.budget_day_left) ?? num(last.ftmo_budget_left);
        break;
    }
  }
  
  return telemetry;
}

function num(x: any): number | undefined {
  const n = Number(x);
  return Number.isFinite(n) ? n : undefined;
}
function bool(x: any): boolean | undefined {
  if (x === true || x === false) return x;
  if (typeof x === "string") {
    if (x.toLowerCase() === "true") return true;
    if (x.toLowerCase() === "false") return false;
  }
  return undefined;
}
