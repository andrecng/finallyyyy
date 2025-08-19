# 🚀 Moteur Alpha - Documentation Complète

## 📚 Vue d'Ensemble

Le **Moteur Alpha** est un système de gestion de risque adaptatif qui maximise le capital au travail tout en limitant strictement le risque selon les contraintes spécifiques de chaque objectif.

## 🎯 Philosophie Fondamentale

> **⚠️ SUPER IMPORTANT : Le risque est relatif, jamais absolu**

Le risque dépend du **contexte** et de l'**objectif** :
- **FTMO** : Perdre = casser la règle de −10% ou −5% par jour
- **Fonds long terme** : Perdre = descendre sous le plancher garanti
- **Particulier** : Perdre = descendre sous le capital initial

**Voir** : `docs/alpha_philosophie.md` pour les détails complets.

## 🏗️ Architecture

### **Couches Principales**
1. **Contrôle (Risk Management)** : CPPI Freeze, Kelly Cap, Soft Barrier
2. **Allocation (Position Sizing)** : Volatility Target, Kelly Calculator, Position Sizer
3. **Simulation (Backtesting)** : Monte Carlo Engine, Trade Simulator, Metrics Calculator

**Voir** : `docs/ARCHITECTURE_ALPHA.md` pour l'architecture détaillée.

## 📊 Stratégies

### **Baseline (Production)**
- **CPPI simple** : `α = 0.10` (DD max 10%)
- **Kelly fractionné** : `λ = 0.50` sur le cushion
- **Freeze** : si `cushion/W < 5%`

### **Expérimentation (Backlog)**
- **CPPI imbriqué** (double airbag)
- **Grille** : `α2 ∈ {0.3, 0.5, 0.7}`, `τ2 ∈ {0.05, 0.10, 0.20}`, `λ ∈ {0.25, 0.5, 0.75}`

**Voir** : `docs/alpha_strategy_baseline.md` pour la stratégie complète.

## 🔄 Adaptation Dynamique

### **Modes de Fonctionnement**
- **Mode Expansion** : Cushion > 20%, Kelly optimal
- **Mode Normal** : Cushion 5-20%, Kelly fractionné
- **Mode Protection** : Cushion < 5%, freeze effectif
- **Mode Survie** : Cushion < 2%, exposition minimale

**Voir** : `docs/alpha_concepts_cles.md` pour les concepts détaillés.

## 🧪 Tests & Validation

### **Test #001 - Volatility Target**
- **Objectif** : Valider la stabilisation du risque
- **Critères** : 6 règles d'or
- **Exécution** : `./scripts/run_test_001.sh`

### **Test A/B - Baseline CPPI + Kelly**
- **Objectif** : Valider la baseline production
- **Critères** : Contraintes FTMO + ratios d'efficacité
- **Exécution** : `./tests/run_ab_baseline.sh`

## 📈 Métriques de Décision

### **Contraintes FTMO (Priorité 1)**
- **Pass%** > 80% (DD total ≤ 10%, DD/jour ≤ 5%)
- **Target%** > 60% (+10% en ≤ 30j)
- **Jours→Cible** < 20 (médian)

### **Ratios d'Efficacité (Priorité 2)**
- **Calmar/MAR** > 2.0
- **Sortino** > 1.5
- **Gain-to-Pain** > 1.2

**Voir** : `tests/metrics_readme.md` pour les critères détaillés.

## 🚀 Roadmap

### **Phase 1 - Baseline (Maintenant)** ✅
- ✅ Frontend minimal (Pages Router)
- ✅ Backend API `/simulate`
- ✅ Test infrastructure
- ✅ Documentation stratégique complète

### **Phase 2 - Production (Prochaine)**
- 🔄 Implémentation CPPI Freeze
- 🔄 Implémentation Kelly Cap
- 🔄 Validation contraintes FTMO

### **Phase 3 - Optimisation (Futur)**
- ⏳ CPPI imbriqué
- ⏳ Grille de paramètres
- ⏳ Monte Carlo avancé

## 🔧 Utilisation

### **Lancer le Backend**
```bash
./scripts/dev.sh
```

### **Lancer le Frontend**
```bash
npm run dev -p 3003
```

### **Exécuter les Tests**
```bash
# Test #001 - Volatility Target
./scripts/run_test_001.sh

# Test A/B - Baseline CPPI + Kelly
./tests/run_ab_baseline.sh
```

## 📁 Structure des Fichiers

```
docs/
├── README_ALPHA.md               # Ce fichier (vue d'ensemble)
├── alpha_strategy_baseline.md    # Stratégie baseline (SUPER IMPORTANT)
├── alpha_philosophie.md          # Philosophie du risque relatif
├── alpha_concepts_cles.md        # Concepts clés synthétisés
└── ARCHITECTURE_ALPHA.md        # Architecture complète

tests/
├── specs/
│   └── test_001_voltarget.md    # Spécification Test #001
├── ab_config.json               # Configuration A/B testing
├── metrics_readme.md            # Guide des métriques
└── run_ab_baseline.sh          # Script A/B baseline

tools/
└── simulate_cli.py              # CLI Python pour simulations

scripts/
└── run_test_001.sh             # Script automatisé Test #001
```

## 🎯 Prochaines Étapes

1. **Implémenter Baseline** : CPPI Freeze + Kelly Cap dans `backend/modules/`
2. **Connecter simulate_core** : Remplacer le mock par la vraie logique
3. **Valider FTMO** : Respect des contraintes DD total/jour
4. **Tester A/B Réel** : Exécuter avec la vraie implémentation
5. **Optimiser Paramètres** : Grille de recherche pour `α`, `τ`, `λ`

## 💡 Notes Stratégiques

- **Kelly pur interdit** : Variance et DD trop élevés
- **Kelly fractionné** : Appliqué au cushion avec bornes
- **CPPI imbriqué** : Double airbag pour lisser l'impact
- **Contraintes FTMO** : Priorité absolue sur l'optimisation
- **Architecture modulaire** : Chaque composant testable indépendamment

## 🌟 Points Forts

1. **Infrastructure complète** : Frontend + Backend + Tests + Docs
2. **Documentation stratégique** : Baseline claire et roadmap détaillée
3. **Pipeline automatisé** : Tests et validation automatisés
4. **Architecture modulaire** : Composants indépendants et testables
5. **Approche méthodique** : Tests avant implémentation

---

## 🎉 Statut Actuel

**Infrastructure opérationnelle** ✅  
**Documentation stratégique créée** ✅  
**Pipeline de tests validé** ✅  

**Prêt pour l'implémentation** de la baseline CPPI + Kelly fractionné avec une base solide et testable.

---

> **Règle d'or** : **Adapter l'exposition au contexte, pas l'inverse.**
