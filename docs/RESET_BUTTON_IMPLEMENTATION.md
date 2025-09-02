# 🔄 Implémentation du Bouton Reset

## 📍 **Localisation Actuelle**

Le bouton Reset existe déjà dans `app/workspace/page.tsx` à la **ligne 287** :

```tsx
<button onClick={resetBaseline} className="btn">↺ Reset</button>
```

## 🔍 **Problème Identifié**

**Fonction actuelle** : `resetBaseline()` remet les paramètres aux **valeurs par défaut** (baseline)
**Fonction souhaitée** : Remettre **TOUS** les paramètres à **zéro**

## 🛠️ **Solution : Modifier la Fonction Reset**

### **Option 1 : Modifier resetBaseline (Recommandée)**
```tsx
const resetBaseline = () => {
  if (confirm("Remettre tous les paramètres à zéro ?")) {
    setPreset({
      schema_version: "1.0",
      name: "reset",
      seed: 0,
      total_steps: 0,
      mu: 0,
      fees_per_trade: 0,
      sigma: 0,
      steps_per_day: 0,
      target_profit: 0,
      max_days: 0,
      daily_limit: 0,
      total_limit: 0,
      modules: {
        VolatilityTarget: { vt_target_vol: 0, vt_halflife: 0 },
        CPPIFreeze: { alpha: 0, freeze_frac: 0 },
        KellyCap: { cap_mult: 0 },
        SoftBarrier: { enabled: false, steps: [0], haircuts: [0] },
        FTMOGate: { enabled: false, daily_limit: 0, total_limit: 0, spend_rate: 0, lmax_vol_aware: "p50" },
        NestedCPPI: { ema_halflife: 0, floor_alpha: 0, freeze_cushion: 0 },
        SessionGate: { news_pre_blackout_min: 0, news_post_blackout_min: 0, dd_daily_freeze_threshold: 0, sess_windows: [] }
      }
    });
    alert("Paramètres remis à zéro !");
  }
};
```

### **Option 2 : Créer une Nouvelle Fonction**
```tsx
const resetToZero = () => {
  if (confirm("Remettre tous les paramètres à zéro ?")) {
    setPreset({
      schema_version: "1.0",
      name: "reset",
      seed: 0,
      total_steps: 0,
      mu: 0,
      fees_per_trade: 0,
      sigma: 0,
      steps_per_day: 0,
      target_profit: 0,
      max_days: 0,
      daily_limit: 0,
      total_limit: 0,
      modules: {
        VolatilityTarget: { vt_target_vol: 0, vt_halflife: 0 },
        CPPIFreeze: { alpha: 0, freeze_frac: 0 },
        KellyCap: { cap_mult: 0 },
        SoftBarrier: { enabled: false, steps: [0], haircuts: [0] },
        FTMOGate: { enabled: false, daily_limit: 0, total_limit: 0, spend_rate: 0, lmax_vol_aware: "p50" },
        NestedCPPI: { ema_halflife: 0, floor_alpha: 0, freeze_cushion: 0 },
        SessionGate: { news_pre_blackout_min: 0, news_post_blackout_min: 0, dd_daily_freeze_threshold: 0, sess_windows: [] }
      }
    });
    alert("Paramètres remis à zéro !");
  }
};

// Puis changer le bouton :
<button onClick={resetToZero} className="btn">↺ Reset</button>
```

## 🎯 **Fichiers à Modifier**

1. **`app/workspace/page.tsx`** (ligne 112-113)
2. **Optionnel** : `app/globals.css` pour ajouter des styles spécifiques

## ✅ **Résultat Attendu**

Après clic sur Reset :
- **Confirmation** : "Remettre tous les paramètres à zéro ?"
- **Action** : Tous les champs passent à 0
- **Feedback** : "Paramètres remis à zéro !"
- **Interface** : Tous les inputs affichent 0

## 🔧 **Test de Validation**

1. Cliquer sur "Reset"
2. Confirmer l'action
3. Vérifier que tous les champs sont à 0
4. Vérifier le message de confirmation
5. Tester que l'interface reflète bien les changements
