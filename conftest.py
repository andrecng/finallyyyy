"""Configuration pytest pour résoudre les problèmes d'import"""
import sys
import os
from pathlib import Path

# Ajouter le répertoire racine au PYTHONPATH
root_dir = Path(__file__).parent
sys.path.insert(0, str(root_dir))

# Vérifier que le backend est accessible
try:
    from backend.main import app
    print(f"✅ Backend importé depuis {root_dir}")
except ImportError as e:
    print(f"❌ Erreur import backend: {e}")
    print(f"📁 Répertoire courant: {os.getcwd()}")
    print(f"📁 Répertoire racine: {root_dir}")
    print(f"🐍 PYTHONPATH: {sys.path}")
    raise
