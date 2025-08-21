from engine.ftmo_gate import FTMOGateParams, FTMOGateState, start_day, ftmo_gate_step, ftmo_update_after_trade

def test_ftmo_daily_breach_detection():
    p = FTMOGateParams(daily_limit=0.02, total_limit=0.50, steps_per_day=2)
    s = FTMOGateState(equity_init=1.0)
    start_day(s, 1.0, p)
    # step 1
    r, _ = ftmo_gate_step(0.01, 1.0, s, p)
    ftmo_update_after_trade(s, pnl=-0.03, equity=0.97, p=p)  # -3% → daily breach
    assert s.daily_breaches == 1
