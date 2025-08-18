# 🚀 GUIDE DE LANCEMENT - MM ENGINE

## ✅ **MODE RECOMMANDÉ (depuis la racine)**

### **1. Backend API**
```bash
# Depuis /Users/andre.cng/Desktop/finallyyyy-1/
uvicorn backend.app:app --reload --host 0.0.0.0 --port 8001
```

**Avantages :**
- ✅ Imports absolus : `from backend.orchestrator import PositionSizer`
- ✅ Reloader stable (pas de bugs)
- ✅ Tests fonctionnent : `PYTHONPATH=backend pytest backend/tests/`
- ✅ Package reconnu grâce à `backend/__init__.py`

### **2. Frontend**
```bash
# Depuis /Users/andre.cng/Desktop/finallyyyy-1/
npm run dev
```

**Ports :**
- Port 3000 (par défaut)
- Si occupé : 3001, 3002, etc.

### **3. Tests**
```bash
# Depuis /Users/andre.cng/Desktop/finallyyyy-1/
PYTHONPATH=backend pytest backend/tests/ -v
```

---

## ❌ **MODE NON RECOMMANDÉ (depuis backend/)**

### **1. Backend API**
```bash
# Depuis /Users/andre.cng/Desktop/finallyyyy-1/backend/
uvicorn app:app --reload --port 8001
```

**Problèmes :**
- ❌ Imports relatifs : `from .orchestrator import PositionSizer`
- ❌ Reloader instable (bugs fréquents)
- ❌ Tests cassés (imports relatifs ne fonctionnent pas)
- ❌ Difficile à déboguer

---

## 🔧 **PAYLOAD CORRECT**

### **Risk Limits (POURCENTAGES, pas fractions)**
```json
// ✅ CORRECT
"risk_limits": {
  "max_dd": 10,           // 10% (pas 0.1)
  "daily_dd": 5,          // 5% (pas 0.05)
  "freeze_cushion_pct": 5 // 5% (pas 0.05)
}

// ❌ INCORRECT
"risk_limits": {
  "max_dd": 0.1,          // 0.1% (trop petit)
  "daily_dd": 0.05,       // 0.05% (trop petit)
  "freeze_cushion_pct": 0.05 // 0.05% (trop petit)
}
```

---

## 🌐 **ACCÈS**

### **Backend API**
- **URL** : http://localhost:8001
- **Health** : http://localhost:8001/health
- **Docs** : http://localhost:8001/docs
- **Simulate** : http://localhost:8001/simulate
- **FTMO Multi** : http://localhost:8001/ftmo_multi

### **Frontend**
- **URL** : http://localhost:3000 (ou 3001, 3002...)
- **Strategy Tester** : http://localhost:3000/strategy-tester

---

## 🎯 **COMMANDES RAPIDES**

```bash
# 1. Démarrer le backend (depuis la racine)
uvicorn backend.app:app --reload --host 0.0.0.0 --port 8001

# 2. Démarrer le frontend (depuis la racine)
npm run dev

# 3. Lancer les tests (depuis la racine)
PYTHONPATH=backend pytest backend/tests/ -v

# 4. Test rapide de l'API
curl -s http://localhost:8001/health
```

---

## ⚠️ **POINTS IMPORTANTS**

1. **Toujours lancer depuis la racine** (`/Users/andre.cng/Desktop/finallyyyy-1/`)
2. **Utiliser `backend.app:app`** (pas `app:app`)
3. **Risk limits en pourcentages** (10, 5, 5 pas 0.1, 0.05, 0.05)
4. **Imports absolus** dans tous les fichiers Python
5. **Package `backend` reconnu** grâce à `backend/__init__.py`

---

**Suivez ce guide pour un fonctionnement optimal ! 🚀**
