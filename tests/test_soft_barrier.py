from engine.modules.soft_barrier import SoftBarrierParams, soft_barrier_step

def test_soft_barrier_monotone():
    p = SoftBarrierParams(levels=[(0.0,1.0),(0.1,0.5),(0.2,0.0)])
    hwm = 1.0
    m0 = soft_barrier_step(1.00, hwm, p)["mult"]  # dd 0%
    m1 = soft_barrier_step(0.90, hwm, p)["mult"]  # dd 10%
    m2 = soft_barrier_step(0.80, hwm, p)["mult"]  # dd 20%
    assert 1.0 >= m0 >= m1 >= m2 >= 0.0
