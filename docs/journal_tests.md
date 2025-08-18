# Journal des Tests - MM Engine

## Tests Validés ✅

### #001 – VolTarget Preset
- **Date** : 2024-08-18
- **Preset** : VolTarget avec target_vol=0.1, vol_est=0.1, scale=0.1, max_risk=0.02
- **Modules actifs** : VolTarget, CPPI, DrawdownManager, Bayes
- **Seeds** : [42]
- **Horizon** : 100
- **KPIs clés** : VolTarget respecté, sizing cohérent
- **Violations** : Aucune
- **Logs JSONL** : `backend/logs/run-YYYYMMDD-HHMMSS/`

### #002 – Gating Sessions/News
- **Date** : 2024-08-18
- **Preset** : Gating avec news_blackouts_steps et session_mask
- **Modules actifs** : Tous les modules
- **Seeds** : [42]
- **Horizon** : 100
- **KPIs clés** : Blackouts respectés, sessions respectées
- **Violations** : Aucune
- **Logs JSONL** : `backend/logs/run-YYYYMMDD-HHMMSS/`

### #003 – FTMO Multi-Challenges
- **Date** : 2024-08-18
- **Preset** : Configuration FTMO avec profit_target_pct=10
- **Modules actifs** : Tous les modules
- **Seeds** : [42]
- **Horizon** : 100
- **KPIs clés** : Estimation P(≥1 succès) avec Wilson CI
- **Violations** : Aucune
- **Logs JSONL** : `backend/logs/run-YYYYMMDD-HHMMSS/`

## Format Standard des Tests

### Structure Preset
```json
{
  "capital_initial": 100000,
  "modules": [
    {
      "id": "bayes",
      "enabled": true,
      "params": {"p": 0.55, "k": 0.1, "cap": 0.02}
    }
  ],
  "gating": {
    "risk_cap": 0.02,
    "news_blackouts_steps": [[10, 13], [30, 32]],
    "session_mask": {"day_len": 24, "allow": [[7, 12], [14, 18]]}
  },
  "risk_limits": {
    "max_dd": 10,
    "daily_dd": 5,
    "freeze_cushion_pct": 5
  }
}
```

### Validation des Invariants
- ✅ `risk_final = min(modules actifs)`
- ✅ Freeze CPPI si cushion < seuil
- ✅ No-increase-after-loss
- ✅ Gating respecté (blackouts, sessions, caps)

### Chemins des Logs
- **Run principal** : `backend/logs/run-{timestamp}/run.log.jsonl`
- **Métriques risque** : `backend/logs/run-{timestamp}/risk.log.jsonl`
- **Violations compliance** : `backend/logs/run-{timestamp}/compliance.log.jsonl`
- **Modules** : `backend/logs/run-{timestamp}/module.{id}.jsonl`

---

*Dernière mise à jour : 2024-08-18*
