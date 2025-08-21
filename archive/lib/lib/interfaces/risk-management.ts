// 📄 @fichier: lib/interfaces/risk-management.ts
// 🧱 Interfaces abstraites pour le risk management

export interface RiskCalculator {
  calculateRisk(trade: Trade): RiskResult;
}

export interface DrawdownManager {
  getMultiplier(equity: number): number;
}

export interface VolatilityTargeter {
  adjustSize(currentSize: number, realizedVol: number): number;
}

export interface PositionSizer {
  computeSize(trade: Trade, context: TradeContext): number;
}

export interface RiskLogger {
  log(tradeId: number, riskResult: RiskResult): void;
}

// Types de base
export interface Trade {
  pWins: number;
  pLosses: number;
  R: number;
  realizedVol: number;
  outcome: number;
  lastResult: "win" | "loss";
  cluster: string;
  marketContext: string;
}

export interface TradeContext {
  equity: number;
  hwm: number;
  step: number;
  capital: number;
}

export interface RiskResult {
  risk: number;
  confidence: number;
  modules: string[];
  notes?: string;
}
