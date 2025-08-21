#!/bin/bash

echo "🚀 Démarrage du Backend en Mode Développement"
echo "📍 Port: 8000"
echo "🔄 Rechargement automatique activé"
echo "🌐 URL: http://localhost:8000"
echo "📚 Documentation: http://localhost:8000/docs"
echo ""

# Vérification des dépendances
echo "🔍 Vérification des dépendances..."
python3 -c "import fastapi, uvicorn, numpy, talib" 2>/dev/null || {
    echo "❌ Dépendances manquantes. Installation..."
    pip3 install -r requirements.txt
}

# Démarrage avec rechargement automatique
echo "✅ Démarrage avec rechargement automatique..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload --reload-dir .
