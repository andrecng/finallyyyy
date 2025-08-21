#!/usr/bin/env python3
"""
Script de diagnostic des problèmes de l'environnement
"""

import requests
import subprocess
import time
import os
import json

def check_api_health():
    """Vérifier la santé de l'API"""
    print("🔍 DIAGNOSTIC DE L'ENVIRONNEMENT")
    print("=" * 50)
    
    print("\n1️⃣ Vérification de l'API:")
    
    try:
        # Test de santé
        response = requests.get("http://localhost:8001/healthz", timeout=5)
        if response.status_code == 200:
            print("   ✅ API en ligne sur port 8001")
        else:
            print(f"   ❌ API en erreur: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("   ❌ API inaccessible sur port 8001")
        return False
    except Exception as e:
        print(f"   ❌ Erreur API: {e}")
        return False
    
    # Test de simulation
    try:
        response = requests.post(
            "http://localhost:8001/simulate",
            json={"params": {"desired_risk": 0.01, "total_steps": 10}},
            timeout=10
        )
        if response.status_code == 200:
            print("   ✅ Endpoint /simulate fonctionnel")
        else:
            print(f"   ❌ /simulate en erreur: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Erreur /simulate: {e}")
    
    return True

def check_frontend():
    """Vérifier le frontend"""
    print("\n2️⃣ Vérification du Frontend:")
    
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("   ✅ Frontend accessible sur port 3000")
            if "/workspace" in response.text:
                print("   ✅ Page /workspace détectée")
            else:
                print("   ⚠️  Page /workspace non trouvée")
        else:
            print(f"   ❌ Frontend en erreur: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("   ❌ Frontend inaccessible sur port 3000")
    except Exception as e:
        print(f"   ❌ Erreur frontend: {e}")

def check_processes():
    """Vérifier les processus en cours"""
    print("\n3️⃣ Vérification des processus:")
    
    try:
        # Vérifier uvicorn
        result = subprocess.run(
            ["pgrep", "-f", "uvicorn.*backend.main:app"],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            pids = result.stdout.strip().split('\n')
            print(f"   ✅ Uvicorn en cours: {len(pids)} processus")
            for pid in pids:
                if pid:
                    print(f"      PID {pid}")
        else:
            print("   ❌ Aucun processus uvicorn trouvé")
        
        # Vérifier next
        result = subprocess.run(
            ["pgrep", "-f", "next dev"],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            pids = result.stdout.strip().split('\n')
            print(f"   ✅ Next.js en cours: {len(pids)} processus")
            for pid in pids:
                if pid:
                    print(f"      PID {pid}")
        else:
            print("   ❌ Aucun processus Next.js trouvé")
            
    except Exception as e:
        print(f"   ❌ Erreur vérification processus: {e}")

def check_ports():
    """Vérifier l'utilisation des ports"""
    print("\n4️⃣ Vérification des ports:")
    
    ports = [3000, 8001]
    for port in ports:
        try:
            result = subprocess.run(
                ["lsof", "-ti", f":{port}"],
                capture_output=True, text=True
            )
            if result.returncode == 0:
                pids = result.stdout.strip().split('\n')
                print(f"   🔴 Port {port} occupé par {len(pids)} processus")
                for pid in pids:
                    if pid:
                        print(f"      PID {pid}")
            else:
                print(f"   🟢 Port {port} libre")
        except Exception as e:
            print(f"   ❌ Erreur vérification port {port}: {e}")

def check_file_changes():
    """Vérifier les modifications récentes de fichiers"""
    print("\n5️⃣ Modifications récentes de fichiers:")
    
    try:
        # Vérifier les modifications dans les 5 dernières minutes
        result = subprocess.run(
            ["find", ".", "-name", "*.py", "-mmin", "-5"],
            capture_output=True, text=True
        )
        if result.returncode == 0 and result.stdout.strip():
            files = result.stdout.strip().split('\n')
            print(f"   📝 {len(files)} fichiers Python modifiés récemment:")
            for file in files[:5]:  # Limiter à 5 fichiers
                if file:
                    print(f"      {file}")
        else:
            print("   ✅ Aucun fichier Python modifié récemment")
            
    except Exception as e:
        print(f"   ❌ Erreur vérification fichiers: {e}")

def check_performance():
    """Vérifier les performances de l'API"""
    print("\n6️⃣ Test de performance:")
    
    try:
        start_time = time.time()
        response = requests.post(
            "http://localhost:8001/simulate",
            json={"params": {"desired_risk": 0.01, "total_steps": 20}},
            timeout=10
        )
        end_time = time.time()
        
        if response.status_code == 200:
            duration = (end_time - start_time) * 1000
            print(f"   ⚡ Temps de réponse: {duration:.1f}ms")
            
            if duration < 100:
                print("   🚀 Performance excellente")
            elif duration < 500:
                print("   ✅ Performance correcte")
            else:
                print("   ⚠️  Performance dégradée")
        else:
            print(f"   ❌ Erreur performance: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Erreur test performance: {e}")

def main():
    """Diagnostic principal"""
    print("🚀 DIAGNOSTIC COMPLET DE L'ENVIRONNEMENT")
    print("=" * 60)
    
    # Vérifications de base
    api_ok = check_api_health()
    check_frontend()
    check_processes()
    check_ports()
    check_file_changes()
    check_performance()
    
    print("\n" + "=" * 60)
    print("📋 RÉSUMÉ DU DIAGNOSTIC")
    
    if api_ok:
        print("✅ API fonctionnelle")
        print("✅ Environnement stable")
        print("\n💡 Pour tester l'interface:")
        print("   Ouvrez http://localhost:3000/workspace")
    else:
        print("❌ Problèmes détectés")
        print("\n🔧 Actions recommandées:")
        print("   1. npm run kill:ports")
        print("   2. npm run dev")
        print("   3. Vérifier les logs pour erreurs")

if __name__ == "__main__":
    main()
