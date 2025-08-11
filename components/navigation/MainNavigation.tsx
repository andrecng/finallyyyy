'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Calculator, 
  TrendingUp, 
  Shield, 
  Zap, 
  History, 
  Settings 
} from 'lucide-react';

const navItems = [
  { href: '/lab', label: 'Lab de Sizing', icon: Calculator },
  { href: '/backtest', label: 'Backtest Historique', icon: TrendingUp },
  { href: '/ftmo', label: 'Mode FTMO', icon: Shield },
  { href: '/live', label: 'Live & Exécution', icon: Zap },
  { href: '/history', label: 'Historique', icon: History },
  { href: '/settings', label: 'Paramètres', icon: Settings },
];

export default function MainNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-secondary border-b border-primary">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/lab" className="text-xl font-bold text-primary">
              2048 Asset Management
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors',
                      isActive
                        ? 'bg-tertiary text-primary'
                        : 'text-secondary hover:text-primary hover:bg-tertiary/50'
                    )}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}