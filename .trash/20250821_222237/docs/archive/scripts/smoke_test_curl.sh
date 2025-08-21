#!/usr/bin/env bash
set -e
BACKEND=${1:-http://localhost:8001}
echo "GET $BACKEND/health"
curl -s "$BACKEND/health" || true
echo
echo "POST $BACKEND/simulate"
curl -s -X POST "$BACKEND/simulate" -H "Content-Type: application/json" -d '{
  "profile":"student_t_jumps_ewma",
  "preset":"FTMO-lite",
  "modules":["VolatilityTarget","CPPIFreeze","KellyCap","SoftBarrier"],
  "params":{"vol_target":0.10,"cap_mult":2.0,"alpha":0.10,"freeze_floor_pct":0.05,"defreeze_pct":0.08,"kelly_cap":0.012,"dd_daily_limit":0.05,"target":0.10},
  "seed":123,"steps_per_day":24,"horizon_days":20,"initial_equity":100000
}' | sed 's/"/\"/g' | cut -c1-400
echo
