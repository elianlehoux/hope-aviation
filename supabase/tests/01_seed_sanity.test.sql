BEGIN;

DO $$
BEGIN
  IF (SELECT count(*) FROM auth.users WHERE email LIKE '%@hope.test') <> 5 THEN
    RAISE EXCEPTION 'seed: expected 5 test users';
  END IF;
  IF (SELECT count(*) FROM public.courses
      WHERE id IN ('10000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000002')) <> 2 THEN
    RAISE EXCEPTION 'seed: expected 2 courses';
  END IF;
  IF (SELECT count(*) FROM public.subjects WHERE course_id = '10000000-0000-4000-a000-000000000002') <> 2 THEN
    RAISE EXCEPTION 'seed: expected course B to have 2 subjects';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = '00000000-0000-4000-a000-000000000005'
      AND course_id = '10000000-0000-4000-a000-000000000002'
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'seed: expected student2 enrolled in course B';
  END IF;
  PERFORM tests.ok('seed');
END $$;

ROLLBACK;
