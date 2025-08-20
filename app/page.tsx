import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              2048 Asset Management
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Moteur Alpha - Système de Gestion de Risque Adaptatif
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-12">
          {/* Hero Section */}
          <section className="text-center">
            <h2 className="text-3xl font-semibold mb-6">
              🚀 Moteur de Simulation Monte Carlo
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-3xl mx-auto">
              Système avancé de gestion de risque avec modules modulaires : CPPI Freeze, 
              VolatilityTarget, FTMOGate, et bien plus encore.
            </p>
            <Link 
              href="/simulate"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              🧮 Lancer une Simulation
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </section>

          {/* Features Grid */}
          <section className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-3">Gestion de Risque</h3>
              <p className="text-slate-300">
                Modules CPPI, VolatilityTarget, KellyCap, SoftBarrier, FTMOGate et SessionNewsGate.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3">Simulation Monte Carlo</h3>
              <p className="text-slate-300">
                Profils de marché configurables : Gaussian, Student-t, EWMA, Jumps.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3">Interface Moderne</h3>
              <p className="text-slate-300">
                Formulaire intuitif avec validation et presets prêts à l'emploi.
              </p>
            </div>
          </section>

          {/* Quick Stats */}
          <section className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-8">
            <h3 className="text-2xl font-semibold text-center mb-6">📈 Statistiques du Projet</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400">1.5M+</div>
                <div className="text-sm text-slate-400">Lignes de code Python</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">7</div>
                <div className="text-sm text-slate-400">Modules de risque</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">2000+</div>
                <div className="text-sm text-slate-400">Scénarios testés</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-400">100%</div>
                <div className="text-sm text-slate-400">FTMO compliant</div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-slate-700/30">
          <p className="text-slate-400">
            © {new Date().getFullYear()} 2048 Asset Management — Moteur Alpha v1.0.1
          </p>
        </footer>
      </div>
    </div>
  );
}
