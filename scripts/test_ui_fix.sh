#!/usr/bin/env bash
set -e

echo "🧪 Test de l'interface après corrections..."
echo

echo "📱 Test 1: Page d'accueil (doit rediriger vers /workspace)"
FRONTEND=${1:-http://localhost:3003}
curl -s -I "$FRONTEND/" | grep -q "308 Permanent Redirect" && echo "✅ Page d'accueil OK (redirection)" || echo "❌ Page d'accueil KO"

echo
echo "🔧 Test 2: Page workspace (doit être accessible)"
curl -s "$FRONTEND/workspace" | grep -q "Workspace" && echo "✅ Page workspace OK" || echo "❌ Page workspace KO"

echo
echo "🎨 Test 3: Styles Tailwind (doit avoir des classes CSS)"
curl -s "$FRONTEND/workspace" | grep -q "bg-card\|border-base\|btn-accent" && echo "✅ Styles Tailwind OK" || echo "❌ Styles Tailwind KO"

echo
echo "📊 Test 4: Composants interactifs (doit avoir des boutons)"
curl -s "$FRONTEND/workspace" | grep -q "button" && echo "✅ Composants interactifs OK" || echo "❌ Composants interactifs KO"

echo
echo "🚀 Test 5: Navigation (doit avoir des onglets)"
curl -s "$FRONTEND/workspace" | grep -q "configure\|modules\|simulate\|results" && echo "✅ Navigation OK" || echo "❌ Navigation KO"

echo
echo "🎯 Résumé:"
echo "- Frontend accessible: http://localhost:3003"
echo "- Page workspace: http://localhost:3003/workspace"
echo "- Backend: http://localhost:8001"
echo
echo "🌐 Ouvrez http://localhost:3003/workspace dans votre navigateur pour tester l'interface !"
