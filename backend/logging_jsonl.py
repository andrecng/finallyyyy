import json, os, time
from typing import Any, Dict, Optional

class JsonlLogger:
    """
    Ecrit des événements au format JSON Lines dans backend/logs/<run_id>/*.
    Fichiers:
      - run.log.jsonl        : tous événements (niveau orchestrateur)
      - risk.log.jsonl       : (t, equity, risk_final, size_final)
      - compliance.log.jsonl : violations compliance
      - module.<id>.jsonl    : événements par module (créés à la volée)
    """

    def __init__(self, run_id: Optional[str] = None, base_dir: Optional[str] = None):
        ts = time.strftime("%Y%m%d-%H%M%S")
        self.run_id = run_id or f"run-{ts}"
        self.base_dir = base_dir or os.environ.get("LOG_DIR", "backend/logs")
        self.dir = os.path.join(self.base_dir, self.run_id)
        os.makedirs(self.dir, exist_ok=True)
        self._files: Dict[str, Any] = {}
        # fichiers de base
        self._files["run"] = open(os.path.join(self.dir, "run.log.jsonl"), "a", encoding="utf-8")
        self._files["risk"] = open(os.path.join(self.dir, "risk.log.jsonl"), "a", encoding="utf-8")
        self._files["compliance"] = open(os.path.join(self.dir, "compliance.log.jsonl"), "a", encoding="utf-8")

    def _w(self, key: str, obj: Dict[str, Any]):
        f = self._files[key]
        f.write(json.dumps(obj, ensure_ascii=False) + "\n")
        f.flush()

    def log_run(self, event: str, **details):
        self._w("run", {"event": event, **details})

    def log_risk(self, t: int, equity: float, risk_final: float, size_final: float):
        self._w("risk", {"t": t, "equity": equity, "risk_final": risk_final, "size_final": size_final})

    def log_compliance(self, violation: Dict[str, Any]):
        self._w("compliance", violation)

    def log_module(self, module_id: str, event: str, **details):
        key = f"module:{module_id}"
        if key not in self._files:
            self._files[key] = open(os.path.join(self.dir, f"module.{module_id}.jsonl"), "a", encoding="utf-8")
        f = self._files[key]
        f.write(json.dumps({"module": module_id, "event": event, **details}, ensure_ascii=False) + "\n")
        f.flush()

    def close(self):
        for f in self._files.values():
            try:
                f.close()
            except Exception:
                pass
        self._files.clear()
