# Moteur Alpha — Baseline & Expés à valider (SUPER IMPORTANT)

## Baseline validée (à implémenter d'abord)
- **Cadre** : CPPI avec plancher dynamique `F = HWM·(1−α)` + règle **freeze** (ex: cushion/W < 5%).
- **Allocation** : **Kelly fractionné sur le cushion**.
  - Cushion `C = max(W − F, 0)`.
  - Fraction Kelly estimée `f*` (bornée), **fractionnement** `λ ∈ {0.25, 0.5}` au départ.
  - Exposition: `E = λ · f* · C` (bornes: `E ≤ C ≤ W`).
- **FTMO** : choisir `α ≈ 0.10` (DD max 10%), ajuster `λ` pour respecter DD/jour et atteindre la cible.

## Expérimentation à BACKTESTER (garder dans le backlog)
- **Idée** : **CPPI imbriqué** (double airbag) pour lisser encore l'impact de Kelly.
  - Externe (capital): `F1 = HWM_W·(1−α1)`, `C1 = max(W−F1, 0)`, freeze si `C1/W < τ1`.
  - **Interne (dans le cushion)** : `HWM_C`, `F2 = HWM_C·(1−α2)`, `C2 = max(C1−F2, 0)`, freeze si `C2/C1 < τ2`.
  - **Allocation** : `E = λ · f* · C2`.
- **Grille initiale** : `α2 ∈ {0.3, 0.5, 0.7}`, `τ2 ∈ {0.05, 0.10, 0.20}`, `λ ∈ {0.25, 0.5, 0.75}`.

## Métriques & Ratios (pour juger le compromis rendement/risque)
- **Contraintes FTMO** :  
  - `Pass %` (respect DD total 10% & DD/jour 5%),  
  - `Target %` (taux d'atteinte de +10% ≤ 30j),  
  - `Jours jusqu'à cible` (médian).
- **Risque** : Max Drawdown, Worst Day DD, Ulcer Index, Downside deviation.
- **Rendement** : PnL final médian (p25/p75), CAGR (si horizon > 30j).
- **Ratios d'efficacité** :  
  - **Calmar/MAR** = CAGR / MaxDD,  
  - **Sortino** (rendement / downside dev),  
  - **Omega** (seuil 0),  
  - **Gain-to-Pain** (Σ gains / |Σ pertes|),  
  - **Sterling** (rendement / moyenne top-N DD).
- **Règle de décision** (lexicographique) :  
  1) Max **Pass %** ; 2) Max **Target %** ; 3) Min **Jours jusqu'à cible** ; 4) Max **PnL médian** / **Calmar**.

## Protocole de tests
- **Données** : historique réel par trade **ou** Monte Carlo (win rate, payoff, clusters de pertes).
- **Robustesse** : 1 000+ runs/seed ; scénarios stress (pertes corrélées, gaps).
- **Sensibilité** : varier `f*` ±erreur d'estimation, et `λ`.

## Notes
- Objectif central : **maximiser le capital au travail** tout en **limitant strictement le risque** (contraintes FTMO en premier).
- Kelly pur **interdit** (variance & DD). On utilise **Kelly fractionné** et/ou borné, appliqué au **cushion**.
