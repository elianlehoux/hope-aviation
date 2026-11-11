#!/usr/bin/env bash
# Run the SQL test suite against the LOCAL Supabase database (never production).
# Loads supabase/tests/00_helpers.sql, then every *.test.sql in name order.
# Each test file wraps itself in BEGIN; ... ROLLBACK; so the database is left unchanged.
set -euo pipefail

CONTAINER="${SUPABASE_DB_CONTAINER:-supabase_db_hope-aviation-dev}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TEST_DIR="$ROOT/supabase/tests"

psql_run() {
  docker exec -i "$CONTAINER" psql -U postgres -v ON_ERROR_STOP=1 -q "$@"
}

echo "# helpers"
psql_run < "$TEST_DIR/00_helpers.sql"

status=0
for file in "$TEST_DIR"/*.test.sql; do
  echo "# $(basename "$file")"
  if ! psql_run < "$file" 2>&1 | sed -e 's/^psql:[^ ]* NOTICE:  /  /' -e 's/^NOTICE:  /  /'; then
    echo "not ok - $(basename "$file")"
    status=1
    break
  fi
done

exit $status
