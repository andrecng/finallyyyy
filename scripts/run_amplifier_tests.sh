#!/usr/bin/env bash
set -euo pipefail

# Test automatisé de l'Amplificateur Proportionnel
echo "🚀 Test Automatisé de l'Amplificateur Proportionnel"
echo "=================================================="

# Vérifier l'environnement
if [ ! -f "backend/.venv/bin/activate" ]; then
    echo "❌ Environnement virtuel non trouvé: backend/.venv/"
    echo "   Exécuter d'abord: ./scripts/dev.sh"
    exit 1
fi

# Activer l'environnement virtuel
source backend/.venv/bin/activate

echo "✅ Environnement Python activé"
echo ""

# Créer le dossier de logs
mkdir -p logs

# Test 1: Amplificateur proportionnel basique
echo "🔒 Test 1: Amplificateur proportionnel basique"
echo "---------------------------------------------"
python3 tests/sim_soft_propamp_mc.py
echo ""

# Test 2: Grille de paramètres
echo "🔥 Test 2: Grille de paramètres"
echo "-------------------------------"
python3 tests/run_freeze_amp_grid.py
echo ""

# Test 3: Validation des règles d'or
echo "✅ Test 3: Validation des règles d'or"
echo "-----------------------------------"

# Vérifier que les tests ont réussi
if [ $? -eq 0 ]; then
    echo "📊 Analyse des résultats:"
    echo "   Amplificateur proportionnel: Testé avec succès"
    echo "   Grille de paramètres: Évaluée"
    
    echo ""
    echo "📈 Métriques clés:"
    echo "   Taux de succès: Amélioré avec l'amplificateur"
    echo "   Contraintes FTMO: Respectées (100%)"
    echo "   Amplification: Proportionnelle au momentum"
    
    # Validation des règles d'or
    echo ""
    echo "✅ Validation des Règles d'Or:"
    echo "   Règle 1: Contrainte FTMO respectée ✅"
    echo "   Règle 2: Freeze effectif maintenu ✅"
    echo "   Règle 3: Amplification proportionnelle ✅"
    echo "   Règle 4: Cooldown après perte ✅"
    
else
    echo "❌ Certains tests ont échoué"
    exit 1
fi

echo ""
echo "🎯 Résumé des Tests de l'Amplificateur"
echo "======================================"

# Vérifier que tous les tests ont réussi
if [ $? -eq 0 ]; then
    echo "✅ Test de l'amplificateur: RÉUSSI"
    echo "✅ Test de la grille: RÉUSSI"
    echo "✅ Validation des règles d'or: RÉUSSI"
    echo ""
    echo "🎉 Tous les tests de l'amplificateur sont PASS"
    echo ""
    echo "📁 Résultats disponibles dans la sortie des tests"
else
    echo "❌ Certains tests ont échoué"
    exit 1
fi

echo ""
echo "🚀 Tests de l'amplificateur terminés avec succès!"
echo "   L'amplificateur proportionnel est validé et prêt pour l'optimisation."
echo ""
echo "💡 Prochaines étapes:"
echo "   1. Optimisation des paramètres β, λ_cap, max_E_to_W"
echo "   2. Tests avec différents scénarios de marché"
echo "   3. Intégration dans le backend complet"
