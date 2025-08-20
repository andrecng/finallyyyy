#!/bin/bash

# 📊 Script de vérification du statut - 2048 Asset Management
# Affiche l'état des processus backend et frontend

echo "📊 Statut de 2048 Asset Management"
echo "=================================="

# Vérifier le backend
echo ""
echo "🔧 BACKEND (Port 8000):"
BACKEND_PID=$(lsof -ti:8000 2>/dev/null)
if [ ! -z "$BACKEND_PID" ]; then
    echo "   ✅ En cours d'exécution (PID: $BACKEND_PID)"
    
    # Vérifier la réponse HTTP
    if curl -s http://localhost:8000/ > /dev/null; then
        echo "   ✅ Répond aux requêtes HTTP"
        echo "   🌐 URL: http://localhost:8000"
    else
        echo "   ⚠️  Ne répond pas aux requêtes HTTP"
    fi
    
    # Afficher les logs récents
    if [ -f "backend/backend.log" ]; then
        echo "   📝 Derniers logs:"
        tail -3 backend/backend.log | sed 's/^/      /'
    fi
else
    echo "   ❌ Non démarré"
fi

# Vérifier le frontend
echo ""
echo "🎨 FRONTEND:"
FRONTEND_FOUND=false
for port in 3000 3001 3002 3003; do
    FRONTEND_PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "   ✅ En cours d'exécution sur le port $port (PID: $FRONTEND_PID)"
        echo "   🌐 URL: http://localhost:$port"
        FRONTEND_FOUND=true
        break
    fi
done

if [ "$FRONTEND_FOUND" = false ]; then
    echo "   ❌ Non démarré"
fi

# Vérifier les logs frontend
if [ -f "frontend.log" ]; then
    echo "   📝 Derniers logs:"
    tail -3 frontend.log | sed 's/^/      /'
fi

# Vérifier l'utilisation des ports
echo ""
echo "🔍 UTILISATION DES PORTS:"
echo "   Port 8000 (Backend):  $(lsof -ti:8000 2>/dev/null | wc -l | tr -d ' ') processus"
for port in 3000 3001 3002 3003; do
    PROCESS_COUNT=$(lsof -ti:$port 2>/dev/null | wc -l | tr -d ' ')
    echo "   Port $port (Frontend): $PROCESS_COUNT processus"
done

# Vérifier l'espace disque
echo ""
echo "💾 ESPACE DISQUE:"
df -h . | tail -1 | awk '{print "   " $5 " utilisé sur " $2 " (" $3 "/" $4 ")"}'

# Vérifier la mémoire
echo ""
echo "🧠 MÉMOIRE:"
MEMORY_INFO=$(top -l 1 | grep PhysMem | awk '{print "   " $2 " utilisée, " $6 " libre"}')
echo "$MEMORY_INFO"

echo ""
echo "🔄 Pour redémarrer: ./bin/start_all.sh"
echo "🛑 Pour arrêter:   ./bin/stop_all.sh"
