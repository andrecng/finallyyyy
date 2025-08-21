from typing import Dict, Any, List, Tuple

def _parse_ranges_from_strings(items: List[str]) -> List[Tuple[int, int]]:
    ranges: List[Tuple[int, int]] = []
    for s in items:
        s = str(s).strip()
        if not s:
            continue
        # format "a-b" ou "k"
        for part in s.split(","):
            part = part.strip()
            if "-" in part:
                a, b = part.split("-", 1)
                try:
                    start = int(a)
                    end = int(b)
                    if end < start:
                        start, end = end, start
                    ranges.append((start, end))
                except ValueError:
                    continue
            else:
                try:
                    k = int(part)
                    ranges.append((k, k + 1))
                except ValueError:
                    continue
    return ranges

def get_blackout_steps(gating: Dict[str, Any]) -> List[Tuple[int, int]]:
    """Retourne des intervalles [start, end) en indices t."""
    ranges: List[Tuple[int, int]] = []
    steps = gating.get("news_blackouts_steps")
    if isinstance(steps, list):
        for it in steps:
            if isinstance(it, (list, tuple)) and len(it) == 2:
                a, b = int(it[0]), int(it[1])
                if b < a:
                    a, b = b, a
                ranges.append((a, b))
    # Support legacy strings: "10-12, 20, 30-35"
    legacy = gating.get("news_blackouts")
    if isinstance(legacy, list) and legacy:
        ranges += _parse_ranges_from_strings([str(x) for x in legacy if x is not None])
    return ranges

def is_blackout(t: int, gating: Dict[str, Any]) -> bool:
    for a, b in get_blackout_steps(gating):
        if a <= t < b:
            return True
    return False

def in_session(t: int, gating: Dict[str, Any]) -> bool:
    """
    session_mask: { day_len: int, allow: [[start, end], ...] } en pas "t".
    Si non fourni → True (pas de restriction).
    """
    sm = gating.get("session_mask")
    if not isinstance(sm, dict):
        return True
    day_len = int(sm.get("day_len", 0))
    allow = sm.get("allow", [])
    if day_len <= 0 or not isinstance(allow, list) or not allow:
        return True
    t_mod = t % day_len
    for rng in allow:
        if isinstance(rng, (list, tuple)) and len(rng) == 2:
            a, b = int(rng[0]), int(rng[1])
            if a <= t_mod < b:
                return True
    return False

def apply_gating_caps(risk: float, gating: Dict[str, Any]) -> float:
    cap = gating.get("risk_cap")
    if cap is None:
        return risk
    try:
        c = float(cap)
    except Exception:
        return risk
    return min(risk, max(0.0, c))
