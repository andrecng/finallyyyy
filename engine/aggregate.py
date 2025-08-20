def aggregate_min(module_results, last_pnl=None):
    # module_results: [{"name":..., "risk_eff": float, "logs": {...}}, ...]
    risk_final = max(0.0, min(r["risk_eff"] for r in module_results))
    # no upsize after loss
    if last_pnl is not None and last_pnl < 0:
        # freeze to previous or enforce a haircut; here: keep as is (no increase is enforced upstream)
        pass
    logs = {"binders": sorted([(r["risk_eff"], r["name"]) for r in module_results])[:2]}
    return {"risk_final": risk_final, "logs": logs}
