# 🎯 Système Monte Carlo - Risk Management Avancé

## 📋 Vue d'ensemble

Le système Monte Carlo de **finallyyyy** combine une architecture ultra-compacte avec des métriques de risk management avancées pour fournir une analyse complète des stratégies de trading.

## 🏗️ Architecture

### **Backend Unifié**
- **`backend/simulator.py`** : Moteur de simulation consolidé
- **`backend/main.py`** : API FastAPI avec endpoints `/simulate` et `/mc_simulate`
- **Modules intégrés** : FTMO, CPPI, VolTarget, SoftBarrier

### **Fonctionnalités Monte Carlo**
- **Simulations multiples** : Jusqu'à 2000 runs indépendants
- **Reproductibilité** : Seeds configurables pour résultats identiques
- **Métriques avancées** : Sortino, Calmar, quantiles personnalisables
- **Annualisation** : Calculs basés sur `steps_per_day`

## 🚀 Utilisation

### **Endpoint Simple : `/simulate`**
```bash
curl -X POST http://127.0.0.1:8001/simulate \
  -H "Content-Type: application/json" \
  -d '{"params": {"desired_risk": 0.02, "total_steps": 100}}'
```

### **Endpoint Monte Carlo : `/mc_simulate`**
```bash
curl -X POST http://127.0.0.1:8001/mc_simulate \
  -H "Content-Type: application/json" \
  -d '{
    "params": {
      "desired_risk": 0.018,
      "daily_limit": 0.025,
      "total_steps": 200,
      "steps_per_day": 1
    },
    "n_runs": 150,
    "seed": 42,
    "quantiles": [0.05, 0.25, 0.5, 0.75, 0.95]
  }'
```

## 📊 Métriques Disponibles

### **Métriques de Base**
- **`pass_pct`** : Pourcentage de simulations qui passent les critères FTMO
- **`n_runs`** : Nombre de simulations exécutées
- **`seed`** : Seed de base utilisé

### **Métriques de Risk**
- **`max_dd`** : Drawdown maximum (p05, p25, p50, p75, p95)
- **`final_eq`** : Équité finale (p05, p25, p50, p75, p95)

### **Ratios Avancés**
- **`sortino`** : Ratio de Sortino (annualisé si `steps_per_day` fourni)
- **`calmar`** : Ratio Calmar (CAGR / MaxDD)

## 🔧 Configuration des Modules

### **FTMO Gate (LMAX Dynamique)**
```json
{
  "daily_limit": 0.02,        // Limite journalière
  "total_limit": 0.10,        // Limite totale
  "spend_rate": 0.33,         // Pacing du budget
  "lmax": 0.02,               // LMAX de base (rétro-compatible)
  "lmax_min": 0.003,          // Plancher dynamique
  "lmax_halflife": 5,         // Demi-vie EWMA volatilité
  "ftmo_target_vol": 0.010,   // Volatilité cible
  "steps_per_day": 1,         // Pas par jour
  "freeze_after_loss": true,  // Pas d'upsize après perte
  "target_pct": 0.10,         // Cible de profit
  "max_days": 30              // Jours maximum
}
```

### **CPPI (Constant Proportion Portfolio Insurance)**
```json
{
  "cppi_alpha": 0.10,         // Drawdown autorisé
  "cppi_freeze_frac": 0.05    // Seuil de freeze
}
```

### **VolTarget (Volatility Targeting)**
```json
{
  "vt_target_vol": 0.010,     // Volatilité cible par pas
  "vt_halflife": 10           // Demi-vie EWMA
}
```

## 📈 Exemples de Résultats

### **Configuration de Base**
```json
{
  "n_runs": 100,
  "pass_pct": 0.0,
  "metrics": {
    "max_dd": {
      "p05": 0.0004, "p25": 0.0011, "p50": 0.0016,
      "p75": 0.0025, "p95": 0.0031
    },
    "final_eq": {
      "p05": 1.0448, "p25": 1.0548, "p50": 1.0608,
      "p75": 1.0664, "p95": 1.0772
    },
    "sortino": {
      "p05": 13.96, "p25": 22.76, "p50": 30.92,
      "p75": 48.45, "p95": 108.83
    },
    "calmar": {
      "p05": 129.87, "p25": 251.17, "p50": 379.68,
      "p75": 644.96, "p95": 1755.01
    }
  }
}
```

### **Configuration Avancée**
```json
{
  "n_runs": 100,
  "pass_pct": 0.0,
  "metrics": {
    "max_dd": {
      "p05": 0.0009, "p25": 0.0018, "p50": 0.0026,
      "p75": 0.0036, "p95": 0.0047
    },
    "final_eq": {
      "p05": 1.0418, "p25": 1.0538, "p50": 1.0610,
      "p75": 1.0677, "p95": 1.0807
    },
    "sortino": {
      "p05": 10.62, "p25": 17.24, "p50": 25.01,
      "p75": 33.82, "p95": 58.66
    },
    "calmar": {
      "p05": 84.39, "p25": 170.60, "p50": 234.99,
      "p75": 401.72, "p95": 846.83
    }
  }
}
```

## 🧪 Tests et Validation

### **Tests Unitaires**
```bash
# Tests MC basiques
python -m pytest tests/test_mc_basic.py -v

# Tests endpoints FastAPI
python -m pytest tests/test_mc_endpoint.py -v

# Tous les tests
python -m pytest tests/ -v
```

### **Script de Démonstration**
```bash
python scripts/demo_mc.py
```

## 💡 Cas d'Usage

### **1. Backtesting de Stratégies**
- Comparaison de différentes configurations de risk management
- Validation de la robustesse des paramètres
- Optimisation des seuils et limites

### **2. Analyse de Risque**
- Évaluation des drawdowns maximums (p95, p99)
- Analyse de la distribution des rendements
- Validation des ratios de performance

### **3. Validation FTMO**
- Test des critères de passage
- Analyse des breaches journaliers/totaux
- Optimisation des paramètres de gating

## 🔍 Analyse des Résultats

### **Interprétation des Quantiles**
- **p05** : Scénario pessimiste (5% des cas)
- **p25** : Quartile inférieur
- **p50** : Médiane (scénario typique)
- **p75** : Quartile supérieur
- **p95** : Scénario optimiste (95% des cas)

### **Ratios de Performance**
- **Sortino > 1** : Bon ratio risque/rendement
- **Calmar > 1** : Bon ratio rendement/drawdown
- **Plus les ratios sont élevés, meilleure est la stratégie**

## 🚨 Limitations et Considérations

### **Limitations Techniques**
- **n_runs** : Maximum 2000 pour éviter la surcharge
- **Reproductibilité** : Dépend de la qualité du RNG
- **Annualisation** : Approximative si `steps_per_day` non fourni

### **Considérations de Risque**
- **Backtesting** : Les résultats passés ne garantissent pas l'avenir
- **Paramètres** : Sensibilité aux choix de configuration
- **Marchés** : Comportement différent selon les conditions

## 🔮 Évolutions Futures

### **Fonctionnalités Prévues**
- **Stress Testing** : Scénarios de marché extrêmes
- **Optimisation** : Recherche automatique des meilleurs paramètres
- **Visualisation** : Graphiques de distribution et heatmaps
- **Export** : Rapports PDF/Excel automatisés

### **Intégrations**
- **Données réelles** : Connexion aux feeds de marché
- **Portfolio** : Gestion multi-actifs
- **Reporting** : Dashboard temps réel

---

**🎯 Le système Monte Carlo de finallyyyy offre une analyse complète et robuste des stratégies de trading, combinant simplicité d'utilisation et puissance d'analyse.**
