// 📄 @fichier: modules/risk-logger.ts
// 📝 Module Risk Logger selon la logique GPT

import { RiskLogger, RiskResult } from '../lib/interfaces/risk-management';

export class RiskLoggerImpl implements RiskLogger {
  private logs: Array<{ tradeId: number; riskResult: RiskResult; timestamp: number }> = [];

  log(tradeId: number, riskResult: RiskResult): void {
    this.logs.push({
      tradeId,
      riskResult,
      timestamp: Date.now()
    });
  }

  getLogs(): Array<{ tradeId: number; riskResult: RiskResult; timestamp: number }> {
    return [...this.logs];
  }

  getLogsByTradeId(tradeId: number): RiskResult[] {
    return this.logs
      .filter(log => log.tradeId === tradeId)
      .map(log => log.riskResult);
  }

  clearLogs(): void {
    this.logs = [];
  }

  getSummary(): {
    totalTrades: number;
    averageRisk: number;
    maxRisk: number;
    minRisk: number;
  } {
    if (this.logs.length === 0) {
      return { totalTrades: 0, averageRisk: 0, maxRisk: 0, minRisk: 0 };
    }

    const risks = this.logs.map(log => log.riskResult.risk);
    const totalRisk = risks.reduce((sum, risk) => sum + risk, 0);

    return {
      totalTrades: this.logs.length,
      averageRisk: totalRisk / this.logs.length,
      maxRisk: Math.max(...risks),
      minRisk: Math.min(...risks)
    };
  }
}
