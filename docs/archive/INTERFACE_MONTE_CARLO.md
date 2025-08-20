# 🎯 **INTERFACE MONTE CARLO - GUIDE D'UTILISATION**

## 🚀 **Vue d'ensemble**

L'interface Monte Carlo permet de lancer des simulations avec des profils de marché configurables via une interface web intuitive.

## 🔧 **Composants implémentés**

### **1. API Client (`lib/api.ts`)**
```typescript
export const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

export async function runSimulation(payload: any) {
  const res = await fetch(`${API_URL}/simulate`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Backend error ${res.status}`);
  return res.json();
}
```

**Configuration :**
- URL backend configurable via `NEXT_PUBLIC_BACKEND_URL`
- Fallback sur `http://localhost:8001` en développement

### **2. Sélecteur de Profils (`components/ProfileSelect.tsx`)**
```typescript
const PROFILES = [
  { key: "gaussian", label: "Gaussian (optimiste)" },
  { key: "student_t", label: "Student-t (queues épaisses)" },
  { key: "student_t_jumps_ewma", label: "Student-t + Jumps + EWMA (stress réaliste)" },
];
```

**Profils disponibles :**
- **Gaussian** : Distribution normale, marché calme
- **Student-t** : Queues épaisses, volatilité élevée
- **Student-t + Jumps + EWMA** : Stress réaliste avec sauts et volatilité dynamique

### **3. Éditeur JSON (`components/JsonPresetEditor.tsx`)**
- Éditeur de texte avec validation JSON
- Synchronisation automatique au blur
- Gestion d'erreurs gracieuse

### **4. Page de Simulation (`app/simulate/page.tsx`)**
- Interface complète avec sélection de profil
- Éditeur JSON pour les paramètres
- Affichage des résultats structurés
- Gestion des erreurs et états de chargement

## 📋 **Format d'entrée standardisé**

### **Schéma JSON (`schemas/run_io.schema.json`)**
```json
{
  "profile": "gaussian",
  "preset": "FTMO-lite",
  "modules": ["VolatilityTarget", "CPPIFreeze", "KellyCap"],
  "params": { "vol_target": 0.10, "alpha": 0.10 },
  "seed": 123,
  "horizon_days": 20
}
```

**Champs requis :**
- `profile` : Profil de marché Monte Carlo
- `preset` : Nom du preset de configuration
- `modules` : Liste des modules de risk management
- `params` : Paramètres des modules

**Champs optionnels :**
- `seed` : Seed pour la reproductibilité (défaut: 123)
- `horizon_days` : Horizon de simulation en jours (défaut: 20)

## 🔌 **Backend FastAPI**

### **Endpoint `/simulate`**
```python
@app.post("/simulate")
def simulate(req: RunIn):
    # TODO: brancher generate_returns(profile), apply modules, aggregate_min, compute KPIs
    # Pour l'instant, retour mocké pour翻了 le front
    return {
        "ok": True,
        "echo": req.dict(),
        "kpis": { "max_dd": -0.032, "cagr": 0.18, "sortino": 1.4 },
        "ftmo": { "pass": True, "days_to_target": 12, "dd_daily_max": -0.041 },
        "logs": [{"module": "VolatilityTarget", "risk_eff": 0.012}]
    }
```

**Compatibilité :**
- Endpoint legacy `/simulate_legacy` pour l'ancien format
- Nouvel endpoint `/simulate` pour le format standardisé

## 🎨 **Interface utilisateur**

### **Layout responsive**
- **Desktop** : 2 colonnes (contrôles + éditeur JSON)
- **Mobile** : 1 colonne empilée

### **Contrôles principaux**
1. **Sélection de profil** : Dropdown avec descriptions
2. **Paramètres avancés** : Seed et horizon configurables
3. **Bouton de lancement** : État de chargement intégré

### **Affichage des résultats**
- **KPIs** : Max DD, CAGR, Sortino ratio
- **FTMO** : Status, jours cible, DD max quotidien
- **Logs** : Activité des modules
- **JSON complet** : Détails dans un accordéon

## 🚀 **Utilisation**

### **1. Accès à l'interface**
```
http://localhost:3000/simulate
```

### **2. Configuration d'un profil**
1. Sélectionner le profil de marché
2. Ajuster les paramètres avancés (seed, horizon)
3. Éditer le JSON des modules et paramètres

### **3. Lancement de simulation**
1. Cliquer sur "🚀 Lancer Simulation"
2. Attendre l'exécution (indicateur de chargement)
3. Consulter les résultats structurés

### **4. Exemples de configurations**

#### **Configuration FTMO basique**
```json
{
  "preset": "FTMO-lite",
  "modules": ["VolatilityTarget", "CPPIFreeze"],
  "params": {
    "vol_target": 0.10,
    "freeze_floor_pct": 0.05
  }
}
```

#### **Configuration avancée avec Kelly**
```json
{
  "preset": "FTMO-advanced",
  "modules": ["VolatilityTarget", "CPPIFreeze", "KellyCap", "SoftBarrier"],
  "params": {
    "vol_target": 0.15,
    "alpha": 0.20,
    "freeze_floor_pct": 0.03,
    "kelly_fraction": 0.25
  }
}
```

## 🔧 **Développement**

### **Variables d'environnement**
```bash
# .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
```

### **Démarrage du backend**
```bash
cd backend
uvicorn app:app --reload --port 8001
```

### **Démarrage du frontend**
```bash
npm run dev
```

## 🎯 **Prochaines étapes**

### **1. Intégration backend**
- Connecter `generate_returns(profile)` au pipeline
- Implémenter l'application des modules
- Calculer les KPIs réels

### **2. Améliorations UI**
- Graphiques des courbes d'équité
- Comparaison de profils
- Export des résultats

### **3. Validation**
- Tests des profils Monte Carlo
- Validation des paramètres
- Gestion d'erreurs avancée

---

## 🏆 **Statut de l'implémentation**

**✅ Interface complète implémentée !** 🎉

- **Frontend** : Page de simulation avec tous les composants
- **Backend** : Endpoint `/simulate` avec schéma validé
- **API** : Client configurable avec fallback
- **Documentation** : Guide complet d'utilisation

**L'interface est prête pour les tests et l'intégration backend !** 🚀
