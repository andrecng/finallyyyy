'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4">
            📈 Historique & Expériences
          </h1>
          <p className="text-2xl text-gray-300 mb-8">Journal de simulations et archive des résultats</p>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full"></div>
        </div>

        <Tabs defaultValue="journal" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="journal" className="data-[state=active]:bg-yellow-600">📝 Journal</TabsTrigger>
            <TabsTrigger value="configs" className="data-[state=active]:bg-orange-600">⚙️ Configurations</TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-red-600">🔄 Comparatifs</TabsTrigger>
            <TabsTrigger value="archive" className="data-[state=active]:bg-purple-600">📚 Archive</TabsTrigger>
          </TabsList>

          <TabsContent value="journal" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-yellow-500/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-yellow-400">📝 Nouvelle Entrée</CardTitle>
                  <CardDescription className="text-gray-300">Ajouter une expérience</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">Documentez vos observations et insights</p>
                  <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                    ✏️ Créer Entrée
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-orange-500/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-orange-400">📊 Statistiques</CardTitle>
                  <CardDescription className="text-gray-300">Vue d'ensemble</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">Analysez vos performances</p>
                  <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                    📈 Voir Stats
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 text-white hover:border-red-500/30 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-red-400">🔍 Recherche</CardTitle>
                  <CardDescription className="text-gray-300">Explorer l'historique</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">Trouvez des informations spécifiques</p>
                  <Button className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
                    🔍 Rechercher
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-purple-400">📋 Dernières Entrées</CardTitle>
                <CardDescription className="text-gray-300">Vos expériences récentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-400 text-lg mb-2">Aucune entrée dans le journal</p>
                  <p className="text-gray-500">Commencez par documenter vos premières expériences</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configs" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-orange-400">⚙️ Historique des Configurations</CardTitle>
                <CardDescription className="text-gray-300">Vos paramètres sauvegardés</CardDescription>
              </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">0</div>
                  <div className="text-sm text-gray-400">Configs sauvegardées</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">0</div>
                  <div className="text-sm text-gray-400">Configs partagées</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">0</div>
                  <div className="text-sm text-gray-400">Versions</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-400">0</div>
                  <div className="text-sm text-gray-400">Favoris</div>
                </div>
              </div>
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-red-400">🔄 Comparatifs Temporels</CardTitle>
                <CardDescription className="text-gray-300">Analyse comparative sur différentes périodes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔄</div>
                  <p className="text-gray-400 text-lg">Comparatifs en développement</p>
                  <p className="text-gray-500 text-sm">Analysez l'évolution de vos performances</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archive" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <CardTitle className="text-purple-400">📚 Archive des Résultats</CardTitle>
                <CardDescription className="text-gray-300">Stockage et organisation des données</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Export automatique</span>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-400">⚠️ Configuré</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Sauvegarde cloud</span>
                    <Badge variant="outline" className="border-gray-500 text-gray-400">☁️ Désactivé</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Compression des données</span>
                    <Badge variant="secondary" className="bg-green-600 text-white">✅ Activé</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                    <span className="text-gray-300">Indexation</span>
                    <Badge variant="secondary" className="bg-blue-600 text-white">🔍 Activé</Badge>
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