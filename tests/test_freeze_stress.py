#!/usr/bin/env python3
"""
Test de stress pour valider la logique de freeze CPPI
Scénarios difficiles pour déclencher les mécanismes de protection
"""

import numpy as np
import json
from datetime import datetime
from test_freeze_modes import run_strategy

def generate_stress_scenario(scenario_type="clustered_losses", N=30):
    """
    Génère des scénarios de stress pour tester les mécanismes de freeze
    
    Args:
        scenario_type: "clustered_losses", "gap_down", "volatility_spike"
        N: nombre de trades
    """
    rng = np.random.default_rng(42)
    
    if scenario_type == "clustered_losses":
        # Pertes groupées au début (scénario FTMO critique)
        trades = np.ones(N) * 0.5  # gains modérés
        # Cluster de pertes au début
        loss_cluster_size = min(8, N // 3)
        trades[:loss_cluster_size] = -2.0  # pertes importantes
        
    elif scenario_type == "gap_down":
        # Gap down soudain
        trades = np.ones(N) * 0.3
        gap_position = N // 4
        trades[gap_position:gap_position+3] = -3.0  # gap de 3 trades
        
    elif scenario_type == "volatility_spike":
        # Volatilité élevée avec pertes importantes
        trades = rng.normal(0, 1.5, N)
        # Assurer quelques pertes importantes
        trades[trades > 0] *= 0.5  # réduire les gains
        trades[trades < 0] *= 1.5  # amplifier les pertes
        
    else:
        # Scénario par défaut: pertes progressives
        trades = np.linspace(-0.5, -2.0, N)
    
    return trades

def run_stress_test():
    """Test de stress avec différents scénarios"""
    
    scenarios = ["clustered_losses", "gap_down", "volatility_spike"]
    results = {}
    
    for scenario in scenarios:
        print(f"\n🔥 Test de stress: {scenario}")
        print("-" * 40)
        
        # Générer scénario de stress
        trades = generate_stress_scenario(scenario, N=30)
        
        # Configuration FTMO stricte
        config = {
            "W0": 100_000,
            "alpha": 0.10,  # plancher à 90% du HWM
            "f": 0.15,      # fraction Kelly plus agressive
            "lam": 0.6,     # fractionnement Kelly plus élevé
            "tau": 0.05,    # freeze si cushion < 5%
        }
        
        # Test hard freeze
        result_hard = run_strategy(
            trades, 
            W0=config["W0"],
            alpha=config["alpha"],
            f=config["f"],
            lam=config["lam"],
            freeze_mode="hard",
            tau=config["tau"]
        )
        
        # Test soft freeze
        result_soft = run_strategy(
            trades, 
            W0=config["W0"],
            alpha=config["alpha"],
            f=config["f"],
            lam=config["lam"],
            freeze_mode="soft",
            tau=config["tau"]
        )
        
        # Analyse du scénario
        scenario_analysis = {
            "trades": trades.tolist(),
            "config": config,
            "hard_freeze": result_hard,
            "soft_freeze": result_soft,
            "stress_metrics": {
                "worst_trade": float(np.min(trades)),
                "best_trade": float(np.max(trades)),
                "trade_volatility": float(np.std(trades)),
                "consecutive_losses": count_consecutive_losses(trades),
                "max_loss_streak": max_consecutive_losses(trades)
            }
        }
        
        results[scenario] = scenario_analysis
        
        # Affichage rapide
        hard = result_hard["metrics"]
        soft = result_soft["metrics"]
        
        print(f"   Hard Freeze: ${hard['final_capital']:,.0f} (DD: {hard['max_drawdown']:.1%}, Freezes: {hard['freeze_count']})")
        print(f"   Soft Freeze: ${soft['final_capital']:,.0f} (DD: {soft['max_drawdown']:.1%}, Freezes: {soft['freeze_count']})")
        
        # Vérifier si le freeze a été déclenché
        if hard["freeze_count"] > 0:
            print(f"   ✅ Freeze déclenché dans le scénario {scenario}")
        else:
            print(f"   ⚠️  Aucun freeze déclenché - scénario peut-être trop doux")
    
    return results

def count_consecutive_losses(trades):
    """Compte les pertes consécutives"""
    losses = trades < 0
    if not np.any(losses):
        return 0
    
    # Trouver les séquences de pertes
    loss_streaks = []
    current_streak = 0
    
    for loss in losses:
        if loss:
            current_streak += 1
        else:
            if current_streak > 0:
                loss_streaks.append(current_streak)
                current_streak = 0
    
    if current_streak > 0:
        loss_streaks.append(current_streak)
    
    return loss_streaks

def max_consecutive_losses(trades):
    """Trouve la séquence de pertes la plus longue"""
    loss_streaks = count_consecutive_losses(trades)
    return max(loss_streaks) if loss_streaks else 0

def analyze_freeze_effectiveness(results):
    """Analyse l'efficacité des mécanismes de freeze"""
    
    print("\n🎯 Analyse de l'Efficacité des Freezes")
    print("=" * 50)
    
    total_scenarios = len(results)
    scenarios_with_freeze = 0
    total_freezes = 0
    total_defreezes = 0
    
    for scenario_name, scenario_data in results.items():
        hard = scenario_data["hard_freeze"]
        soft = scenario_data["soft_freeze"]
        
        if hard["metrics"]["freeze_count"] > 0 or soft["metrics"]["freeze_count"] > 0:
            scenarios_with_freeze += 1
        
        total_freezes += hard["metrics"]["freeze_count"] + soft["metrics"]["freeze_count"]
        total_defreezes += soft["metrics"]["defreeze_count"]
        
        # Analyse détaillée si freeze déclenché
        if hard["metrics"]["freeze_count"] > 0:
            print(f"\n🔒 {scenario_name} - Freeze déclenché:")
            print(f"   Hard Freeze: {hard['metrics']['freeze_count']} freezes")
            print(f"   Soft Freeze: {soft['metrics']['freeze_count']} freezes, {soft['metrics']['defreeze_count']} défreezes")
            
            # Analyser les événements de freeze
            for event in hard["freeze_events"]:
                print(f"   Freeze à l'étape {event['step']}: cushion={event['cushion_ratio']:.1%}, capital=${event['capital']:,.0f}")
    
    print(f"\n📊 Résumé Global:")
    print(f"   Scénarios avec freeze: {scenarios_with_freeze}/{total_scenarios}")
    print(f"   Total freezes: {total_freezes}")
    print(f"   Total défreezes: {total_defreezes}")
    
    # Validation des règles d'or
    print(f"\n✅ Validation des Règles d'Or (Tous Scénarios):")
    
    all_rules_passed = True
    
    for scenario_name, scenario_data in results.items():
        hard = scenario_data["hard_freeze"]
        soft = scenario_data["soft_freeze"]
        
        # Règle 1: Contrainte FTMO respectée
        ftmo_dd_ok = abs(hard["metrics"]["max_drawdown"]) <= 0.10
        if not ftmo_dd_ok:
            print(f"   ❌ {scenario_name}: DD {hard['metrics']['max_drawdown']:.1%} > 10%")
            all_rules_passed = False
        
        # Règle 2: Freeze effectif si nécessaire
        if hard["metrics"]["freeze_count"] == 0 and abs(hard["metrics"]["max_drawdown"]) > 0.05:
            print(f"   ⚠️  {scenario_name}: Freeze non déclenché malgré DD {hard['metrics']['max_drawdown']:.1%}")
    
    if all_rules_passed:
        print("   ✅ Toutes les contraintes FTMO respectées")
    
    return all_rules_passed

def save_stress_results(results, filename=None):
    """Sauvegarde des résultats de stress test"""
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"logs/stress_test_freeze_{timestamp}.json"
    
    # Créer le dossier logs si nécessaire
    import os
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    with open(filename, 'w') as f:
        json.dump(results, f, indent=2)
    
    return filename

if __name__ == "__main__":
    print("🚀 Lancement du test de stress des modes de freeze...")
    
    # Exécuter les tests de stress
    results = run_stress_test()
    
    # Analyser l'efficacité
    effectiveness = analyze_freeze_effectiveness(results)
    
    # Sauvegarder les résultats
    filename = save_stress_results(results)
    print(f"\n💾 Résultats sauvegardés: {filename}")
    
    print(f"\n🎯 Test de stress terminé!")
    print(f"   Efficacité des freezes: {'✅' if effectiveness else '⚠️'}")
