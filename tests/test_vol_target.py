from engine.modules.vol_target import VolTargetParams, VolTargetState, vol_target_step, vol_target_update_after_trade

def test_vol_target_cap_reacts_to_high_vol():
    p = VolTargetParams(target_vol=0.01, halflife=5)
    s = VolTargetState()
    # avant d'observer, cap=1 (sigma=target)
    step0 = vol_target_step(s, p)
    assert 0.0 <= step0["cap"] <= 1.0
    # on injecte une grosse vol (ret=5%)
    vol_target_update_after_trade(s, 0.05, p)
    step1 = vol_target_step(s, p)
    assert step1["cap"] < 1.0  # le cap doit se resserrer
