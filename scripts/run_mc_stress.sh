#!/usr/bin/env bash
set -euo pipefail

mkdir -p out

python sim/run_mc.py --profile gaussian               --n 2000 --T 1000 --seed 11 --out out/mc_gaussian.json
python sim/run_mc.py --profile student_t              --n 2000 --T 1000 --seed 12 --out out/mc_student_t.json
python sim/run_mc.py --profile student_t_jumps_ewma   --n 2000 --T 1000 --seed 13 --out out/mc_t_jumps_ewma.json

echo "Done. Files in ./out"
