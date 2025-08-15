'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BarChart3, 
  Calculator, 
  History, 
  Settings, 
  Play, 
  Menu, 
  X,
  TrendingUp,
  Target,
  Zap,
  Brain
} from 'lucide-react';

const navItems = [
  {
    href: '/lab',
    title: 'Laboratoire',
    description: 'Simulations Monte Carlo avancées',
    icon: Calculator
  },
  {
    href: '/andre-le-grand',
    title: 'André le Grand',
    description: 'Moteur de Money Management',
    icon: Brain
  },
  {
    href: '/simulateur-multi',
    title: 'Simulateur Multi',
    description: 'Simulation multi-actifs avancée',
    icon: BarChart3
  },
  {
    href: '/live',
    title: 'Live Trading',
    description: 'Suivi en temps réel',
    icon: Play
  },
  {
    href: '/backtest',
    title: 'Backtest',
    description: 'Tests sur données historiques',
    icon: History
  },
  {
    href: '/ftmo',
    title: 'FTMO',
    description: 'Gestion des comptes FTMO',
    icon: Target
  },
  {
    href: '/settings',
    title: 'Paramètres',
    description: 'Configuration et préférences',
    icon: Settings
  }
];

export default function MainNavigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Navigation Desktop - Style Binance */}
      <nav className="hidden lg:flex items-center space-x-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group relative px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-binance border border-primary/30' 
                  : 'text-foreground hover:text-primary hover:bg-accent/80 border border-transparent hover:border-primary/30'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary-foreground' : 'text-current'}`} />
                <span>{item.title}</span>
              </div>
              
              {/* Tooltip style Binance */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 text-xs text-primary-foreground bg-card border border-primary/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-lg z-50">
                {item.description}
                {/* Flèche du tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-surface"></div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bouton Mobile - Style Binance */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden p-3 rounded-xl text-foreground hover:text-primary hover:bg-accent/80 border border-transparent hover:border-primary/30 transition-all duration-200"
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Menu Mobile - Style Binance */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-card/95 backdrop-blur-lg border-b border-border shadow-lg animate-slide-down z-50">
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border border-primary/30 shadow-binance' 
                      : 'text-foreground hover:text-primary hover:bg-accent/80 border border-transparent hover:border-primary/30'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}