# 🚀 Scripts de gestion - 2048 Asset Management

Ce dossier contient tous les scripts utiles pour gérer l'application.

## 📋 **Scripts disponibles :**

### **🚀 `start_all.sh`**
- **Démarre** le backend et le frontend en parallèle
- **Vérifie** les dépendances (Python, Node.js, npm)
- **Arrête** les processus existants avant de redémarrer
- **Affiche** les URLs d'accès

**Usage :**
```bash
./bin/start_all.sh
```

### **🛑 `stop_all.sh`**
- **Arrête** proprement tous les processus
- **Vérifie** que tout est bien arrêté
- **Affiche** le statut final

**Usage :**
```bash
./bin/stop_all.sh
```

### **📊 `status.sh`**
- **Affiche** l'état des processus backend et frontend
- **Vérifie** la réponse HTTP du backend
- **Montre** les logs récents
- **Affiche** l'utilisation des ports et ressources

**Usage :**
```bash
./bin/status.sh
```

### **🧹 `clean_logs.sh`**
- **Nettoie** tous les logs et fichiers temporaires
- **Supprime** le cache Next.js
- **Nettoie** les fichiers Python compilés

**Usage :**
```bash
./bin/clean_logs.sh
```

## 🔧 **Workflow typique :**

1. **Démarrage :**
   ```bash
   ./bin/start_all.sh
   ```

2. **Vérification du statut :**
   ```bash
   ./bin/status.sh
   ```

3. **Arrêt :**
   ```bash
   ./bin/stop_all.sh
   ```

4. **Nettoyage (optionnel) :**
   ```bash
   ./bin/clean_logs.sh
   ```

## 📝 **Logs :**

- **Backend :** `backend/backend.log`
- **Frontend :** `frontend.log`

## 🌐 **Ports par défaut :**

- **Backend :** 8000
- **Frontend :** 3000, 3001, 3002, ou 3003 (auto-détection)

## ⚠️ **Notes importantes :**

- Les scripts arrêtent **forcément** les processus existants
- Utilisez `./bin/status.sh` pour vérifier l'état avant d'agir
- Les logs sont sauvegardés automatiquement
- Le cache Next.js est régénéré au redémarrage

## 🆘 **En cas de problème :**

1. Vérifiez le statut : `./bin/status.sh`
2. Arrêtez tout : `./bin/stop_all.sh`
3. Nettoyez : `./bin/clean_logs.sh`
4. Redémarrez : `./bin/start_all.sh`
