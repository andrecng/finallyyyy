'use client';

export default function ColorTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">🎨 Test des Couleurs</h1>
        
        {/* Test des arrière-plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">bg-card</h3>
            <p className="text-muted-foreground">Ce panneau utilise bg-card</p>
          </div>
          
          <div className="bg-background p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">bg-background</h3>
            <p className="text-muted-foreground">Ce panneau utilise bg-background</p>
          </div>
          
          <div className="bg-muted p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">bg-muted</h3>
            <p className="text-foreground">Ce panneau utilise bg-muted</p>
          </div>
        </div>
        
        {/* Test des composants Binance */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">🔘 Composants Binance</h2>
          
          <div className="binance-panel p-4">
            <h3 className="text-lg font-medium text-foreground mb-2">Panneau Binance</h3>
            <p className="text-muted-foreground">Ce panneau utilise binance-panel</p>
          </div>
          
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Input Binance" 
              className="binance-input flex-1"
            />
            <button className="binance-button px-4 py-2">
              Bouton Binance
            </button>
          </div>
        </div>
        
        {/* Lien de retour */}
        <div className="text-center pt-6">
          <a href="/lab" className="binance-button px-6 py-3">
            🎯 Retour au Laboratoire
          </a>
        </div>
      </div>
    </div>
  );
}
