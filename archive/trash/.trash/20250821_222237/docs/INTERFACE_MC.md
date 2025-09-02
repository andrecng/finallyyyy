# 🎯 Interface Monte Carlo - Guide Utilisateur

## 🚀 Démarrage Rapide

### **1. Démarrer les serveurs**
```bash
# Terminal 1 - Backend API
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001

# Terminal 2 - Frontend Next.js
npm run dev -- -p 3000
```

### **2. Accéder à l'interface**
- Ouvrez votre navigateur
- Allez sur `http://localhost:3000/workspace`

## 🎮 Utilisation de l'Interface

### **Boutons Disponibles**

#### **"Lancer la simulation"**
- Exécute une simulation unique
- Affiche la courbe d'équité
- Montre les KPIs de base (max_dd, pass_ftmo)

#### **"Lancer Monte Carlo (200 runs)"**
- Exécute 200 simulations indépendantes
- Calcule les métriques statistiques
- Affiche les résultats dans le panneau MC

### **Panneau Monte Carlo**

Le panneau MC affiche :

#### **Informations Générales**
- **Runs** : Nombre de simulations exécutées
- **Seed** : Seed utilisé pour la reproductibilité
- **Pass %** : Pourcentage de simulations qui passent les critères FTMO

#### **Métriques de Risk**
- **MaxDD** : Drawdown maximum (p05, p50, p95)
- **Final Eq** : Équité finale (p05, p50, p95)

#### **Ratios de Performance**
- **Sortino** : Ratio de Sortino (rendement vs risque de baisse)
- **Calmar** : Ratio Calmar (CAGR vs Maximum Drawdown)

## 📊 Interprétation des Résultats

### **Quantiles (p05, p50, p95)**
- **p05** : Scénario pessimiste (5% des cas)
- **p50** : Médiane (scénario typique)
- **p95** : Scénario optimiste (95% des cas)

### **Exemple de Lecture**
```
MaxDD (p05 / p50 / p95): 0.50% / 1.20% / 2.80%
```
- Dans 5% des cas, le drawdown max sera ≤ 0.50%
- Dans 50% des cas, le drawdown max sera ≤ 1.20%
- Dans 95% des cas, le drawdown max sera ≤ 2.80%

## 🔧 Configuration des Paramètres

### **Paramètres de Base**
- **`desired_risk`** : Risque désiré par pas
- **`total_steps`** : Nombre total de pas
- **`steps_per_day`** : Pas par jour (pour annualisation)

### **Modules FTMO**
- **`daily_limit`** : Limite de perte journalière
- **`total_limit`** : Limite de perte totale
- **`lmax`** : Cap d'exposition (base)
- **`lmax_min`** : Plancher dynamique
- **`lmax_halflife`** : Demi-vie EWMA volatilité

### **Modules Avancés**
- **`cppi_alpha`** : Drawdown autorisé CPPI
- **`vt_target_vol`** : Volatilité cible VolTarget
- **`vt_halflife`** : Demi-vie EWMA VolTarget

## 💡 Cas d'Usage

### **1. Validation de Stratégie**
1. Configurez vos paramètres
2. Lancez une simulation simple
3. Lancez Monte Carlo (200 runs)
4. Analysez la distribution des résultats

### **2. Optimisation de Paramètres**
1. Testez différentes configurations
2. Comparez les métriques MC
3. Identifiez les paramètres optimaux

### **3. Analyse de Risque**
1. Observez les quantiles p05/p95
2. Évaluez la robustesse de la stratégie
3. Validez les limites de drawdown

## 🧪 Tests et Validation

### **Script de Test Automatique**
```bash
python scripts/test_ui_mc.py
```

### **Test Manuel via API**
```bash
# Test simulation simple
curl -X POST http://127.0.0.1:8001/simulate \
  -H "Content-Type: application/json" \
  -d '{"params": {"desired_risk": 0.02, "total_steps": 100}}'

# Test Monte Carlo
curl -X POST http://127.0.0.1:8001/mc_simulate \
  -H "Content-Type: application/json" \
  -d '{"params": {"desired_risk": 0.02, "total_steps": 100}, "n_runs": 100}'
```

## 🚨 Dépannage

### **Problèmes Courants**

#### **"API KO"**
- Vérifiez que le backend est démarré sur le port 8001
- Vérifiez les logs uvicorn

#### **"Erreur: ..."**
- Vérifiez la console du navigateur
- Vérifiez les logs du backend
- Validez le format des paramètres

#### **Simulation lente**
- Monte Carlo peut prendre du temps (200 runs)
- Réduisez `n_runs` pour des tests rapides
- Utilisez `total_steps` plus petit

## 🔮 Fonctionnalités Avancées

### **Quantiles Personnalisés**
L'API supporte des quantiles personnalisés :
```json
{
  "quantiles": [0.01, 0.25, 0.5, 0.75, 0.99]
}
```

### **Seeds Reproductibles**
- Utilisez le même seed pour des résultats identiques
- Changez le seed pour tester la robustesse

### **Paramètres Dynamiques**
- **LMAX dynamique** : S'ajuste selon la volatilité
- **CPPI adaptatif** : Floor dynamique basé sur HWM
- **VolTarget intelligent** : Maintient la volatilité cible

---

**🎯 L'interface Monte Carlo de finallyyyy offre une analyse complète et intuitive des stratégies de trading, combinant simplicité d'utilisation et puissance d'analyse professionnelle.**
