# 🚀 Guide du Développeur - FondForex Money Management Engine

## 📋 Vue d'ensemble

Ce projet est un **moteur de gestion d'argent** pour le trading Forex, développé avec :
- **Frontend** : Next.js 14 + TypeScript + Tailwind CSS
- **Backend** : Python FastAPI + Uvicorn
- **Architecture** : Client-Server avec API REST

## 🏗️ Architecture du Projet

### Structure des dossiers
```
finallyyyy-1/
├── app/                    # Next.js App Router
│   ├── api/               # Routes API Next.js
│   ├── components/        # Composants React
│   ├── workspace/         # Page principale (simulation)
│   ├── simulate/          # Page dédiée simulation
│   └── optimize/          # Page d'optimisation
├── backend/               # Backend Python
├── components/            # Composants React globaux
├── engine/                # Moteur de simulation
├── lib/                   # Utilitaires TypeScript
└── presets/               # Fichiers de configuration
```

### Composants clés
- **`RunSimButton`** : Bouton unique de simulation (remplace l'ancien Run/Stop)
- **`PresetDropdown`** : Gestion des presets côté client
- **`EquityChart`** : Graphique des courbes d'équité
- **`RunJournalPanel`** : Journal des simulations

## 🔧 Installation et Démarrage

### Prérequis
- Node.js 18+ 
- Python 3.8+
- npm ou yarn

### Installation
```bash
# Cloner le projet
git clone <repo-url>
cd finallyyyy-1

# Installer les dépendances
npm install
pip install -r requirements.txt

# Activer l'environnement virtuel Python
source .venv/bin/activate  # macOS/Linux
# ou
.venv\Scripts\activate     # Windows
```

### Démarrage
```bash
# Démarrer les deux serveurs (frontend + backend)
npm run dev

# Ou séparément
npm run dev:web    # Frontend sur http://localhost:3000
npm run dev:api    # Backend sur http://localhost:8001
```

## 🎯 Fonctionnalités Principales

### 1. Simulation de Trading
- **Paramètres configurables** : steps, seed, drift, volatilité, frais
- **Modules actifs** : Volatility Target, CPPI Freeze, Kelly Cap, Soft Barrier
- **Contraintes** : profit target, max drawdown, limites daily/total

### 2. Gestion des Presets
- **Système client-side** : localStorage + synchronisation cross-tabs
- **Opérations** : Save, Save As, Delete, Load
- **Persistance** : Survit aux rechargements de page

### 3. Monte-Carlo
- **Simulations multiples** : 100+ itérations
- **Métriques** : Pass rate, DD percentiles
- **Auto-run** : Optionnel (évite les boucles infinies)

### 4. Visualisation
- **Graphiques** : Courbes d'équité en temps réel
- **KPIs** : Max DD, violations, performance
- **Journal** : Historique des simulations

## 🔄 Flux de Données

### Simulation
```
UI Form → mapToBackend() → /api/simulate → Backend Python → Résultats → normalizeSimOut() → UI
```

### Presets
```
localStorage ←→ PresetDropdown ←→ Form Inputs ←→ Save/Load Operations
```

## 🚨 Points d'Attention

### 1. Anti-Double-Click
- **RunSimButton** : `lockRef` empêche les clics multiples
- **Preset operations** : `savingRef` protège les sauvegardes

### 2. Gestion des Erreurs
- **API calls** : Timeout + AbortController
- **Fallbacks** : `/api/simulate` → `/simulate` si échec
- **Validation** : Payload sanitization côté serveur

### 3. Performance
- **Re-renders** : `runId` force le refresh des composants
- **Memoization** : `useMemo` pour les calculs coûteux
- **Debouncing** : Monte-Carlo auto-run évité

## 🐛 Débogage

### Variables de Debug (Console)
```javascript
// Accès aux données de simulation
window.__payload      // Payload envoyé
window.__raw         // Réponse brute du backend
window.__norm        // Données normalisées
window.__lastOut     // Dernier résultat
window.dbgSetOut()   // Fonction de debug
```

### Logs Utiles
- `EquityChart props` : Vérification des données reçues
- `simulate raw result` : Réponse du backend
- `out updated` : Mise à jour de l'état

### Tests API
```bash
# Test de santé
curl http://localhost:8001/health

# Test simulation
curl -X POST http://localhost:3000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"total_steps": 100, "use_vt": true}'
```

## 🔧 Maintenance

### Nettoyage des Fichiers
- **Supprimés** : Ancien système de presets serveur
- **Conservés** : Nouveau système client-side
- **Migration** : Complète vers localStorage

### Mise à Jour des Dépendances
```bash
# Frontend
npm update
npm audit fix

# Backend
pip install --upgrade -r requirements.txt
```

## 📚 Ressources

### Documentation
- **Next.js 14** : [App Router](https://nextjs.org/docs/app)
- **FastAPI** : [Tutorial](https://fastapi.tiangolo.com/tutorial/)
- **Tailwind CSS** : [Documentation](https://tailwindcss.com/docs)

### Composants React
- **Patterns** : Controlled components, custom hooks
- **State Management** : useState, useRef, useCallback
- **Performance** : useMemo, React.memo

## 🎉 Dernières Améliorations Apportées

### ✅ Problèmes Résolus
1. **Bouton "Stop" fantôme** → RunSimButton unique
2. **Auto-run Monte Carlo** → Boucles infinies éliminées
3. **Système de presets** → Migration complète vers client-side
4. **Gestion d'état** → Anti-double-click et validation
5. **API robuste** → Timeout + AbortController + fallbacks

### 🔄 Refactoring Effectué
- Suppression de l'ancien système de presets serveur
- Harmonisation des composants (une seule interface)
- Nettoyage des imports et dépendances
- Amélioration de la gestion d'erreurs

## 🚀 Prochaines Étapes Recommandées

### Court terme
1. **Tests** : Ajouter des tests unitaires et d'intégration
2. **Documentation** : JSDoc pour les composants
3. **Error boundaries** : Gestion des erreurs React

### Moyen terme
1. **State management** : Zustand ou Redux Toolkit
2. **Type safety** : Stricter TypeScript config
3. **Performance** : Lazy loading des composants

### Long terme
1. **PWA** : Service workers et offline support
2. **Real-time** : WebSockets pour les simulations longues
3. **Analytics** : Suivi des performances utilisateur

## 📞 Support

### En cas de problème
1. **Vérifier les logs** : Terminal + Console navigateur
2. **Redémarrer** : `npm run dev` (nettoie le cache)
3. **Vérifier les ports** : 3000 (frontend) et 8001 (backend)
4. **Consulter** : Ce guide et les commentaires dans le code

### Bonnes pratiques
- **Commits atomiques** : Un changement = un commit
- **Tests avant push** : Vérifier que tout fonctionne
- **Documentation** : Mettre à jour ce guide si nécessaire

---

**Bonne continuation avec Copilot ! 🚀**

*Ce projet est maintenant dans un état stable et maintenable. Toutes les améliorations ont été testées et validées.*
