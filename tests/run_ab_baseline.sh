#!/usr/bin/env bash
set -euo pipefail

# Test A/B pour la baseline CPPI + Kelly fractionné
echo "🧪 Test A/B - Baseline CPPI + Kelly fractionné"
echo "================================================"

# Charger la config
CONFIG="tests/ab_config.json"
if [ ! -f "$CONFIG" ]; then
    echo "❌ Config non trouvée: $CONFIG"
    exit 1
fi

# Extraire paramètres
FTMO_DD=$(jq -r '.ftmo.max_total_dd' "$CONFIG")
FTMO_DAILY_DD=$(jq -r '.ftmo.max_daily_dd' "$CONFIG")
FTMO_TARGET=$(jq -r '.ftmo.profit_target' "$CONFIG")
FTMO_HORIZON=$(jq -r '.ftmo.horizon_days' "$CONFIG")

BASELINE_ALPHA=$(jq -r '.baseline.alpha1' "$CONFIG")
BASELINE_TAU=$(jq -r '.baseline.tau1' "$CONFIG")
BASELINE_LAMBDA=$(jq -r '.baseline.lambda' "$CONFIG")
BASELINE_FMAX=$(jq -r '.baseline.fmax' "$CONFIG")

MC_RUNS=$(jq -r '.mc.runs' "$CONFIG")
MC_SEED=$(jq -r '.mc.seed' "$CONFIG")

echo "📊 Contraintes FTMO:"
echo "   - DD total max: ${FTMO_DD}%"
echo "   - DD/jour max: ${FTMO_DAILY_DD}%"
echo "   - Cible: +${FTMO_TARGET}% en ${FTMO_HORIZON}j"
echo ""
echo "⚙️  Paramètres Baseline:"
echo "   - Alpha (plancher): ${BASELINE_ALPHA}"
echo "   - Tau (freeze): ${BASELINE_TAU}"
echo "   - Lambda (fractionnement): ${BASELINE_LAMBDA}"
echo "   - Fmax (Kelly max): ${BASELINE_FMAX}"
echo ""
echo "🎲 Monte Carlo: ${MC_RUNS} runs, seed ${MC_SEED}"
echo ""

# Créer le dossier de sortie
TS=$(date +"%Y%m%d_%H%M%S")
OUT_DIR="logs/ab_baseline_$TS"
mkdir -p "$OUT_DIR"

echo "📁 Sortie: $OUT_DIR"
echo ""

# TODO: Appeler le simulateur avec ces paramètres
echo "🚀 Lancement simulation baseline..."
echo "   (À implémenter: python3 tools/simulate_ab.py --config $CONFIG --out $OUT_DIR)"

# Placeholder pour les résultats
echo ""
echo "📈 Résultats attendus:"
echo "   - Pass%: >80% (contraintes FTMO respectées)"
echo "   - Target%: >60% (cible atteinte)"
echo "   - Jours→Cible: <20 (médian)"
echo "   - Calmar: >2.0 (rendement/risque)"

echo ""
echo "✅ Test A/B baseline configuré et prêt"
echo "   Config: $CONFIG"
echo "   Sortie: $OUT_DIR"
