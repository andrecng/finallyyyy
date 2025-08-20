import json
import os

def load_profile(name: str, path="presets/profiles.json"):
    with open(path, "r") as f:
        profiles = json.load(f)
    if name not in profiles:
        raise ValueError(f"Unknown profile '{name}'. Available={list(profiles.keys())}")
    return profiles[name]
