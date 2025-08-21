// ✅ COMPOSANT : SimulateurMulti.tsx
// 📍 Emplacement : /components/SimulateurMulti.tsx
// 🧪 Interface principale du simulateur multi-actifs - DESIGN MODERNE

'use client';

import { useState } from 'react';
import RiskSummary from '@/components/RiskSummary';
import EquityChart from '@/components/EquityChart';
import LaunchSimulation from '@/components/LaunchSimulation';
import KPIReport from '@/components/KPIReport';
// import UniverseSelector from '@/components/UniverseSelector';
// import VolatilityTargeter from '@/components/VolatilityTargeter';
import ResetStore from '@/components/ResetStore';
import PresetsLoader from '@/components/PresetsLoader';

export default function SimulateurMulti() {
  const [activeTab, setActiveTab] = useState<'overview' | 'simulation' | 'analysis' | 'settings'>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header Professionnel */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">📊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Simulateur Multi-Actifs Pro
                </h1>
                <p className="text-slate-400 text-sm">Plateforme de simulation avancée</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1">
                <span className="text-green-400 text-sm font-medium">🟢 En ligne</span>
              </div>
              <button className="bg-slate-700 hover:bg-slate-600 transition-colors rounded-lg px-4 py-2 text-sm">
                ⚙️ Paramètres
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation par onglets */}
      <nav className="bg-slate-800/30 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: '📊 Vue d\'ensemble', icon: '📊' },
              { id: 'simulation', label: '🚀 Simulation', icon: '🚀' },
              { id: 'analysis', label: '📈 Analyse', icon: '📈' },
              { id: 'settings', label: '⚙️ Configuration', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-600'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPIs en temps réel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">CAGR</p>
                    <p className="text-2xl font-bold text-blue-100">12.5%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-300 text-sm font-medium">Max Drawdown</p>
                    <p className="text-2xl font-bold text-red-100">-8.2%</p>
                  </div>
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📉</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">Sharpe Ratio</p>
                    <p className="text-2xl font-bold text-green-100">1.85</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">Win Rate</p>
                    <p className="text-2xl font-bold text-purple-100">68.5%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphique principal */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-100">Évolution du Capital</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">1M</button>
                  <button className="px-3 py-1 bg-blue-600 rounded text-sm">3M</button>
                  <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">1A</button>
                  <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">Tout</button>
                </div>
              </div>
              <EquityChart />
            </div>

            {/* Sélecteur d'univers */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              {/* <UniverseSelector /> */}
            </div>
          </div>
        )}

        {/* Simulation */}
        {activeTab === 'simulation' && (
          <div className="space-y-8">
            {/* Configuration de simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">🎯 Paramètres de Simulation</h3>
                <div className="space-y-4">
                  {/* <VolatilityTargeter /> */}
                  <PresetsLoader />
                </div>
              </div>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">🚀 Contrôles</h3>
                <div className="space-y-4">
                  <LaunchSimulation />
                  <ResetStore />
                </div>
              </div>
            </div>

            {/* Résultats de simulation */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">📊 Résultats</h3>
              <RiskSummary out={{}} />
            </div>
          </div>
        )}

        {/* Analyse */}
        {activeTab === 'analysis' && (
          <div className="space-y-8">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">📈 Analyse Détaillée</h3>
              <KPIReport />
            </div>
          </div>
        )}

        {/* Configuration */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">⚙️ Configuration Avancée</h3>
              <p className="text-slate-400">Paramètres avancés à venir...</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/50 border-t border-slate-700/50 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center space-x-4">
              <span>📊 Simulateur Multi-Actifs Pro v2.0</span>
              <span>•</span>
              <span>Propulsé par Next.js & Zustand</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>🕐 Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
