#!/usr/bin/env python3
"""
Test du bouton Reset (0) - vérifie que total_steps=0 est géré correctement
"""

import requests
import json

def test_reset_zero():
    """Test avec un preset où total_steps=0"""
    
    # Preset avec total_steps=0 (cas Reset (0))
    reset_preset = {
        "name": "reset-zero-test",
        "schema_version": "1.0",
        "seed": 0,
        "total_steps": 0,  # ⚠️ Ceci peut causer des problèmes
        "mu": 0,
        "fees_per_trade": 0,
        "modules": {}  # Tous les modules OFF
    }
    
    print("🧪 Test du bouton Reset (0)")
    print(f"Preset: {json.dumps(reset_preset, indent=2)}")
    
    try:
        # Test de l'API
        response = requests.post(
            "http://localhost:3000/api/simulate",
            json=reset_preset,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API accepte total_steps=0")
            print(f"Résultat: {json.dumps(result, indent=2)}")
        else:
            print(f"❌ API rejette total_steps=0: {response.status_code}")
            print(f"Erreur: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")
    
    print("\n💡 Recommandation:")
    print("- Si l'API rejette total_steps=0, modifier zeroPreset() pour mettre une valeur min (ex: 100)")
    print("- Ou gérer ce cas côté backend/mock")

if __name__ == "__main__":
    test_reset_zero()
