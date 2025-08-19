# Test #001 — Volatility Target (rework)

## Objectif
Valider que le module VolatilityTarget stabilise le risk effectif autour de la cible sans overshoot significatif, 
sans conflit avec CPPI Freeze & Kelly Cap, et sans augmentation de taille après perte (règle d'or).

## Contexte
- Modules actifs : VolatilityTarget, CPPIFreeze, KellyCap, SoftBarrier
- Preset de départ : FTMO-lite (ou équivalent interne)
- Horizon : 50 000 pas (ou 2 ans daily, selon moteur)
- Seed : 42 (reproductible)

## Entrée (exemple CLI)
```json
{
  "preset": {"name": "FTMO-lite", "params": {"vol_target": 0.10}},
  "seed": 42,
  "horizon": 50000
}
```

## Sorties attendues
- `kpis`: { stdev_realized, mean_drawdown, max_drawdown, avg_step_risk, violations_count, ... }
- `equityCurve`: tableau (valeurs ou {time,value})
- `violations`: liste normalisable (code/message/severity)
- `logs`: optionnel (évènements clés)
- `run_id`: identifiant unique

## Critères d'acceptation (✅ = PASS / ❌ = FAIL)
1. **Cible de vol**: |stdev_realized - vol_target| ≤ 0.02 (2 points de vol)
2. **Overshoot risk**: max(step_risk) ≤ vol_target × cap_mult + 0.0005 (5 bps de marge)
3. **No size-up after loss**: aucun évènement "size_up_after_loss" dans violations
4. **CPPI Freeze**: si cushion < 5%, freeze effectif (aucun trade qui augmente l'exposition)
5. **Kelly guardrail**: aucune violation "kelly_negative_edge" (G(f) ≥ 0)
6. **Stabilité**: avg_step_risk / vol_target ∈ [0.7 ; 1.3]

> Note: on n'expose pas les formules internes (conformité sécurité projet), on vérifie via indicateurs/évènements.

## Décision
- ✅ **PASS** si les 6 conditions sont vraies.
- ❌ **FAIL** sinon (consigner quels critères échouent).
