-- Instructors read learner data for every course (migration 20261025130000).
-- instructor2 (...0004) is not assigned to any course.
BEGIN;
DO $$ BEGIN PERFORM tests.reset_learners(); END $$;
SAVEPOINT clean;

DO $$
DECLARE
  v_enrollments bigint;
  v_profiles bigint;
  v_progress bigint;
BEGIN
  INSERT INTO public.exam_attempts (user_id, exam_id, score, passed, started_at, finished_at)
  VALUES ('00000000-0000-4000-a000-000000000003', '40000000-0000-4000-a000-000000000001', 50, false, now(), now());

  PERFORM tests.as_user('00000000-0000-4000-a000-000000000004');
  SELECT count(*) INTO v_enrollments FROM public.enrollments
  WHERE course_id = '10000000-0000-4000-a000-000000000001';
  SELECT count(*) INTO v_profiles FROM public.profiles WHERE id = '00000000-0000-4000-a000-000000000003';
  SELECT count(*) INTO v_progress FROM public.lesson_progress WHERE user_id = '00000000-0000-4000-a000-000000000003';
  IF v_enrollments < 1 OR v_profiles <> 1 OR v_progress < 1
     OR NOT EXISTS (SELECT 1 FROM public.exam_attempts WHERE user_id = '00000000-0000-4000-a000-000000000003') THEN
    RAISE EXCEPTION 'expected instructor2 to read course A learner data (% % %)', v_enrollments, v_profiles, v_progress;
  END IF;
  PERFORM tests.as_postgres();
  PERFORM tests.ok('unassigned_instructor_reads_enrollments');
END $$;
ROLLBACK TO SAVEPOINT clean;

DO $$
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  IF EXISTS (SELECT 1 FROM public.enrollments WHERE user_id <> '00000000-0000-4000-a000-000000000003')
     OR EXISTS (SELECT 1 FROM public.profiles WHERE id <> '00000000-0000-4000-a000-000000000003')
     OR EXISTS (SELECT 1 FROM public.lesson_progress WHERE user_id <> '00000000-0000-4000-a000-000000000003') THEN
    RAISE EXCEPTION 'a student can read another learner''s data';
  END IF;
  PERFORM tests.as_postgres();
  PERFORM tests.ok('student_cannot_read_others');
END $$;
ROLLBACK TO SAVEPOINT clean;

DO $$
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000004');
  UPDATE public.enrollments SET status = 'cancelled'
  WHERE user_id = '00000000-0000-4000-a000-000000000003'
    AND course_id = '10000000-0000-4000-a000-000000000001';
  PERFORM tests.as_postgres();
  IF (SELECT status FROM public.enrollments
      WHERE user_id = '00000000-0000-4000-a000-000000000003'
        AND course_id = '10000000-0000-4000-a000-000000000001') <> 'active' THEN
    RAISE EXCEPTION 'an unassigned instructor changed an enrollment status';
  END IF;
  PERFORM tests.ok('instructor_cannot_update_enrollment_status');
END $$;

ROLLBACK;
