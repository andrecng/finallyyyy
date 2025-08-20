# 🏗️ Framework du Moteur Money Management

Architecture logique et règles de structuration du moteur.

---

## 🔑 Principes
- **Source de vérité** = `journal_tests.md`
- **Chaque test validé** doit être synchronisé ici (statut, modules, résultats)
- **Placeholder** tant qu'aucun test n'est confirmé

---

## 📂 Modules actifs

### **✅ Modules Validés (Test #001)**
- **CPPIFreeze** : Gestion du plancher et freeze automatique
  - `alpha` : Paramètre de plancher (ex: 0.2 = 80% du HWM)
  - `m` : Multiple CPPI (contrôle agressivité)
  - `freeze_cushion_pct` : Seuil de freeze (ex: 5%)

- **AmplifierProportionnel** : Amplification et bornage
  - `gain` : Multiplicateur d'exposition
  - `cap` : Borne supérieure d'exposition

### **⏳ Modules en Développement**
- **KellyHook** : Désactivé par défaut (pas d'exposition de formules)
- **VolatilityTarget** : Ciblage de volatilité
- **SoftBarrier** : Barrières de protection douces

---

## 🧪 Tests synchronisés

### **Test #001 - ✅ CONFIRMÉ**
- **Statut** : PASS - Architecture validée
- **Modules** : CPPIFreeze, AmplifierProportionnel
- **Résultats** : Système opérationnel end-to-end
- **Métriques** : Max DD 0.3%, FTMO constraints respectées

---

## 🏗️ Architecture

### **Couches**
1. **Frontend** : Interface Next.js avec formulaire JSON
2. **API** : Endpoint `/api/simulate` 
3. **Moteur Core** : Logique métier modulaire
4. **Modules** : Composants spécialisés (CPPI, Amplifier, etc.)

### **Flux de Données**
```
JSON Input → API → simulateCore → Modules → Output (KPIs + Logs)
```

---

## 📋 Règles de Structuration

### **Nouveaux Tests**
1. **Créer** dans `journal_tests.md`
2. **Synchroniser** dans `docs/04_tests.md`
3. **Mettre à jour** ce framework si nouveaux modules

### **Nouveaux Modules**
1. **Implémenter** dans `src/core/modules/`
2. **Exporter** via `src/core/modules/index.ts`
3. **Intégrer** dans `simulate_core.ts`
4. **Tester** et valider
5. **Documenter** ici

---

## 🎯 Prochaines Étapes

- **Test #002** : Validation des paramètres extrêmes
- **Module VolatilityTarget** : Implémentation et tests
- **Optimisation** : Ajustement des paramètres par défaut
