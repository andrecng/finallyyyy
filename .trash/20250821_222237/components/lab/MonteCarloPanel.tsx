'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Play, Download, BarChart3, TrendingUp, AlertTriangle, CheckCircle, Square } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MonteCarloRequest {
  initial_capital: number;
  risk_per_trade: number;
  win_rate: number;
  avg_win: number;
  avg_loss: number;
  num_trades: number;
  num_simulations: number;
}

interface SimulationResult {
  simulation_id: string;
  final_capital: number;
  max_drawdown: number;
  sharpe_ratio: number;
  total_return: number;
  trades: any[];
  equity_curve: number[];
  timestamp: string;
}

interface MonteCarloResult {
  simulations: SimulationResult[];
  statistics: {
    mean_final_capital: number;
    std_final_capital: number;
    mean_max_drawdown: number;
    mean_sharpe_ratio: number;
    mean_total_return: number;
    success_rate: number;
  };
  percentiles: {
    p5_final_capital: number;
    p25_final_capital: number;
    p50_final_capital: number;
    p75_final_capital: number;
    p95_final_capital: number;
    worst_case: number;
    best_case: number;
  };
}

export default function MonteCarloPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MonteCarloResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [params, setParams] = useState<MonteCarloRequest>({
    initial_capital: 100000,
    risk_per_trade: 2,
    win_rate: 0.55,
    avg_win: 2.5,
    avg_loss: 1.5,
    num_trades: 100,
    num_simulations: 1000
  });

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

  const runMonteCarlo = async () => {
    setIsLoading(true);
    setProgress(0);
    setResults(null);
    
    // Création d'un contrôleur d'annulation
    abortControllerRef.current = new AbortController();
    
    try {
      // Simulation de progression (car le backend ne supporte pas encore le streaming)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);
      
      const response = await fetch('http://localhost:8000/simulate/monte-carlo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: abortControllerRef.current.signal,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('Erreur lors de la simulation');
      }

      const data = await response.json();
      setResults(data);
      toast({
        title: "Simulation terminée !",
        description: `${data.simulations.length} simulations Monte-Carlo exécutées avec succès.`,
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast({
          title: "Simulation arrêtée",
          description: "La simulation a été arrêtée par l'utilisateur.",
        });
      } else {
        console.error('Erreur:', error);
        toast({
          title: "Erreur",
          description: "Impossible de lancer la simulation. Vérifiez que le backend est démarré.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setProgress(0);
      abortControllerRef.current = null;
    }
  };

  const stopSimulation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setProgress(0);
    }
  };

  const exportResults = () => {
    if (!results) return;
    
    const csvContent = generateCSV(results);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `monte-carlo-simulation-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const generateCSV = (data: MonteCarloResult) => {
    const headers = ['Simulation ID', 'Final Capital', 'Max Drawdown', 'Sharpe Ratio', 'Total Return', 'Timestamp'];
    const rows = data.simulations.map(sim => [
      sim.simulation_id,
      sim.final_capital,
      sim.max_drawdown,
      sim.sharpe_ratio,
      sim.total_return,
      sim.timestamp
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  return (
    <div className="space-y-4 h-full">
      {/* Paramètres de Simulation - Version Compacte */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {/* Capital Initial */}
          <div className="space-y-1">
            <Label htmlFor="initial_capital" className="text-xs">Capital (€)</Label>
            <Input
              id="initial_capital"
              type="number"
              value={params.initial_capital}
              onChange={(e) => setParams({...params, initial_capital: Number(e.target.value)})}
              className="binance-input h-8 text-sm"
            />
          </div>

          {/* Risque par Trade */}
          <div className="space-y-1">
            <Label htmlFor="risk_per_trade" className="text-xs">Risque (%)</Label>
            <Input
              id="risk_per_trade"
              type="number"
              step="0.1"
              value={params.risk_per_trade}
              onChange={(e) => setParams({...params, risk_per_trade: Number(e.target.value)})}
              className="binance-input h-8 text-sm"
            />
          </div>
        </div>

        {/* Taux de Gain - Compact */}
        <div className="space-y-1">
          <Label className="text-xs">Taux de Gain: {formatPercentage(params.win_rate)}</Label>
          <Slider
            value={[params.win_rate * 100]}
            onValueChange={([value]) => setParams({...params, win_rate: value / 100})}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        {/* Bouton de Simulation - Compact */}
        <Button
          onClick={runMonteCarlo}
          disabled={isLoading}
          className="binance-button w-full h-8 text-sm"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
          ) : (
            <Play size={14} className="mr-2" />
          )}
          {isLoading ? 'Simulation...' : 'Lancer Simulation'}
        </Button>
        
        {/* Bouton Stop - Compact */}
        {isLoading && (
          <Button
            onClick={stopSimulation}
            variant="destructive"
            className="w-full h-8 text-sm"
          >
            <Square size={14} className="mr-2" />
            Arrêter
          </Button>
        )}
        
        {/* Barre de Progression - Compacte */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-secondary">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>

      {/* Résultats - Version Compacte */}
      {results && (
        <div className="space-y-3">
          {/* Statistiques Globales - Compactes */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 bg-green-500/10 rounded border border-green-500/20">
              <div className="font-bold text-green-400">
                {formatCurrency(results.statistics.mean_final_capital)}
              </div>
              <div className="text-secondary">Capital Moyen</div>
            </div>
            <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/20">
              <div className="font-bold text-blue-400">
                {formatPercentage(results.statistics.mean_total_return)}
              </div>
              <div className="text-secondary">Rendement</div>
            </div>
          </div>

          {/* Bouton Export - Compact */}
          <Button
            onClick={exportResults}
            variant="outline"
            className="binance-button-outline w-full h-8 text-xs"
          >
            <Download size={12} className="mr-2" />
            Exporter CSV
          </Button>
        </div>
      )}

      {!results && !isLoading && (
        <div className="flex items-center justify-center h-32 text-muted">
          <div className="text-center">
            <BarChart3 size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">Aucune simulation</p>
          </div>
        </div>
      )}
    </div>
  );
}
