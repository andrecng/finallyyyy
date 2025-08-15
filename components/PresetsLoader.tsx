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
  const setCapital = useSimStore((s) => s.setCapital);
  const setNbSimulations = useSimStore((s) => s.setNbSimulations);
  const setVolatilityTarget = useSimStore((s) => s.setVolatilityTarget);
  const capital = useSimStore((s) => s.capital);
  const nbSimulations = useSimStore((s) => s.nbSimulations);
  const volatilityTarget = useSimStore((s) => s.volatilityTarget);

  useEffect(() => {
    const saved = localStorage.getItem('userPresets');
    if (saved) {
      setUserPresets(JSON.parse(saved));
    }
  }, []);

  const loadPreset = (value: string) => {
    const preset = userPresets[value] || defaultPresets[value];
    if (preset) {
      setCapital(preset.capital);
      setNbSimulations(preset.nbSimulations);
      setVolatilityTarget(preset.volatilityTarget);
    }
  };

  const saveCurrentAsPreset = () => {
    const name = prompt('Nom du nouveau preset :');
    if (name) {
      const updated = {
        ...userPresets,
        [name]: { capital, nbSimulations, volatilityTarget },
      };
      setUserPresets(updated);
      localStorage.setItem('userPresets', JSON.stringify(updated));
    }
  };

  const allPresets = { ...defaultPresets, ...userPresets };

  return (
    <div className="space-y-2 mt-4">
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
      <Button variant="outline" size="sm" onClick={saveCurrentAsPreset}>
        💾 Sauvegarder comme preset
      </Button>
      <p className="text-sm text-muted-foreground">Chargez ou créez vos presets personnalisés</p>
    </div>
  );
}
