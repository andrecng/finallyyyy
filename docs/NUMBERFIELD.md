# NumberField - Composant de saisie numérique intelligent

## 🎯 **Vue d'ensemble**

`NumberField` est un composant React réutilisable qui offre une expérience utilisateur fluide et fiable pour la saisie de valeurs numériques. Il remplace les inputs HTML standard avec des fonctionnalités avancées de parsing, validation et contrôle.

## ✨ **Fonctionnalités clés**

### **1. Parsing tolérant**
- **Virgules** : `1,23` → `1.23`
- **Espaces** : ` 200 ` → `200`
- **Négatifs** : `-0,001` → `-0.001`
- **Partiels** : `-` → fallback sur valeur précédente

### **2. Commit intelligent**
- **Blur** : commit automatique quand l'input perd le focus
- **Enter** : commit sur touche Entrée
- **Escape** : annulation et retour à la valeur précédente

### **3. Contrôle par flèches**
- **↑/↓** : incrément/décrément par `step`
- **Ctrl/Cmd + ↑/↓** : incrément ×10 pour ajustements rapides
- **Respect des limites** : `min` et `max` appliqués

### **4. Sécurité**
- **Molette bloquée** : évite changements accidentels
- **Validation** : `min`, `max`, `decimals` respectés
- **Fallback** : valeur précédente si parsing échoue

## 🚀 **Utilisation**

### **Import**
```tsx
import NumberField from "@/components/NumberField";
```

### **Props**
```tsx
type Props = {
  value: number;                    // Valeur actuelle
  onCommit: (v: number) => void;   // Callback de commit
  min?: number;                     // Valeur minimale
  max?: number;                     // Valeur maximale
  step?: number;                    // Pas d'incrément (défaut: 0.001)
  decimals?: number;                // Décimales pour arrondi
  placeholder?: string;             // Placeholder
  className?: string;               // Classes CSS
};
```

### **Exemple basique**
```tsx
<NumberField
  value={0.015}
  onCommit={(v) => setRisk(v)}
  step={0.001}
  min={0}
  max={1}
  decimals={6}
/>
```

### **Exemple avec validation**
```tsx
<NumberField
  value={params.desired_risk}
  onCommit={(v) => setParams({ ...params, desired_risk: v })}
  step={0.001}
  min={0}
  max={0.1}
  decimals={6}
  placeholder="Risque désiré (0-10%)"
/>
```

## 🔧 **Configuration par paramètre**

### **Paramètres de risque (6 décimales)**
```tsx
// desired_risk, mu, vt_target_vol, lmax
<NumberField
  step={0.001}
  min={0}
  decimals={6}
/>
```

### **Paramètres de pourcentage (4 décimales)**
```tsx
// cppi_alpha, cppi_freeze_frac, daily_limit, total_limit, spend_rate, target_pct
<NumberField
  step={0.01}
  min={0}
  max={1}
  decimals={4}
/>
```

### **Paramètres entiers (0 décimales)**
```tsx
// total_steps, vt_halflife, steps_per_day, max_days
<NumberField
  step={1}
  min={1}
  decimals={0}
/>
```

## 🎮 **Interactions utilisateur**

### **Saisie**
- **Tapez** : `1,23` ou `1.23` ou ` 1.23 `
- **Validation en temps réel** : seuls chiffres, virgules, points, tirets autorisés

### **Navigation clavier**
- **↑** : incrément par `step`
- **↓** : décrément par `step`
- **Ctrl/Cmd + ↑** : incrément ×10
- **Ctrl/Cmd + ↓** : décrément ×10
- **Enter** : commit
- **Escape** : annulation

### **Focus/Blur**
- **Focus** : début de l'édition
- **Blur** : commit automatique
- **Changement externe** : resync si pas en cours d'édition

## 🧠 **Logique interne**

### **État local**
```tsx
const [text, setText] = React.useState<string>(String(value));
const [dirty, setDirty] = React.useState(false);
```

### **Parsing**
```tsx
function parseLoose(s: string): number | null {
  const t = s.replace(/\s+/g, "").replace(",", ".");
  if (t === "" || t === "-" || t === "." || t === "-.") return null;
  const x = Number(t);
  return Number.isFinite(x) ? x : null;
}
```

### **Validation**
```tsx
function clamp(v: number, lo?: number, hi?: number) {
  if (typeof lo === "number") v = Math.max(lo, v);
  if (typeof hi === "number") v = Math.min(hi, v);
  return v;
}
```

### **Arrondi**
```tsx
function roundTo(v: number, d?: number) {
  if (!d && d !== 0) return v;
  const k = Math.pow(10, d);
  return Math.round(v * k) / k;
}
```

## 🔄 **Cycle de vie**

### **1. Initialisation**
- `text` = `String(value)`
- `dirty` = `false`

### **2. Édition**
- `onChange` → `setText(nouvelle_valeur)`
- `setDirty(true)`

### **3. Commit**
- `onBlur` ou `Enter` → `commit()`
- Parsing → validation → `onCommit(valeur_finale)`
- `setDirty(false)`
- `setText(String(valeur_finale))`

### **4. Annulation**
- `Escape` → `revert()`
- `setDirty(false)`
- `setText(String(value))`

## 🎨 **Personnalisation CSS**

### **Classes par défaut**
```tsx
className={className ?? "rounded-xl border px-3 py-2"}
```

### **Override personnalisé**
```tsx
<NumberField
  value={risk}
  onCommit={setRisk}
  className="w-24 text-center font-mono text-sm"
/>
```

## 🧪 **Tests**

### **Script de test**
```bash
python scripts/test_numberfield.py
```

### **Scénarios testés**
- ✅ Parsing tolérant (virgules, espaces)
- ✅ Validation min/max
- ✅ Fallback sur valeurs partielles
- ✅ Monte Carlo avec parsing
- ✅ Intégration complète

## 🚀 **Avantages vs input standard**

| Aspect | Input HTML | NumberField |
|--------|------------|-------------|
| **Parsing** | `Number()` strict | Tolérant (virgules, espaces) |
| **Validation** | Aucune | Min/max/step/decimals |
| **Contrôle** | Aucun | Flèches + Ctrl |
| **Sécurité** | Molette active | Molette bloquée |
| **UX** | Basique | Professionnelle |
| **Fiabilité** | Variable | Garantie |

## 🔮 **Évolutions futures**

### **Fonctionnalités envisagées**
- **Formatage** : affichage avec séparateurs de milliers
- **Unités** : suffixe (%, $, etc.)
- **Historique** : Undo/Redo des valeurs
- **Validation** : règles métier personnalisées
- **Accessibilité** : ARIA labels, screen readers

### **Intégrations**
- **Formulaires** : validation automatique
- **Tableaux** : édition inline
- **Graphiques** : contrôles interactifs
- **Dashboards** : paramètres en temps réel

---

**🎯 NumberField transforme la saisie numérique en expérience utilisateur fluide et professionnelle.**
