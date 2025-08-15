// Composant de test pour vérifier Tailwind CSS
export default function TailwindTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          🧪 Test Tailwind CSS
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-blue-300 mb-2">Carte Bleue</h3>
            <p className="text-blue-100">Test des couleurs et gradients</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-green-300 mb-2">Carte Verte</h3>
            <p className="text-green-100">Test des couleurs et gradients</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-purple-300 mb-2">Carte Violette</h3>
            <p className="text-purple-100">Test des couleurs et gradients</p>
          </div>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-slate-100 mb-4">Test des Composants</h2>
          <div className="space-y-4">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105">
              🚀 Bouton Moderne
            </button>
            
            <div className="flex space-x-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2">
                <span className="text-green-400 font-medium">✅ Succès</span>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
                <span className="text-red-400 font-medium">❌ Erreur</span>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-4 py-2">
                <span className="text-yellow-400 font-medium">⚠️ Attention</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
