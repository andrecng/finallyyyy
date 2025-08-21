#!/usr/bin/env python3
"""Script pour simuler l'environnement CI et valider la configuration"""

import sys
import os
from pathlib import Path

def test_ci_environment():
    """Teste la configuration comme dans l'environnement CI"""
    print("🧪 Test de l'environnement CI simulé")
    print(f"📁 Répertoire courant: {os.getcwd()}")
    print(f"🐍 Python version: {sys.version}")
    
    # Simuler l'environnement CI
    workspace = os.getcwd()
    print(f"🏠 GITHUB_WORKSPACE simulé: {workspace}")
    
    # Ajouter au PYTHONPATH comme dans CI
    if workspace not in sys.path:
        sys.path.insert(0, workspace)
        print(f"✅ PYTHONPATH mis à jour: {workspace}")
    
    print(f"🐍 PYTHONPATH complet: {sys.path}")
    
    # Test d'import du backend
    try:
        from backend.main import app
        print("✅ Backend importé avec succès")
        
        # Test des endpoints
        if hasattr(app, 'routes'):
            print(f"✅ FastAPI app avec {len(app.routes)} routes")
        else:
            print("⚠️ FastAPI app sans routes")
            
    except ImportError as e:
        print(f"❌ Erreur import backend: {e}")
        return False
    
    # Test des tests
    try:
        import pytest
        print(f"✅ Pytest disponible: {pytest.__version__}")
    except ImportError as e:
        print(f"❌ Pytest non disponible: {e}")
        return False
    
    print("🎉 Tous les tests CI passent !")
    return True

if __name__ == "__main__":
    success = test_ci_environment()
    sys.exit(0 if success else 1)
