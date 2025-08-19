# Concepts Clés du Moteur Alpha

## 🎯 Principe Fondamental : Risque Relatif

### **Le risque n'est pas absolu, il dépend du contexte**

#### **1. Objectif du Portefeuille**
- **FTMO** : Agressivité, vitesse, respect strict des règles (−10% total, −5% jour)
- **Fonds long terme** : Survie, stabilité, préservation du capital
- **Particulier** : Protection du capital initial, croissance modérée

#### **2. Structure du Capital**
- **Cushion petit** : Risque vital, exposition minimale
- **Cushion grand** : Risque gérable, exposition optimale
- **Phase HWM** : Capital au travail maximal
- **Phase plancher** : Protection absolue

#### **3. Métriques de Risque**
- **MaxDD** : Drawdown maximum acceptable
- **Sortino** : Rendement par unité de risque baissier
- **Ulcer Index** : Profondeur et durée des pertes
- **Calmar** : Ratio rendement/risque

## 🔄 Adaptation Dynamique

### **Le moteur s'adapte en temps réel**

#### **Variables d'Adaptation**
1. **Distance au plancher** (cushion/W)
2. **Phase du cycle** (expansion vs contraction)
3. **Volatilité du marché** (régime)
4. **Performance récente** (momentum)

#### **Modes de Fonctionnement**
- **Mode Expansion** : Cushion > 20%, Kelly optimal
- **Mode Normal** : Cushion 5-20%, Kelly fractionné
- **Mode Protection** : Cushion < 5%, freeze effectif
- **Mode Survie** : Cushion < 2%, exposition minimale

## 🎲 Stratégies par Objectif

### **FTMO (Agressif)**
- **α = 0.10** : Plancher à 90% du HWM
- **λ = 0.50** : Kelly fractionné sur le cushion
- **Freeze** : Si cushion/W < 5%
- **Cible** : +10% en ≤ 30 jours

### **Fonds (Conservateur)**
- **α = 0.05** : Plancher à 95% du HWM
- **λ = 0.25** : Kelly très fractionné
- **Freeze** : Si cushion/W < 10%
- **Cible** : +5% par an avec stabilité

### **Particulier (Équilibré)**
- **α = 0.08** : Plancher à 92% du HWM
- **λ = 0.35** : Kelly modérément fractionné
- **Freeze** : Si cushion/W < 7%
- **Cible** : +8% par an avec protection

## ⚡ Implémentation Technique

### **Modules Clés**
- **CPPI Freeze** : Gestion du plancher dynamique
- **Kelly Cap** : Limitation de l'exposition
- **Volatility Target** : Stabilisation du risque
- **Position Sizer** : Calcul de la taille optimale

### **Logique de Décision**
```python
# Pseudo-code de la logique
if cushion_ratio < 0.05:  # Mode survie
    exposure = 0.0
elif cushion_ratio < 0.10:  # Mode protection
    exposure = min(kelly_fraction * 0.25, cushion)
elif cushion_ratio < 0.20:  # Mode normal
    exposure = min(kelly_fraction * 0.50, cushion)
else:  # Mode expansion
    exposure = min(kelly_fraction * 0.75, cushion)
```

## 🎯 Conclusion

**Le moteur Alpha n'est pas un système statique** mais un **organisme adaptatif** qui :

1. **S'adapte au contexte** (FTMO vs Fonds vs Particulier)
2. **Réagit au cycle** (expansion vs contraction)
3. **Protège le capital** (freeze effectif)
4. **Optimise l'exposition** (Kelly fractionné dynamique)

**La clé** : Le risque est **relatif au contexte**, pas absolu. Un même niveau d'exposition peut être :
- **Trop risqué** en phase de stress (cushion petit)
- **Optimal** en phase d'expansion (cushion grand)
- **Insuffisant** en phase de momentum (opportunités manquées)

---

> **Règle d'or** : **Adapter l'exposition au contexte, pas l'inverse.**
