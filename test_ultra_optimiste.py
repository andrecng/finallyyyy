#!/usr/bin/env python3
"""
Test ultra-optimiste FTMO - Target très basse pour voir un succès
"""

import requests
import json

def test_ultra_optimiste():
    """Test avec une target ultra-basse"""
    print("🎯 TEST ULTRA-OPTIMISTE FTMO")
    print("=" * 45)
    
    config = {
        "preset": {
            "capital_initial": 100000,
            "modules": [
                {"id": "bayes", "enabled": True, "params": {"p": 0.55, "k": 0.1, "cap": 0.02}},
                {"id": "vol_target", "enabled": True, "params": {"target_vol": 0.1, "vol_est": 0.1, "scale": 0.1, "max_risk": 0.02}},
                {"id": "cppi", "enabled": True, "params": {"multiplier": 1.0, "cap": 0.02}},
                {"id": "drawdown_manager", "enabled": True, "params": {"bands": [[5, 0.02], [10, 0.01], [20, 0.0]]}}
            ],
            "gating": {},
            "risk_limits": {"max_dd": 20, "daily_dd": 10, "freeze_cushion_pct": 5}
        },
        "market_model": {"type": "MC", "params": {"mu": 0.005, "sigma": 0.005}},
        "horizon": 50,
        "rules": {
            "profit_target_pct": 0.1,  # Target ultra-basse
            "max_total_dd_pct": 20,
            "max_daily_dd_pct": 10,
            "min_trading_steps": 2,
            "time_limit_steps": 50
        },
        "parallel": 3,
        "trials": 30,
        "seed": 42
    }
    
    try:
        response = requests.post("http://localhost:8001/ftmo_multi", json=config)
        if response.status_code == 200:
            data = response.json()
            estimate = data["estimate"]
            example = data["example"]
            
            print(f"📊 Résultats:")
            print(f"   • P(≥1 succès): {estimate['p_any']:.1%}")
            print(f"   • P(tous succès): {estimate['p_all']:.1%}")
            print(f"   • P(aucun succès): {estimate['p_none']:.1%}")
            print(f"   • IC 95%: [{estimate['ci95'][0]:.1%}, {estimate['ci95'][1]:.1%}]")
            
            print(f"\n📈 Exemple:")
            print(f"   • Succès: {'✅' if example['passed'] else '❌'}")
            print(f"   • Gain: {example['gain_pct']:.3f}%")
            print(f"   • MaxDD: {example['kpis']['MaxDD']:.1%}")
            
            # Test avec target encore plus basse
            print(f"\n🔍 Test avec target 0.05%:")
            config["rules"]["profit_target_pct"] = 0.05
            individual = requests.post("http://localhost:8001/ftmo_multi", json={
                **config,
                "trials": 1,
                "parallel": 1
            }).json()
            
            ex = individual["example"]
            print(f"   • Gain final: {ex['gain_pct']:.3f}%")
            print(f"   • Target: 0.05%")
            print(f"   • Passé: {'✅' if ex['gain_pct'] >= 0.05 else '❌'}")
            
        else:
            print(f"❌ Erreur: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_ultra_optimiste()
