#!/usr/bin/env bash
set -euo pipefail

echo "🧹 Nettoyage des ports..."

ports=(3000 8001)

for p in "${ports[@]}"; do
  if lsof -ti :"$p" >/dev/null 2>&1; then
    echo "   🔴 Port $p occupé, nettoyage..."
    kill -9 $(lsof -ti :"$p") || true
    sleep 0.5
  else
    echo "   🟢 Port $p libre"
  fi
done

# Nettoyer les processus uvicorn et next qui pourraient traîner
echo "   🧹 Nettoyage des processus..."
pkill -f "uvicorn.*backend.main:app" || true
pkill -f "next dev" || true

echo "✅ Ports nettoyés !"
