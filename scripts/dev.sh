#!/usr/bin/env bash
set -euo pipefail

PORT="${API_PORT:-8001}"

echo "==> Killing processes bound to port ${PORT} (if any)"
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -ti tcp:${PORT} || true)
  if [ -n "${PIDS}" ]; then
    echo "${PIDS}" | xargs -r kill -9 || true
  fi
fi

echo "==> Cleaning old uvicorn reloaders"
pkill -f "uvicorn .*backend.app:app" 2>/dev/null || true

echo "==> Ensuring venv"
if [ ! -d "backend/.venv" ]; then
  python3 -m venv backend/.venv
fi
source backend/.venv/bin/activate
pip install --upgrade pip >/dev/null
pip install -r requirements.txt

echo "==> Starting API on :${PORT}"
export PYTHONPATH=.
# Exclusions pour éviter les boucles de reload
uvicorn backend.app:app --reload --host 0.0.0.0 --port "${PORT}" \
  --reload-exclude "backend/logs/*" \
  --reload-exclude ".venv/*" \
  --reload-exclude "node_modules/*"
