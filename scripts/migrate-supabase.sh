#!/usr/bin/env bash
# Copy the Hope Aviation database (roles, schema, data incl. auth users) from one
# Supabase project to another.
#
# Usage: OLD_REF=<old project ref> NEW_DB_URL=<new session-pooler URL> scripts/migrate-supabase.sh
#   - The CLI must be logged in to the account that owns OLD_REF (dump uses the login role).
#   - NEW_DB_URL can also live in .env.migration.local (gitignored).
#   - psql runs inside the local Supabase Postgres container, so no local psql is needed.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.migration.local ]]; then
  # shellcheck disable=SC1091
  source .env.migration.local
fi

: "${OLD_REF:?Set OLD_REF (old project ref)}"
: "${NEW_DB_URL:?Set NEW_DB_URL (new project session-pooler connection string)}"
PSQL_CONTAINER="${PSQL_CONTAINER:-supabase_db_hope-aviation-dev}"

OUT="${OUT_DIR:-$(mktemp -d)}"
mkdir -p "$OUT/supabase"
cp supabase/config.toml "$OUT/supabase/"
echo "Working in $OUT"

pnpm exec supabase link --project-ref "$OLD_REF" --workdir "$OUT" </dev/null

echo "Dumping roles, schema and data from $OLD_REF..."
pnpm exec supabase db dump --linked --workdir "$OUT" --role-only -f "$OUT/roles.sql"
pnpm exec supabase db dump --linked --workdir "$OUT" -f "$OUT/schema.sql"
pnpm exec supabase db dump --linked --workdir "$OUT" --data-only --use-copy -f "$OUT/data.sql"

echo "Restoring into the new project..."
{
  cat "$OUT/roles.sql"
  cat "$OUT/schema.sql"
  echo "SET session_replication_role = replica;"
  cat "$OUT/data.sql"
} | docker exec -i "$PSQL_CONTAINER" psql --single-transaction -v ON_ERROR_STOP=1 -q "$NEW_DB_URL"

echo "Row counts in the new project:"
docker exec -i "$PSQL_CONTAINER" psql -tA "$NEW_DB_URL" <<'SQL'
select 'auth.users', count(*) from auth.users
union all select 'profiles', count(*) from public.profiles
union all select 'courses', count(*) from public.courses
union all select 'enrollments', count(*) from public.enrollments
union all select 'exam_attempts', count(*) from public.exam_attempts;
SQL
echo "Done. Dumps kept in $OUT"
