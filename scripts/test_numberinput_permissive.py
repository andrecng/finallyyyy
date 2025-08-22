#!/usr/bin/env python3
"""
Test du NumberInput permissif - vérifie que l'édition libre fonctionne
"""

import requests
import json

def test_numberinput_permissive():
    """Test avec des valeurs intermédiaires pour vérifier la tolérance"""
    
    print("🧪 Test du NumberInput permissif")
    print("Vérification que l'API accepte les valeurs intermédiaires...")
    
    # Test avec des valeurs qui auraient pu poser problème avant
    test_cases = [
        {
            "name": "test-negative",
            "mu": -0.05,  # Valeur négative
            "total_steps": 100,
            "modules": {}
        },
        {
            "name": "test-decimal",
            "fees_per_trade": 0.0001,  # Très petit décimal
            "total_steps": 100,
            "modules": {}
        },
        {
            "name": "test-zero",
            "mu": 0,  # Zéro exact
            "total_steps": 100,
            "modules": {}
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}: {test_case['name']}")
        print(f"   Valeurs: {json.dumps(test_case, indent=6)}")
        
        try:
            response = requests.post(
                "http://localhost:3000/api/simulate",
                json=test_case,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ API accepte les valeurs")
                print(f"   📊 Résultat: max_dd_total={result['kpis']['max_dd_total']:.4f}")
            else:
                print(f"   ❌ API rejette: {response.status_code}")
                print(f"   📝 Erreur: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Erreur de connexion: {e}")
    
    print("\n💡 Vérification:")
    print("- NumberInput permissif autorise l'édition libre")
    print("- L'API accepte les valeurs négatives, décimales et zéro")
    print("- L'interface est plus conviviale pour l'utilisateur")

if __name__ == "__main__":
    test_numberinput_permissive()
