# Logging Spec

- `t` (int): horodatage uniforme (bar index)
- `module`: id du module
- `event`: "proposal" | "cap" | "freeze" | "reject" | "apply"
- `details`: JSON libre

Fichiers:
- `run.log.jsonl`       : événements séquentiels
- `module.<id>.jsonl`   : événements par module
- `compliance.log.jsonl`: violations
- `risk.log.jsonl`      : risk_effectif final par t

Invariants à tracer:
- no-increase-after-loss (bool + justification)
- freeze si cushion < seuil (bool + cushion, seuil)
- risk_final = min(proposals)
