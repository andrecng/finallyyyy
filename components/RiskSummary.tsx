// ✅ COMPOSANT : RiskSummary.tsx
// 📍 Emplacement : /components/RiskSummary.tsx
// 📊 Affiche les métriques issues de simStore avec design moderne

'use client';

import { useSimStore } from '@/stores/simStore';

export default function RiskSummary() {
  const metrics = useSimStore((state) => state.metrics);

  const metricCards = [
    {
      label: 'CAGR',
      value: (metrics.CAGR * 100).toFixed(2),
      unit: '%',
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-100',
      icon: '📈',
      description: 'Croissance annuelle composée'
    },
    {
      label: 'Max Drawdown',
      value: (metrics.MaxDD * 100).toFixed(2),
      unit: '%',
      color: 'from-red-500/20 to-red-600/20',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-100',
      icon: '📉',
      description: 'Perte maximale historique'
    },
    {
      label: 'Sortino Ratio',
      value: metrics.Sortino.toFixed(2),
      unit: '',
      color: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-100',
      icon: '🎯',
      description: 'Ratio de rendement ajusté au risque'
    },
    {
      label: 'Win Rate',
      value: (metrics.WinRate * 100).toFixed(2),
      unit: '%',
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-100',
      icon: '🏆',
      description: 'Pourcentage de trades gagnants'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${metric.color} ${metric.borderColor} border rounded-xl p-4 backdrop-blur-sm hover:scale-105 transition-all duration-200 cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-xl">{metric.icon}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-300 font-medium">{metric.label}</p>
                <p className={`text-2xl font-bold ${metric.textColor}`}>
                  {metric.value}{metric.unit}
                </p>
              </div>
            </div>
            
            {/* Tooltip au survol */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {metric.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Barre de progression globale */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-slate-300">Score de Performance Global</h4>
          <span className="text-sm text-slate-400">75/100</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: '75%' }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>Faible</span>
          <span>Moyen</span>
          <span>Élevé</span>
        </div>
      </div>
    </div>
  );
}
