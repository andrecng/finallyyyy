#!/usr/bin/env bash
set -euo pipefail

# Backend
(cd backend && [ -d .venv ] || python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && uvicorn app:app --port 8001) &

# Frontend
npm run dev -- -p 3003
