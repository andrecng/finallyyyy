// CPPI Freeze basique : floor = HWM * (1 - alpha); cushion = equity - floor.
// freeze si cushion_pct < freeze_cushion_pct -> exposition = 0.

export type CPPICfg = { alpha: number; m: number; freeze_cushion_pct: number };

export function cppiExposure(equity: number, hwm: number, cfg: CPPICfg) {
  const floor = hwm * (1 - cfg.alpha);
  const cushion = Math.max(0, equity - floor);
  const cushion_pct = equity > 0 ? cushion / equity : 0;
  const frozen = cushion_pct < cfg.freeze_cushion_pct;
  const exposure = frozen ? 0 : cfg.m * (cushion / Math.max(1e-9, equity));
  return { floor, cushion, frozen, exposure };
}
