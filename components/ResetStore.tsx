// ✅ Bouton ResetStore.tsx
// 📍 /components/ResetStore.tsx

'use client';
import { useSimStore } from '@/stores/simStore';
import { Button } from '@/components/ui/button';

export default function ResetStore() {
  const reset = useSimStore((state) => state.resetAll);

  return (
    <div className="mt-4">
      <Button variant="destructive" onClick={reset}>
        🔄 Réinitialiser le Simulateur
      </Button>
    </div>
  );
}
