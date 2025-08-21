// ✅ COMPONENT : VolatilityTargeter.tsx
// 📍 Emplacement : /components/VolatilityTargeter.tsx
// 🎯 Objectif : Saisie et affichage de la volatilité cible (en %)

'use client';

import { useSimStore } from '@/stores/simStore';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export default function VolatilityTargeter() {
  const volatilityTarget = useSimStore((state) => state.volatilityTarget);
  const setVolatilityTarget = useSimStore((state) => state.setVolatilityTarget);

  return (
    <div className="p-4 border rounded-lg bg-neutral-900 text-white space-y-4">
      <Label className="text-lg font-semibold">🎯 Volatilité Cible</Label>
      <Slider
        min={0}
        max={50}
        step={0.5}
        value={[volatilityTarget]}
        onValueChange={([value]) => setVolatilityTarget(value)}
      />
      <div className="text-sm text-gray-300">
        Volatilité actuelle cible : <span className="font-bold">{volatilityTarget}%</span>
      </div>
    </div>
  );
}
