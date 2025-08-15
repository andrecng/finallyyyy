// 📄 @fichier: modules/main_simulation_multi.ts

import { computePositionSize } from "./position_sizer";
import { enforcePortfolioCaps, InstrumentExposure, PortfolioCaps } from "./portfolio_manager";

export function runMultiAssetSimulation(tradeMatrix: any, caps: PortfolioCaps): Record<string, number[]> {
  const equity: Record<string, number[]> = {};
  const capitalNow: Record<string, number> = {};
  const capital = 100000;
  const hwm: Record<string, number> = {};
  const step: Record<string, number> = {};

  for (const asset of Object.keys(tradeMatrix)) {
    equity[asset] = [];
    capitalNow[asset] = capital;
    hwm[asset] = capital;
    step[asset] = 0;
  }

  const len = Math.max(...Object.values(tradeMatrix).map((v: any) => v.length));

  for (let t = 0; t < len; t++) {
    const exposures: InstrumentExposure[] = [];

    for (const asset of Object.keys(tradeMatrix)) {
      const trade = tradeMatrix[asset][t];
      if (!trade) continue;

      const sizePct = computePositionSize({
        ...trade,
        capital: capitalNow[asset],
        hwm: hwm[asset],
        step: step[asset],
      });

      exposures.push({
        instrument: asset,
        cluster: trade.cluster,
        requestedSize: sizePct,
      });
    }

    const adjusted = enforcePortfolioCaps(exposures, caps);

    for (const asset of Object.keys(adjusted)) {
      const size = adjusted[asset];
      const trade = tradeMatrix[asset][t];
      const pnl = size * capitalNow[asset] * trade.outcome;
      capitalNow[asset] += pnl;
      hwm[asset] = Math.max(hwm[asset], capitalNow[asset]);
      equity[asset].push(capitalNow[asset]);
      step[asset] = trade.lastResult === "win" ? step[asset] + 1 : 0;
    }
  }

  return equity;
}
