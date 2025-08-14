'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LivePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mb-4">
            📡 Live & Exécution
          </h1>
          <p className="text-2xl text-gray-300 mb-8">Trading en direct avec exécution automatique</p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
        </div>

        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="connection" className="data-[state=active]:bg-cyan-600">🔌 Connection</TabsTrigger>
            <TabsTrigger value="execution" className="data-[state=active]:bg-blue-600">⚡ Exécution</TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-purple-600">📊 Monitoring</TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-green-600">🔔 Alertes</TabsTrigger>
          </TabsList>

          <TabsContent value="connection" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-cyan-500/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-cyan-400">🔌 MT4/MT5</CardTitle>
                  <CardDescription className="text-gray-300">Connection MetaTrader</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="server" className="text-gray-300">Serveur</Label>
                      <Input
                        id="server"
                        placeholder="demo.mt4.com"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="account" className="text-gray-300">Compte</Label>
                      <Input
                        id="account"
                        type="number"
                        placeholder="12345678"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-gray-300">Mot de passe</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                      🔌 Se connecter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-blue-500/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-blue-400">📊 Statut Connection</CardTitle>
                  <CardDescription className="text-gray-300">État de la connection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-gray-300">MT4/MT5</span>
                      <Badge variant="destructive" className="bg-red-600 text-white">🔴 Déconnecté</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-gray-300">API Trading</span>
                      <Badge variant="destructive" className="bg-red-600 text-white">🔴 Inactif</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-gray-300">Données temps réel</span>
                      <Badge variant="destructive" className="bg-red-600 text-white">🔴 Non disponible</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="execution" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-blue-400">⚡ Exécution Automatique</CardTitle>
                <CardDescription className="text-gray-300">Configuration des ordres automatiques</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">✅</div>
                    <div className="text-sm text-gray-400">Auto-Entry</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">⚠️</div>
                    <div className="text-sm text-gray-400">Auto-Exit</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">🚫</div>
                    <div className="text-sm text-gray-400">Risk Management</div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    ⚡ Activer Exécution Auto
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-purple-400">📊 Monitoring Temps Réel</CardTitle>
                <CardDescription className="text-gray-300">Suivi des positions et performances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-400 text-lg">Monitoring en développement</p>
                  <p className="text-gray-500 text-sm">Suivi des positions en temps réel</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-green-400">🔔 Alertes & Notifications</CardTitle>
                <CardDescription className="text-gray-300">Configuration des alertes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Alertes de trade</span>
                    <Badge variant="secondary" className="bg-green-600 text-white">✅ Activé</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Notifications push</span>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-400">⚠️ Configuré</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Alertes email</span>
                    <Badge variant="outline" className="border-gray-500 text-gray-400">📧 Désactivé</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Alertes de risque</span>
                    <Badge variant="secondary" className="bg-red-600 text-white">🚨 Activé</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}