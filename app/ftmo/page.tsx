'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FTMOPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 mb-4">
            🎯 Mode FTMO
          </h1>
          <p className="text-2xl text-gray-300 mb-8">Configuration spéciale pour les prop firms</p>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-red-500 mx-auto rounded-full"></div>
        </div>

        <Tabs defaultValue="rules" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="rules" className="data-[state=active]:bg-orange-600">📋 Règles</TabsTrigger>
            <TabsTrigger value="validation" className="data-[state=active]:bg-red-600">✅ Validation</TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-pink-600">📊 Monitoring</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">⚙️ Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-orange-500/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-orange-400">📊 Daily Drawdown</CardTitle>
                  <CardDescription className="text-gray-300">Limite journalière de perte</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="daily-dd" className="text-gray-300">Limite DD journalière (%)</Label>
                      <Input
                        id="daily-dd"
                        type="number"
                        defaultValue="5"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <Badge variant="outline" className="border-orange-500 text-orange-400 w-full justify-center">
                      Limite: 5% du capital
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-red-500/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-red-400">📈 Total Drawdown</CardTitle>
                  <CardDescription className="text-gray-300">Limite totale de perte</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="total-dd" className="text-gray-300">Limite DD totale (%)</Label>
                      <Input
                        id="total-dd"
                        type="number"
                        defaultValue="10"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <Badge variant="outline" className="border-red-500 text-red-400 w-full justify-center">
                      Limite: 10% du capital
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-pink-400">🎯 Règles de Trading</CardTitle>
                <CardDescription className="text-gray-300">Contraintes spécifiques FTMO</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">✅</div>
                    <div className="text-sm text-gray-400">Trading autorisé</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">⚠️</div>
                    <div className="text-sm text-gray-400">DD proche limite</div>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">🚫</div>
                    <div className="text-sm text-gray-400">Trading bloqué</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-red-400">✅ Validation FTMO/FTUK</CardTitle>
                <CardDescription className="text-gray-300">Vérification des règles prop firms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Daily DD Check</span>
                    <Badge variant="secondary" className="bg-green-600 text-white">✅ Validé</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Total DD Check</span>
                    <Badge variant="secondary" className="bg-green-600 text-white">✅ Validé</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Position Sizing</span>
                    <Badge variant="secondary" className="bg-green-600 text-white">✅ Validé</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Risk Management</span>
                    <Badge variant="secondary" className="bg-green-600 text-white">✅ Validé</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-pink-400">📊 Suivi Daily DD</CardTitle>
                <CardDescription className="text-gray-300">Monitoring en temps réel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-400 text-lg">Monitoring en développement</p>
                  <p className="text-gray-500 text-sm">Suivi des drawdowns en temps réel</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-purple-400">⚙️ Configuration FTMO</CardTitle>
                <CardDescription className="text-gray-300">Paramètres avancés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="account-type" className="text-gray-300">Type de compte</Label>
                    <select 
                      id="account-type" 
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                    >
                      <option value="ftmo">FTMO</option>
                      <option value="ftuk">FTUK</option>
                      <option value="custom">Personnalisé</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="capital" className="text-gray-300">Capital initial ($)</Label>
                    <Input
                      id="capital"
                      type="number"
                      defaultValue="100000"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    💾 Sauvegarder Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}