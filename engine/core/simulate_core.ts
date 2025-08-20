import { SimInput, SimOutput, StepLog } from "./types";
import { cppiExposure } from "./modules/cppi_freeze";
import { amplify } from "./modules/amplifier";
import { applyGates, newsGate, feesGate } from "./modules/gates";
import { kellyExposure } from "./modules/kelly_split";

export function simulateCore(input: SimInput): SimOutput {
  const initial_equity = input.initial_equity ?? 100000;
  const rets = Array.isArray(input.returns) ? input.returns : [];
  if (!rets.length) throw new Error("input.returns[] requis");

  const cppiCfg = {
    alpha: input?.params?.cppi?.alpha ?? 0.2,
    m: input?.params?.cppi?.m ?? 3.0,
    freeze_cushion_pct: input?.params?.cppi?.freeze_cushion_pct ?? 0.05,
  };
  const ampCfg = {
    gain: input?.params?.amplifier?.gain ?? 1.0,
    cap: input?.params?.amplifier?.cap ?? 1.5,
  };
  const kellyCfg = {
    enabled: !!input?.params?.kelly?.enabled,
    f_cap: input?.params?.kelly?.f_cap ?? 1.0,
    haircut: input?.params?.kelly?.haircut ?? 1.0,
    source: input?.params?.kelly?.source ?? "external",
  } as const;
  const stepsPerDay = input?.steps_per_day ?? 20;

  // Gates
  const newsBlocked = new Set<number>(input?.params?.gates?.news_blocked_steps ?? []);
  const gates = [
    newsGate(!!input?.params?.gates?.news_enabled, newsBlocked),
    feesGate(input?.params?.gates?.fee_bps_per_step ?? 0),
  ];

  const equity: number[] = [initial_equity];
  const exposure: number[] = [];
  const logs: StepLog[] = [];
  const activeModules = ["CPPIFreeze", "Amplifier", "Gates"];
  if (kellyCfg.enabled) activeModules.push("KellySplit");

  let hwm = initial_equity;
  let maxDDPct = 0;

  for (let i = 0; i < rets.length; i++) {
    const eq_before = equity[equity.length - 1];
    hwm = Math.max(hwm, eq_before);

    // CPPI
    const cppi = cppiExposure(eq_before, hwm, cppiCfg); // { floor, cushion, frozen, exposure }
    // Kelly (boîte noire) : on attend un f "fourni", ici on le laisse à 0 par défaut
    const f_external = 0; // placeholder si aucune source fournie
    const eKelly = kellyExposure(f_external, kellyCfg); // undefined si désactivé

    // Agrégation min(modules actifs) AVANT amplification
    const candidates = [cppi.exposure];
    if (typeof eKelly === "number") candidates.push(eKelly);
    const eMinPreAmp = Math.min(...candidates);

    // Amplificateur proportionnel
    const eAmplified = amplify(eMinPreAmp, ampCfg);

    // Gates (news, fees, etc.)
    const gated = applyGates(eAmplified, gates, i + 1, eq_before);
    const eFinal = gated.exposure;

    // Application du retour (exposure * return)
    const applied_return = eFinal * rets[i];
    const eq_after = eq_before * (1 + applied_return);

    equity.push(eq_after);
    exposure.push(eFinal);

    const ddPct = 1 - (eq_after / hwm);
    maxDDPct = Math.max(maxDDPct, ddPct);

    logs.push({
      step: i + 1,
      hwm,
      floor: cppi.floor,
      equity_before: eq_before,
      cushion: cppi.cushion,
      frozen: cppi.frozen,
      exposures_by_module: { cppi: cppi.exposure, kelly: eKelly, min_pre_amp: eMinPreAmp },
      amplified_exposure: eAmplified,
      gate_reasons: gated.reasons,
      applied_return,
      equity_after: eq_after,
    });
  }

  // DD / jour — inclure le point de fin de journée (off-by-one fixé)
  let maxDailyDD = 0;
  if (stepsPerDay > 0) {
    const totalSteps = rets.length;         // nb de steps (pas)
    const totalDays = Math.ceil(totalSteps / stepsPerDay);
    for (let d = 0; d < totalDays; d++) {
      const startStep = d * stepsPerDay;                // index de step début de journée
      const endStepExclusive = Math.min((d + 1) * stepsPerDay, totalSteps);
      // equity a taille = totalSteps + 1 (inclut l'initial)
      // Pour couvrir TOUTE la journée, on prend equity[startStep .. endStepInclusive]
      const endEquityIndexInclusive = endStepExclusive; // +1 par rapport aux steps
      const slice = equity.slice(startStep, endEquityIndexInclusive + 1);
      if (slice.length >= 2) {
        const dayMax = Math.max(...slice);
        const dayMin = Math.min(...slice);
        const dd = 1 - (dayMin / dayMax);
        maxDailyDD = Math.max(maxDailyDD, dd);
      }
    }
  }

  const final_equity = equity[equity.length - 1];
  const out: SimOutput = {
    kpis: {
      steps: rets.length,
      initial_equity,
      final_equity,
      max_dd_pct: maxDDPct,
      max_daily_dd_pct: maxDailyDD,
      success_flags: {
        ftmo_total_dd_le_10: maxDDPct <= 0.10,
        ftmo_daily_dd_le_5: maxDailyDD <= 0.05,
      },
    },
    series: { equity, exposure },
    logs,
    modules: activeModules,
  };
  return out;
}
