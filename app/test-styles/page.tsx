'use client';

export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-foreground">🧪 Test des Styles CSS</h1>
        
        {/* Test des couleurs de base */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">🎨 Couleurs de Base</h2>
            
            <div className="bg-card p-4 rounded-lg border border-border">
              <h3 className="text-lg font-medium text-card-foreground mb-3">Carte (bg-card)</h3>
              <p className="text-muted-foreground">Ce panneau utilise bg-card</p>
            </div>
            
            <div className="bg-background p-4 rounded-lg border border-border">
              <h3 className="text-lg font-medium text-foreground mb-3">Arrière-plan (bg-background)</h3>
              <p className="text-muted-foreground">Ce panneau utilise bg-background</p>
            </div>
            
            <div className="bg-muted p-4 rounded-lg border border-border">
              <h3 className="text-lg font-medium text-muted-foreground mb-3">Muté (bg-muted)</h3>
              <p className="text-foreground">Ce panneau utilise bg-muted</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">🔘 Composants Binance</h2>
            
            <div className="binance-panel p-4">
              <h3 className="text-lg font-medium text-foreground mb-3">Panneau Binance</h3>
              <p className="text-muted-foreground">Ce panneau utilise binance-panel</p>
            </div>
            
            <input 
              type="text" 
              placeholder="Input Binance" 
              className="binance-input w-full"
            />
            
            <button className="binance-button px-4 py-2">
              Bouton Binance
            </button>
            
            <button className="binance-button-outline px-4 py-2">
              Bouton Outline
            </button>
          </div>
        </div>
        
        {/* Test des couleurs d'accent */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">🌈 Couleurs d'Accent</h2>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-primary p-4 rounded-lg text-primary-foreground text-center">
              <div className="text-sm">Primary</div>
              <div className="text-lg font-bold">Jaune Binance</div>
            </div>
            
            <div className="bg-success p-4 rounded-lg text-success-foreground text-center">
              <div className="text-sm">Success</div>
              <div className="text-lg font-bold">Vert</div>
            </div>
            
            <div className="bg-warning p-4 rounded-lg text-warning-foreground text-center">
              <div className="text-sm">Warning</div>
              <div className="text-lg font-bold">Rouge</div>
            </div>
            
            <div className="bg-info p-4 rounded-lg text-info-foreground text-center">
              <div className="text-sm">Info</div>
              <div className="text-lg font-bold">Bleu</div>
            </div>
          </div>
        </div>
        
        {/* Test des classes utilitaires */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">⚙️ Classes Utilitaires</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-tertiary p-4 rounded-lg text-center">
              <div className="text-sm text-secondary">bg-tertiary</div>
              <div className="profit font-bold">Profit (vert)</div>
            </div>
            
            <div className="bg-tertiary p-4 rounded-lg text-center">
              <div className="text-sm text-secondary">bg-tertiary</div>
              <div className="loss font-bold">Loss (rouge)</div>
            </div>
            
            <div className="bg-tertiary p-4 rounded-lg text-center">
              <div className="text-sm text-secondary">bg-tertiary</div>
              <div className="text-primary font-bold">Primary</div>
            </div>
          </div>
        </div>
        
        {/* Lien de retour */}
        <div className="text-center pt-8">
          <a 
            href="/lab" 
            className="binance-button px-6 py-3 text-lg"
          >
            🎯 Retour au Laboratoire
          </a>
        </div>
      </div>
    </div>
  );
}
