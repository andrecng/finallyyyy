'use client';

import ParametersPanel from '@/components/lab/ParametersPanel';
import ChartsPanel from '@/components/lab/ChartsPanel';
import KPIPanel from '@/components/lab/KPIPanel';
import MonteCarloPanel from '@/components/lab/MonteCarloPanel';

export default function LabPage() {
  return (
    <div className="h-[calc(100vh-128px)] p-6 bg-background">
      {/* Header Dashboard */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">🎯 Laboratoire de Simulation Trading</h1>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-12 gap-4 h-full">
        
        {/* Left Column - Paramètres & Monte-Carlo */}
        <div className="col-span-3 space-y-4">
          {/* Paramètres */}
          <div className="bg-white border-2 border-primary/20 rounded-lg p-4 h-1/2 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-3">⚙️ Paramètres</h3>
            <ParametersPanel />
          </div>
          
          {/* Monte-Carlo Compact */}
          <div className="bg-white border-2 border-primary/20 rounded-lg p-4 h-1/2 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-3">🎲 Monte-Carlo</h3>
            <MonteCarloPanel />
          </div>
        </div>

        {/* Center Column - Graphiques Principaux */}
        <div className="col-span-6 space-y-4">
          {/* Courbe d'Equity */}
          <div className="bg-white border-2 border-success/20 rounded-lg p-4 h-1/2 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-3">📈 Courbe d'Equity</h3>
            <div className="h-full">
              <ChartsPanel />
            </div>
          </div>
          
          {/* Distribution & Drawdown */}
          <div className="bg-white border-2 border-warning/20 rounded-lg p-4 h-1/2 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-3">📊 Distribution & Risque</h3>
            <div className="h-full">
              <ChartsPanel />
            </div>
          </div>
        </div>

        {/* Right Column - KPIs & Indicateurs */}
        <div className="col-span-3 space-y-4">
          {/* KPIs */}
          <div className="bg-white border-2 border-info/20 rounded-lg p-4 h-1/2 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-3">📊 KPIs</h3>
            <KPIPanel />
          </div>
          
          {/* Indicateurs Techniques */}
          <div className="bg-white border-2 border-border rounded-lg p-4 h-1/2 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-3">🔧 Indicateurs</h3>
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>Indicateurs techniques</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}