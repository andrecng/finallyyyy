'use client';

import { useState } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Save, Download } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function ParametersPanel() {
  const { config, updateConfig, savePreset, exportConfig } = useSimulationStore();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    capital: true,
    edge: true,
    kelly: false,
    bayes: false,
    sequence: false,
    dd_paliers: false,
    cppi: false,
    vol_target: false,
    markov: false,
    portfolio: false,
    stops: false,
    stress: false,
  });

  const [presetForm, setPresetForm] = useState({ name: '', description: '' });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSavePreset = () => {
    if (presetForm.name) {
      savePreset(presetForm.name, presetForm.description);
      setPresetForm({ name: '', description: '' });
    }
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto sidebar-scrollbar pr-2">
      {/* Capital & Coûts */}
      <Card className="binance-panel">
        <Collapsible open={openSections.capital} onOpenChange={() => toggleSection('capital')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle className="flex items-center justify-between text-sm">
                Capital & Coûts
                <ChevronDown size={16} className={openSections.capital ? 'rotate-180' : ''} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div>
                <Label>Capital Initial</Label>
                <Input
                  type="number"
                  value={config.capital.initial}
                  onChange={(e) => updateConfig({
                    capital: { ...config.capital, initial: Number(e.target.value) }
                  })}
                  className="binance-input"
                />
              </div>
              <div>
                <Label>Base de Calcul</Label>
                <Select
                  value={config.capital.basis}
                  onValueChange={(value) => updateConfig({
                    capital: { ...config.capital, basis: value as any }
                  })}
                >
                  <SelectTrigger className="binance-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balance">Balance</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="risk_capital">Risk Capital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Fees (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.capital.fees}
                    onChange={(e) => updateConfig({
                      capital: { ...config.capital, fees: Number(e.target.value) }
                    })}
                    className="binance-input"
                  />
                </div>
                <div>
                  <Label>Spread (bp)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.capital.spread_bp}
                    onChange={(e) => updateConfig({
                      capital: { ...config.capital, spread_bp: Number(e.target.value) }
                    })}
                    className="binance-input"
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Edge */}
      <Card className="binance-panel">
        <Collapsible open={openSections.edge} onOpenChange={() => toggleSection('edge')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle className="flex items-center justify-between text-sm">
                Edge
                <ChevronDown size={16} className={openSections.edge ? 'rotate-180' : ''} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>Win Rate</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={config.edge.win_rate}
                    onChange={(e) => updateConfig({
                      edge: { ...config.edge, win_rate: Number(e.target.value) }
                    })}
                    className="binance-input"
                  />
                </div>
                <div>
                  <Label>R Win</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.edge.r_win}
                    onChange={(e) => updateConfig({
                      edge: { ...config.edge, r_win: Number(e.target.value) }
                    })}
                    className="binance-input"
                  />
                </div>
                <div>
                  <Label>R Loss</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.edge.r_loss}
                    onChange={(e) => updateConfig({
                      edge: { ...config.edge, r_loss: Number(e.target.value) }
                    })}
                    className="binance-input"
                  />
                </div>
              </div>
              <div>
                <Label>Source</Label>
                <Select
                  value={config.edge.source}
                  onValueChange={(value) => updateConfig({
                    edge: { ...config.edge, source: value as any }
                  })}
                >
                  <SelectTrigger className="binance-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixe</SelectItem>
                    <SelectItem value="bayes">Bayes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Kelly */}
      <Card className="binance-panel">
        <Collapsible open={openSections.kelly} onOpenChange={() => toggleSection('kelly')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle className="flex items-center justify-between text-sm">
                Kelly
                <ChevronDown size={16} className={openSections.kelly ? 'rotate-180' : ''} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.kelly.enabled}
                  onCheckedChange={(checked) => updateConfig({
                    kelly: { ...config.kelly, enabled: checked }
                  })}
                />
                <Label>Activer Kelly</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Fraction Cap</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={config.kelly.fraction_cap}
                    onChange={(e) => updateConfig({
                      kelly: { ...config.kelly, fraction_cap: Number(e.target.value) }
                    })}
                    className="binance-input"
                    disabled={!config.kelly.enabled}
                  />
                </div>
                <div>
                  <Label>Cap Global (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={config.kelly.cap_global_pct}
                    onChange={(e) => updateConfig({
                      kelly: { ...config.kelly, cap_global_pct: Number(e.target.value) }
                    })}
                    className="binance-input"
                    disabled={!config.kelly.enabled}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Stress Tests */}
      <Card className="binance-panel">
        <Collapsible open={openSections.stress} onOpenChange={() => toggleSection('stress')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <CardTitle className="flex items-center justify-between text-sm">
                Tests de Stress
                <ChevronDown size={16} className={openSections.stress ? 'rotate-180' : ''} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3">
              {Object.entries({
                wr_minus_10: 'WR -10%',
                wr_plus_10: 'WR +10%',
                vol_plus_50: 'Vol +50%',
                costs_x2: 'Coûts ×2',
                costs_x3: 'Coûts ×3',
                corr_to_1: 'Corr → 1.0',
                black_swan_5r: 'Black Swan -5R',
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Switch
                    checked={config.stress_flags[key as keyof typeof config.stress_flags]}
                    onCheckedChange={(checked) => updateConfig({
                      stress_flags: { ...config.stress_flags, [key]: checked }
                    })}
                  />
                  <Label className="text-sm">{label}</Label>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Simulation Parameters */}
      <Card className="binance-panel">
        <CardHeader>
          <CardTitle className="text-sm">Paramètres de Simulation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>N Trades</Label>
              <Input
                type="number"
                value={config.n_trades}
                onChange={(e) => updateConfig({ n_trades: Number(e.target.value) })}
                className="binance-input"
              />
            </div>
            <div>
              <Label>Seed</Label>
              <Input
                type="number"
                value={config.seed}
                onChange={(e) => updateConfig({ seed: Number(e.target.value) })}
                className="binance-input"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preset Management */}
      <Card className="binance-panel">
        <CardHeader>
          <CardTitle className="text-sm">Presets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nom du Preset</Label>
            <Input
              value={presetForm.name}
              onChange={(e) => setPresetForm(prev => ({ ...prev, name: e.target.value }))}
              className="binance-input"
              placeholder="Mon preset..."
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={presetForm.description}
              onChange={(e) => setPresetForm(prev => ({ ...prev, description: e.target.value }))}
              className="binance-input"
              placeholder="Description du preset..."
              rows={2}
            />
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleSavePreset}
              disabled={!presetForm.name}
              className="binance-button flex-1"
            >
              <Save size={16} className="mr-2" />
              Sauvegarder
            </Button>
            <Button
              onClick={exportConfig}
              variant="outline"
              className="flex-1"
            >
              <Download size={16} className="mr-2" />
              Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}