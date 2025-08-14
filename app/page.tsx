'use client';

import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4">
            🧠 André le Grand MM Engine
          </h1>
          <p className="text-2xl text-gray-300 mb-8">Moteur de Money Management modulaire et avancé</p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Navigation rapide */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              onClick={() => window.location.href = '/andre-le-grand'} 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 text-lg font-semibold"
            >
              🧠 ANDRE'S BRAIN
            </Button>
            <Button 
              onClick={() => window.location.href = '/lab'} 
              variant="outline" 
              className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white px-6 py-3 text-lg font-semibold"
            >
              🎯 Laboratoire
            </Button>
            <Button 
              onClick={() => window.location.href = '/backtest'} 
              variant="outline" 
              className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white px-6 py-3 text-lg font-semibold"
            >
              📊 Backtest
            </Button>
            <Button 
              onClick={() => window.location.href = '/ftmo'} 
              variant="outline" 
              className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white px-6 py-3 text-lg font-semibold"
            >
              🎯 FTMO
            </Button>
          </div>
        </div>

        {/* Section principale - André le Grand */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
            🧠 ANDRE'S BRAIN - Moteur de Money Management
          </h2>
          <p className="text-lg text-gray-300 mb-6">Système avancé de gestion des risques et position sizing pour 2048 Asset Management</p>
          <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-purple-500/30 transition-all duration-300 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Moteur Modulaire</h3>
              <p className="text-gray-300 mb-6">
                Calcul Kelly optimisé, séquences anti-martingale, cible de volatilité, 
                et contrôle de risque avec paliers de drawdown.
              </p>
              <Button 
                onClick={() => window.location.href = '/andre-le-grand'} 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-3"
              >
                🚀 Accéder au Moteur
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Section outils */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-300 mb-6">🛠️ Outils et Modules</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-blue-500/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-blue-400">🎯 Laboratoire</CardTitle>
              <CardDescription className="text-gray-300">Simulations et analyses avancées</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Accédez au laboratoire de simulation pour tester vos stratégies</p>
              <Button 
                onClick={() => window.location.href = '/lab'} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                🚀 Accéder au Lab
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-green-500/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-green-400">📊 Backtest</CardTitle>
              <CardDescription className="text-gray-300">Validation historique des stratégies</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Testez vos stratégies sur des données historiques</p>
              <Button 
                onClick={() => window.location.href = '/backtest'} 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                📈 Lancer Backtest
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-orange-500/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-orange-400">🎯 FTMO</CardTitle>
              <CardDescription className="text-gray-300">Mode prop firm</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Configuration spéciale pour les prop firms</p>
              <Button 
                onClick={() => window.location.href = '/ftmo'} 
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                🎯 Mode FTMO
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-cyan-500/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-cyan-400">📡 Live Trading</CardTitle>
              <CardDescription className="text-gray-300">Exécution en temps réel</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Trading en direct avec exécution automatique</p>
              <Button 
                onClick={() => window.location.href = '/live'} 
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
              >
                📡 Mode Live
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-yellow-500/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-yellow-400">📈 Historique</CardTitle>
              <CardDescription className="text-gray-300">Journal et archive</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Documentez et analysez vos expériences</p>
              <Button 
                onClick={() => window.location.href = '/history'} 
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                📝 Voir Historique
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-pink-500/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-pink-400">⚙️ Paramètres</CardTitle>
              <CardDescription className="text-gray-300">Configuration générale</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Personnalisez votre expérience</p>
              <Button 
                onClick={() => window.location.href = '/settings'} 
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              >
                ⚙️ Configurer
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-6 py-3">
            <Badge variant="secondary" className="bg-blue-600 text-white">🚀</Badge>
            <span className="text-gray-300">Plateforme en développement actif</span>
            <Badge variant="outline" className="border-green-500 text-green-400">Beta</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}