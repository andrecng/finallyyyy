export default function SettingsPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Paramètres</h1>
        <div className="bg-secondary rounded-lg p-8 max-w-md mx-auto">
          <p className="text-secondary mb-4">Configuration générale</p>
          <div className="text-sm text-muted">
            • Préférences utilisateur<br/>
            • Configuration API<br/>
            • Thèmes et affichage<br/>
            • Paramètres d'export
          </div>
        </div>
      </div>
    </div>
  );
}