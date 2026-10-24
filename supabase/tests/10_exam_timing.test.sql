-- Server-timed module exam attempts and final exam sessions (migration 20261025100000).
-- Seed ids: student ...0003 (course A), student2 ...0005 (course B), exams 4000...01/02 (A), 4000...03 (B).
BEGIN;
SAVEPOINT clean;

DO $$
DECLARE
  r public.exam_attempts;
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  r := public.start_exam_attempt('40000000-0000-4000-a000-000000000001');
  PERFORM tests.as_postgres();
  IF r.id IS NULL OR r.finished_at IS NOT NULL THEN
    RAISE EXCEPTION 'expected an open attempt';
  END IF;
  IF (SELECT count(*) FROM public.exam_attempts
      WHERE user_id = '00000000-0000-4000-a000-000000000003'
        AND exam_id = '40000000-0000-4000-a000-000000000001' AND finished_at IS NULL) <> 1 THEN
    RAISE EXCEPTION 'expected exactly one open attempt';
  END IF;
  PERFORM tests.ok('start_creates_open_attempt');
END $$;
ROLLBACK TO SAVEPOINT clean;

DO $$
DECLARE
  a public.exam_attempts;
  b public.exam_attempts;
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  a := public.start_exam_attempt('40000000-0000-4000-a000-000000000001');
  b := public.start_exam_attempt('40000000-0000-4000-a000-000000000001');
  PERFORM tests.as_postgres();
  IF a.id <> b.id OR a.started_at <> b.started_at THEN
    RAISE EXCEPTION 'expected the same open attempt on resume';
  END IF;
  PERFORM tests.ok('resume_returns_open_attempt');
END $$;
ROLLBACK TO SAVEPOINT clean;

DO $$
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  PERFORM tests.expect_error(
    $q$SELECT public.submit_exam_attempt('40000000-0000-4000-a000-000000000001', '{}'::jsonb)$q$,
    'no_open_attempt'
  );
  PERFORM tests.as_postgres();
  PERFORM tests.ok('submit_without_start_rejected');
END $$;
ROLLBACK TO SAVEPOINT clean;

DO $$
DECLARE
  v_answers jsonb;
  r public.exam_attempts;
BEGIN
  SELECT jsonb_object_agg(q.id, o.id) INTO v_answers
  FROM public.questions q JOIN public.options o ON o.question_id = q.id AND o.is_correct
  WHERE q.exam_id = '40000000-0000-4000-a000-000000000001';

  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  PERFORM public.start_exam_attempt('40000000-0000-4000-a000-000000000001');
  r := public.submit_exam_attempt('40000000-0000-4000-a000-000000000001', v_answers);
  IF r.score <> 100 OR r.passed IS NOT TRUE OR r.finished_at IS NULL THEN
    RAISE EXCEPTION 'expected a graded, passed attempt (got % %)', r.score, r.passed;
  END IF;
  PERFORM tests.expect_error(
    format('SELECT public.submit_exam_attempt(%L, %L::jsonb)', '40000000-0000-4000-a000-000000000001', v_answers),
    'no_open_attempt'
  );
  PERFORM tests.as_postgres();
  IF (SELECT count(*) FROM public.exam_attempts
      WHERE user_id = '00000000-0000-4000-a000-000000000003'
        AND exam_id = '40000000-0000-4000-a000-000000000001') <> 1 THEN
    RAISE EXCEPTION 'expected exactly one attempt row';
  END IF;
  PERFORM tests.ok('submit_twice_rejected');
END $$;
ROLLBACK TO SAVEPOINT clean;

DO $$
DECLARE
  v_answers jsonb;
  r public.exam_attempts;
