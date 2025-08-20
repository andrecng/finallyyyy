export type GateContext = { step: number; equity: number; exposure: number };
export type GateDecision = { exposure: number; reason?: string };
export type Gate = (ctx: GateContext) => GateDecision;

export const newsGate = (enabled: boolean, blockedSteps: Set<number>): Gate => (ctx) => {
  if (!enabled) return { exposure: ctx.exposure };
  if (blockedSteps.has(ctx.step)) return { exposure: 0, reason: "news_freeze" };
  return { exposure: ctx.exposure };
};

export const feesGate = (feeBpsPerStep = 0): Gate => (ctx) => {
  // Ici, on ne modifie pas l'expo (haircut possible plus tard si souhaité)
  return { exposure: ctx.exposure, reason: feeBpsPerStep ? "fees_applied" : undefined };
};

export function applyGates(exposure: number, gates: Gate[], step: number, equity: number) {
  let e = exposure;
  const reasons: string[] = [];
  for (const g of gates) {
    const out = g({ step, equity, exposure: e });
    e = Math.max(0, Math.min(out.exposure, 100));
    if (out.reason) reasons.push(out.reason);
  }
  return { exposure: e, reasons };
}
