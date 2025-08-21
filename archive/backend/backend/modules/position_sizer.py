from engine.modules.ftmo_gate import ftmo_gate, FTMOGateParams, FTMOGateState

def aggregate_allowed_risk(requested_risk, ctx):
    # ctx expose les sorties des modules précédents + états
    candidates = [
        ctx.voltarget_allowed,   # ex: 0.012
        ctx.cppi_allowed,        # ex: 0.010
        ctx.kellycap_allowed,    # ex: 0.009
        ctx.softbarrier_allowed, # ex: 0.009
    ]

    # FTMOGate
    p = FTMOGateParams(
        daily_max_loss=ctx.cfg.daily_max_loss,
        total_max_loss=ctx.cfg.total_max_loss,
        spend_rate=ctx.cfg.spend_rate,
        lmax_vol_mult=ctx.cfg.lmax_vol_mult,
        ref_vol=ctx.cfg.ref_vol,
    )
    s = FTMOGateState(
        day_pnl=ctx.state.day_pnl,
        total_drawdown=ctx.state.total_drawdown,
        hourly_spent=ctx.state.hourly_spent,
        realized_vol=ctx.state.realized_vol,
    )
    gate = ftmo_gate(requested_risk, p, s)
    ctx.logs.append({"module": "FTMOGate", "out": gate.__dict__})

    candidates.append(gate.allowed_risk)
    final = min(candidates)
    freeze = gate.freeze or ctx.freeze  # si un module freeze, on freeze
    return final, freeze