BEGIN
  -- Module 1 of course B has no exam: completing its classes unlocks module 2.
  INSERT INTO public.lesson_progress (user_id, class_id, is_completed, completed_at)
  SELECT '00000000-0000-4000-a000-000000000005', c.id, true, now()
  FROM public.classes c WHERE c.subject_id = '20000000-0000-4000-a000-000000000003';

  SELECT jsonb_object_agg(q.id, o.id) INTO v_answers
  FROM public.questions q JOIN public.options o ON o.question_id = q.id AND o.is_correct
  WHERE q.exam_id = '40000000-0000-4000-a000-000000000003';

  PERFORM tests.as_user('00000000-0000-4000-a000-000000000005');
  PERFORM public.start_exam_attempt('40000000-0000-4000-a000-000000000003');
  PERFORM tests.as_postgres();

  UPDATE public.exam_attempts SET started_at = now() - interval '10 minutes'
  WHERE user_id = '00000000-0000-4000-a000-000000000005'
    AND exam_id = '40000000-0000-4000-a000-000000000003' AND finished_at IS NULL;

  PERFORM tests.as_user('00000000-0000-4000-a000-000000000005');
  r := public.submit_exam_attempt('40000000-0000-4000-a000-000000000003', v_answers);
  PERFORM tests.as_postgres();
  IF r.score <> 0 OR r.passed IS NOT FALSE OR r.finished_at IS NULL THEN
    RAISE EXCEPTION 'expected a late submit to score 0 (got % %)', r.score, r.passed;
  END IF;
  PERFORM tests.ok('expired_attempt_scores_zero');
END $$;
ROLLBACK TO SAVEPOINT clean;

DO $$
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000005');
  PERFORM tests.expect_error(
    $q$SELECT public.start_exam_attempt('40000000-0000-4000-a000-000000000003')$q$,
    'module_locked'
  );
  PERFORM tests.as_postgres();
  PERFORM tests.ok('module_without_exam_gates_on_lessons');
END $$;
ROLLBACK TO SAVEPOINT clean;

DO $$
DECLARE
  i integer;
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  FOR i IN 1..3 LOOP
    PERFORM public.start_exam_attempt('40000000-0000-4000-a000-000000000001');
    PERFORM public.submit_exam_attempt('40000000-0000-4000-a000-000000000001', '{}'::jsonb);
  END LOOP;
  PERFORM tests.expect_error(
    $q$SELECT public.start_exam_attempt('40000000-0000-4000-a000-000000000001')$q$,
    'max_attempts_reached'
  );
  PERFORM tests.as_postgres();
  PERFORM tests.ok('max_attempts_enforced');
END $$;
ROLLBACK TO SAVEPOINT clean;

DO $$
BEGIN
  -- An exam without questions cannot be started.
  INSERT INTO public.exams (id, course_id, subject_id, title, passing_score, max_attempts, order_index)
  VALUES ('4fffffff-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001',
          '20000000-0000-4000-a000-000000000001', '{"es": "Vacío"}', 70, 3, 5);
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  PERFORM tests.expect_error(
    $q$SELECT public.start_exam_attempt('4fffffff-0000-4000-a000-000000000001')$q$,
    'no_questions'
  );
  PERFORM tests.as_postgres();
  PERFORM tests.ok('start_without_questions_rejected');
END $$;
ROLLBACK TO SAVEPOINT clean;

-- Final exam cases: as postgres, give the student passed attempts on both module exams.
INSERT INTO public.exam_attempts (user_id, exam_id, score, passed, started_at, finished_at)
VALUES
  ('00000000-0000-4000-a000-000000000003', '40000000-0000-4000-a000-000000000001', 100, true, now(), now()),
  ('00000000-0000-4000-a000-000000000003', '40000000-0000-4000-a000-000000000002', 100, true, now(), now());
UPDATE public.courses SET final_exam_question_count = 3 WHERE id = '10000000-0000-4000-a000-000000000001';
SAVEPOINT final_ready;

DO $$
DECLARE
  s public.final_exam_sessions;
  s2 public.final_exam_sessions;
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  s := public.start_final_exam('10000000-0000-4000-a000-000000000001');
  s2 := public.start_final_exam('10000000-0000-4000-a000-000000000001');
  PERFORM tests.as_postgres();
  IF cardinality(s.question_ids) <> 3 THEN
    RAISE EXCEPTION 'expected 3 sampled questions, got %', cardinality(s.question_ids);
  END IF;
  IF s.id <> s2.id THEN
    RAISE EXCEPTION 'expected the open session to be resumed';
  END IF;
  PERFORM tests.ok('final_session_samples_n_questions');
END $$;
ROLLBACK TO SAVEPOINT final_ready;

