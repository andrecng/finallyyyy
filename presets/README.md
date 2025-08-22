# 🎯 Presets de Test FTMO

Collection de 8 presets prêts à importer pour tester différents scénarios de risque et de performance.

## 📁 Import des Presets

1. **Copier** le contenu JSON d'un preset
2. **Coller** dans un fichier `.json` local
3. **Importer** depuis la barre d'actions (bouton ⬆ Import)
4. **Sauvegarder** dans la Preset Library avec "Save As"

## 🔍 Détail des Presets

### 1. **baseline-daily-first** (Point de départ)
```json
{
  "name": "baseline-daily-first",
  "modules": {
    "VolatilityTarget": { "vt_target_vol": 0.10, "vt_halflife": 16 },
    "CPPIFreeze": { "alpha": 0.20, "freeze_frac": 0.05 },
    "KellyCap": { "cap_mult": 0.50 },
    "SoftBarrier": { "enabled": true, "steps": [1,2,3], "haircuts": [0.7,0.5,0.3] },
    "FTMOGate": { "enabled": true, "daily_limit": 0.02, "total_limit": 0.10, "spend_rate": 0.35, "lmax_vol_aware": "p50" }
  }
}
```
**Attendu** : PASS/FAIL équilibré, DD modéré. Sert de référence.

---

### 2. **ftmo-tight** (Limites plus dures)
```json
{
  "name": "ftmo-tight",
  "FTMOGate": { "daily_limit": 0.01, "total_limit": 0.05 }
}
```
**Attendu** : Pass rate ↓ vs baseline, violations_daily/total ↑ (surtout si VT élevé).

---

### 3. **no-protection** (Tout off - anti-pattern)
```json
{
  "name": "no-protection",
  "modules": {}
}
```
**Attendu** : Max DD total ↑, Pass rate ↓, surtout avec backend. Sert d'anti-pattern.

---

### 4. **cppi-strong-freeze** (Plancher plus défensif)
```json
{
  "name": "cppi-strong-freeze",
  "modules": {
    "CPPIFreeze": { "alpha": 0.40, "freeze_frac": 0.10 },
    "FTMOGate": { "enabled": true, "daily_limit": 0.02, "total_limit": 0.10 }
  }
}
```
**Attendu** : Max DD total ↓ vs baseline, parfois Pass rate ↑ (surtout sur limite total). Le daily peut rester contraignant.

---

### 5. **vt-high-target** (Plus agressif)
```json
{
  "name": "vt-high-target",
  "modules": {
    "VolatilityTarget": { "vt_target_vol": 0.20, "vt_halflife": 8 },
    "FTMOGate": { "enabled": true, "daily_limit": 0.02, "total_limit": 0.10 }
  }
}
```
**Attendu** : Max DD daily ↑ et souvent violations_daily ↑ → Pass rate ↓ vs baseline.

---

### 6. **kelly-low-cap** (Bridé)
```json
{
  "name": "kelly-low-cap",
  "modules": {
    "KellyCap": { "cap_mult": 0.20 },
    "FTMOGate": { "enabled": true, "daily_limit": 0.02, "total_limit": 0.10 }
  }
}
```
**Attendu** : Pass rate ↑ vs baseline (risque plafonné), mais croissance plus lente.

---

### 7. **neg-edge** (Edge négatif + frais ↑)
```json
{
  "name": "neg-edge",
  "mu": -0.4,
  "fees_per_trade": 0.0005,
  "modules": {
    "VolatilityTarget": { "vt_target_vol": 0.10, "vt_halflife": 16 },
    "FTMOGate": { "enabled": true, "daily_limit": 0.02, "total_limit": 0.10 }
  }
}
```
**Attendu** : Pass rate ↓↓↓, DD ↑, test de robustesse. Les modules doivent limiter la casse, pas la supprimer.

---

### 8. **softbarrier-steep** (Paliers plus agressifs)
```json
{
  "name": "softbarrier-steep",
  "modules": {
    "SoftBarrier": { "enabled": true, "steps": [1,2,4,6], "haircuts": [0.8,0.6,0.4,0.2] },
    "FTMOGate": { "enabled": true, "daily_limit": 0.02, "total_limit": 0.10 }
  }
}
```
**Attendu** : Protection plus progressive, DD daily ↓, mais peut impacter la croissance.

## 🧪 Stratégie de Test

### **Phase 1 : Baseline**
1. Importer `baseline-daily-first`
2. Lancer simulation
3. Noter les métriques de référence

### **Phase 2 : Tests de Protection**
1. `no-protection` → Vérifier que c'est pire
2. `cppi-strong-freeze` → Vérifier DD ↓
3. `kelly-low-cap` → Vérifier risque ↓

### **Phase 3 : Tests de Contraintes**
1. `ftmo-tight` → Vérifier violations ↑
2. `vt-high-target` → Vérifier DD daily ↑
3. `neg-edge` → Vérifier robustesse

### **Phase 4 : Tests Avancés**
1. `softbarrier-steep` → Vérifier protection progressive
2. Combinaisons personnalisées

## 📊 Métriques à Surveiller

- **Pass Rate** : % de simulations qui passent FTMO
- **Max DD Total** : Drawdown maximum sur toute la période
- **Max DD Daily** : Drawdown maximum sur une journée
- **Violations Daily** : Nombre de violations de limite quotidienne
- **Violations Total** : Nombre de violations de limite totale

## 🎯 Objectifs

- **Comprendre** l'impact de chaque module
- **Valider** la robustesse du système
- **Optimiser** les paramètres pour FTMO
- **Identifier** les anti-patterns à éviter
