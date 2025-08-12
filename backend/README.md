# 🚀 Backend Trading Simulation API

Backend FastAPI pour les simulations de trading avec analyses Monte-Carlo et indicateurs techniques.

## 🎯 Fonctionnalités

### 📊 Simulations Monte-Carlo
- **Simulations multiples** : Jusqu'à 1000 simulations simultanées
- **Paramètres configurables** : Capital, risque, taux de gain, etc.
- **Métriques avancées** : Drawdown, Sharpe ratio, rendements
- **Statistiques globales** : Moyennes, percentiles, taux de succès

### 📈 Indicateurs Techniques (TA-Lib)
- **158 indicateurs** disponibles
- **Groupes** : Moyennes mobiles, oscillateurs, volatilité
- **Calculs en temps réel** sur données OHLCV
- **Indicateurs populaires** : RSI, MACD, Bollinger Bands, Stochastic

## 🚀 Installation & Démarrage

### Prérequis
- Python 3.8+
- pip3

### Installation des dépendances
```bash
cd backend
pip3 install -r requirements.txt
```

### Démarrage rapide
```bash
# Option 1: Script automatique
./start.sh

# Option 2: Commande directe
python3 main.py

# Option 3: Uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 🌐 Endpoints API

### Base
- `GET /` - Statut de l'API
- `GET /health` - Vérification de santé

### Simulations
- `POST /simulate/monte-carlo` - Simulation Monte-Carlo
- **Paramètres** : Capital, risque, taux de gain, nombre de trades

### Indicateurs Techniques
- `GET /indicators/technical` - Liste des indicateurs disponibles
- `POST /indicators/calculate` - Calcul d'indicateurs sur données OHLCV

## 📊 Exemple d'utilisation

### Simulation Monte-Carlo
```bash
curl -X POST "http://localhost:8000/simulate/monte-carlo" \
  -H "Content-Type: application/json" \
  -d '{
    "initial_capital": 100000,
    "risk_per_trade": 2.0,
    "win_rate": 0.55,
    "avg_win": 2.5,
    "avg_loss": 1.5,
    "num_trades": 100,
    "num_simulations": 1000
  }'
```

### Indicateurs Techniques
```bash
curl -X POST "http://localhost:8000/indicators/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "ohlc": [
      {"open": 100, "high": 105, "low": 98, "close": 103, "volume": 1000},
      {"open": 103, "high": 108, "low": 102, "close": 106, "volume": 1200}
    ]
  }'
```

## 🔧 Configuration

### Variables d'environnement
- `PORT` : Port du serveur (défaut: 8000)
- `HOST` : Host du serveur (défaut: 0.0.0.0)

### CORS
Configuré pour permettre les requêtes depuis :
- `http://localhost:3000` (Next.js par défaut)
- `http://localhost:3001` (Next.js alternatif)

## 📈 Métriques Calculées

### Par Simulation
- **Capital final** : Valeur du portefeuille après simulation
- **Drawdown maximum** : Perte maximale depuis le pic
- **Ratio de Sharpe** : Rendement ajusté au risque
- **Rendement total** : Gain/perte en pourcentage

### Statistiques Globales
- **Moyennes** : Capital, drawdown, Sharpe, rendement
- **Percentiles** : P5, P25, P50, P75, P95
- **Extrêmes** : Meilleur et pire cas
- **Taux de succès** : Pourcentage de simulations positives

## 🛠️ Architecture

### Technologies
- **FastAPI** : Framework web moderne et rapide
- **TA-Lib** : 158 indicateurs techniques financiers
- **NumPy** : Calculs mathématiques et statistiques
- **Pydantic** : Validation des données et modèles

### Structure
```
backend/
├── main.py              # Application FastAPI principale
├── requirements.txt     # Dépendances Python
├── start.sh            # Script de démarrage
└── README.md           # Documentation
```

## 🔍 Débogage

### Logs
Les erreurs sont loggées dans la console avec stack traces détaillées.

### Tests
```bash
# Test de santé
curl http://localhost:8000/health

# Test des indicateurs
curl http://localhost:8000/indicators/technical

# Test de simulation (petite)
curl -X POST "http://localhost:8000/simulate/monte-carlo" \
  -H "Content-Type: application/json" \
  -d '{"initial_capital": 10000, "risk_per_trade": 1, "win_rate": 0.5, "avg_win": 2, "avg_loss": 1, "num_trades": 10, "num_simulations": 10}'
```

## 🚀 Prochaines étapes

- [ ] **Base de données** : Stockage persistant des simulations
- [ ] **Authentification** : Sécurisation des endpoints
- [ ] **Cache Redis** : Optimisation des performances
- [ ] **Tests unitaires** : Couverture de code
- [ ] **Monitoring** : Métriques de performance
- [ ] **Docker** : Containerisation

## 📞 Support

Pour toute question ou problème :
1. Vérifiez que le backend est démarré sur le port 8000
2. Consultez les logs dans la console
3. Testez les endpoints avec curl
4. Vérifiez la documentation interactive : `http://localhost:8000/docs`
