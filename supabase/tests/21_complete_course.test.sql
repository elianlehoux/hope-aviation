-- complete_course for courses without a final exam (migration 20261025120000).
-- Course B (...0002): module 1 has classes 3000...05/06 and no exam; module 2 has class
-- 3000...07 and exam 4000...03. student2 (...0005) is enrolled with no progress.
BEGIN;
SAVEPOINT clean;

DO $$
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000005');
  PERFORM tests.expect_error(
    $q$SELECT public.complete_course('10000000-0000-4000-a000-000000000002')$q$,
    'lessons_incomplete'
  );
  PERFORM tests.as_postgres();
  PERFORM tests.ok('complete_course_requires_lessons');
END $$;
ROLLBACK TO SAVEPOINT clean;

DO $$
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  PERFORM tests.expect_error(
    $q$SELECT public.complete_course('10000000-0000-4000-a000-000000000001')$q$,
    'final_exam_required'
  );
  PERFORM tests.expect_error(
    $q$SELECT public.complete_course('10000000-0000-4000-a000-000000000002')$q$,
    'not_enrolled'
  );
  PERFORM tests.as_postgres();
  PERFORM tests.ok('complete_course_rejected_when_final_configured');
END $$;
ROLLBACK TO SAVEPOINT clean;

-- Every lesson of course B done.
INSERT INTO public.lesson_progress (user_id, class_id, is_completed, completed_at)
SELECT '00000000-0000-4000-a000-000000000005', c.id, true, now()
FROM public.classes c JOIN public.subjects s ON s.id = c.subject_id
WHERE s.course_id = '10000000-0000-4000-a000-000000000002';
SAVEPOINT lessons_done;

DO $$
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000005');
  PERFORM tests.expect_error(
    $q$SELECT public.complete_course('10000000-0000-4000-a000-000000000002')$q$,
    'modules_not_passed'
  );
  PERFORM tests.as_postgres();
  PERFORM tests.ok('complete_course_requires_module_exams');
END $$;
ROLLBACK TO SAVEPOINT lessons_done;

DO $$
DECLARE
  e public.enrollments;
  e2 public.enrollments;
BEGIN
  INSERT INTO public.exam_attempts (user_id, exam_id, score, passed, started_at, finished_at)
  VALUES ('00000000-0000-4000-a000-000000000005', '40000000-0000-4000-a000-000000000003', 100, true, now(), now());

  PERFORM tests.as_user('00000000-0000-4000-a000-000000000005');
  e := public.complete_course('10000000-0000-4000-a000-000000000002');
  e2 := public.complete_course('10000000-0000-4000-a000-000000000002');
  PERFORM tests.as_postgres();
  IF e.status <> 'completed' OR e.certificate_code IS NULL OR e.completed_at IS NULL THEN
    RAISE EXCEPTION 'expected a completed enrollment with a certificate';
  END IF;
  IF e2.certificate_code IS DISTINCT FROM e.certificate_code THEN
    RAISE EXCEPTION 'expected a repeat call to return the same certificate';
  END IF;
  PERFORM tests.ok('complete_course_ok_for_course_b');
END $$;

ROLLBACK;
