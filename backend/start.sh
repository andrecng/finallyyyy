#!/bin/bash

echo "🚀 Démarrage du Backend Trading Simulation API..."
echo "📍 Port: 8000"
echo "🌐 URL: http://localhost:8000"
echo "📚 Documentation: http://localhost:8000/docs"
echo ""

# Vérification des dépendances
echo "🔍 Vérification des dépendances..."
python3 -c "import fastapi, uvicorn, numpy, talib" 2>/dev/null || {
    echo "❌ Dépendances manquantes. Installation..."
    pip3 install -r requirements.txt
}

# Démarrage du serveur
echo "✅ Démarrage du serveur..."
python3 main.py
