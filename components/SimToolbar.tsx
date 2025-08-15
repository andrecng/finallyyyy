// 📄 @fichier: components/SimToolbar.tsx
// 🛠️ Barre d'outils de simulation

"use client";
import { useSimStore } from "@/stores/simStore";
import { Button } from "@/components/ui/button";

export function SimToolbar() {
  const { reset } = useSimStore();

  return (
    <div className="flex gap-4 items-center flex-wrap mb-6">
      <Button onClick={reset} variant="outline">
        🔄 Reset
      </Button>
      
      <div className="text-sm text-gray-400">
        Utilisez les contrôles ci-dessous pour configurer votre simulation
      </div>
    </div>
  );
}
