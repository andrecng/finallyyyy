#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DATE_TAG="$(date +%Y%m%d_%H%M%S)"
TRASH_DIR=".trash/${DATE_TAG}"
REPORTS_DIR="reports"
mkdir -p "$TRASH_DIR" "$REPORTS_DIR"

# --- Helpers ---------------------------------------------------------------
exists()   { [ -f "$1" ] || [ -d "$1" ]; }
mv_safe()  { local p="$1"; exists "$p" || return 0; mkdir -p "$TRASH_DIR/$(dirname "$p")"; git mv "$p" "$TRASH_DIR/$p"; echo "→ moved: $p"; }
sed_in()   { # macOS/BSD compatible sed -i
  local file="$1" ; shift
  [ -f "$file" ] || return 0
  sed -i '' "$@" "$file" 2>/dev/null || sed -i "$@" "$file" || true
}
log()      { echo "$*" | tee -a "$REPORTS_DIR/purge_${DATE_TAG}.log" >/dev/null; }

# --- P1: Composants TS morts ----------------------------------------------
P1=( components/CapsAdjuster.tsx components/ConfigPanel.tsx components/CSVExportButton.tsx components/CustomChart.tsx components/EquityCurve.tsx
     src/components/CapsAdjuster.tsx src/components/ConfigPanel.tsx src/components/CSVExportButton.tsx src/components/CustomChart.tsx src/components/EquityCurve.tsx )

# --- P2: Legacy 2048 ------------------------------------------------------
P2=( docs/archive/scripts/README.md )
# Ajouter tous les .sh d'archive
while IFS= read -r f; do P2+=("$f"); done < <(find docs/archive/scripts -type f -name "*.sh" 2>/dev/null || true)

# --- P3: Composants UI non utilisés ---------------------------------------
P3=( components/UniverseSelector.tsx components/VolatilityTargeter.tsx components/MarketRegimeTag.tsx
     src/components/UniverseSelector.tsx src/components/VolatilityTargeter.tsx src/components/MarketRegimeTag.tsx )

# --- P4: Hooks morts -------------------------------------------------------
P4=( hooks/useBusinessLogic.ts hooks/useRiskManagement.ts
     src/hooks/useBusinessLogic.ts src/hooks/useRiskManagement.ts )

# --- P5: Lab components ----------------------------------------------------
# Tout le dossier lab/ s'il existe (components &/ou src/components)
P5=()
exists components/lab && P5+=(components/lab)
exists src/components/lab && P5+=(src/components/lab)

# --- P6: Tests UI (scripts Python) ----------------------------------------
P6=()
while IFS= read -r f; do P6+=("$f"); done < <(find scripts -maxdepth 1 -type f -name "test_ui_*.py" 2>/dev/null || true)
while IFS= read -r f; do P6+=("$f"); done < <(find scripts -maxdepth 1 -type f -name "test_*.py" 2>/dev/null || true)

# --- P7: Docs d'interface obsolètes ---------------------------------------
P7=( docs/INTERFACE_AMELIORATIONS.md docs/INTERFACE_MC.md docs/NUMBERFIELD.md CHANGELOG.md )

echo "=== Purge plan ${DATE_TAG} ===" | tee "$REPORTS_DIR/purge_${DATE_TAG}.log"

# Déplacer tout (P1→P7)
for arr in P1 P2 P3 P4 P5 P6 P7; do
  eval "list=(\"\${$arr[@]}\" )"
  for path in "${list[@]}"; do
    exists "$path" || continue
    mv_safe "$path"
    log "trash: $path"
  done
done

# --- Nettoyage barrels -----------------------------------------------------
for BARREL in components/index.ts src/components/index.ts; do
  [ -f "$BARREL" ] || continue
  for base in CapsAdjuster ConfigPanel CSVExportButton CustomChart EquityCurve UniverseSelector VolatilityTargeter MarketRegimeTag; do
    sed_in "$BARREL" "/from\\s\\+['\"]\\.\\/${base}['\"];*/d"
    sed_in "$BARREL" "/export\\s\\+\\*\\s\\+from\\s\\+['\"]\\.\\/${base}['\"];*/d"
    sed_in "$BARREL" "/export\\s\\+{\\s*${base}[^}]*}\\s\\+from\\s\\+['\"]\\.\\/${base}['\"];*/d"
  done
done

# --- Supprimer redirection legacy 'strategy-t' → '/workspace' -------------
if [ -f next.config.js ]; then
  cp next.config.js "${TRASH_DIR}/next.config.js.bak"
  # Commenter toute ligne contenant 'strategy-t' dans rewrites/redirects
  sed_in next.config.js "s/\\(.*strategy-t.*\\)/\\/\\/ LEGACY REMOVED \\1/"
  log "patched: next.config.js (strategy-t redirection commented)"
fi

# --- Résumé ---------------------------------------------------------------
echo "Trash dir: ${TRASH_DIR}"
echo "Log: ${REPORTS_DIR}/purge_${DATE_TAG}.log"

# --- Build de contrôle ----------------------------------------------------
if npm run -s build; then
  echo "✅ Build OK"
else
  echo "⚠️ Build KO — tu peux restaurer avec:"
  echo "   git restore --staged . && git checkout -- . && npm run build"
fi

# --- Fin -------------------------------------------------------------------
echo "Done."
