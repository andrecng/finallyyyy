import logging
import os
from logging.handlers import RotatingFileHandler

LOG_DIR = os.getenv("LOG_DIR", "backend/logs")
LOG_FILE = os.path.join(LOG_DIR, os.getenv("LOG_FILE", "app.log"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_MAX_MB = int(os.getenv("LOG_MAX_MB", "5"))   # taille max d'un fichier
LOG_BACKUPS = int(os.getenv("LOG_BACKUPS", "5")) # nb de rotations

def setup_logging():
    os.makedirs(LOG_DIR, exist_ok=True)
    root = logging.getLogger()
    root.setLevel(LOG_LEVEL)

    # Console
    ch = logging.StreamHandler()
    ch.setLevel(LOG_LEVEL)
    ch.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
    root.addHandler(ch)

    # Fichier rotatif
    fh = RotatingFileHandler(LOG_FILE, maxBytes=LOG_MAX_MB * 1024 * 1024, backupCount=LOG_BACKUPS)
    fh.setLevel(LOG_LEVEL)
    fh.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
    root.addHandler(fh)
