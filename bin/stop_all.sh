#!/bin/bash

# 🛑 Script d'arrêt complet - 2048 Asset Management
# Arrête le backend et le frontend proprement

echo "🛑 Arrêt de 2048 Asset Management..."
echo "===================================="

# Arrêter le backend (port 8000)
BACKEND_PID=$(lsof -ti:8000 2>/dev/null)
if [ ! -z "$BACKEND_PID" ]; then
    echo "🔄 Arrêt du backend (PID: $BACKEND_PID)"
    kill -9 $BACKEND_PID 2>/dev/null
    echo "✅ Backend arrêté"
else
    echo "ℹ️  Aucun backend en cours d'exécution"
fi

# Arrêter le frontend (ports 3000-3003)
FRONTEND_STOPPED=false
for port in 3000 3001 3002 3003; do
    FRONTEND_PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "🔄 Arrêt du frontend sur le port $port (PID: $FRONTEND_PID)"
        kill -9 $FRONTEND_PID 2>/dev/null
        FRONTEND_STOPPED=true
    fi
done

if [ "$FRONTEND_STOPPED" = true ]; then
    echo "✅ Frontend arrêté"
else
    echo "ℹ️  Aucun frontend en cours d'exécution"
fi

# Vérifier qu'il ne reste plus de processus
sleep 2

REMAINING_BACKEND=$(lsof -ti:8000 2>/dev/null)
REMAINING_FRONTEND=$(lsof -ti:3000 2>/dev/null || lsof -ti:3001 2>/dev/null || lsof -ti:3002 2>/dev/null || lsof -ti:3003 2>/dev/null)

if [ -z "$REMAINING_BACKEND" ] && [ -z "$REMAINING_FRONTEND" ]; then
    echo "🎉 Tous les processus ont été arrêtés avec succès !"
else
    echo "⚠️  Certains processus sont encore en cours d'exécution :"
    if [ ! -z "$REMAINING_BACKEND" ]; then
        echo "   Backend: PID $REMAINING_BACKEND"
    fi
    if [ ! -z "$REMAINING_FRONTEND" ]; then
        echo "   Frontend: PID $REMAINING_FRONTEND"
    fi
    echo "   Utilisez 'kill -9 <PID>' pour forcer l'arrêt"
fi

echo ""
echo "🔄 Pour redémarrer: ./bin/start_all.sh"
