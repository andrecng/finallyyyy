"use client";

import React, { useState } from "react";
import { PresetV1 } from "@/engine/facade";
import { addRun, hashPayload, shortHash } from "@/app/lib/runJournal";
import { setWorkspacePayload } from "@/app/lib/workspacePayload";
import { suggestPresetName, addPreset } from "@/app/lib/presets";
import PresetSaver from "./components/PresetSaver";

type SearchRange = {
  min: number;
  max: number;
  step: number;
};

type SearchConfig = {
  [key: string]: SearchRange;
};

type SearchResult = {
  preset: PresetV1;
  score: number;
  kpis: any;
  mc?: any;
};

export default function OptimizePage() {
  const [searchConfig, setSearchConfig] = useState<SearchConfig>({
    "modules.VolatilityTarget.vt_target_vol": { min: 0.05, max: 0.20, step: 0.02 },
    "modules.VolatilityTarget.vt_halflife": { min: 10, max: 30, step: 5 },
    "modules.KellyCap.cap_mult": { min: 0.3, max: 0.7, step: 0.1 },
  });
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [topK, setTopK] = useState(10);

  // Fonction utilitaire pour accéder aux propriétés imbriquées
  function setNestedValue(obj: any, path: string, value: any) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }

  function getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    return current;
  }

  // Génère toutes les combinaisons de paramètres
  function generateCombinations(): PresetV1[] {
    const combinations: PresetV1[] = [];
    
    // Base preset
    const basePreset: PresetV1 = {
      schema_version: "1.0",
      name: "search_result",
      seed: 1337,
      total_steps: 2000,
      mu: 0.0,
      fees_per_trade: 0.0002,
      modules: {
        VolatilityTarget: { vt_target_vol: 0.10, vt_halflife: 16 },
        CPPIFreeze: { alpha: 0.20, freeze_frac: 0.05 },
        KellyCap: { cap_mult: 0.50 },
        SoftBarrier: { enabled: true, steps: [1,2,3], haircuts: [0.7,0.5,0.3] },
        FTMOGate: { enabled: true, daily_limit: 0.02, total_limit: 0.10, spend_rate: 0.35, lmax_vol_aware: "p50" }
      }
    };

    // Calculer le nombre total de combinaisons
    let totalCombinations = 1;
    for (const range of Object.values(searchConfig)) {
      const steps = Math.floor((range.max - range.min) / range.step) + 1;
      totalCombinations *= steps;
    }

    // Générer toutes les combinaisons
    function generateRecursive(currentPreset: PresetV1, paramIndex: number) {
      if (paramIndex >= Object.keys(searchConfig).length) {
        combinations.push({ ...currentPreset });
        return;
      }

      const paramPath = Object.keys(searchConfig)[paramIndex];
      const range = searchConfig[paramPath];
      
      for (let value = range.min; value <= range.max; value += range.step) {
        const newPreset = JSON.parse(JSON.stringify(currentPreset));
        setNestedValue(newPreset, paramPath, value);
        generateRecursive(newPreset, paramIndex + 1);
      }
    }

    generateRecursive(basePreset, 0);
    return combinations;
  }

  async function runSearch() {
    setIsSearching(true);
    setSearchProgress(0);
    setResults([]);

    const combinations = generateCombinations();
    const results: SearchResult[] = [];

    console.log(`Lancement de la recherche sur ${combinations.length} combinaisons...`);

    for (let i = 0; i < combinations.length; i++) {
      const preset = combinations[i];
      
      try {
        // Simulation simple (pas Monte Carlo pour accélérer)
        const response = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preset),
        });
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        // Calcul du score (exemple simple)
        const score = calculateScore(data);
        
        results.push({
          preset,
          score,
          kpis: data.kpis || {},
          mc: data.mc,
        });

        // Mise à jour du progrès
        setSearchProgress((i + 1) / combinations.length);
        
        // Log dans le journal
        const payloadHash = hashPayload(preset);
        addRun({
          id: `${new Date().toISOString()}-sweep-${shortHash(payloadHash)}`,
          ts: new Date().toISOString(),
          type: "sweep",
          presetName: preset.name,
          payloadHash,
          payload: preset,
          gist: {
            score,
            max_dd_total: data.max_dd_total,
            pass_target: data.kpis?.target_pass,
            violations_daily: data.violations_daily,
          },
        });

      } catch (error) {
        console.error(`Erreur sur la combinaison ${i}:`, error);
      }
    }

    // Trier par score et garder le top-K
    results.sort((a, b) => b.score - a.score);
    setResults(results.slice(0, topK));
    setIsSearching(false);
    setSearchProgress(1);
  }

  function calculateScore(data: any): number {
    // Score basé sur les KPIs (exemple)
    let score = 0;
    
    if (data.kpis?.target_pass) score += 50; // Bonus pour passer la cible
    if (data.max_dd_total < 0.05) score += 30; // Bonus pour DD faible
    if (data.violations_daily === 0) score += 20; // Bonus pour pas de violations
    
    // Score basé sur le rendement
    if (data.kpis?.cagr) {
      score += Math.min(data.kpis.cagr * 100, 50); // Max 50 points pour le rendement
    }
    
    return score;
  }

  function savePreset(preset: PresetV1) {
    // Copier dans le clipboard
    const presetJson = JSON.stringify(preset, null, 2);
    navigator.clipboard.writeText(presetJson);
    alert("Preset copié dans le clipboard !");
  }

  function setAsWorkspace(preset: PresetV1) {
    // Sauvegarder dans le workspace
    setWorkspacePayload(preset);
    alert("Preset défini comme workspace ! Rechargez la page workspace pour l'appliquer.");
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Auto-Search</h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <a 
              href="/workspace" 
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              ← Workspace
            </a>
            <a 
              href="/presets" 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
            >
              Bibliothèque
            </a>
          </div>
          <div className="text-xs text-gray-500">
            {isSearching ? `Recherche en cours... ${Math.round(searchProgress * 100)}%` : "Prêt"}
          </div>
        </div>
      </div>

      {/* Configuration des ranges */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Configuration des Ranges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(searchConfig).map(([paramPath, range]) => (
            <div key={paramPath} className="border rounded-lg p-4 space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {paramPath}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  step="any"
                  value={range.min}
                  onChange={(e) => setSearchConfig(prev => ({
                    ...prev,
                    [paramPath]: { ...prev[paramPath], min: parseFloat(e.target.value) || 0 }
                  }))}
                  className="border rounded px-2 py-1 text-sm"
                  placeholder="Min"
                />
                <input
                  type="number"
                  step="any"
                  value={range.max}
                  onChange={(e) => setSearchConfig(prev => ({
                    ...prev,
                    [paramPath]: { ...prev[paramPath], max: parseFloat(e.target.value) || 0 }
                  }))}
                  className="border rounded px-2 py-1 text-sm"
                  placeholder="Max"
                />
                <input
                  type="number"
                  step="any"
                  value={range.step}
                  onChange={(e) => setSearchConfig(prev => ({
                    ...prev,
                    [paramPath]: { ...prev[paramPath], step: parseFloat(e.target.value) || 0.01 }
                  }))}
                  className="border rounded px-2 py-1 text-sm"
                  placeholder="Step"
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={runSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSearching ? "Recherche..." : "Lancer la Recherche"}
          </button>
          
          <div className="flex items-center gap-2">
            <label className="text-sm">Top-K:</label>
            <input
              type="number"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value) || 10)}
              className="border rounded px-2 py-1 w-16 text-sm"
              min="1"
              max="100"
            />
          </div>
        </div>
      </section>

      {/* Barre de progression */}
      {isSearching && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${searchProgress * 100}%` }}
          />
        </div>
      )}

      {/* Résultats */}
      {results.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Top {topK} Résultats</h2>
          
          {/* PresetSaver pour le meilleur résultat */}
          <PresetSaver
            disabled={isSearching}
            getPreset={() => results[0] ? {
              name: results[0].preset.name,
              payload: results[0].preset,
              meta: { score: results[0].score, kpis: results[0].kpis, mc: results[0].mc }
            } : null}
          />
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-left">Score</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Paramètres</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">KPIs</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-3 py-2">
                      <span className="font-mono text-lg">{result.score.toFixed(1)}</span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <details>
                        <summary className="cursor-pointer text-sm">Voir paramètres</summary>
                        <pre className="text-xs mt-2 whitespace-pre-wrap">
                          {JSON.stringify(result.preset, null, 2)}
                        </pre>
                      </details>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <details>
                        <summary className="cursor-pointer text-sm">Voir KPIs</summary>
                        <pre className="text-xs mt-2 whitespace-pre-wrap">
                          {JSON.stringify(result.kpis, null, 2)}
                        </pre>
                      </details>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => savePreset(result.preset)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Copier
                        </button>
                        <button
                          onClick={() => setAsWorkspace(result.preset)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Set as Workspace
                        </button>
                        <button
                          onClick={() => {
                            const name = suggestPresetName({
                              score: result.score,
                              pass_rate_full: result.mc?.pass_rate_full,
                              payload: result.preset,
                            });
                            addPreset({ 
                              name, 
                              payload: result.preset, 
                              meta: { 
                                score: result.score, 
                                kpis: result.kpis, 
                                mc: result.mc 
                              } 
                            });
                            alert(`Preset enregistré: ${name}`);
                          }}
                          className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                        >
                          Enregistrer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
