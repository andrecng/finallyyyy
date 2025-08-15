// ✅ PAGE : test-universes/page.tsx
// 📍 Emplacement : /app/test-universes/page.tsx
// 🧪 Page de test des univers d'actifs

import UniverseTest from '@/components/UniverseTest';

export default function TestUniversesPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold text-center mb-8">🧪 Test des Univers d'Actifs</h1>
      <UniverseTest />
    </div>
  );
}
