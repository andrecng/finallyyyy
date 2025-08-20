# AVANCEE SESSION - Moteur Alpha

## 🎯 Objectif de la Session
Mise en place d'une **infrastructure complète** pour le moteur Alpha avec :
- Frontend minimal et sobre
- Backend API fonctionnel
- Pipeline de tests automatisé
- Documentation stratégique complète

## ✅ Réalisations

### **Frontend Minimal (Sobre & Propre)**
- **Architecture** : Pages Router (plus stable que App Router)
- **Design** : Interface épurée, navigation simple
- **Pages** : Home + Strategy Tester
- **Style** : System fonts, padding uniforme, couleurs sobres

### **Backend API**
- **Endpoint** : `/simulate` avec validation permissive
- **Mock** : Fallback temporaire pour tests UI
- **CORS** : Configuré pour frontend localhost:3003
- **Port** : 8001 (via `./scripts/dev.sh`)

### **Infrastructure de Tests**
- **Test #001** : Volatility Target (6 règles d'or)
- **CLI Python** : `tools/simulate_cli.py` avec mock
- **Scripts Shell** : `scripts/run_test_001.sh` automatisé
- **Journal** : Template `journal_tests.md` pour résultats

### **Documentation Stratégique**
- **README** : `docs/README_ALPHA.md` (vue d'ensemble complète)
- **Baseline** : `docs/alpha_strategy_baseline.md` (SUPER IMPORTANT)
- **Architecture** : `docs/ARCHITECTURE_ALPHA.md` (vue d'ensemble)
- **Philosophie** : `docs/alpha_philosophie.md` (risque relatif)
- **Concepts** : `docs/alpha_concepts_cles.md` (synthèse philosophique)
- **Config A/B** : `tests/ab_config.json` (paramètres FTMO)
- **Métriques** : `tests/metrics_readme.md` (critères de décision)

## 🏗️ Architecture Moteur Alpha

### **Couches Principales**
1. **Contrôle (Risk Management)** : CPPI Freeze, Kelly Cap, Soft Barrier
2. **Allocation (Position Sizing)** : Volatility Target, Kelly Calculator, Position Sizer
3. **Simulation (Backtesting)** : Monte Carlo Engine, Trade Simulator, Metrics Calculator

### **Modules Clés**
- **Risk Control** : `cppi-freeze.py`, `portfolio-caps.py`, `position-sizer.py`
- **Money Management** : `drawdown-manager.py`, `kelly-calculator.py`, `volatility-target.ts`
- **Simulation** : `engine.py`, `presets.py`, `validators.py`

## 📊 Pipeline de Tests

### **Test #001 - Volatility Target**
- **Objectif** : Valider la stabilisation du risque
- **Critères** : 6 règles d'or (cible vol, overshoot, no size-up, CPPI freeze, Kelly guardrail, stabilité)
- **Outils** : CLI Python + script shell automatisé

### **Test A/B - Baseline CPPI + Kelly**
- **Objectif** : Valider la baseline production
- **Critères** : Contraintes FTMO (DD total ≤ 10%, DD/jour ≤ 5%, +10% en ≤ 30j)
- **Ratios** : Calmar > 2.0, Sortino > 1.5, Gain-to-Pain > 1.2

## 🎲 Stratégies

### **Baseline (Production)**
- CPPI simple : `α = 0.10` (DD max 10%)
- Kelly fractionné : `λ = 0.50` sur le cushion
- Freeze : si `cushion/W < 5%`

### **Expérimentation (Backlog)**
- CPPI imbriqué (double airbag)
- Grille : `α2 ∈ {0.3, 0.5, 0.7}`, `τ2 ∈ {0.05, 0.10, 0.20}`, `λ ∈ {0.25, 0.5, 0.75}`
- Monte Carlo : 1000+ runs par seed

## 🚀 Roadmap

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

## 📁 Structure des Fichiers

```
docs/
├── README_ALPHA.md               # Vue d'ensemble complète
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

1. **Valider Test #001** : Exécuter `./scripts/run_test_001.sh`
2. **Implémenter Baseline** : CPPI Freeze + Kelly Cap
3. **Tester A/B** : Exécuter `./tests/run_ab_baseline.sh`
4. **Valider FTMO** : Respect des contraintes DD total/jour
5. **Optimiser Paramètres** : Grille de recherche pour `α`, `τ`, `λ`

## 💡 Notes Importantes

- **Kelly pur interdit** : Variance et DD trop élevés
- **Kelly fractionné** : Appliqué au cushion avec bornes
- **CPPI imbriqué** : Double airbag pour lisser l'impact
- **Contraintes FTMO** : Priorité absolue sur l'optimisation
- **Architecture modulaire** : Chaque composant testable indépendamment

---

> **Session réussie** : Infrastructure complète mise en place, documentation stratégique créée, pipeline de tests opérationnel. Prêt pour l'implémentation de la baseline CPPI + Kelly fractionné.

