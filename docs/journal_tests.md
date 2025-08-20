# Journal des Tests - Monte Carlo Simulation

## 🧪 Test #002 – FTMOGate (daily-first + pacing)
- **Paramètre testé** : `daily_max_loss = 0.5%`, `total_max_loss = 10%`, `spend_rate = 0.2`, `lmax_vol_mult = 1.0`, `ref_vol = 10%`
- **Résultat** : ⏳ en cours (mock validé UI)
- **Date** : 2025-08-20
- **Commentaires** :
  - Gate priorise le budget **jour** (daily-first).
  - Pacing actif : limite horaire = `spend_rate × daily_max_loss`.
  - lmax vol-aware : réduit si vol > ref.
  - Aggregation = **min**(modules…), freeze si daily cushion <5%.
- **Modules actifs** :
  - `VolatilityTarget`, `CPPIFreeze`, `KellyCap`, `SoftBarrier`, **`FTMOGate`**
- **Logs (exemple)** :
  - `requested = 1.2%`, `allowed = 0.9%`, `freeze = false`, `reasons = ["clipped"]`

## 🧪 Test #001 – Interface de base

- **Paramètres testés** : Profil gaussian, modules de base
- **Résultat** : ✅ Fonctionnel
- **Date** : 2025-01-20
- **Commentaires** : Interface complète avec KPIs, binder%, et gestion d'erreur robuste
- **Modules actifs** : VolatilityTarget, CPPIFreeze, KellyCap, SoftBarrier
- **Logs** : binder_pct: KellyCap: 100%, dd_daily_max: -0.001, days_to_target: -1

## 🧪 Test #002 – FTMOGate + SessionNewsGate

- **Paramètres testés** :
  - dd_total_limit = 10 %
  - dd_daily_limit = 5 %
  - worst_step_loss_guess = 2 %
  - safety_buffer = 0.2 %
  - banned_hours = [[22,23],[0,1]]
  - session_haircut = 0.0
- **Résultat** : ✅ Fonctionnel
- **Date** : 2025-01-20
- **Commentaires** :
  - FTMOGate active un cap en fin de journée quand headroom faible
  - SessionNewsGate coupe totalement 22–23h et 0–1h
- **Modules actifs** :
  - VolatilityTarget, CPPIFreeze, KellyCap, SoftBarrier, FTMOGate, SessionNewsGate
- **Logs** :
  - binder_pct : SessionNewsGate: 16.67%, KellyCap: 83.33%
  - dd_daily_max : (à reporter)
  - days_to_target : (à reporter)

## 🧪 Test #003 – NestedCPPI (double airbag)

- **Paramètres testés** :
  - alpha = 10 %, freeze_floor_pct = 5 %, defreeze_pct = 8 %
  - nested_ema_beta = 0.85, nested_cushion_gain = 1.0, nested_hard_cap = 1.0
- **Résultat** : ✅ Fonctionnel
- **Date** : 2025-01-20
- **Commentaires** :
  - Lissage cushion via EMA → sizing plus stable vs CPPI simple
  - Freeze actif sous 5 %, dé-freeze > 8 %
  - Avec kelly_cap=0.15, NestedCPPI devient le module limitant (83.33%)
- **Modules actifs** :
  - VolatilityTarget, NestedCPPI, KellyCap, SoftBarrier, FTMOGate, SessionNewsGate
- **Logs** :
  - binder_pct : SessionNewsGate: 16.67%, NestedCPPI: 83.33%
  - dd_daily_max : (à reporter)
  - days_to_target : (à reporter)

---

## 📋 Checklist des tests

- [x] Test #001 : Interface de base
- [x] Test #002 : FTMOGate + SessionNewsGate
- [x] Test #003 : NestedCPPI (double airbag)
- [ ] Test #004 : Profils de marché alternatifs
- [ ] Test #005 : Stress test avec paramètres extrêmes
