# Composants d'Input Améliorés

## NumericField

Composant pour saisie libre de nombres avec commit au blur/Enter.

### Props
- `value`: `number | null | undefined` - La valeur actuelle (null = vide)
- `onCommit`: `(v: number | null) => void` - Callback appelé au commit
- `className`: `string` - Classe CSS (défaut: "w-36")
- `allowNegative`: `boolean` - Autorise les valeurs négatives (défaut: true)
- `step`: `number` - Pas pour les flèches haut/bas
- `placeholder`: `string` - Placeholder du champ

### Fonctionnalités
- ✅ Accepte virgules et points
- ✅ Accepte valeurs vides (null)
- ✅ Commit au blur ou Enter
- ✅ Escape pour annuler
- ✅ Flèches haut/bas avec step
- ✅ Gestion des valeurs négatives

### Exemple
```tsx
import NumericField from "@/app/components/inputs/NumericField";

// Drift (peut être 0, vide, ou négatif)
<NumericField 
  value={drift} 
  onCommit={(v) => setDrift(v ?? 0)} 
/>

// Frais par trade (pas de négatif)
<NumericField 
  value={fees} 
  onCommit={(v) => setFees(v ?? 0)} 
  allowNegative={false}
  step={0.0001}
/>
```

## InputPercent

Composant pour saisie de pourcentages avec stockage en décimal.

### Props
- `value`: `number | null | undefined` - Valeur décimale (ex: 0.10)
- `onCommit`: `(dec: number | null) => void` - Callback avec valeur décimale
- `className`: `string` - Classe CSS (défaut: "w-36")
- `decimals`: `number` - Nombre de décimales affichées (défaut: 2)

### Fonctionnalités
- ✅ Affichage en pourcentage (ex: "10.00 %")
- ✅ Stockage en décimal (ex: 0.10)
- ✅ Accepte virgules et points
- ✅ Accepte valeurs vides
- ✅ Commit au blur ou Enter
- ✅ Escape pour annuler

### Exemple
```tsx
import InputPercent from "@/app/components/inputs/InputPercent";

// Daily/Total limit, Target profit
<InputPercent 
  value={dailyLimit} 
  onCommit={(v) => setDailyLimit(v ?? 0.02)} 
/>

<InputPercent 
  value={totalLimit} 
  onCommit={(v) => setTotalLimit(v ?? 0.10)} 
/>

<InputPercent 
  value={targetProfit} 
  onCommit={(v) => setTargetProfit(v ?? 0.10)} 
/>
```

## Migration depuis les anciens composants

### Avant (Input classique)
```tsx
<input 
  type="number" 
  value={dailyLimit} 
  onChange={(e) => setDailyLimit(Number(e.target.value))}
  min={0}
  step={0.01}
/>
```

### Après (InputPercent)
```tsx
<InputPercent 
  value={dailyLimit} 
  onCommit={(v) => setDailyLimit(v ?? 0.02)} 
/>
```

### Avantages
- ✅ Plus de contraintes `min={0}` qui bloquent la saisie
- ✅ Plus de `step` forcé
- ✅ Saisie libre avec virgules
- ✅ Commit intelligent (pas de re-render à chaque frappe)
- ✅ Gestion des valeurs vides
- ✅ UX améliorée (Escape, flèches, etc.)
