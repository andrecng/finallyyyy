#!/usr/bin/env python3
"""
Test de tous les presets - validation des comportements attendus
"""

import requests
import json
import os
from pathlib import Path

def test_preset(preset_name: str, preset_data: dict) -> dict:
    """Test un preset et retourne les résultats"""
    
    print(f"\n🧪 Test: {preset_name}")
    print(f"   Modules: {list(preset_data.get('modules', {}).keys())}")
    
    try:
        response = requests.post(
            "http://localhost:3000/api/simulate",
            json=preset_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            kpis = result['kpis']
            
            print(f"   ✅ Simulation réussie")
            print(f"   📊 Max DD Total: {kpis['max_dd_total']:.4f}")
            print(f"   📊 Max DD Daily: {kpis['max_dd_daily']:.4f}")
            print(f"   📊 Violations Daily: {kpis['violations_daily']}")
            print(f"   📊 Violations Total: {kpis['violations_total']}")
            print(f"   📊 Pass Rate: {kpis['pass_rate']:.2f}")
            
            return {
                'name': preset_name,
                'success': True,
                'kpis': kpis,
                'modules': result.get('modules_active', [])
            }
        else:
            print(f"   ❌ Erreur API: {response.status_code}")
            print(f"   📝 Détails: {response.text}")
            return {
                'name': preset_name,
                'success': False,
                'error': f"HTTP {response.status_code}"
            }
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Erreur de connexion: {e}")
        return {
            'name': preset_name,
            'success': False,
            'error': str(e)
        }

def analyze_results(results: list) -> None:
    """Analyse et compare les résultats des presets"""
    
    print("\n" + "="*60)
    print("📊 ANALYSE COMPARATIVE DES PRESETS")
    print("="*60)
    
    # Filtrer les tests réussis
    successful = [r for r in results if r['success']]
    
    if not successful:
        print("❌ Aucun test réussi")
        return
    
    # Baseline comme référence
    baseline = next((r for r in successful if 'baseline' in r['name']), None)
    
    if baseline:
        print(f"\n🎯 BASELINE: {baseline['name']}")
        print(f"   Max DD Total: {baseline['kpis']['max_dd_total']:.4f}")
        print(f"   Max DD Daily: {baseline['kpis']['max_dd_daily']:.4f}")
        print(f"   Pass Rate: {baseline['kpis']['pass_rate']:.2f}")
        
        # Comparer avec baseline
        print(f"\n📈 COMPARAISONS vs BASELINE:")
        for result in successful:
            if result['name'] == baseline['name']:
                continue
                
            dd_total_diff = result['kpis']['max_dd_total'] - baseline['kpis']['max_dd_total']
            dd_daily_diff = result['kpis']['max_dd_daily'] - baseline['kpis']['max_dd_daily']
            pass_rate_diff = result['kpis']['pass_rate'] - baseline['kpis']['pass_rate']
            
            print(f"\n   {result['name']}:")
            print(f"     DD Total: {dd_total_diff:+.4f} ({'↑' if dd_total_diff > 0 else '↓'})")
            print(f"     DD Daily: {dd_daily_diff:+.4f} ({'↑' if dd_daily_diff > 0 else '↓'})")
            print(f"     Pass Rate: {pass_rate_diff:+.2f} ({'↑' if pass_rate_diff > 0 else '↓'})")
    
    # Résumé des performances
    print(f"\n🏆 RÉSUMÉ DES PERFORMANCES:")
    print(f"   Tests réussis: {len(successful)}/{len(results)}")
    
    if successful:
        best_pass_rate = max(successful, key=lambda x: x['kpis']['pass_rate'])
        lowest_dd_total = min(successful, key=lambda x: x['kpis']['max_dd_total'])
        lowest_dd_daily = min(successful, key=lambda x: x['kpis']['max_dd_daily'])
        
        print(f"   🥇 Meilleur Pass Rate: {best_pass_rate['name']} ({best_pass_rate['kpis']['pass_rate']:.2f})")
        print(f"   🥇 Plus bas DD Total: {lowest_dd_total['name']} ({lowest_dd_total['kpis']['max_dd_total']:.4f})")
        print(f"   🥇 Plus bas DD Daily: {lowest_dd_daily['name']} ({lowest_dd_daily['kpis']['max_dd_daily']:.4f})")

def main():
    """Test principal de tous les presets"""
    
    print("🚀 TEST COMPLET DE TOUS LES PRESETS")
    print("="*60)
    
    # Charger tous les presets
    presets_dir = Path("presets")
    preset_files = list(presets_dir.glob("*.json"))
    
    if not preset_files:
        print("❌ Aucun fichier preset trouvé dans presets/")
        return
    
    print(f"📁 {len(preset_files)} presets trouvés:")
    for f in preset_files:
        print(f"   - {f.name}")
    
    # Tester chaque preset
    results = []
    for preset_file in preset_files:
        try:
            with open(preset_file, 'r') as f:
                preset_data = json.load(f)
            
            result = test_preset(preset_file.stem, preset_data)
            results.append(result)
            
        except Exception as e:
            print(f"\n❌ Erreur lecture {preset_file.name}: {e}")
            results.append({
                'name': preset_file.stem,
                'success': False,
                'error': f"Erreur lecture: {e}"
            })
    
    # Analyser les résultats
    analyze_results(results)
    
    print(f"\n✅ Test terminé pour {len(results)} presets")

if __name__ == "__main__":
    main()
