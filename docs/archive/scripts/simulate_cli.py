#!/usr/bin/env python3
import argparse, json, os, sys, time, importlib

def try_simulate_core(payload: dict) -> dict:
    """
    Appelle backend.simulation.simulate_core(payload) si dispo,
    sinon renvoie un mock contrôlé pour vérifier le pipeline.
    """
    try:
        mod = importlib.import_module("backend.simulation")
        if hasattr(mod, "simulate_core"):
            return mod.simulate_core(payload)  # type: ignore
    except Exception as e:
        # On tombe en mock silencieux
        pass

    # --- MOCK DEGRADE (à remplacer dès que le core est branché) ---
    # Objectif: fournir une structure compatible UI/Tests.
    import math, random
    random.seed(payload.get("seed", 42))
    n = int(payload.get("horizon", 5000))
    vol_tgt = payload.get("preset", {}).get("params", {}).get("vol_target", 0.10)
    equity = 100000.0
    curve = []
    step_risks = []
    # simple marche aléatoire avec amplitude liée à vol_tgt
    for i in range(n):
        step_vol = vol_tgt / (252 ** 0.5)  # approx daily
        r = random.gauss(0, step_vol)
        equity *= (1.0 + r)
        curve.append(equity)
        step_risks.append(abs(r))
    stdev_realized = (sum((x - (sum(step_risks)/n))**2 for x in step_risks)/n) ** 0.5

    return {
        "kpis": {
            "stdev_realized": stdev_realized * (252 ** 0.5),
            "avg_step_risk": sum(step_risks)/n,
            "max_drawdown": None,
            "mean_drawdown": None,
            "violations_count": 0
        },
        "equityCurve": curve,
        "violations": [],
        "logs": [],
        "run_id": f"dryrun-{int(time.time())}"
    }

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preset", default="FTMO-lite")
    ap.add_argument("--vol-target", type=float, default=0.10)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--horizon", type=int, default=50000)
    ap.add_argument("--out", default="logs/run_latest.json")
    args = ap.parse_args()

    payload = {
        "preset": {"name": args.preset, "params": {"vol_target": args.vol_target}},
        "seed": args.seed,
        "horizon": args.horizon,
    }

    res = try_simulate_core(payload)

    # Normalisation minimale: garantir les clés attendues
    res.setdefault("kpis", {})
    res.setdefault("equityCurve", [])
    res.setdefault("violations", [])
    res.setdefault("logs", [])
    res.setdefault("run_id", f"run-{int(time.time())}")

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w") as f:
        json.dump(res, f, indent=2)

    # Affiche KPIs + chemin de sortie
    print(json.dumps({"kpis": res["kpis"], "run_id": res["run_id"], "out": args.out}, indent=2))

if __name__ == "__main__":
    main()
