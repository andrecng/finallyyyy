// 📍 modules/overlay/market-engine.ts

import { RiskModule } from "@/lib/registry/module-registry";

export class MarketEngine implements RiskModule {
  id = "market_engine";
  name = "Market Engine Overlay";
  version = "1.0.0";
  isEnabled = true;
  priority = 5; // ordre relatif dans l'orchestration

  private boost: number;
  private haircut: number;
  private neutralThreshold: number;

  constructor(boost = 0.15, haircut = 0.30, neutralThreshold = 0.05) {
    this.boost = boost;
    this.haircut = haircut;
    this.neutralThreshold = neutralThreshold;
  }

  apply(risk: number, regime: "bull" | "bear" | "neutral"): number {
    if (!this.isEnabled) return risk;

    if (regime === "bull") {
      return Math.min(risk * (1 + this.boost), risk * 2);
    } else if (regime === "bear") {
      return risk * (1 - this.haircut);
    } else {
      return risk;
    }
  }
}
