'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 mb-4">
            ⚙️ Paramètres
          </h1>
          <p className="text-2xl text-gray-300 mb-8">Configuration générale de la plateforme</p>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-500 mx-auto rounded-full"></div>
        </div>

        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="preferences" className="data-[state=active]:bg-pink-600">👤 Préférences</TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-purple-600">🔑 API</TabsTrigger>
            <TabsTrigger value="theme" className="data-[state=active]:bg-blue-600">🎨 Thème</TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-green-600">📤 Export</TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-pink-500/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-pink-400">👤 Profil Utilisateur</CardTitle>
                  <CardDescription className="text-gray-300">Informations personnelles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username" className="text-gray-300">Nom d'utilisateur</Label>
                      <Input
                        id="username"
                        placeholder="TradingMaster"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone" className="text-gray-300">Fuseau horaire</Label>
                      <select 
                        id="timezone" 
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2"
                      >
                        <option value="utc">UTC</option>
                        <option value="est">EST (UTC-5)</option>
                        <option value="pst">PST (UTC-8)</option>
                        <option value="cet">CET (UTC+1)</option>
                      </select>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                      💾 Sauvegarder Profil
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-purple-500/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-purple-400">🔔 Notifications</CardTitle>
                  <CardDescription className="text-gray-300">Préférences de notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Alertes de trade</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Notifications push</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Alertes email</span>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Alertes de risque</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-purple-400">🔑 Configuration API</CardTitle>
                <CardDescription className="text-gray-300">Clés et paramètres d'API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="api-key" className="text-gray-300">Clé API</Label>
                    <Input
                      id="api-key"
                      type="password"
                      placeholder="••••••••••••••••"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="api-secret" className="text-gray-300">Secret API</Label>
                    <Input
                      id="api-secret"
                      type="password"
                      placeholder="••••••••••••••••"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="api-url" className="text-gray-300">URL API</Label>
                    <Input
                      id="api-url"
                      placeholder="https://api.exchange.com"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      🔑 Tester Connection
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                      💾 Sauvegarder
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-blue-400">🎨 Thèmes et Affichage</CardTitle>
                <CardDescription className="text-gray-300">Personnalisation de l'interface</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label className="text-gray-300 mb-2 block">Mode de couleur</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg border-2 border-blue-500">
                        <div className="text-2xl mb-2">🌙</div>
                        <div className="text-sm text-blue-400">Sombre</div>
                      </div>
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="text-2xl mb-2">☀️</div>
                        <div className="text-sm text-gray-400">Clair</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 mb-2 block">Accent de couleur</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {['blue', 'green', 'purple', 'orange', 'pink'].map((color) => (
                        <div key={color} className={`w-8 h-8 rounded-full bg-${color}-500 cursor-pointer hover:scale-110 transition-transform`}></div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      🎨 Appliquer Thème
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-gray-300 hover:bg-slate-700">
                      🔄 Réinitialiser
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-green-400">📤 Paramètres d'Export</CardTitle>
                <CardDescription className="text-gray-300">Configuration des exports et sauvegardes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Export automatique</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Sauvegarde cloud</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Compression des données</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Chiffrement</span>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="pt-4">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                      📤 Exporter Configuration
                    </Button>
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