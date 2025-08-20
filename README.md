# 🚀 Moteur Alpha - Système de Gestion de Risque Adaptatif

## 📚 Vue d'Ensemble

Le **Moteur Alpha** est un système de gestion de risque adaptatif qui maximise le capital au travail tout en limitant strictement le risque selon les contraintes spécifiques de chaque objectif (FTMO, fonds long terme, etc.).

## 🎯 Philosophie Fondamentale

> **⚠️ SUPER IMPORTANT : Le risque est relatif, jamais absolu**

- **Risque relatif** : Le risque dépend du portefeuille et de l'objectif
- **Adaptation dynamique** : L'exposition s'adapte au contexte de marché
- **Protection proactive** : Freeze automatique avant d'atteindre les limites
- **Maximisation intelligente** : Amplification proportionnelle au momentum

## 🏗️ Architecture

### **Couches Principales**
- **Frontend** : Next.js avec interface minimaliste et intuitive
- **Backend** : FastAPI avec endpoints REST pour la simulation
- **Moteur de Risque** : CPPI Freeze + Amplificateur Proportionnel
- **Pipeline de Tests** : Tests automatisés et validation Monte Carlo

### **Modules Clés**
- **`engine/prop_amplifier.py`** : Amplificateur proportionnel au momentum
- **`tests/`** : Suite complète de tests et validation
- **`scripts/`** : Automatisation des tests et déploiement
- **`docs/`** : Documentation stratégique et philosophique

## 🚀 Installation & Démarrage

### **Prérequis**
- Python 3.10+
- Node.js 18+
- npm ou yarn

### **Installation Backend**
```bash
cd backend
python -m venv ../infra/.venv
source ../infra/.venv/bin/activate  # Linux/Mac
# ou ../infra/.venv\Scripts\activate  # Windows
pip install -r ../config/requirements.txt
```

### **Installation Frontend**
```bash
npm install
```

### **Démarrage**
```bash
# Terminal 1 - Backend
./scripts/dev.sh

# Terminal 2 - Frontend
npm run dev -- -p 3003
```

## 🧪 Tests & Validation

### **Tests Automatisés**
```bash
# Tests CPPI Freeze
./scripts/run_freeze_tests.sh

# Tests Amplificateur Proportionnel
./scripts/run_amplifier_tests.sh

# Tests individuels
source backend/.venv/bin/activate
python3 tests/test_freeze_modes.py
python3 tests/sim_soft_propamp_mc.py
```

### **Validation Monte Carlo**
- **2000+ scénarios** testés automatiquement
- **Contraintes FTMO** validées (DD ≤ 10%, DD/jour ≤ 5%)
- **Métriques de performance** : Success rate, hit target, max DD

## 🔒 Stratégies de Risque

### **CPPI Freeze**
- **Modes** : Hard freeze (permanent) et Soft freeze (défreeze possible)
- **Seuils** : Freeze si `cushion/W < 5%`, défreeze si `≥ 8%`
- **Protection** : Exposition = 0 en mode freeze

### **Amplificateur Proportionnel**
- **Momentum** : EMA des hausses du cushion
- **Amplification** : `λ_eff = λ_base × (1 + β × momentum_norm)`
- **Sécurité** : Cap d'exposition `E/W ≤ 1.5%`
- **Cooldown** : Pas d'amplification après perte

## 📊 Métriques & KPIs

### **Métriques de Risque**
- **Max Drawdown** : Limite stricte selon l'objectif
- **Ulcer Index** : Mesure de la douleur du portefeuille
- **Sortino Ratio** : Rendement ajusté au risque de baisse
- **Calmar Ratio** : Rendement vs max drawdown

### **Métriques de Performance**
- **Success Rate** : % de sessions réussies (target + contraintes)
- **Hit Target** : % d'atteinte de l'objectif (+10% pour FTMO)
- **Days to Target** : Temps moyen pour atteindre l'objectif

## 🎯 Cas d'Usage

### **FTMO Challenge**
- **Objectif** : +10% en ≤ 30 jours
- **Contraintes** : DD total ≤ 10%, DD/jour ≤ 5%
- **Stratégie** : CPPI Freeze + Amplificateur Proportionnel

### **Fonds Long Terme**
- **Objectif** : Survie et stabilité
- **Contraintes** : Plancher garanti, ratio rendement/risque
- **Stratégie** : CPPI conservateur avec airbag multiple

## 📁 Structure du Projet

