'use client';

import { useSimulationStore } from '@/stores/simulationStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, Image, FileSpreadsheet } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function KPIPanel() {
  const { currentResult, exportResults } = useSimulationStore();

  if (!currentResult) {
    return (
      <div className="space-y-4">
        <Card className="binance-panel">
          <CardContent className="p-4">
            <div className="text-center text-muted">
              <p>Aucun résultat disponible</p>
              <p className="text-sm">Lancez une simulation pour voir les KPIs</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { kpis, guardrails } = currentResult;

  const formatPercentage = (value: number, decimals = 1) => {
    return `${(value * 100).toFixed(decimals)}%`;
  };

  const formatNumber = (value: number, decimals = 2) => {
    return value.toFixed(decimals);
  };

  const getRiskColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'profit';
    if (value <= thresholds.warning) return 'text-yellow-400';
    return 'loss';
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto sidebar-scrollbar pr-2">
      {/* KPIs Principaux */}
      <Card className="binance-panel">
        <CardHeader>
          <CardTitle className="text-sm">KPIs Principaux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-tertiary rounded">
              <div className="text-xs text-secondary">CAGR</div>
              <div className="text-lg font-bold profit">{formatPercentage(kpis.CAGR)}</div>
            </div>
            <div className="text-center p-2 bg-tertiary rounded">
              <div className="text-xs text-secondary">Max DD</div>
              <div className="text-lg font-bold loss">{formatPercentage(kpis.MaxDD)}</div>
            </div>
            <div className="text-center p-2 bg-tertiary rounded">
              <div className="text-xs text-secondary">Sharpe</div>
              <div className="text-lg font-bold text-primary">{formatNumber(kpis.Sharpe)}</div>
            </div>
            <div className="text-center p-2 bg-tertiary rounded">
              <div className="text-xs text-secondary">Sortino</div>
              <div className="text-lg font-bold text-primary">{formatNumber(kpis.Sortino)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary">Win Rate</span>
              <span className="text-sm font-medium">{formatPercentage(kpis.WinRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary">Profit Factor</span>
              <span className="text-sm font-medium">{formatNumber(kpis.ProfitFactor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary">Expectancy R</span>
              <span className={`text-sm font-medium ${kpis.Expectancy_R > 0 ? 'profit' : 'loss'}`}>
                {formatNumber(kpis.Expectancy_R)}R
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Probabilités de Ruine */}
      <Card className="binance-panel">
        <CardHeader>
          <CardTitle className="text-sm">Probabilités de Ruine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>DD -10%</span>
                <span className={getRiskColor(kpis.ruin_prob.dd_10, { good: 0.05, warning: 0.15 })}>
                  {formatPercentage(kpis.ruin_prob.dd_10)}
                </span>
              </div>
              <Progress value={kpis.ruin_prob.dd_10 * 100} className="h-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>DD -20%</span>
                <span className={getRiskColor(kpis.ruin_prob.dd_20, { good: 0.02, warning: 0.08 })}>
                  {formatPercentage(kpis.ruin_prob.dd_20)}
                </span>
              </div>
              <Progress value={kpis.ruin_prob.dd_20 * 100} className="h-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>DD -30%</span>
                <span className={getRiskColor(kpis.ruin_prob.dd_30, { good: 0.005, warning: 0.02 })}>
                  {formatPercentage(kpis.ruin_prob.dd_30)}
                </span>
              </div>
              <Progress value={kpis.ruin_prob.dd_30 * 100} className="h-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques Avancées */}
      <Card className="binance-panel">
        <CardHeader>
          <CardTitle className="text-sm">Métriques Avancées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-secondary">ES-95</span>
              <span className="loss">{formatPercentage(kpis.ES_95)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Ulcer</span>
              <span>{formatNumber(kpis.Ulcer)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Time in DD</span>
              <span>{formatPercentage(kpis.time_in_dd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Longest Loss</span>
              <span>{kpis.longest_loss_streak}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guardrails */}
      <Card className="binance-panel">
        <CardHeader>
          <CardTitle className="text-sm">Guardrails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-secondary">Breaks Paliers</span>
              <span>[{guardrails.palier_break_count.join(', ')}]</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Prob Next Break</span>
              <span className={getRiskColor(guardrails.prob_break_next_palier, { good: 0.05, warning: 0.15 })}>
                {formatPercentage(guardrails.prob_break_next_palier)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Floor Breaches</span>
              <span className={guardrails.floor_breaches > 0 ? 'loss' : 'profit'}>
                {guardrails.floor_breaches}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Avg Recovery</span>
              <span>{guardrails.avg_dd_recovery_trades} trades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Peak Positions</span>
              <span>{guardrails.peak_concurrent_pos}</span>
            </div>
          </div>

          {guardrails.compliance_flags.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-secondary">Compliance Flags:</div>
              {guardrails.compliance_flags.map((flag, i) => (
                <Badge key={i} variant="destructive" className="text-xs">
                  {flag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stress Tests */}
      <Card className="binance-panel">
        <CardHeader>
          <CardTitle className="text-sm">Tests de Stress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-secondary mb-2">Tests rapides (toggles actifs)</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <Button size="sm" variant="outline" className="h-8 text-xs">
              WR -10%
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs">
              Vol +50%
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs">
              Coûts ×2
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs">
              Corr → 1.0
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <Card className="binance-panel">
        <CardHeader>
          <CardTitle className="text-sm">Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportResults('csv')}
              className="text-xs"
            >
              <FileSpreadsheet size={14} className="mr-1" />
              CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportResults('json')}
              className="text-xs"
            >
              <Download size={14} className="mr-1" />
              JSON
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportResults('png')}
              className="text-xs"
            >
              <Image size={14} className="mr-1" />
              PNG
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportResults('pdf')}
              className="text-xs"
            >
              <FileText size={14} className="mr-1" />
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trades Stats */}
      <Card className="binance-panel">
        <CardHeader>
          <CardTitle className="text-sm">Trades Nécessaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{kpis.trades_needed_mean}</div>
            <div className="text-xs text-secondary">Moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-medium text-secondary">{kpis.trades_needed_p95}</div>
            <div className="text-xs text-secondary">95ème percentile</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}