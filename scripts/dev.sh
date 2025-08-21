#!/usr/bin/env bash
set -euo pipefail

echo "🧹 Nettoyage des ports et processus..."
lsof -ti tcp:3000 | xargs -r kill -9 || true
lsof -ti tcp:8001 | xargs -r kill -9 || true
pkill -f "uvicorn.*backend.main:app" || true

echo "🚀 Lancement du projet..."
npm run dev
