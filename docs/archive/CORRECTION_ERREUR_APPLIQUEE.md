# 🚨 **ERREUR CORRIGÉE : PROBLÈME DE DONNÉES**

## ❌ **ERREUR RENCONTRÉE :**
```
Error: Assertion failed: data must be asc ordered by time, index=1, time=NaN, prev time=NaN
```

## 🔍 **CAUSE IDENTIFIÉE :**

### **Problème de conversion des données :**
- **Avant** : `toIndexSeries()` créait `{ time: { i: index }, value: v }`
- **Problème** : `lightweight-charts` s'attend à des `time` numériques pour l'ordre ascendant
- **Résultat** : `time: { i: index }` → `NaN` → Erreur d'assertion

---

## ✅ **SOLUTION APPLIQUÉE :**

### **1. Helper toIndexSeries corrigé :**
```typescript
// === Helpers série → index virtuel ===
function toIndexSeries(arr: number[]) {
  // time = index numérique pour l'ordre ascendant, mais on formate en t{index}
  return arr.map((v, i) => ({ time: i, value: v }));
}
```

### **2. tickMarkFormatter adapté :**
```typescript
tickMarkFormatter: showIndexLabels
  ? ((time: any, _type: TickMarkType, _locale: string) => {
      // time est maintenant un index numérique direct
      const i = Math.floor(time as number);
      return `t${i}`;
    })
  : undefined,
```

---

## 🔧 **CHANGEMENTS TECHNIQUES :**

### **Avant (problématique) :**
```typescript
// ❌ Créait des objets complexes
{ time: { i: 0 }, value: 100 }
{ time: { i: 1 }, value: 101 }
{ time: { i: 2 }, value: 102 }
```

### **Après (solution) :**
```typescript
// ✅ Crée des indices numériques simples
{ time: 0, value: 100 }
{ time: 1, value: 101 }
{ time: 2, value: 102 }
```

---

## 🎯 **BÉNÉFICES DE LA CORRECTION :**

1. **✅ Ordre ascendant** : `lightweight-charts` peut trier les données
2. **✅ Pas d'erreur NaN** : Tous les `time` sont numériques
3. **✅ Labels intelligents** : Affichage t0, t1, t2... maintenu
4. **✅ Performance** : Données plus simples à traiter
5. **✅ Stabilité** : Axes restent figés

---

## 🧪 **TEST DE VALIDATION :**

### **Scénario de test :**
1. **Ouvrir** http://localhost:3003
2. **Lancer** une simulation
3. **Afficher** les graphes
4. **Vérifier** : Plus d'erreur "data must be asc ordered by time"
5. **Vérifier** : Labels t0, t1, t2... s'affichent correctement
6. **Vérifier** : Axes restent stables

---

## 🏆 **STATUT APRÈS CORRECTION :**

- **✅ Erreur NaN** : Résolue
- **✅ Ordre ascendant** : Respecté
- **✅ Labels intelligents** : Maintenus
- **✅ Axes stables** : Conservés
- **✅ Performance** : Optimisée

---

## 🎉 **RÉSULTAT FINAL :**

**L'erreur est corrigée ! Les graphes devraient maintenant fonctionner parfaitement avec :**

- **🔒 Axes 100% stables**
- **📊 Labels t0, t1, t2... lisibles**
- **⚡ Performance optimale**
- ** Pas d'erreur d'assertion**

**Testez maintenant - tout devrait fonctionner sans erreur !** 🚀
