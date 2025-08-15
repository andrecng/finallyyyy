'use client';
import { useEffect, useState } from 'react';
import { useSimStore } from '@/stores/simStore';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface Preset {
  capital: number;
  nbSimulations: number;
  volatilityTarget: number;
}

const defaultPresets: Record<string, Preset> = {
  conservative: {
    capital: 50000,
    nbSimulations: 1,
    volatilityTarget: 10,
  },
  balanced: {
    capital: 100000,
    nbSimulations: 10,
    volatilityTarget: 15,
  },
  aggressive: {
    capital: 200000,
    nbSimulations: 50,
    volatilityTarget: 25,
  },
};

export default function PresetsLoader() {
  const [userPresets, setUserPresets] = useState<Record<string, Preset>>({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  
  const setCapital = useSimStore((s) => s.setCapital);
  const setNbSimulations = useSimStore((s) => s.setNbSimulations);
  const setVolatilityTarget = useSimStore((s) => s.setVolatilityTarget);
  const capital = useSimStore((s) => s.capital);
  const nbSimulations = useSimStore((s) => s.nbSimulations);
  const volatilityTarget = useSimStore((s) => s.volatilityTarget);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('userPresets');
      if (saved) {
        setUserPresets(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des presets:', error);
    }
  }, []);

  const loadPreset = (value: string) => {
    try {
      const preset = userPresets[value] || defaultPresets[value];
      if (preset) {
        setCapital(preset.capital);
        setNbSimulations(preset.nbSimulations);
        setVolatilityTarget(preset.volatilityTarget);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du preset:', error);
    }
  };

  const saveCurrentAsPreset = () => {
    setShowSaveModal(true);
  };

  const handleSavePreset = () => {
    if (newPresetName.trim()) {
      try {
        const updated = {
          ...userPresets,
          [newPresetName.trim()]: { capital, nbSimulations, volatilityTarget },
        };
        setUserPresets(updated);
        localStorage.setItem('userPresets', JSON.stringify(updated));
        setNewPresetName('');
        setShowSaveModal(false);
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du preset:', error);
        alert('Erreur lors de la sauvegarde. Vérifiez que les cookies sont activés.');
      }
    }
  };

  const allPresets = { ...defaultPresets, ...userPresets };

  return (
    <div className="space-y-4">
      {/* Sélecteur de presets */}
      <div className="space-y-2">
        <Select onValueChange={loadPreset}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un preset" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(allPresets).map((key) => (
              <SelectItem key={key} value={key}>
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={saveCurrentAsPreset}
          className="w-full"
        >
          💾 Sauvegarder comme preset
        </Button>
        
        <p className="text-sm text-slate-400 text-center">
          Chargez ou créez vos presets personnalisés
        </p>
      </div>

      {/* Modal de sauvegarde */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              💾 Sauvegarder un preset
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Nom du preset
                </label>
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="ex: MonPreset"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
                />
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-3">
                <p className="text-sm text-slate-300 mb-2">Configuration actuelle :</p>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>Capital: {capital.toLocaleString('fr-FR')} €</p>
                  <p>Simulations: {nbSimulations}</p>
                  <p>Volatilité: {volatilityTarget}%</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleSavePreset}
                  disabled={!newPresetName.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  💾 Sauvegarder
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveModal(false);
                    setNewPresetName('');
                  }}
                  className="flex-1"
                >
                  ❌ Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
