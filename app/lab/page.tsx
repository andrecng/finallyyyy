'use client';

import ParametersPanel from '@/components/lab/ParametersPanel';
import ChartsPanel from '@/components/lab/ChartsPanel';
import KPIPanel from '@/components/lab/KPIPanel';
import MonteCarloPanel from '@/components/lab/MonteCarloPanel';

export default function LabPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Dashboard */}
        <div className="text-center">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4">
            🎯 Laboratoire de Simulation
          </h1>
          <p className="text-2xl text-gray-300 mb-8">Testez et optimisez vos stratégies trading</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-12 gap-6 h-full">
          
          {/* Left Column - Paramètres & Monte-Carlo */}
          <div className="col-span-3 space-y-6">
            {/* Paramètres */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 shadow-lg hover:border-blue-500/30 transition-all duration-300">
              <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
                ⚙️ Paramètres
              </h3>
              <ParametersPanel />
            </div>
            
            {/* Monte-Carlo Compact */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 shadow-lg hover:border-purple-500/30 transition-all duration-300">
              <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
                🎲 Monte-Carlo
              </h3>
              <MonteCarloPanel />
            </div>
          </div>

          {/* Center Column - Graphiques Principaux */}
          <div className="col-span-6 space-y-6">
            {/* Courbe d'Equity */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 shadow-lg hover:border-green-500/30 transition-all duration-300">
              <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                📈 Courbe d'Equity
              </h3>
              <div className="h-full">
                <ChartsPanel />
              </div>
            </div>
            
            {/* Distribution & Drawdown */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 shadow-lg hover:border-orange-500/30 transition-all duration-300">
              <h3 className="text-xl font-semibold text-orange-400 mb-4 flex items-center gap-2">
                📊 Distribution & Risque
              </h3>
              <div className="h-full">
                <ChartsPanel />
              </div>
            </div>
          </div>

          {/* Right Column - KPIs & Indicateurs */}
          <div className="col-span-3 space-y-6">
            {/* KPIs */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 shadow-lg hover:border-cyan-500/30 transition-all duration-300">
              <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                📊 KPIs
              </h3>
              <KPIPanel />
            </div>
            
            {/* Indicateurs Techniques */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 shadow-lg hover:border-pink-500/30 transition-all duration-300">
              <h3 className="text-xl font-semibold text-pink-400 mb-4 flex items-center gap-2">
                🔧 Indicateurs
              </h3>
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">🔧</div>
                  <p className="text-gray-400">Indicateurs techniques</p>
                  <p className="text-sm text-gray-500 mt-2">En développement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}