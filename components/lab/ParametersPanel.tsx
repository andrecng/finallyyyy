'use client';

import { useState, useEffect, useRef } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Download, ChevronDown, Settings, DollarSign, Target, TrendingUp, Zap, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ParametersPanel() {
  const { config, updateConfig, savePreset, exportConfig } = useSimulationStore();
  const [presetForm, setPresetForm] = useState({ name: '', description: '' });
  const [showBaseOptions, setShowBaseOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowBaseOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSavePreset = () => {
    if (presetForm.name.trim()) {
      savePreset(presetForm.name, presetForm.description);
      setPresetForm({ name: '', description: '' });
    }
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto p-6">
      {/* Capital & Coûts - Style Binance */}
      <Card className="card-hover-effect border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent overflow-hidden relative">
        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
        
        <CardHeader className="pb-4 relative z-10">
          <CardTitle className="flex items-center gap-4 text-xl text-foreground">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-binance">
              <DollarSign className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="text-lg font-bold">Capital & Coûts</div>
              <div className="text-sm text-muted-foreground font-normal">Configuration du capital initial et de la base de calcul</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              Capital Initial
            </Label>
            <Input
              type="text"
              value={config.capital.initial.toLocaleString('fr-FR')}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, '');
                const numValue = Number(value);
                if (!isNaN(numValue) && numValue >= 0) {
                  updateConfig({
                    capital: { ...config.capital, initial: numValue }
                  });
                }
              }}
              placeholder="100 000"
              className="input-modern h-12 text-lg font-bold bg-card border-2 border-border hover:border-primary/40 focus:border-primary"
            />
            <Badge className="badge-primary text-xs px-3 py-1">
              💰 Capital disponible pour les simulations
            </Badge>
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              Base de Calcul
            </Label>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowBaseOptions(!showBaseOptions)}
                className="w-full h-12 px-4 text-sm bg-card border-2 border-border hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl flex items-center justify-between text-left transition-all duration-200 text-foreground font-medium"
              >
                <span className="flex items-center gap-3">
                  {config.capital.basis === 'balance' ? '💰 Balance' : '📊 Equity'}
                  <span className="text-muted-foreground text-xs">
                    {config.capital.basis === 'balance' ? '(Solde du compte)' : '(Valeur nette)'}
                  </span>
                </span>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform duration-200 text-primary",
                  showBaseOptions ? "rotate-180" : ""
                )} />
              </button>
              
              {showBaseOptions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-primary rounded-xl shadow-2xl z-[9999] overflow-hidden animate-scale-in">
                  <button
                    onClick={() => {
                      updateConfig({ capital: { ...config.capital, basis: 'balance' } });
                      setShowBaseOptions(false);
                    }}
                    className="w-full px-4 py-4 text-sm text-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer text-left border-b border-border last:border-b-0 transition-colors font-medium"
                  >
                    💰 Balance (Solde du compte)
                  </button>
                  <button
                    onClick={() => {
                      updateConfig({ capital: { ...config.capital, basis: 'equity' } });
                      setShowBaseOptions(false);
                    }}
                    className="w-full px-4 py-4 text-sm text-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer text-left transition-colors font-medium"
                  >
                    📊 Equity (Valeur nette)
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edge & Kelly - Style Binance */}
      <Card className="card-hover-effect border-2 border-success/30 bg-gradient-to-br from-success/5 via-success/3 to-transparent overflow-hidden relative">
        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-success/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
        
        <CardHeader className="pb-4 relative z-10">
          <CardTitle className="flex items-center gap-4 text-xl text-foreground">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-success to-success/80 flex items-center justify-center shadow-lg">
              <Target className="h-6 w-6 text-success-foreground" />
            </div>
            <div>
              <div className="text-lg font-bold">Edge & Kelly</div>
              <div className="text-sm text-muted-foreground font-normal">Paramètres de performance et de risque</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success"></div>
              Win Rate
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={config.edge.win_rate}
              onChange={(e) => updateConfig({
                edge: { ...config.edge, win_rate: Number(e.target.value) }
              })}
              className="input-modern h-12 bg-surface border-2 border-border hover:border-success/40 focus:border-success"
            />
            <div className="flex items-center gap-3">
              <Badge className="badge-success text-xs px-3 py-1">
                {Math.round(config.edge.win_rate * 100)}% de réussite
              </Badge>
              <div className="flex-1 bg-card rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-success to-success/80 transition-all duration-300"
                  style={{ width: `${config.edge.win_rate * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success"></div>
              R Win
            </Label>
            <Input
              type="number"
              step="0.1"
              value={config.edge.r_win}
              onChange={(e) => updateConfig({
                edge: { ...config.edge, r_win: Number(e.target.value) }
              })}
              className="input-modern h-12 bg-surface border-2 border-border hover:border-success/40 focus:border-success"
            />
            <div className="flex items-center gap-3">
              <Badge className="badge-success text-xs px-3 py-1">
                Ratio gain/perte: {config.edge.r_win}:1
              </Badge>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Gain moyen: {config.edge.r_win}x</span>
                <span>•</span>
                <span>Perte moyenne: 1x</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Presets - Style Binance */}
      <Card className="card-hover-effect border-2 border-warning/30 bg-gradient-to-br from-warning/5 via-warning/3 to-transparent overflow-hidden relative">
        {/* Effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-warning/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
        
        <CardHeader className="pb-4 relative z-10">
          <CardTitle className="flex items-center gap-4 text-xl text-foreground">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-warning to-warning/80 flex items-center justify-center shadow-lg">
              <Settings className="h-6 w-6 text-warning-foreground" />
            </div>
            <div>
              <div className="text-lg font-bold">Presets & Configuration</div>
              <div className="text-sm text-muted-foreground font-normal">Sauvegarde et export des configurations</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-warning"></div>
              Nom du preset
            </Label>
            <Input
              placeholder="Ex: Stratégie Conservative"
              value={presetForm.name}
              onChange={(e) => setPresetForm({ ...presetForm, name: e.target.value })}
              className="input-modern h-12 bg-surface border-2 border-border hover:border-warning/40 focus:border-warning"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleSavePreset}
              className="btn-primary flex-1 h-12 text-base font-semibold"
            >
              <Save className="h-5 w-5" />
              Sauvegarder
            </Button>
            <Button
              onClick={exportConfig}
              variant="outline"
              className="btn-modern h-12 border-2 border-border hover:border-warning/40 hover:bg-warning/10 text-foreground font-semibold"
            >
              <Download className="h-5 w-5" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}