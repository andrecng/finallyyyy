import { describe, it, expect } from "vitest";
import { simulateCore } from "../src/core/simulate_core";

describe("Moteur Alpha - règles d'or & FTMO", () => {
  it("CPPI: freeze si cushion_pct < 5% (après un gros drawdown)", () => {
    const out = simulateCore({
      initial_equity: 100000,
      returns: [-0.3, 0.0],       // drawdown fort au step 1
      steps_per_day: 2,
      params: { cppi: { alpha: 0.2, m: 3, freeze_cushion_pct: 0.05 }, amplifier: { gain: 1, cap: 2 } }
    });
    // Au step 2, equity_before est bas, HWM élevé -> cushion faible => freeze attendu => expo ~ 0
    expect(out.series.exposure[1]).toBe(0);
    expect(out.logs[1].frozen).toBe(true);
  });

  it("Aucune augmentation de taille juste après une perte", () => {
    const out = simulateCore({
      initial_equity: 100000,
      returns: [-0.05, 0.0],      // perte puis neutre
      steps_per_day: 2,
      params: { cppi: { alpha: 0.2, m: 3, freeze_cushion_pct: 0.05 }, amplifier: { gain: 1, cap: 2 } }
    });
    const e1 = out.series.exposure[0];
    const e2 = out.series.exposure[1];
    expect(e2).toBeLessThanOrEqual(e1);
  });

  it("FTMO: flag daily DD ≤ 5% devient false si day-DD > 5%", () => {
    const out = simulateCore({
      initial_equity: 100000,
      returns: [0.0, -0.1, 0.0, 0.0], // 10% baisse sur un 'jour' (steps_per_day=2)
      steps_per_day: 2,
      params: { cppi: { alpha: 0.2, m: 3, freeze_cushion_pct: 0.05 }, amplifier: { gain: 1, cap: 2 } }
    });
    expect(out.kpis.success_flags?.ftmo_daily_dd_le_5).toBe(false);
  });

  it("News gate: expo=0 au step bloqué + reason loggée", () => {
    const out = simulateCore({
      initial_equity: 100000,
      returns: [0.01, 0.01, 0.01],
      steps_per_day: 3,
      params: {
        cppi: { alpha: 0.2, m: 3, freeze_cushion_pct: 0.05 },
        amplifier: { gain: 1, cap: 2 },
        gates: { news_enabled: true, news_blocked_steps: [2] } // bloque le step 2
      }
    });
    expect(out.series.exposure[1]).toBe(0);
    expect(out.logs[1].gate_reasons).toContain("news_freeze");
  });
});
