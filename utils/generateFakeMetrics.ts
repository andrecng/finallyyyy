
import { SimulationMetrics } from "@/stores/simStore";

export function generateFakeMetrics(): SimulationMetrics {
  return {
    CAGR: 15.5,
    MaxDD: 8.2,
    Sharpe: 1.8,
    Sortino: 2.1,
    WinRate: 62.5,
    TimeInDrawdown: 28.3,
    ES95: -12.5,
    UlcerIndex: 0.045,
  };
}

