# 🏗️ Architecture Modulaire - 2048 Asset Management

## 📋 **Vue d'ensemble**

Cette nouvelle architecture modulaire remplace l'ancien système monolithique par des modules TypeScript bien structurés, typés et maintenables.

## 🗂️ **Structure des Modules**

```
/modules/
├── money-management/          # Gestion du capital et du risque
│   ├── kelly-calculator.ts   # Formule de Kelly avec caps
│   ├── volatility-target.ts  # Target de volatilité avec fallback
│   ├── drawdown-manager.ts   # Paliers dynamiques de drawdown
│   └── sequence-manager.ts   # Séquences anti-martingale
├── risk-control/             # Contrôle des risques avancé
│   ├── position-sizer.ts     # Orchestration centralisée
│   ├── cppi-freeze.ts        # CPPI + plancher HWM
│   ├── portfolio-caps.ts     # Caps global/instrument/cluster
│   └── risk-logger.ts        # Logger exposition, drawdown, size
├── overlay/                   # Overlays et moteurs de marché
│   └── market-engine.ts      # Lecture de régime + boost/haircut
├── simulation/               # Moteurs de simulation
│   ├── engine.ts             # Moteur de simulation général
│   ├── presets.ts            # Paramètres / templates JSON
│   └── validators.ts         # Validateur des presets (Zod)
└── config.ts                 # Configuration centralisée
```

## 💰 **Money Management Modules**

### **Kelly Calculator**
- **Objectif** : Calcul de la taille de position optimale selon Kelly
- **Fonctionnalités** : Caps de fraction, validation des paramètres, ajustements
- **Usage** : `new KellyCalculator().calculate(params)`

### **Volatility Targeter**
- **Objectif** : Gestion de la volatilité cible avec ajustements automatiques
- **Fonctionnalités** : Mode fallback, ajustements selon drawdown, tendances
- **Usage** : `new VolatilityTargeter(config).adjustVolatility(conditions)`

### **Drawdown Manager**
- **Objectif** : Gestion des paliers de drawdown avec actions automatiques
- **Fonctionnalités** : Seuils configurables, actions (reduce/freeze/close), reset HWM
- **Usage** : `new DrawdownManager(thresholds).updateDrawdown(equity, peak)`

### **Sequence Manager**
- **Objectif** : Gestion des séquences de trading (anti-martingale, etc.)
- **Fonctionnalités** : Multiplicateurs progressifs, caps de séquence, statistiques
- **Usage** : `new SequenceManager(config).recordTradeResult('win')`

## 🔧 **Configuration Centralisée**

Le fichier `config.ts` centralise toutes les configurations :
- **KELLY_CONFIG** : Paramètres par défaut Kelly
- **VOLATILITY_CONFIG** : Seuils et ajustements volatilité
- **DRAWDOWN_CONFIG** : Paliers et actions drawdown
- **SEQUENCE_CONFIG** : Configurations des séquences
- **PRESET_CONFIG** : Presets prédéfinis (conservateur, équilibré, agressif)

## 🚀 **Utilisation**

### **Import des modules**
```typescript
import { KellyCalculator, VolatilityTargeter, DrawdownManager } from '@/modules/money-management';
import { ALL_CONFIG, PRESET_CONFIG } from '@/modules/config';
```

### **Création d'instances**
```typescript
// Kelly Calculator
const kelly = new KellyCalculator();
const result = kelly.calculate({
  winRate: 0.6,
  rRatio: 1.5,
  fractionCap: 0.25
});

// Volatility Targeter
const volTargeter = new VolatilityTargeter(ALL_CONFIG.volatility);
const adjustedVol = volTargeter.adjustVolatility({
  currentDrawdown: 15,
  maxDrawdown: 30,
  marketVolatility: 20,
  trendStrength: 0.7
});

// Drawdown Manager
const ddManager = new DrawdownManager(ALL_CONFIG.drawdown.defaultThresholds);
const ddResult = ddManager.updateDrawdown(95000, 100000);
```

### **Configuration des presets**
```typescript
const preset = PRESET_CONFIG.balanced;
const kellyParams = {
  winRate: 0.65,
  rRatio: 1.8,
  fractionCap: preset.kellyFraction
};
```

## 📊 **Avantages de cette Architecture**

### **✅ Modularité**
- Chaque module a une responsabilité unique
- Facile d'ajouter/supprimer des fonctionnalités
- Tests unitaires simplifiés

### **✅ Type Safety**
- TypeScript strict avec interfaces complètes
- Validation des paramètres d'entrée
- Gestion d'erreurs robuste

### **✅ Maintenabilité**
- Code documenté avec JSDoc
- Structure claire et logique
- Configuration centralisée

### **✅ Extensibilité**
- Facile d'ajouter de nouveaux modules
- Configuration flexible via config.ts
- Presets personnalisables

## 🔄 **Migration depuis l'ancien système**

### **Étape 1 : Remplacer les imports**
```typescript
// Avant
import { calculateKelly } from '@/old/money-management';

// Après
import { KellyCalculator } from '@/modules/money-management';
```

### **Étape 2 : Adapter les appels**
```typescript
// Avant
const kellyFraction = calculateKelly(winRate, rRatio);

// Après
const kelly = new KellyCalculator();
const result = kelly.calculate({ winRate, rRatio });
const kellyFraction = result.positionSize;
```

### **Étape 3 : Utiliser la configuration**
```typescript
// Avant
const volatilityTarget = 15;

// Après
import { VOLATILITY_CONFIG } from '@/modules/config';
const volatilityTarget = VOLATILITY_CONFIG.defaultTargetVol;
```

## 🧪 **Tests et Validation**

### **Tests unitaires**
```bash
# Tester un module spécifique
npm test modules/money-management/kelly-calculator.test.ts

# Tester tous les modules
npm test modules/
```

### **Validation des types**
```bash
# Vérifier la compilation TypeScript
npm run build

# Vérifier les types
npm run type-check
```

## 📚 **Documentation API**

Chaque module est entièrement documenté avec :
- **JSDoc** : Documentation des méthodes et paramètres
- **Interfaces TypeScript** : Types stricts et validation
- **Exemples d'usage** : Cas d'utilisation concrets
- **Gestion d'erreurs** : Validation et messages d'erreur clairs

## 🎯 **Prochaines Étapes**

1. **Compléter les modules** : Risk-control, Overlay, Simulation
2. **Tests unitaires** : Couverture complète des modules
3. **Intégration UI** : Connecter les modules aux composants React
4. **Performance** : Optimisation et monitoring
5. **Documentation** : Guides utilisateur et API reference

---

**Cette architecture modulaire représente une refonte complète du système, offrant une base solide pour le développement futur ! 🚀**
