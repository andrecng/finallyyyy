# 🎯 **GUIDE D'UTILISATION DES PROFILS ET RUNNER MC**

## 📋 **PROFILS DISPONIBLES**

### **1. 🟢 `gaussian` - Test Optimiste**
```json
{
  "sampler": "gaussian",
  "mu": 0.0002,        // Rendement moyen par step
  "sigma": 0.008,      // Volatilité fixe
  "vol_process": "none", // Pas de clustering
  "jumps": { "enabled": false } // Pas de sauts
}
```
**Utilisation** : Tests de base, validation des modules, cas "normaux"

---

### **2. 🟡 `student_t` - Test Réaliste**
```json
{
  "sampler": "student_t",
  "mu": 0.0002,
  "sigma": 0.009,      // Vol légèrement plus élevée
  "nu": 4,             // Queues épaisses (Student-t)
  "vol_process": "none",
  "jumps": { "enabled": false }
}
```
**Utilisation** : Tests réalistes, validation queues épaisses, stress modéré

---

### **3. 🔴 `student_t_jumps_ewma` - Test Stress Réaliste**
```json
{
  "sampler": "student_t",
  "mu": 0.00015,       // Rendement légèrement plus faible
  "sigma": 0.010,      // Vol de base plus élevée
  "nu": 4,             // Queues épaisses
  "vol_process": "ewma", // Volatilité en grappes
  "ewma": {
    "lambda": 0.94,    // Persistance de la vol
    "sigma0": 0.010,   // Vol initiale
    "shock": 0.02      // Amplitude des chocs
  },
  "jumps": {
    "enabled": true,
    "p_jump": 0.01,    // 1% de probabilité de saut
    "jump_sigma": 0.04 // Volatilité des sauts
  }
}
```
**Utilisation** : Stress testing complet, validation robustesse, cas extrêmes

---

## 🚀 **UTILISATION DU RUNNER MC**

### **Commande de base :**
```bash
python sim/run_mc.py --profile <nom_profil> --n <runs> --T <steps> --seed <seed> --out <fichier>
```

### **Exemples d'utilisation :**

#### **Test rapide (gaussian) :**
```bash
python sim/run_mc.py --profile gaussian --n 1000 --T 500 --seed 123 --out out/test_gauss.json
```

#### **Test complet (tous les profils) :**
```bash
bash scripts/run_mc_stress.sh
```

#### **Test personnalisé :**
```bash
python sim/run_mc.py --profile student_t --n 5000 --T 1000 --seed 42 --out out/custom_test.json
```

---

## 📊 **SORTIES ET MÉTRIQUES**

### **Fichier de sortie JSON :**
```json
{
  "profile": "student_t_jumps_ewma",
  "runs": 2000,
  "T": 1000,
  "seed": 13,
  "summary": {
    "avg_worst_dd": -0.045,
    "p95_worst_dd": -0.089
  }
}
```

### **Métriques calculées :**
- **`avg_worst_dd`** : Drawdown moyen sur tous les runs
- **`p95_worst_dd`** : 95ème percentile des pires drawdowns

---

## 🔧 **EXTENSION AVEC MODULES**

### **Actuellement (proxy) :**
```python
# TODO: appliquer modules -> aggregate_min() -> equity, logs
# Ici, simple proxy: DD sur la série bruitee (à remplacer par equity réel)
eq = (1.0 + r).cumprod()
peak = np.maximum.accumulate(eq)
dd = (eq - peak) / peak
worst_dds.append(dd.min())
```

### **Futur (avec modules) :**
```python
# 1. Générer les returns selon le profil
returns = gen_returns(profile, T, rng)

# 2. Appliquer les modules de risk management
module_results = []
module_results.append(cppi_module.step(equity, hwm, cushion))
module_results.append(vol_target.step(returns, current_exposure))
module_results.append(soft_barrier.step(equity))
module_results.append(ftmo_gate.step(daily_equity, total_equity))

# 3. Agrégation avec aggregate_min()
risk_result = aggregate_min(module_results, last_pnl)

# 4. Calcul de l'équité et métriques
equity = calculate_equity(returns, risk_result["risk_final"])
ftmo_report = ftmo_reporter.generate_report(equity, daily_equity)
```

---

## 🎯 **STRATÉGIE DE TESTING**

### **Phase 1 : Validation de base**
```bash
# Tester avec gaussian (cas simple)
python sim/run_mc.py --profile gaussian --n 1000 --T 500 --seed 42
```

### **Phase 2 : Validation réaliste**
```bash
# Tester avec student_t (queues épaisses)
python sim/run_mc.py --profile student_t --n 2000 --T 1000 --seed 123
```

### **Phase 3 : Stress testing complet**
```bash
# Tester avec student_t_jumps_ewma (cas extrêmes)
python sim/run_mc.py --profile student_t_jumps_ewma --n 5000 --T 1000 --seed 456
```

### **Phase 4 : Validation complète**
```bash
# Tous les profils d'un coup
bash scripts/run_mc_stress.sh
```

---

## 🚨 **POINTS D'ATTENTION**

### **1. Seeds différents**
- Utilisez des seeds différents pour chaque profil
- Évitez la corrélation entre tests

### **2. Taille des runs**
- **Validation** : 1000-2000 runs suffisent
- **Production** : 5000+ runs recommandés
- **Stress** : 10000+ runs pour cas extrêmes

### **3. Horizon T**
- **Court terme** : T=500 (validation rapide)
- **Moyen terme** : T=1000 (tests standard)
- **Long terme** : T=2000+ (validation robustesse)

---

## 🎉 **PROCHAINES ÉTAPES**

### **1. Implémentation des modules**
- Brancher `VolTarget`, `CPPI`, `Kelly`, `SoftBarrier`, `FTMO`
- Remplacer le proxy DD par l'équité réelle

### **2. Métriques avancées**
- Rapports FTMO complets
- Analyse des binders (modules limitants)
- Logs détaillés par run

### **3. Interface utilisateur**
- Sélection de profil dans le frontend
- Visualisation des résultats MC
- Comparaison entre profils

---

## 🏆 **STATUT ACTUEL**

**Le système de profils et le runner MC sont opérationnels !** 🚀

- **✅ Profils JSON** : 3 configurations prêtes
- **✅ Loader** : Chargement automatique des profils
- **✅ Runner MC** : Génération de returns selon profil
- **✅ Scripts** : Stress testing automatisé
- **✅ Extensible** : Prêt pour l'intégration des modules

**Prêt pour les tests Monte Carlo avec profils configurables !** 🎯
