// 📄 @fichier: components/layout/UnifiedLayout.tsx
// 🏗️ Layout unifié pour toutes les pages

"use client";

import { ReactNode } from 'react';
import { useUI, useActions } from '../../hooks';

interface UnifiedLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  showArchitectureTest?: boolean;
}

export function UnifiedLayout({ 
  children, 
  title, 
  description, 
  showArchitectureTest = false 
}: UnifiedLayoutProps) {
  const { theme, activeTab } = useUI();
  const { setTheme, setActiveTab } = useActions();

  const tabs = [
    { id: 'simulation', label: 'Simulation', icon: '📊' },
    { id: 'risk', label: 'Risk Management', icon: '🛡️' },
    { id: 'modules', label: 'Modules', icon: '🧩' },
    { id: 'config', label: 'Configuration', icon: '⚙️' },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header unifié */}
      <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo et titre */}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FondForex Money Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {description || 'Plateforme de trading avancée'}
                </p>
              </div>
            </div>

            {/* Contrôles */}
            <div className="flex items-center gap-4">
              {/* Sélecteur de thème */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </button>
            </div>
          </div>

          {/* Navigation par onglets */}
          <nav className="mt-4">
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-6 py-8">
        {/* Titre de page */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>

        {/* Test d'architecture optionnel */}
        {showArchitectureTest && (
          <div className="mb-8">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🧪 Test d'Architecture
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Cette page utilise le layout unifié. Cliquez sur "Tester l'Architecture" pour vérifier que tout fonctionne.
              </p>
            </div>
          </div>
        )}

        {/* Contenu de la page */}
        <div className="space-y-8">
          {children}
        </div>
      </main>

      {/* Footer unifié */}
      <footer className="bg-white/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">2</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                © 2024 FondForex Money Management
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Version 1.0.0
              </span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Architecture Modulaire
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
