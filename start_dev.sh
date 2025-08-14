#!/bin/bash

# 🚀 Script de démarrage automatique - 2048 Asset Management
# Lance le backend et le frontend en arrière-plan automatiquement

echo "🎯 Démarrage automatique de 2048 Asset Management..."
echo "=================================================="

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 n'est pas installé !"
    exit 1
fi

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé !"
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé !"
    exit 1
fi

echo "✅ Dépendances vérifiées"

# Arrêter les processus existants
echo "🔄 Arrêt des processus existants..."

# Backend (port 8000)
BACKEND_PID=$(lsof -ti:8000 2>/dev/null)
if [ ! -z "$BACKEND_PID" ]; then
    echo "🔄 Arrêt du backend (PID: $BACKEND_PID)"
    kill -9 $BACKEND_PID 2>/dev/null
fi

# Frontend (ports 3000-3003)
for port in 3000 3001 3002 3003; do
    FRONTEND_PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "🔄 Arrêt du frontend sur le port $port (PID: $FRONTEND_PID)"
        kill -9 $FRONTEND_PID 2>/dev/null
    fi
done

sleep 2

# Démarrer le backend en arrière-plan
echo "🚀 Démarrage du backend en arrière-plan..."
cd backend
nohup python3 main.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend démarré en arrière-plan (PID: $BACKEND_PID)"

# Attendre que le backend soit prêt
echo "⏳ Attente du démarrage du backend..."
sleep 5

# Vérifier que le backend répond
if curl -s http://localhost:8000/ > /dev/null; then
    echo "✅ Backend accessible sur http://localhost:8000"
else
    echo "⚠️  Backend pas encore prêt, continuons..."
fi

# Retourner au répertoire racine
cd ..

# Démarrer le frontend en arrière-plan
echo "🚀 Démarrage du frontend en arrière-plan..."
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend démarré en arrière-plan (PID: $FRONTEND_PID)"

# Attendre que le frontend soit prêt
echo "⏳ Attente du démarrage du frontend..."
sleep 8

# Vérifier les ports utilisés
echo "🔍 Vérification des ports :"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:$(lsof -ti:3000 2>/dev/null || lsof -ti:3001 2>/dev/null || lsof -ti:3002 2>/dev/null || lsof -ti:3003 2>/dev/null || echo 'N/A')"

echo ""
echo "🎉 Démarrage automatique terminé !"
echo "📊 Logs backend:   tail -f backend/backend.log"
echo "📊 Logs frontend:  tail -f frontend.log"
echo "🛑 Pour arrêter:  ./stop_dev.sh"
echo ""
echo "🌐 L'application est maintenant accessible en arrière-plan !"
echo "💡 Vous pouvez fermer ce terminal, l'application continuera de tourner"


