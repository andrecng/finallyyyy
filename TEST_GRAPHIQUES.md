# 🧪 GUIDE DE TEST - GRAPHIQUES OPTIMISÉS

## 🎯 **OBJECTIFS DE TEST**

Valider que les optimisations du composant TVChart fonctionnent correctement :
1. ✅ Graphes stables (pas de scroll auto)
2. ✅ Contrôles de navigation optimisés
3. ✅ Performance améliorée
4. ✅ Interface responsive

---

## 🚀 **ÉTAPE 1 : ACCÈS À L'INTERFACE**

```bash
# Ouvrir le navigateur
open http://localhost:3003

# Ou copier-coller : http://localhost:3003
```

---

## 🧪 **ÉTAPE 2 : TEST DE STABILITÉ**

### **Test A : Simulation Simple**
1. **Action** : Coller ce JSON dans le textarea :
```json
{
  "initial_equity": 100000,
  "returns": [0.01, -0.005, 0.02, 0.015, -0.01, 0.008, -0.012, 0.018],
  "steps_per_day": 20,
  "params": {
    "cppi": {"alpha": 0.2, "m": 3.0, "freeze_cushion_pct": 0.05},
    "amplifier": {"gain": 1.0, "cap": 1.5},
    "gates": {"news_enabled": true, "news_blocked_steps": [], "fee_bps_per_step": 0}
  }
}
```

2. **Action** : Cliquer "Lancer (Ctrl/Cmd+Enter)"
3. **Vérification** : 
   - ✅ KPIs s'affichent correctement
   - ✅ Bouton "Afficher graphes" apparaît
   - ✅ Pas d'erreur dans la console

### **Test B : Affichage des Graphes**
1. **Action** : Cliquer "Afficher graphes"
2. **Vérification** :
   - ✅ Courbe Equity s'affiche (9 points)
   - ✅ Courbe Exposure s'affiche (8 points)
   - ✅ **CRITIQUE** : Graphes restent stables, pas de scroll auto

---

## 🎮 **ÉTAPE 3 : TEST DES CONTRÔLES**

### **Test C : Zoom avec Molette**
1. **Action** : Placer la souris sur un graphe
2. **Action** : Utiliser la molette de la souris
3. **Vérification** :
   - ✅ Zoom fonctionne (in/out)
   - ✅ **CRITIQUE** : Pas de défilement automatique
   - ✅ Graphe reste centré sur la zone zoomée

### **Test D : Pan (Déplacement)**
1. **Action** : Cliquer et maintenir sur un graphe
2. **Action** : Faire glisser la souris
3. **Vérification** :
   - ✅ Graphe se déplace avec la souris
   - ✅ Navigation fluide et contrôlée
   - ✅ Pas de mouvement inattendu

### **Test E : Touch Mobile (Optionnel)**
1. **Action** : Ouvrir DevTools → Toggle device toolbar
2. **Action** : Tester le pinch (pincement) sur mobile
3. **Vérification** :
   - ✅ Zoom fonctionne avec les doigts
   - ✅ Pan fonctionne au toucher

---

## 📱 **ÉTAPE 4 : TEST RESPONSIVE**

### **Test F : Redimensionnement**
1. **Action** : Redimensionner la fenêtre du navigateur
2. **Vérification** :
   - ✅ Graphes s'adaptent à la largeur
   - ✅ Grille passe en 1 colonne sous 900px
   - ✅ Interface reste lisible

### **Test G : Mobile**
1. **Action** : DevTools → Toggle device toolbar
2. **Action** : Sélectionner un appareil mobile
3. **Vérification** :
   - ✅ Interface s'adapte au mobile
   - ✅ Boutons restent accessibles
   - ✅ Graphes restent fonctionnels

---

## 🔍 **ÉTAPE 5 : VALIDATION DES OPTIMISATIONS**

### **Test H : Performance**
1. **Action** : Ouvrir DevTools → Performance
2. **Action** : Lancer une simulation
3. **Vérification** :
   - ✅ Pas de re-renders excessifs
   - ✅ Graphes se chargent rapidement
   - ✅ Pas de lag lors du zoom/pan

### **Test I : Console d'Erreurs**
1. **Action** : DevTools → Console
2. **Action** : Lancer plusieurs simulations
3. **Vérification** :
   - ✅ Aucune erreur JavaScript
   - ✅ Aucun warning
   - ✅ Logs propres

---

## ✅ **CRITÈRES DE SUCCÈS**

### **Stabilité** 🎯
- [ ] Graphes restent stables, pas de scroll auto
- [ ] Pas de mouvement inattendu des graphes
- [ ] Interface prévisible et contrôlée

### **Contrôles** 🎮
- [ ] Zoom fonctionne avec la molette
- [ ] Pan fonctionne au drag & drop
- [ ] Navigation fluide et responsive

### **Performance** ⚡
- [ ] Chargement rapide des graphes
- [ ] Pas de lag lors des interactions
- [ ] Code optimisé et propre

### **Responsive** 📱
- [ ] Adaptation mobile/desktop
- [ ] Grille adaptative fonctionnelle
- [ ] Interface lisible sur tous les écrans

---

## 🚨 **PROBLÈMES À SIGNALER**

### **Critiques** 🔴
- Graphes qui défilent automatiquement
- Erreurs JavaScript dans la console
- Interface qui plante ou freeze

### **Majeurs** 🟠
- Contrôles de navigation qui ne fonctionnent pas
- Performance lente ou lag
- Interface non responsive

### **Mineurs** 🟡
- Petits problèmes d'affichage
- Animations pas fluides
- Styles légèrement décalés

---

## 📝 **RAPPORT DE TEST**

Après avoir effectué tous les tests, documentez :

```markdown
## 📊 RÉSULTATS DES TESTS

**Date** : [DATE]
**Tester** : [NOM]
**Version** : TVChart Optimisé

### ✅ Tests Réussis
- [ ] Test A : Simulation Simple
- [ ] Test B : Affichage des Graphes
- [ ] Test C : Zoom avec Molette
- [ ] Test D : Pan (Déplacement)
- [ ] Test E : Touch Mobile
- [ ] Test F : Redimensionnement
- [ ] Test G : Mobile
- [ ] Test H : Performance
- [ ] Test I : Console d'Erreurs

### 🚨 Problèmes Détectés
- [ ] Aucun problème
- [ ] Problème critique : [DESCRIPTION]
- [ ] Problème majeur : [DESCRIPTION]
- [ ] Problème mineur : [DESCRIPTION]

### 🏆 Conclusion
[RESUMÉ DES RÉSULTATS]
```

---

## 🎉 **SUCCÈS ATTENDU**

Avec les optimisations appliquées, vous devriez constater :

1. **🎯 Stabilité** : Graphes parfaitement stables, pas de scroll auto
2. **🎮 Contrôles** : Navigation fluide et contrôlée
3. **⚡ Performance** : Chargement rapide et interactions fluides
4. **📱 Responsive** : Interface adaptative sur tous les écrans

**Les graphes sont maintenant professionnels et optimisés !** 🚀
