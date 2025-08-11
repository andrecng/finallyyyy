# ForexMM Pro - Laboratoire de Simulation de Trading

## 🎯 Description

**ForexMM Pro** est un laboratoire de simulation de trading avancé développé avec Next.js. Il permet de configurer, tester et analyser des stratégies de trading via des simulations Monte-Carlo avec une interface professionnelle.

## ✨ Fonctionnalités

### 🧪 Laboratoire de Simulation
- **Interface 3-panels** : Paramètres, Graphiques, KPIs
- **Configuration avancée** : Capital, Edge, Kelly, Bayes, etc.
- **Simulation Monte-Carlo** avec données mock
- **Gestion des presets** et export de configuration

### 📊 Visualisations
- **Graphiques interactifs** avec Recharts
- **Courbe d'equity** et drawdown
- **Distribution R/Trade**
- **Métriques de performance** en temps réel

### 🎨 Interface Utilisateur
- **Thème Binance** sombre et professionnel
- **Composants UI** modernes avec shadcn/ui
- **Responsive design** et navigation intuitive
- **Séparateurs de milliers** pour une meilleure lisibilité

## 🚀 Technologies

- **Frontend** : Next.js 13.5.1 + TypeScript
- **Styling** : Tailwind CSS + shadcn/ui
- **État** : Zustand
- **Graphiques** : Recharts
- **Architecture** : App Router + Composants modulaires

## 📁 Structure du Projet

```
finallyyyy-1/
├── app/                    # Pages Next.js
│   ├── lab/              # Laboratoire principal
│   ├── backtest/         # Backtest historique
│   ├── ftmo/             # Mode FTMO
│   └── ...               # Autres pages
├── components/            # Composants React
│   ├── lab/              # Composants du laboratoire
│   └── ui/               # Composants UI génériques
├── stores/               # Gestion d'état Zustand
├── lib/                  # Types et utilitaires
└── docs/                 # Documentation
```

## 🛠️ Installation

```bash
# Cloner le projet
git clone https://github.com/andrecng/finallyyyy.git
cd finallyyyy-1

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

## 📖 Documentation

- **[CHANGELOG.md](CHANGELOG.md)** - Historique des versions et changements
- **[AVANCEE_SESSION.md](AVANCEE_SESSION.md)** - Journal des sessions de développement
- **Types TypeScript** - Documentation complète des interfaces

## 🎯 Roadmap

### Phase 1: Frontend ✅ COMPLET
- [x] Interface utilisateur complète
- [x] Configuration des paramètres
- [x] Graphiques et visualisations
- [x] Gestion des presets

### Phase 2: Backend 🚧 EN COURS
- [ ] API FastAPI pour simulations réelles
- [ ] Base de données des résultats
- [ ] Export fonctionnel (CSV, PNG, PDF)

### Phase 3: Production 🎯
- [ ] Tests automatisés
- [ ] Déploiement
- [ ] Monitoring et analytics

## 🤝 Contribution

Ce projet est en développement actif. Les contributions sont les bienvenues !

## 📄 Licence

Projet privé - Tous droits réservés

---

**Développé avec ❤️ pour la simulation de trading professionnelle**
