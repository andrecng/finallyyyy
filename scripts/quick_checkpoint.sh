#!/usr/bin/env bash
set -e
echo "=== tree (2 niveaux) ==="
command -v tree >/dev/null && tree -L 2 || find . -maxdepth 2 -type d -print
echo
echo "=== grep modules backend ==="
grep -RIn "class .*FTMOGate\|class .*SessionNewsGate\|class .*NestedCPPI\|class .*VolatilityTarget\|class .*CPPIFreeze\|class .*KellyCap\|class .*SoftBarrier" backend || true
echo
echo "=== grep routes ==="
grep -RIn "app\.get(\|app\.post(" backend || true
echo
echo "=== next env ==="
[ -f .env.local ] && cat .env.local || echo "(pas de .env.local)"
