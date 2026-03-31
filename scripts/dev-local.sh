#!/usr/bin/env bash
# Start local Supabase, run Next.js dev, then stop Supabase when the dev session ends (Ctrl+C or exit).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

cleanup() {
  npx supabase stop || true
}

trap cleanup EXIT INT TERM

npx supabase start
npm run dev