DO $$
DECLARE
  s public.final_exam_sessions;
  v_outside uuid;
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  s := public.start_final_exam('10000000-0000-4000-a000-000000000001');
  PERFORM tests.as_postgres();
  SELECT q.id INTO v_outside
  FROM public.questions q JOIN public.exams e ON e.id = q.exam_id
  WHERE e.course_id = '10000000-0000-4000-a000-000000000001' AND NOT (q.id = ANY (s.question_ids))
  LIMIT 1;
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  PERFORM tests.expect_error(
    format('SELECT * FROM public.submit_final_exam(%L, %L::jsonb)',
      '10000000-0000-4000-a000-000000000001',
      jsonb_build_object(v_outside, gen_random_uuid())),
    'unknown_question'
  );
  PERFORM tests.as_postgres();
  PERFORM tests.ok('final_unknown_question_rejected');
END $$;
ROLLBACK TO SAVEPOINT final_ready;

DO $$
DECLARE
  s public.final_exam_sessions;
  v_answers jsonb;
  v_score double precision;
  v_passed boolean;
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  s := public.start_final_exam('10000000-0000-4000-a000-000000000001');
  PERFORM tests.as_postgres();
  SELECT jsonb_object_agg(o.question_id, o.id) INTO v_answers
  FROM public.options o WHERE o.is_correct AND o.question_id = ANY (s.question_ids);

  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  SELECT f.score, f.passed INTO v_score, v_passed
  FROM public.submit_final_exam('10000000-0000-4000-a000-000000000001', v_answers) f;
  PERFORM tests.expect_error(
    format('SELECT * FROM public.submit_final_exam(%L, %L::jsonb)', '10000000-0000-4000-a000-000000000001', v_answers),
    'no_open_attempt'
  );
  PERFORM tests.as_postgres();
  IF v_score <> 100 OR v_passed IS NOT TRUE THEN
    RAISE EXCEPTION 'expected a passed final (got % %)', v_score, v_passed;
  END IF;
  IF (SELECT status FROM public.enrollments
      WHERE user_id = '00000000-0000-4000-a000-000000000003'
        AND course_id = '10000000-0000-4000-a000-000000000001') <> 'completed' THEN
    RAISE EXCEPTION 'expected the enrollment to be completed';
  END IF;
  IF (SELECT finished_at FROM public.final_exam_sessions WHERE id = s.id) IS NULL THEN
    RAISE EXCEPTION 'expected the session to be closed';
  END IF;
  PERFORM tests.ok('final_pass_completes_enrollment');
END $$;
ROLLBACK TO SAVEPOINT final_ready;

DO $$
DECLARE
  s public.final_exam_sessions;
  v_score double precision;
  v_passed boolean;
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  PERFORM public.start_final_exam('10000000-0000-4000-a000-000000000001');
  PERFORM tests.as_postgres();
  UPDATE public.final_exam_sessions SET started_at = now() - interval '1 hour'
  WHERE user_id = '00000000-0000-4000-a000-000000000003' AND finished_at IS NULL;
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  SELECT f.score, f.passed INTO v_score, v_passed
  FROM public.submit_final_exam('10000000-0000-4000-a000-000000000001', '{}'::jsonb) f;
  PERFORM tests.as_postgres();
  IF v_score <> 0 OR v_passed IS NOT FALSE THEN
    RAISE EXCEPTION 'expected an expired final to score 0';
  END IF;
  PERFORM tests.ok('final_expired_scores_zero');
END $$;
ROLLBACK TO SAVEPOINT final_ready;

DO $$
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000005');
  PERFORM tests.expect_error(
    $q$SELECT public.start_final_exam('10000000-0000-4000-a000-000000000002')$q$,
    'final_exam_not_configured'
  );
  PERFORM tests.as_postgres();
  PERFORM tests.ok('final_not_configured_rejected');
END $$;
ROLLBACK TO SAVEPOINT final_ready;

DO $$
BEGIN
  PERFORM tests.as_user('00000000-0000-4000-a000-000000000003');
  PERFORM tests.expect_error(
    $q$INSERT INTO public.final_exam_sessions (user_id, course_id, question_ids)
       VALUES ('00000000-0000-4000-a000-000000000003', '10000000-0000-4000-a000-000000000001', '{}')$q$,
    'row-level security'
  );
  PERFORM tests.as_postgres();
  PERFORM tests.ok('learner_cannot_insert_session');
END $$;

ROLLBACK;
