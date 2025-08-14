'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BacktestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-cyan-500 mb-4">
            📊 Backtest Historique
          </h1>
          <p className="text-2xl text-gray-300 mb-8">Validation de stratégies sur données historiques</p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto rounded-full"></div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-600">📋 Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-600">📈 Analyse</TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-purple-600">🔄 Comparaison</TabsTrigger>
            <TabsTrigger value="walkforward" className="data-[state=active]:bg-orange-600">🚶 Walk-Forward</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-green-500/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-green-400">📊 Données Historiques</CardTitle>
                  <CardDescription className="text-gray-300">Accès aux données de marché</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">Importez et gérez vos données historiques</p>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    📁 Importer Données
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-blue-500/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-blue-400">🎯 Stratégies</CardTitle>
                  <CardDescription className="text-gray-300">Gestion des stratégies</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">Créez et modifiez vos stratégies</p>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    ✏️ Créer Stratégie
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-purple-500/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-purple-400">⚡ Exécution</CardTitle>
                  <CardDescription className="text-gray-300">Lancement des backtests</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">Lancez vos simulations</p>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    🚀 Lancer Backtest
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-cyan-400">📋 Résultats Récents</CardTitle>
                <CardDescription className="text-gray-300">Vos derniers backtests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-400 text-lg mb-2">Aucun backtest effectué</p>
                  <p className="text-gray-500">Commencez par importer des données et créer une stratégie</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-blue-400">📈 Analyse des Performances</CardTitle>
                <CardDescription className="text-gray-300">Métriques et indicateurs de performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">0%</div>
                    <div className="text-sm text-gray-400">Sharpe Ratio</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">0%</div>
                    <div className="text-sm text-gray-400">Max Drawdown</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">0</div>
                    <div className="text-sm text-gray-400">Trades</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-400">0%</div>
                    <div className="text-sm text-gray-400">Win Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-purple-400">🔄 Comparaison Multi-Périodes</CardTitle>
                <CardDescription className="text-gray-300">Analyse comparative sur différentes périodes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔄</div>
                  <p className="text-gray-400 text-lg">Fonctionnalité en développement</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="walkforward" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-orange-400">🚶 Walk-Forward Analysis</CardTitle>
                <CardDescription className="text-gray-300">Validation temporelle des stratégies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚶</div>
                  <p className="text-gray-400 text-lg">Fonctionnalité en développement</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}