#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SKIP_ENV_BOOTSTRAP=0
SKIP_WAIT=0

for arg in "$@"; do
  case "$arg" in
    --skip-env-bootstrap) SKIP_ENV_BOOTSTRAP=1 ;;
    --skip-wait)          SKIP_WAIT=1 ;;
  esac
done

step() { echo ""; echo "==> $1"; }

ensure_file() {
  local src="$1" dst="$2"
  if [ ! -f "$dst" ]; then
    cp "$src" "$dst"
    echo "Created $dst from example."
  fi
}

wait_port() {
  local port="$1" timeout="${2:-60}" elapsed=0
  until nc -z 127.0.0.1 "$port" 2>/dev/null; do
    sleep 1
    elapsed=$((elapsed + 1))
    [ "$elapsed" -ge "$timeout" ] && echo "Timed out waiting for port $port." && exit 1
  done
}

wait_http() {
  local url="$1" timeout="${2:-90}" elapsed=0
  until curl -sf --max-time 5 "$url" > /dev/null 2>&1; do
    sleep 2
    elapsed=$((elapsed + 2))
    [ "$elapsed" -ge "$timeout" ] && echo "Timed out waiting for $url." && exit 1
  done
}

if ! command -v docker &> /dev/null; then
  echo "Docker is required but was not found on PATH." && exit 1
fi

cd "$ROOT"

if [ "$SKIP_ENV_BOOTSTRAP" -eq 0 ]; then
  step "Ensuring local environment files exist"
  ensure_file "$ROOT/.env.example"              "$ROOT/.env"
  ensure_file "$ROOT/apps/api/.env.example"     "$ROOT/apps/api/.env"
  ensure_file "$ROOT/apps/web/.env.local.example" "$ROOT/apps/web/.env.local"
fi

step "Building and starting the full EventGrid stack with Docker Compose"
docker compose up -d --build

if [ "$SKIP_WAIT" -eq 0 ]; then
  step "Waiting for EventGrid services"
  wait_port 5432 60
  wait_port 6379 60
  wait_port 8000 120
  wait_port 4000 120
  wait_port 3000 120
  wait_http "http://localhost:8000/health" 90
  wait_http "http://localhost:4000/health" 120
  wait_http "http://localhost:3000/health" 120
fi

step "EventGrid deployment complete"
echo "Web:         http://localhost:3000"
echo "API:         http://localhost:4000/api"
echo "API health:  http://localhost:4000/health"
echo "AI health:   http://localhost:8000/health"
echo "MinIO console: http://localhost:9001"
echo ""
echo "Demo sign-in:"
echo "  admin@eventgrid.dev / any password"
echo "  sales@eventgrid.dev / any password"
