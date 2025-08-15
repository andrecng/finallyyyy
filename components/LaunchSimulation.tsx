// ✅ COMPOSANT : LaunchSimulation.tsx
// 📍 Emplacement : /components/LaunchSimulation.tsx
// 🧠 Lance une simulation avec interface moderne

'use client';

import { useState } from 'react';
import { useSimStore } from '@/stores/simStore';
import { simulateReal } from '@/lib/simulateReal';

export default function LaunchSimulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationType, setSimulationType] = useState<'basic' | 'advanced' | 'monte-carlo'>('basic');
  
  const { 
    capital, 
    volatilityTarget, 
    nbSimulations,
    setCapital,
    setVolatilityTarget,
    setNbSimulations,
    setMetrics,
    setEquity
  } = useSimStore();

  const handleSimulation = async () => {
    setIsRunning(true);
    
    try {
      // Simulation basique
      if (simulationType === 'basic') {
        const equity: number[] = [];
        let currentCapital = capital;
        
        for (let i = 0; i < 100; i++) {
          const pnl = (Math.random() - 0.45) * 2000;
          currentCapital += pnl;
          equity.push(currentCapital);
        }
        
        setEquity(equity);
        
        const start = equity[0];
        const end = equity[equity.length - 1];
        const returns = equity.map((v, i, arr) => 
          i === 0 ? 0 : (v - arr[i - 1]) / arr[i - 1]
        );
        
        const negReturns = returns.filter((r) => r < 0);
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const negVol = Math.sqrt(negReturns.reduce((a, b) => a + b * b, 0) / negReturns.length);
        const maxDD = 1 - Math.min(...equity.map((v, i) => v / Math.max(...equity.slice(0, i + 1))));
        
        setMetrics({
          CAGR: Math.pow(end / start, 1 / (equity.length / 252)) - 1,
          MaxDD: maxDD,
          Sortino: avgReturn / negVol,
          WinRate: returns.filter((r) => r > 0).length / returns.length,
          Sharpe: 0,
          TimeInDrawdown: 0,
          ES95: 0,
          UlcerIndex: 0
        });
      } else if (simulationType === 'advanced') {
        // Utilise le simulateur avancé
        const result = simulateReal();
        setMetrics({
          CAGR: result.cagr / 100,
          MaxDD: result.maxDrawdown / 100,
          Sortino: result.sortino,
          WinRate: result.winRate / 100,
          Sharpe: 0,
          TimeInDrawdown: 0,
          ES95: 0,
          UlcerIndex: 0
        });
        setEquity(result.equitySeries.map((item: { t: number; value: number }) => item.value));
      }
      
    } catch (error) {
      console.error('Erreur de simulation:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur de type de simulation */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300">Type de Simulation</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'basic', label: 'Basique', icon: '🚀', desc: 'Simulation rapide' },
            { id: 'advanced', label: 'Avancée', icon: '⚡', desc: 'Monte Carlo' },
            { id: 'monte-carlo', label: 'MC Pro', icon: '🎲', desc: 'Multi-scénarios' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSimulationType(type.id as any)}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                simulationType === type.id
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500 hover:bg-slate-600/50'
              }`}
            >
              <div className="text-center">
                <div className="text-xl mb-1">{type.icon}</div>
                <div className="text-xs font-medium">{type.label}</div>
                <div className="text-xs opacity-75">{type.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Paramètres de simulation */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Capital Initial</label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100000"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Volatilité Cible (%)</label>
            <input
              type="number"
              value={volatilityTarget}
              onChange={(e) => setVolatilityTarget(Number(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="15"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Nb Simulations</label>
            <input
              type="number"
              value={nbSimulations}
              onChange={(e) => setNbSimulations(Number(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1000"
            />
          </div>
        </div>
      </div>

      {/* Bouton de lancement */}
      <div className="space-y-3">
        <button
          onClick={handleSimulation}
          disabled={isRunning}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
            isRunning
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {isRunning ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Simulation en cours...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>🚀 Lancer la Simulation</span>
            </div>
          )}
        </button>
        
        {isRunning && (
          <div className="text-center">
            <p className="text-sm text-slate-400">Calcul des métriques de performance...</p>
          </div>
        )}
      </div>

      {/* Informations sur la simulation */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-slate-300 mb-2">ℹ️ Informations</h4>
        <div className="text-xs text-slate-400 space-y-1">
          <p>• Simulation sur 252 jours de trading</p>
          <p>• Volatilité cible: {volatilityTarget}%</p>
          <p>• Capital initial: {capital.toLocaleString('fr-FR')} €</p>
          <p>• Nombre de simulations: {nbSimulations}</p>
        </div>
      </div>
    </div>
  );
}
