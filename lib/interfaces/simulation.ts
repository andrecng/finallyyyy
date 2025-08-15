// 📄 @fichier: lib/interfaces/simulation.ts
// 🧱 Interfaces abstraites pour la simulation

import { Trade, TradeContext, RiskResult } from './risk-management';

export interface SimulationEngine {
  runSimulation(tradeMatrix: TradeMatrix, caps: PortfolioCaps): SimulationResult;
}

export interface PortfolioCaps {
  globalCap: number;
  perInstrumentCap: number;
  perClusterCap: number;
}

export interface TradeMatrix {
  [asset: string]: Trade[];
}

export interface SimulationResult {
  equity: Record<string, number[]>;
  metrics: SimulationMetrics;
  riskLogs: RiskLogEntry[];
}

export interface SimulationMetrics {
  cagr: number;
  maxDD: number;
  sortino: number;
  winRate: number;
}

export interface RiskLogEntry {
  tradeId: number;
  riskPct: number;
  modules: string[];
  notes?: string;
}
