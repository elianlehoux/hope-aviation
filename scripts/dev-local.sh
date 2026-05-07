#!/usr/bin/env bash
# Start local Supabase, run Next.js dev, then stop Supabase when the dev session ends (Ctrl+C or exit).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

cleanup() {
  echo "Stopping Supabase..."
  pnpm exec supabase stop || true
}

trap cleanup EXIT INT TERM

echo "Starting Supabase..."
pnpm exec supabase start
echo "Starting Next.js..."
pnpm dev
