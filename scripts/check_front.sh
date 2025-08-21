#!/usr/bin/env bash
set -euo pipefail

echo "== Typecheck ==" && npm run -s typecheck
echo "== Dead exports ==" && npx ts-prune -p tsconfig.json || true
echo "== Unused deps ==" && npx depcheck || true
echo "== Build ==" && npm run -s build && echo "OK"
