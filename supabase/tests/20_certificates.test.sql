-- Certificate codes and public verification (migration 20261025110000).
BEGIN;
SAVEPOINT clean;

DO $$
DECLARE
  e public.enrollments;
BEGIN
  UPDATE public.enrollments SET status = 'completed'
  WHERE user_id = '00000000-0000-4000-a000-000000000003'
    AND course_id = '10000000-0000-4000-a000-000000000001'
  RETURNING * INTO e;
  IF e.certificate_code !~ '^HA-[0-9A-F]{10}$' OR e.completed_at IS NULL THEN
    RAISE EXCEPTION 'expected a certificate code and date, got % %', e.certificate_code, e.completed_at;
  END IF;
  PERFORM tests.ok('code_issued_on_completion');
END $$;
ROLLBACK TO SAVEPOINT clean;

DO $$
DECLARE
  v_first text;
  v_again text;
BEGIN
  UPDATE public.enrollments SET status = 'completed'
  WHERE user_id = '00000000-0000-4000-a000-000000000003'
    AND course_id = '10000000-0000-4000-a000-000000000001'
  RETURNING certificate_code INTO v_first;
  UPDATE public.enrollments SET status = 'active'
  WHERE user_id = '00000000-0000-4000-a000-000000000003'
    AND course_id = '10000000-0000-4000-a000-000000000001';
  UPDATE public.enrollments SET status = 'completed'
  WHERE user_id = '00000000-0000-4000-a000-000000000003'
    AND course_id = '10000000-0000-4000-a000-000000000001'
  RETURNING certificate_code INTO v_again;
  IF v_first IS DISTINCT FROM v_again THEN
    RAISE EXCEPTION 'expected a stable code, got % then %', v_first, v_again;
  END IF;
  PERFORM tests.ok('code_stable_on_repeat_update');
END $$;
ROLLBACK TO SAVEPOINT clean;

DO $$
DECLARE
  v_code text;
BEGIN
  UPDATE public.enrollments SET status = 'completed'
  WHERE user_id = '00000000-0000-4000-a000-000000000003'
    AND course_id = '10000000-0000-4000-a000-000000000001'
  RETURNING certificate_code INTO v_code;

  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  UPDATE public.enrollments SET certificate_code = 'HA-FORGED0000', completed_at = '2000-01-01'
  WHERE user_id = '00000000-0000-4000-a000-000000000003'
    AND course_id = '10000000-0000-4000-a000-000000000001';
  PERFORM tests.as_postgres();

  IF (SELECT certificate_code FROM public.enrollments
      WHERE user_id = '00000000-0000-4000-a000-000000000003'
        AND course_id = '10000000-0000-4000-a000-000000000001') IS DISTINCT FROM v_code THEN
    RAISE EXCEPTION 'learner changed the certificate code';
  END IF;
  PERFORM tests.ok('learner_cannot_edit_code');
END $$;
ROLLBACK TO SAVEPOINT clean;

DO $$
BEGIN
  PERFORM tests.as_anon();
  IF (SELECT count(*) FROM public.verify_certificate('HA-NOPE000000')) <> 0 THEN
    RAISE EXCEPTION 'expected no rows for an unknown code';
  END IF;
  PERFORM tests.as_postgres();
  PERFORM tests.ok('verify_unknown_returns_none');
END $$;
ROLLBACK TO SAVEPOINT clean;

DO $$
DECLARE
  v_code text;
  v_name text;
  v_title jsonb;
BEGIN
  UPDATE public.enrollments SET status = 'completed'
  WHERE user_id = '00000000-0000-4000-a000-000000000003'
    AND course_id = '10000000-0000-4000-a000-000000000001'
  RETURNING certificate_code INTO v_code;

  PERFORM tests.as_anon();
  SELECT v.full_name, v.course_title INTO v_name, v_title FROM public.verify_certificate(lower(v_code)) v;
  PERFORM tests.as_postgres();
  IF v_name IS DISTINCT FROM 'Sofía Estudiante' OR v_title->>'en' IS NULL THEN
    RAISE EXCEPTION 'expected the certificate holder, got % %', v_name, v_title;
  END IF;

  UPDATE public.enrollments SET status = 'active'
  WHERE user_id = '00000000-0000-4000-a000-000000000003'
    AND course_id = '10000000-0000-4000-a000-000000000001';
  IF (SELECT count(*) FROM public.verify_certificate(v_code)) <> 0 THEN
    RAISE EXCEPTION 'expected no rows once the enrollment is no longer completed';
  END IF;
  PERFORM tests.ok('verify_anon_allowed');
END $$;
ROLLBACK TO SAVEPOINT clean;

DO $$
DECLARE
  v_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
  VALUES (v_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
          'meta@hope.test', '{"first_name": "Mara", "last_name": "Pérez"}', now(), now());
  IF (SELECT last_name FROM public.profiles WHERE id = v_id) IS DISTINCT FROM 'Pérez' THEN
    RAISE EXCEPTION 'expected last_name copied from metadata';
  END IF;
  PERFORM tests.ok('signup_copies_last_name');
END $$;

ROLLBACK;
