# Architecture Moteur Alpha — Vue d'ensemble

## 🎯 Objectif Stratégique
**Maximiser le capital au travail** tout en **limitant strictement le risque** selon les contraintes FTMO.

> **⚠️ Philosophie clé** : Le risque est **relatif, jamais absolu**. Voir `docs/alpha_philosophie.md` pour les détails.

## 🏗️ Architecture en Couches

### 1. **Couche Contrôle (Risk Management)**
- **CPPI Freeze** : Plancher dynamique `F = HWM·(1−α)` + règle freeze
- **Kelly Cap** : Limitation de l'exposition maximale
- **Soft Barrier** : Gestion des violations et alertes

### 2. **Couche Allocation (Position Sizing)**
- **Volatility Target** : Stabilisation du risque effectif
- **Kelly Calculator** : Estimation de la fraction optimale
- **Position Sizer** : Calcul de la taille de position

### 3. **Couche Simulation (Backtesting)**
- **Monte Carlo Engine** : Génération de scénarios
- **Trade Simulator** : Exécution des trades
- **Metrics Calculator** : Calcul des KPIs et ratios

## 🔧 Modules Clés

### **Risk Management**
```python
# backend/modules/risk-control/
├── cppi-freeze.py      # Plancher dynamique + freeze
├── portfolio-caps.py   # Limites d'exposition
└── position-sizer.py   # Calcul taille position
```

### **Money Management**
```python
# backend/modules/money-management/
├── drawdown-manager.py # Gestion des drawdowns
├── kelly-calculator.py # Fraction Kelly optimale
└── volatility-target.ts # Cible de volatilité
```

### **Simulation Engine**
```python
# backend/modules/simulation/
├── engine.py           # Moteur principal
├── presets.py          # Configurations prédéfinies
└── validators.py       # Validation des paramètres
```

## 📊 Pipeline de Test

### **Test #001 - Volatility Target**
- **Objectif** : Valider la stabilisation du risque
- **Critères** : 6 règles d'or (voir `tests/specs/test_001_voltarget.md`)
- **Outils** : `tools/simulate_cli.py` + `scripts/run_test_001.sh`

### **Test A/B - Baseline CPPI + Kelly**
- **Objectif** : Valider la baseline production
- **Critères** : Contraintes FTMO + ratios d'efficacité
- **Outils** : `tests/run_ab_baseline.sh` + config `tests/ab_config.json`

## 🎲 Stratégies de Test

### **Baseline (Production)**
- CPPI simple avec plancher `α = 0.10`
- Kelly fractionné `λ = 0.50` sur le cushion
- Freeze si `cushion/W < 5%`

### **Expérimentation (Backlog)**
- CPPI imbriqué (double airbag)
- Grille de paramètres `α2`, `τ2`, `λ`
- Monte Carlo 1000+ runs par seed

## 📈 Métriques de Décision

### **Contraintes FTMO (Priorité 1)**
- Pass% > 80% (DD total ≤ 10%, DD/jour ≤ 5%)
- Target% > 60% (+10% en ≤ 30j)
- Jours→Cible < 20 (médian)

### **Ratios d'Efficacité (Priorité 2)**
- Calmar/MAR > 2.0
- Sortino > 1.5
- Gain-to-Pain > 1.2

## 🚀 Roadmap d'Implémentation

### **Phase 1 - Baseline (Maintenant)**
- ✅ Frontend minimal (Pages Router)
- ✅ Backend API `/simulate`
- ✅ Test infrastructure
- 🔄 Test #001 - Volatility Target
- ⏳ Test A/B - Baseline CPPI + Kelly

### **Phase 2 - Production (Prochaine)**
- 🔄 Implémentation CPPI Freeze
- 🔄 Implémentation Kelly Cap
- 🔄 Validation contraintes FTMO
- 🔄 Backtesting historique

### **Phase 3 - Optimisation (Futur)**
- ⏳ CPPI imbriqué
- ⏳ Grille de paramètres
- ⏳ Monte Carlo avancé
- ⏳ Machine Learning

## 🔍 Points de Validation

### **Critiques (Production)**
- Respect strict des contraintes FTMO
- Pas de "size-up after loss"
- Freeze effectif en cas de stress

### **Importants (Qualité)**
- Stabilité du risque effectif
- Efficacité des ratios
- Robustesse Monte Carlo

### **Optionnels (Recherche)**
- CPPI imbriqué
- Optimisation paramètres
- ML pour estimation Kelly

## 📚 Documentation

- **Stratégie** : `docs/alpha_strategy_baseline.md`
- **Architecture** : `docs/ARCHITECTURE_ALPHA.md` (ce fichier)
- **Tests** : `tests/specs/`, `tests/metrics_readme.md`
- **Config** : `tests/ab_config.json`
- **Scripts** : `tests/run_ab_baseline.sh`

---

> **Note** : Cette architecture est conçue pour être **modulaire**, **testable** et **évolutive**. Chaque composant peut être testé indépendamment avant intégration.
