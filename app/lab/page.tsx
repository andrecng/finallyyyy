'use client';

import ParametersPanel from '@/components/lab/ParametersPanel';
import ChartsPanel from '@/components/lab/ChartsPanel';
import KPIPanel from '@/components/lab/KPIPanel';

export default function LabPage() {
  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left Sidebar - Parameters */}
      <div className="w-80 bg-secondary border-r border-primary p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-primary">Paramètres</h2>
          <p className="text-sm text-secondary">Configuration de la simulation</p>
        </div>
        <ParametersPanel />
      </div>

      {/* Central Charts Area */}
      <div className="flex-1 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-primary">Graphiques & Résultats</h2>
          <p className="text-sm text-secondary">Visualisation des simulations Monte-Carlo</p>
        </div>
        <ChartsPanel />
      </div>

      {/* Right Sidebar - KPIs */}
      <div className="w-80 bg-secondary border-l border-primary p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-primary">KPIs & Guardrails</h2>
          <p className="text-sm text-secondary">Métriques et contrôles de risque</p>
        </div>
        <KPIPanel />
      </div>
    </div>
  );
}