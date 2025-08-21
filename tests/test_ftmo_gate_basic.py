from engine.ftmo_gate import FTMOGateParams, FTMOGateState, ftmo_gate_step, start_day

def test_ftmo_gate_step_runs():
    p = FTMOGateParams()
    s = FTMOGateState(equity_init=1.0)
    start_day(s, 1.0, p)
    risk, log = ftmo_gate_step(0.01, 1.0, s, p)
    assert 0.0 <= risk <= p.lmax
    assert log.get("gate") == "FTMO"
