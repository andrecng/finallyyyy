// ✅ COMPOSANT : EquityChart.tsx
// 📍 Emplacement : /components/EquityChart.tsx
// 📈 Affiche l'évolution du capital avec design moderne

'use client';

import { useSimStore } from '@/stores/simStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function EquityChart() {
  const equity = useSimStore((state) => state.equitySeries);
  
  // Données par défaut si pas d'équité
  const defaultData = Array.from({ length: 100 }, (_, i) => ({
    day: i,
    equity: 100000 * (1 + Math.sin(i / 10) * 0.05),
    benchmark: 100000 * (1 + i * 0.0005), // Benchmark linéaire
    drawdown: 0
  }));

  const data = equity.length > 0 
    ? equity.map((val, i) => ({
        day: i,
        equity: val,
        benchmark: 100000 * (1 + i * 0.0005),
        drawdown: i === 0 ? 0 : ((Math.max(...equity.slice(0, i + 1)) - val) / Math.max(...equity.slice(0, i + 1)) * 100)
      }))
    : defaultData;

  // Configuration du tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg backdrop-blur-sm">
          <p className="text-slate-300 text-sm font-medium">Jour {label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-blue-400 text-sm">
              Capital: <span className="font-bold">{payload[0]?.value?.toLocaleString('fr-FR')} €</span>
            </p>
            {payload[1] && (
              <p className="text-green-400 text-sm">
                Benchmark: <span className="font-bold">{payload[1]?.value?.toLocaleString('fr-FR')} €</span>
              </p>
            )}
            {payload[2] && (
              <p className="text-red-400 text-sm">
                Drawdown: <span className="font-bold">{payload[2]?.value?.toFixed(2)}%</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Graphique principal */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            
            <XAxis 
              dataKey="day" 
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Ligne de benchmark */}
            <Area
              type="monotone"
              dataKey="benchmark"
              stroke="#10b981"
              strokeWidth={1}
              fill="url(#benchmarkGradient)"
              fillOpacity={0.3}
              dot={false}
            />
            
            {/* Ligne principale d'équité */}
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#equityGradient)"
              fillOpacity={0.6}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Métriques rapides */}
      {equity.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Capital Final</p>
                <p className="text-xl font-bold text-blue-400">
                  {equity[equity.length - 1]?.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Performance</p>
                <p className={`text-xl font-bold ${
                  equity[equity.length - 1] > equity[0] ? 'text-green-400' : 'text-red-400'
                }`}>
                  {((equity[equity.length - 1] / equity[0] - 1) * 100).toFixed(2)}%
                </p>
              </div>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Période</p>
                <p className="text-xl font-bold text-purple-400">
                  {equity.length} jours
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">📅</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graphique du drawdown */}
      {equity.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-4">📉 Évolution du Drawdown</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(value) => `${value.toFixed(1)}%`} />
                <Tooltip 
                  content={({ active, payload, label }) => 
                    active && payload && payload.length ? (
                      <div className="bg-slate-800 border border-slate-600 rounded p-2 text-xs">
                        <p>Jour {label}: {Number(payload[0]?.value)?.toFixed(2)}%</p>
                      </div>
                    ) : null
                  }
                />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="#ef4444"
                  fillOpacity={0.2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
