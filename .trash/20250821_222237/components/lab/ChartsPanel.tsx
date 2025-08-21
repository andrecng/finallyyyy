'use client';

import { useSimulationStore } from '@/stores/simulationStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';

export default function ChartsPanel() {
  const { currentResult, isLoading, runSimulation, compareMode, compareResults } = useSimulationStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-4 h-full">
      {/* Control Panel */}
      <Card className="binance-panel">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={runSimulation}
                disabled={isLoading}
                className="binance-button"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Play size={16} className="mr-2" />
                )}
                {isLoading ? 'Simulation...' : 'Lancer Simulation'}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RotateCcw size={16} className="mr-2" />
                Reset
              </Button>
            </div>
            {currentResult && (
              <div className="text-sm text-secondary">
                Durée: {currentResult.run_meta.duration_ms}ms | 
                Engine: {currentResult.run_meta.engine_version}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Equity Curve */}
      <Card className="binance-panel">
        <CardHeader>
          <CardTitle className="text-sm">Courbe d'Equity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentResult?.series.equity.map(([x, y]) => ({ x, y })) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="x" 
                  stroke="var(--text-secondary)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--text-secondary)"
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                  }}
                  labelFormatter={(value) => `Trade ${value}`}
                  formatter={(value: number) => [formatCurrency(value), 'Equity']}
                />
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke="var(--green)"
                  fillOpacity={0.1}
                  fill="var(--green)"
                  strokeWidth={2}
                />
                <ReferenceLine 
                  y={100000} 
                  stroke="var(--text-muted)" 
                  strokeDasharray="2 2"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Drawdown */}
      <Card className="binance-panel">
        <CardHeader>
          <CardTitle className="text-sm">Drawdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentResult?.series.dd.map(([x, y]) => ({ x, y })) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="x" 
                  stroke="var(--text-secondary)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--text-secondary)"
                  fontSize={12}
                  tickFormatter={formatPercentage}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                  }}
                  formatter={(value: number) => [formatPercentage(value), 'DD']}
                />
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke="var(--red)"
                  fillOpacity={0.2}
                  fill="var(--red)"
                  strokeWidth={2}
                />
                <ReferenceLine 
                  y={-0.1} 
                  stroke="var(--yellow)" 
                  strokeDasharray="2 2"
                  label={{ value: "Palier -10%", position: "top" }}
                />
                <ReferenceLine 
                  y={-0.2} 
                  stroke="var(--red)" 
                  strokeDasharray="2 2"
                  label={{ value: "Palier -20%", position: "top" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* R Distribution */}
      <Card className="binance-panel">
        <CardHeader>
          <CardTitle className="text-sm">Distribution R/Trade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { r: '-3R', count: 15 },
                { r: '-2R', count: 45 },
                { r: '-1R', count: 180 },
                { r: '0R', count: 20 },
                { r: '1R', count: 200 },
                { r: '2R', count: 90 },
                { r: '3R', count: 25 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="r" 
                  stroke="var(--text-secondary)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--text-secondary)"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="var(--blue)"
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {!currentResult && !isLoading && (
        <div className="flex items-center justify-center h-64 text-muted">
          <div className="text-center">
            <p>Aucune simulation lancée</p>
            <p className="text-sm">Cliquez sur "Lancer Simulation" pour commencer</p>
          </div>
        </div>
      )}
    </div>
  );
}