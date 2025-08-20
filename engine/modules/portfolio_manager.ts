// 📄 @fichier: modules/portfolio_manager.ts

export interface PortfolioCaps {
  globalCap: number;
  perInstrumentCap: number;
  perClusterCap: number;
}

export interface InstrumentExposure {
  instrument: string;
  cluster: string;
  requestedSize: number;
}

export function enforcePortfolioCaps(
  exposures: InstrumentExposure[],
  caps: PortfolioCaps
): Record<string, number> {
  const clusterTotals: Record<string, number> = {};
  let totalExposure = 0;

  for (const exp of exposures) {
    clusterTotals[exp.cluster] = (clusterTotals[exp.cluster] || 0) + exp.requestedSize;
    totalExposure += exp.requestedSize;
  }

  const output: Record<string, number> = {};

  for (const exp of exposures) {
    let adjSize = exp.requestedSize;
    adjSize = Math.min(adjSize, caps.perInstrumentCap);
    if (clusterTotals[exp.cluster] > caps.perClusterCap) {
      adjSize *= caps.perClusterCap / clusterTotals[exp.cluster];
    }
    if (totalExposure > caps.globalCap) {
      adjSize *= caps.globalCap / totalExposure;
    }
    output[exp.instrument] = adjSize;
  }

  return output;
}
