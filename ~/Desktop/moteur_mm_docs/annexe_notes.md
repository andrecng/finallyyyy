# Annexe Notes – Détails techniques du moteur

## 📐 Formules & Probabilités

### Multi-challenges
Probabilité d'avoir ≥1 succès sur *N* challenges indépendants :  
\[
P(\geq 1) = 1 - (1-p)^N
\]
où *p* = proba individuelle de réussite, *N* = nombre de challenges.

**Exemples (p = 0.6)** :
- N=2 → 84 %.
- N=3 → 94 %.
- N=4 → 97.4 %.
- N=5 → 99 %.

👉 Gain marginal décroissant : 2→3 = bond massif, 3→4 = utile mais plus petit.

---

### Escalade du risque FTMO
- FTMO : bornes en % → 5 % daily, 10 % overall.  
- Même si le compte double, les bornes grandissent en $ mais restent fixes en %.  
👉 **Escalade impossible** sous FTMO.  
👉 Dans un fonds perso, escalade possible via HWM/cushion.

---

### Horizon & Loi des grands nombres
- Horizon FTMO = 30 jours.  
- Même avec edge > 0, variance énorme à court terme.  
- LLN joue lentement (clustering de volatilité, autocorrélations).  
👉 D'où importance de multi-challenges ou horizon plus long en fonds perso.

---

### Frais réels (erosion de l'edge)
- Spreads.  
- Slippage.  
- Exécution imparfaite.  
👉 Peuvent transformer un edge théorique positif en edge nul/négatif.  
👉 Toujours tester en net de frais.

---

### Non-linéarités des modules
- **Kelly capé** : protège contre overbetting, limite la croissance brute.  
- **Vol targeting** : stabilise mais réduit le rendement si edge fort.  
- **CPPI Freeze** : coupe le moteur en cas de cushion < seuil.  
- **Haircuts corrélation** : réduisent le sizing quand signaux trop proches.  
👉 Ces modules améliorent la survie mais **"taxent" le rendement**.

---

### Metrics – Rappel des 3 couches
1. **Hard** : FTMO breach, CPPI floor.  
2. **Contrôle** : vol réalisée, corr, risk_effectif.  
3. **Optimisation** : Sharpe, Calmar, CAGR, time-to-target.  

👉 Rendement fait partie de la 3ᵉ couche (objectif final, mais conditionné à la survie).

---

### Exemple alpha requis
Supposons :  
- Objectif : 95 % de réussir ≥1 challenge sur 3.  
- Proba de réussite individuelle = 70 %.  
→ Prob global = 97.3 %.  

Donc : il faut calibrer l'alpha (edge net de frais) pour atteindre ~70 % de réussite par challenge.

---

### Stress tests à inclure
- Volatility clustering (chocs concentrés).  
- Corrélation extrême (actifs tous corrélés).  
- Fat tails (queues épaisses).  
- Drawdown compressé (pauses forcées).  

---

## ⚖️ Points de vigilance
- Horizon FTMO court → variance non compressible.  
- Modules = robustesse mais réduisent CAGR.  
- Multi-challenges = diversification statistique très efficace.  
- Frais réels = premier ennemi de l'edge marginal.  
- FTMO ≠ fonds perso (pas la même dynamique d'allocation).  

---

## 🧩 Mini Workflow alpha
1. Calculer l'**alpha requis** pour respecter contraintes et proba cible.  
2. Estimer l'**alpha réalisé** via backtests et Bayesian update.  
3. Comparer → valider faisabilité ou ajuster stratégie.  

---
