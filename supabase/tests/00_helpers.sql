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

-- Put the seed learners back to their seed state (inside the caller's transaction, which
-- the test file rolls back). Other people use the local database, so tests must not depend
-- on whatever attempts or progress they left behind.
CREATE OR REPLACE FUNCTION tests.reset_learners()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_learners uuid[] := ARRAY[
    '00000000-0000-4000-a000-000000000003'::uuid,
    '00000000-0000-4000-a000-000000000005'::uuid
  ];
BEGIN
  DELETE FROM public.exam_attempts WHERE user_id = ANY (v_learners);
  DELETE FROM public.final_exam_sessions WHERE user_id = ANY (v_learners);
  DELETE FROM public.lesson_progress WHERE user_id = ANY (v_learners);
  DELETE FROM public.enrollments WHERE user_id = ANY (v_learners);
  INSERT INTO public.enrollments (user_id, course_id, status) VALUES
    ('00000000-0000-4000-a000-000000000003', '10000000-0000-4000-a000-000000000001', 'active'),
    ('00000000-0000-4000-a000-000000000005', '10000000-0000-4000-a000-000000000002', 'active');
  INSERT INTO public.lesson_progress (user_id, class_id, is_completed, completed_at)
  VALUES ('00000000-0000-4000-a000-000000000003', '30000000-0000-4000-a000-000000000001', true, now());
  UPDATE public.profiles SET first_name = 'Sofía', last_name = 'Estudiante'
  WHERE id = '00000000-0000-4000-a000-000000000003';
  UPDATE public.courses
  SET final_exam_question_count = 4, final_exam_passing_score = 70, final_exam_time_limit_minutes = 20
  WHERE id = '10000000-0000-4000-a000-000000000001';
  UPDATE public.courses SET final_exam_question_count = NULL
  WHERE id = '10000000-0000-4000-a000-000000000002';
END;
$$;
