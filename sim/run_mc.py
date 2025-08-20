import argparse
import json
import numpy as np
import sys
import os

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sim.profile import load_profile
from sim.returns import sample_with_jumps, sample_mixture, sample_student_t
from sim.vol_process import ewma_vol_path

def sample_gaussian(mu, sigma, size, rng):
    return rng.normal(mu, sigma, size)

def gen_returns(profile, T, rng):
    mu = profile.get("mu", 0.0)
    sigma = profile.get("sigma", 0.01)
    sampler = profile.get("sampler", "gaussian")
    vol_proc = profile.get("vol_process", "none")

    # Build volatility path if needed
    if vol_proc == "ewma":
        lam = profile.get("ewma", {}).get("lambda", 0.94)
        sigma0 = profile.get("ewma", {}).get("sigma0", sigma)
        shock = profile.get("ewma", {}).get("shock", 0.02)
        sig_path = ewma_vol_path(T=T, sigma0=sigma0, lam=lam, shock=shock, rng=rng)
    else:
        sig_path = np.full(T, sigma)

    # Base samples
    if sampler == "gaussian":
        base = np.array([sample_gaussian(mu, s, 1, rng)[0] for s in sig_path])
    elif sampler == "student_t":
        nu = profile.get("nu", 4)
        base = np.array([sample_student_t(mu, s, nu, 1, rng)[0] for s in sig_path])
    else:
        raise ValueError(f"Unsupported sampler: {sampler}")

    # Optional jumps
    jumps_cfg = profile.get("jumps", {"enabled": False})
    if jumps_cfg.get("enabled", False):
        p_jump = jumps_cfg.get("p_jump", 0.01)
        jump_sigma = jumps_cfg.get("jump_sigma", 0.04)
        jumps = sample_with_jumps(0.0, 0.0, p_jump=p_jump, jump_sigma=jump_sigma, size=T, rng=rng)
        base = base + jumps

    return base

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--profile", type=str, default="gaussian")
    ap.add_argument("--n", type=int, default=2000, help="nbr de runs")
    ap.add_argument("--T", type=int, default=1000, help="horizon steps")
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--out", type=str, default="out_mc.json")
    args = ap.parse_args()

    rng = np.random.default_rng(args.seed)
    profile = load_profile(args.profile)

    results = {"profile": args.profile, "runs": args.n, "T": args.T, "seed": args.seed, "summary": {}}
    # NOTE: ici on simule juste les retours; plug tes modules/aggregate_min() dans la boucle
    worst_dds = []
    for _ in range(args.n):
        r = gen_returns(profile, args.T, rng)
        # TODO: appliquer modules -> aggregate_min -> equity, logs
        # Ici, simple proxy: DD sur la série bruitee (à remplacer par equity réel)
        eq = (1.0 + r).cumprod()
        peak = np.maximum.accumulate(eq)
        dd = (eq - peak) / peak
        worst_dds.append(dd.min())

    results["summary"]["avg_worst_dd"] = float(np.mean(worst_dds))
    results["summary"]["p95_worst_dd"] = float(np.percentile(worst_dds, 5))
    with open(args.out, "w") as f:
        json.dump(results, f, indent=2)
    print(f"[OK] wrote {args.out} with summary: {results['summary']}")

if __name__ == "__main__":
    main()
