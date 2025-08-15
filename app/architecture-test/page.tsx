// 📄 @fichier: app/architecture-test/page.tsx
// 🧪 Page de test de l'architecture avec layout unifié

import { UnifiedLayout } from '../../components/layout/UnifiedLayout';
import { ArchitectureTest } from '../../components/ArchitectureTest';

export default function ArchitectureTestPage() {
  return (
    <UnifiedLayout 
      title="🧪 Test d'Architecture Modulaire"
      description="Vérification complète de l'architecture modulaire"
      showArchitectureTest={true}
    >
      <div className="max-w-4xl mx-auto">
        {/* Informations sur l'architecture */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">📋 Architecture Implémentée :</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-blue-400">✅ Interfaces Abstraites</h3>
              <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                <li>• RiskCalculator</li>
                <li>• DrawdownManager</li>
                <li>• VolatilityTargeter</li>
                <li>• PositionSizer</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-green-400">✅ Injection de Dépendances</h3>
              <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                <li>• RiskFactory</li>
                <li>• ModuleRegistry</li>
                <li>• Singleton Pattern</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400">✅ Séparation UI/Logique</h3>
              <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                <li>• useBusinessLogic Hook</li>
                <li>• Logique métier pure</li>
                <li>• Composants UI isolés</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-purple-400">✅ Store Unifié</h3>
              <ul className="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Zustand avec slices</li>
                <li>• État centralisé</li>
                <li>• Actions typées</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Composant de test */}
        <ArchitectureTest />
        
        {/* Prochaines étapes */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">🚀 Prochaines Étapes :</h2>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div>• Adapter les composants existants aux nouvelles interfaces</div>
            <div>• Migrer vers le store unifié</div>
            <div>• Ajouter les 4 nouveaux modules</div>
            <div>• Tests unitaires pour chaque module</div>
            <div>• Interface unifiée sur toutes les pages</div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}
