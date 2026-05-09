#!/usr/bin/env bash
# Start the stack for local review: backend (Docker if possible) + Next.js dev server.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

start_backend() {
  if [[ -f .env ]] && command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    docker compose up -d backend
    echo "Waiting for http://localhost:8000/health …"
    for _ in $(seq 1 60); do
      if curl -sf "http://localhost:8000/health" >/dev/null; then
        echo "Backend is healthy."
        return 0
      fi
      sleep 0.5
    done
    echo "Backend did not become healthy in time. Check: docker compose logs backend"
    return 1
  fi

  if curl -sf "http://localhost:8000/health" >/dev/null; then
    echo "Using existing backend on http://localhost:8000"
    return 0
  fi

  echo "Backend is not running on :8000."
  echo "  • Docker: add API keys to repo-root .env (see README), then: docker compose up -d backend"
  echo "  • Local uv: cd backend && uv sync && uv run uvicorn src.main:app --reload --port 8000"
  return 1
}

start_backend || true

cd frontend
if [[ ! -d node_modules ]]; then
  npm install
fi
exec npm run dev