```
/ (racine)
├── package.json, tsconfig.json, next.config.js, tailwind.config.ts
├── README.md, CHANGELOG.md, journal_tests.md
├── app/                    # Frontend Next.js
├── components/             # UI et composants
├── backend/                # API FastAPI
├── engine/                 # Moteur Python (money management)
├── tests/                  # Tests Python & JS
├── docs/                   # Documentation
├── scripts/                # Scripts utilitaires
├── config/
│   ├── requirements.txt    # Dépendances Python
│   ├── pyproject.toml     # Config Python/Poetry
│   └── vitest.config.ts   # Config tests front
└── infra/
    ├── .venv/             # Environnement virtuel Python
    ├── logs/              # Logs backend
    └── .pytest_cache/     # Cache tests Python
```

## 🔧 Configuration

### **Variables d'Environnement**
```bash
# .env.local
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8001
```

### **Paramètres de l'Amplificateur**
```python
@dataclass
class PropAmpConfig:
    tau_freeze: float = 0.05      # Seuil de freeze (5%)
    tau_up: float = 0.08          # Seuil de défreeze (8%)
    beta: float = 2.0             # Sensibilité au momentum
    lam_base: float = 0.50        # Lambda de base (Kelly fractionné)
    max_E_to_W: float = 0.015    # Cap d'exposition (1.5%)
```

## 🚀 Développement

### **Ajout de Nouvelles Stratégies**
1. Créer le module dans `engine/`
2. Implémenter les tests dans `tests/`
3. Valider avec Monte Carlo
4. Documenter dans `docs/`

### **Tests de Validation**
1. **Tests unitaires** : Logique de base
2. **Tests d'intégration** : Pipeline complet
3. **Tests Monte Carlo** : Robustesse sur 2000+ scénarios
4. **Tests de stress** : Scénarios de marché extrêmes

## 📈 Roadmap

### **Phase 1 - Infrastructure** ✅
- ✅ Frontend Next.js minimal
- ✅ Backend FastAPI opérationnel
- ✅ Tests CPPI Freeze validés
- ✅ Amplificateur Proportionnel implémenté

### **Phase 2 - Implémentation** 🔄
- 🔄 Modules Risk Management complets
- 🔄 Intégration simulate_core
- 🔄 Validation FTMO en production

### **Phase 3 - Optimisation** ⏳
- ⏳ CPPI imbriqué (double airbag)
- ⏳ Machine Learning pour paramètres dynamiques
- ⏳ Multi-timeframe momentum
- ⏳ Stratégies adaptatives avancées

## 🤝 Contribution

### **Guidelines**
1. **Tests obligatoires** : Tous les changements doivent passer les tests
2. **Documentation** : Mettre à jour la documentation correspondante
3. **Validation** : Tests Monte Carlo pour les nouvelles stratégies
4. **Philosophie** : Respecter le principe du risque relatif

### **Workflow**
1. Fork du repository
2. Créer une branche feature
3. Implémenter avec tests
4. Valider avec Monte Carlo
5. Pull Request avec documentation

## 📚 Documentation

### **Documents Clés**
- **`docs/README_ALPHA.md`** : Vue d'ensemble complète
- **`docs/ARCHITECTURE_ALPHA.md`** : Architecture détaillée
- **`docs/alpha_philosophie.md`** : Philosophie du risque relatif
- **`TESTS_FREEZE_COMPLETE.md`** : Validation des tests CPPI
- **`AMPLIFICATEUR_PROPORTIONNEL_COMPLETE.md`** : Validation de l'amplificateur

## 🎉 Statut du Projet

**Tests Freeze + Amplificateur Proportionnel** : ✅ **COMPLETE**

- **Moteur CPPI Freeze** : Validé et opérationnel
- **Amplificateur Proportionnel** : Implémenté et testé
- **Pipeline de tests** : Automatisé et reproductible
- **Validation FTMO** : Toutes les contraintes respectées
- **Documentation** : Complète et à jour

## 🔗 Liens Utiles

- **Repository GitHub** : [https://github.com/andrecng/finallyyyy](https://github.com/andrecng/finallyyyy)
- **API Backend** : `http://localhost:8001`
- **Frontend** : `http://localhost:3003`
- **Documentation** : Voir le dossier `docs/`

## 📞 Support

Pour toute question ou contribution :
- **Issues** : Utiliser les GitHub Issues
- **Discussions** : GitHub Discussions pour les questions générales
- **Pull Requests** : Pour les contributions de code

---

> **Le Moteur Alpha** : Maximiser le capital au travail selon le contexte, jamais l'inverse. 🚀
