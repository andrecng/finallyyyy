// 📄 @fichier: app/modules/page.tsx
// 🧩 Page des modules avec layout unifié

import { UnifiedLayout } from '../../components/layout/UnifiedLayout';

export default function ModulesPage() {
  return (
    <UnifiedLayout 
      title="🧩 Modules de Risk Management"
      description="Gestion des modules de calcul de risque"
    >
      <div className="max-w-4xl mx-auto">
        {/* Liste des modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Module Kelly */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-xl">🧮</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Kelly Calculator</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Calcul de la taille de position optimale selon la formule de Kelly fractionnée.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              <div>• Cap configurable</div>
              <div>• Probabilité de gain</div>
              <div>• Ratio gain/perte</div>
            </div>
          </div>

          {/* Module Drawdown */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <span className="text-xl">📉</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Drawdown Manager</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Gestion dynamique du risque selon les paliers de drawdown.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              <div>• Paliers configurables</div>
              <div>• Hystérésis</div>
              <div>• High Water Mark</div>
            </div>
          </div>

          {/* Module Volatility */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Volatility Target</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Ajustement de la taille selon la volatilité observée.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              <div>• Volatilité cible</div>
              <div>• Lookback configurable</div>
              <div>• Cap multiplicateur</div>
            </div>
          </div>

          {/* Module Logger */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Risk Logger</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Enregistrement et analyse des décisions de risque.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              <div>• Logs structurés</div>
              <div>• Analyse des performances</div>
              <div>• Audit trail</div>
            </div>
          </div>
        </div>

        {/* Statut des modules */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📊 Statut des Modules</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">4</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Modules Actifs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Interface Complète</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">✅</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tests Passés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">4</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Nouveaux Prévus</div>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}
