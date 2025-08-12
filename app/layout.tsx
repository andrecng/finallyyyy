import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MainNavigation from '@/components/navigation/MainNavigation';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: '2048 Asset Management - Laboratoire de Simulation Trading',
  description: 'Plateforme avancée de simulation Monte-Carlo et d\'analyse de risque pour le trading',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="light">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-background text-foreground">
          {/* Header avec navigation - Style Binance */}
          <header className="bg-card/95 backdrop-blur-lg sticky top-0 z-30 border-b border-border/50 shadow-lg">
            <div className="container flex items-center justify-between h-20 px-6">
              {/* Logo et titre - Style Binance */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-primary-foreground">2</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    2048 Asset Management
                  </h1>
                </div>
              </div>
              
              {/* Navigation principale */}
              <MainNavigation />
            </div>
          </header>

          {/* Contenu principal - Style Binance */}
          <main className="container mx-auto px-6 py-8 animate-fade-in">
            {children}
          </main>

          {/* Footer - Style Binance */}
          <footer className="bg-card/50 border-t border-border/50 mt-auto">
            <div className="container mx-auto px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">2</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    © 2024 2048 Asset Management
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs text-muted-foreground">
                    Version 1.0.0
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                    <span className="text-xs text-success font-medium">
                      Backend Opérationnel
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}