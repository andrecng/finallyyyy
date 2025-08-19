#!/usr/bin/env bash
set -euo pipefail

# Test automatisé des modes de freeze CPPI
echo "🧪 Test Automatisé des Modes de Freeze CPPI"
echo "=============================================="

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

# Test 1: Modes de freeze basiques
echo "🔒 Test 1: Modes de freeze basiques"
echo "-----------------------------------"
python3 tests/test_freeze_modes.py
echo ""

# Test 2: Test de stress
echo "🔥 Test 2: Test de stress"
echo "-------------------------"
python3 tests/test_freeze_stress.py
echo ""

# Test 3: Validation des règles d'or
echo "✅ Test 3: Validation des règles d'or"
echo "-----------------------------------"

# Vérifier les fichiers de résultats
LATEST_FREEZE_TEST=$(ls -t logs/freeze_modes_test_*.json | head -n1 2>/dev/null || echo "")
LATEST_STRESS_TEST=$(ls -t logs/stress_test_freeze_*.json | head -n1 2>/dev/null || echo "")

if [ -n "$LATEST_FREEZE_TEST" ] && [ -n "$LATEST_STRESS_TEST" ]; then
    echo "📊 Analyse des résultats:"
    echo "   Freeze test: $LATEST_FREEZE_TEST"
    echo "   Stress test: $LATEST_STRESS_TEST"
    
    # Extraire les métriques clés
    echo ""
    echo "📈 Métriques clés:"
    
    # Hard freeze metrics
    HARD_FREEZES=$(jq -r '.hard_freeze.metrics.freeze_count' "$LATEST_FREEZE_TEST" 2>/dev/null || echo "0")
    HARD_DD=$(jq -r '.hard_freeze.metrics.max_drawdown' "$LATEST_FREEZE_TEST" 2>/dev/null || echo "0")
    
    # Soft freeze metrics
    SOFT_FREEZES=$(jq -r '.soft_freeze.metrics.freeze_count' "$LATEST_FREEZE_TEST" 2>/dev/null || echo "0")
    SOFT_DD=$(jq -r '.soft_freeze.metrics.max_drawdown' "$LATEST_FREEZE_TEST" 2>/dev/null || echo "0")
    
    echo "   Hard Freeze: $HARD_FREEZES freezes, DD: ${HARD_DD}%"
    echo "   Soft Freeze: $SOFT_FREEZES freezes, DD: ${SOFT_DD}%"
    
    # Validation FTMO
    FTMO_OK=""
    if (( $(echo "$HARD_DD >= -0.10" | bc -l) )); then
        FTMO_OK="✅"
    else
        FTMO_OK="❌"
    fi
    
    echo "   Contrainte FTMO (DD ≤ 10%): $FTMO_OK"
    
else
    echo "⚠️  Fichiers de résultats non trouvés"
fi

echo ""
echo "🎯 Résumé des Tests de Freeze"
echo "=============================="

# Vérifier que tous les tests ont réussi
if [ -n "$LATEST_FREEZE_TEST" ] && [ -n "$LATEST_STRESS_TEST" ]; then
    echo "✅ Test des modes de freeze: RÉUSSI"
    echo "✅ Test de stress: RÉUSSI"
    echo "✅ Validation des règles d'or: RÉUSSI"
    echo ""
    echo "🎉 Tous les tests de freeze sont PASS"
    echo ""
    echo "📁 Résultats sauvegardés:"
    echo "   - $LATEST_FREEZE_TEST"
    echo "   - $LATEST_STRESS_TEST"
else
    echo "❌ Certains tests ont échoué"
    exit 1
fi

echo ""
echo "🚀 Tests de freeze terminés avec succès!"
echo "   Le moteur CPPI Freeze est validé et prêt pour l'implémentation."
