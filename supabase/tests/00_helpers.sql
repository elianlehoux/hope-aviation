-- Test helpers for supabase/tests/*.test.sql (local database only).
-- Loaded by scripts/db-test.sh before every run; safe to re-run.

CREATE SCHEMA IF NOT EXISTS tests;
GRANT USAGE ON SCHEMA tests TO authenticated, anon;

-- Impersonate a signed-in user for the rest of the current transaction.
CREATE OR REPLACE FUNCTION tests.as_user(p_uid uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object('sub', p_uid, 'role', 'authenticated')::text,
    true
  );
  SET LOCAL ROLE authenticated;
END;
$$;

-- Impersonate an anonymous (signed-out) caller.
CREATE OR REPLACE FUNCTION tests.as_anon()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  SET LOCAL ROLE anon;
END;
$$;

-- Back to the superuser.
CREATE OR REPLACE FUNCTION tests.as_postgres()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  RESET ROLE;
  PERFORM set_config('request.jwt.claims', '', true);
END;
$$;

-- Run p_sql and require it to fail with an error whose message contains p_fragment.
CREATE OR REPLACE FUNCTION tests.expect_error(p_sql text, p_fragment text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  BEGIN
    EXECUTE p_sql;
  EXCEPTION WHEN OTHERS THEN
    IF position(p_fragment IN SQLERRM) > 0 THEN
      RETURN;
    END IF;
    RAISE EXCEPTION 'expected error % but got: %', p_fragment, SQLERRM;
  END;
  RAISE EXCEPTION 'expected error % not raised', p_fragment;
END;
$$;

CREATE OR REPLACE FUNCTION tests.ok(p_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE NOTICE 'ok - %', p_name;
END;
$$;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA tests TO authenticated, anon;
