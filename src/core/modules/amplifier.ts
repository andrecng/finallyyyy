export type AmplifierCfg = { gain: number; cap: number };
export function amplify(exposure: number, cfg: AmplifierCfg) {
  const amplified = exposure * cfg.gain;
  return Math.max(0, Math.min(cfg.cap, amplified));
}
