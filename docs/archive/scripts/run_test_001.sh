#!/usr/bin/env bash
set -euo pipefail
ts=$(date +"%Y%m%d_%H%M%S")
out="logs/test_001_voltarget_$ts.json"
python3 tools/simulate_cli.py --preset FTMO-lite --vol-target 0.10 --seed 42 --horizon 50000 --out "$out"
echo "=> Résultat: $out"
jq '{kpis:.kpis, run_id:.run_id}' "$out" 2>/dev/null || true
