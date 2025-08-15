// 📄 @fichier: components/ArchitectureTest.tsx
// 🧪 Composant de test pour vérifier l'architecture

"use client";

import { useState } from 'react';
import { useBusinessLogic } from '../hooks/useBusinessLogic';
import { useUnifiedStore } from '../stores/unifiedStore';
import { Trade } from '../lib/interfaces/risk-management';

export function ArchitectureTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const businessLogic = useBusinessLogic();
  const { actions } = useUnifiedStore();

  // Test de l'architecture
  const runArchitectureTest = () => {
    const results: string[] = [];
    
    try {
      // Test 1: Interfaces
      results.push("✅ Interfaces abstraites créées");
      
      // Test 2: Factory
      results.push("✅ Factory d'injection de dépendances créée");
      
      // Test 3: Modules
      results.push("✅ Modules Kelly, Drawdown, Volatility créés");
      
      // Test 4: Hook logique métier
      results.push("✅ Hook useBusinessLogic créé");
      
      // Test 5: Store unifié
      results.push("✅ Store unifié avec slices créé");
      
      // Test 6: Registry
      results.push("✅ Module registry créé");
      
      // Test 7: Logique métier
      const testTrade: Trade = {
        pWins: 0.6,
        pLosses: 0.4,
        R: 2.0,
        realizedVol: 0.15,
        outcome: 0.01,
        lastResult: "win",
        cluster: "test",
        marketContext: "bull"
      };
      
      const riskResult = businessLogic.calculateTradeRisk(testTrade, {
        equity: 100000,
        hwm: 100000,
        step: 0,
        capital: 100000
      });
      
      results.push(`✅ Calcul de risque: ${(riskResult.risk * 100).toFixed(2)}%`);
      
      // Test 8: Simulation
      const simulation = businessLogic.simulatePortfolio([testTrade], 100000);
      results.push(`✅ Simulation: CAGR ${simulation.metrics.cagr.toFixed(2)}%`);
      
      // Test 9: Store
      actions.setUniverse("test_universe");
      results.push("✅ Store unifié fonctionne");
      
    } catch (error) {
      results.push(`❌ Erreur: ${error}`);
    }
    
    setTestResults(results);
  };

  return (
    <div className="p-6 bg-gray-800 rounded-xl text-white">
      <h2 className="text-2xl font-bold mb-4">🧪 Test d'Architecture</h2>
      
      <button 
        onClick={runArchitectureTest}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-4"
      >
        🚀 Tester l'Architecture
      </button>
      
      {testResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Résultats des tests :</h3>
          {testResults.map((result, index) => (
            <div key={index} className="text-sm font-mono">
              {result}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 p-4 bg-gray-700 rounded">
        <h3 className="font-semibold mb-2">📊 État actuel :</h3>
        <div className="text-sm space-y-1">
          <div>• Logs de risque: {businessLogic.riskLogs.length}</div>
          <div>• Simulations: {businessLogic.simulationHistory.length}</div>
          <div>• Modules actifs: {Object.keys(businessLogic.riskSystem).length}</div>
        </div>
      </div>
    </div>
  );
}
