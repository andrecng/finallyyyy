# 🚀 **DÉMARRAGE RAPIDE - MMEngine**

## 📋 **1. Cloner et installer**

```bash
git clone https://github.com/andrecng/finallyyyy.git
cd finallyyyy
npm install
python3 -m venv backend/.venv 
source backend/.venv/bin/activate 
pip install -r backend/requirements.txt
```

## 🎯 **2. Lancer le développement**

### **Option A : Script unifié (recommandé)**
```bash
./scripts/dev.sh
```

### **Option B : Deux consoles séparées**
```bash
# Terminal 1 - Backend
cd backend
source .venv/bin/activate
uvicorn app:app --port 8001

# Terminal 2 - Frontend  
npm run dev -- -p 3003
```

## 🧪 **3. Lancer les tests existants**

```bash
# Tests de base
./scripts/run_freeze_tests.sh || true
./scripts/run_amplifier_tests.sh || true

# Tests des nouveaux modules
python -m pytest tests/ -v
```

## 🌐 **4. Accès aux services**

- **Frontend** : http://localhost:3003
- **Backend API** : http://localhost:8001
- **Docs API** : http://localhost:8001/docs

## 📁 **5. Structure créée**

```
├── schemas/           # Schémas JSON I/O
├── engine/            # Moteur de position sizing
├── modules/           # Modules FTMO, CPPI, etc.
├── tests/             # Tests étendus
├── components/        # Composants React
└── scripts/           # Scripts de développement
```

## 🎉 **Prêt à développer !**
