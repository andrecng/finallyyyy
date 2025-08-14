#!/bin/bash

# 🧹 Script de nettoyage des logs - 2048 Asset Management
# Nettoie les logs et fichiers temporaires

echo "🧹 Nettoyage des logs et fichiers temporaires..."
echo "================================================"

# Nettoyer les logs backend
if [ -f "backend/backend.log" ]; then
    echo "🗑️  Suppression du log backend..."
    rm backend/backend.log
    echo "✅ Log backend supprimé"
fi

# Nettoyer les logs frontend
if [ -f "frontend.log" ]; then
    echo "🗑️  Suppression du log frontend..."
    rm frontend.log
    echo "✅ Log frontend supprimé"
fi

# Nettoyer le cache Next.js
if [ -d ".next" ]; then
    echo "🗑️  Suppression du cache Next.js..."
    rm -rf .next
    echo "✅ Cache Next.js supprimé"
fi

# Nettoyer les fichiers temporaires
echo "🗑️  Suppression des fichiers temporaires..."
find . -name "*.tmp" -delete 2>/dev/null
find . -name "*.log" -delete 2>/dev/null
find . -name ".DS_Store" -delete 2>/dev/null

# Nettoyer les fichiers Python
find . -name "*.pyc" -delete 2>/dev/null
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null

echo "✅ Nettoyage terminé !"
echo ""
echo "🔄 Pour redémarrer: ./bin/start_all.sh"
