# 🧪 TESTS RAPIDES - VALIDATION IMMÉDIATE

## 🚀 **TEST IMMÉDIAT (5 minutes)**

### **1. 📱 Ouvrir l'Interface**
```
http://localhost:3003
```

### **2. 🎯 Test de Base**
- [ ] **Coller ce JSON** dans le textarea :
```json
{
  "initial_equity": 100000,
  "returns": [0.01, -0.005, 0.02, 0.015, -0.01],
  "steps_per_day": 20,
  "params": {
    "cppi": {"alpha": 0.2, "m": 3.0, "freeze_cushion_pct": 0.05},
    "amplifier": {"gain": 1.0, "cap": 1.5},
    "gates": {"news_enabled": true, "news_blocked_steps": [], "fee_bps_per_step": 0}
  }
}
```

- [ ] **Cliquer "Lancer"**
- [ ] **Vérifier** : KPIs s'affichent ✅

### **3. 🎮 Test des Graphes**
- [ ] **Cliquer "Afficher graphes"**
- [ ] **Vérifier** : 2 graphes s'affichent ✅
- [ ] **CRITIQUE** : Graphes restent stables (pas de scroll auto) ✅

### **4. 🎯 Test de Navigation**
- [ ] **Zoom** : Molette sur un graphe
- [ ] **Pan** : Clic + glisser sur un graphe
- [ ] **Vérifier** : Contrôles fonctionnent, pas de mouvement auto ✅

### **5. 📱 Test Responsive**
- [ ] **Redimensionner** la fenêtre
- [ ] **Vérifier** : Grille s'adapte ✅

---

## ✅ **SUCCÈS ATTENDU**

- **🎯 Stabilité** : Graphes parfaitement stables
- **🎮 Contrôles** : Zoom/pan fluides et contrôlés  
- **📱 Responsive** : Interface adaptative
- **⚡ Performance** : Chargement rapide

---

## 🚨 **PROBLÈMES CRITIQUES À DÉTECTER**

- ❌ Graphes qui défilent automatiquement
- ❌ Erreurs JavaScript dans la console
- ❌ Contrôles qui ne fonctionnent pas
- ❌ Interface qui plante

---

## 🎉 **RÉSULTAT ATTENDU**

**Les graphes sont maintenant professionnels, stables et optimisés !**

**Temps estimé** : 5 minutes
**Difficulté** : Facile
**Priorité** : Critique pour la validation
