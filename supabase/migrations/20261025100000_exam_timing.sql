-- Server-timed exam attempts and final exam sessions.
--
-- Before this migration an attempt only existed once it was submitted, so the time limit was
-- enforced by the browser and a reload restarted the clock. Now:
--   * start_exam_attempt opens (or resumes) an attempt and records started_at server-side;
--   * submit_exam_attempt grades and closes that open attempt (a late submit scores zero);
--   * the final exam samples its questions in SQL into final_exam_sessions, and
--     submit_final_exam grades only against that session's question set.
-- An attempt is expired when the exam has a time limit and more than limit + 2 minutes
-- (network grace) have passed since started_at.

-- ---------------------------------------------------------------------------
-- 1. At most one open module-exam attempt per learner and exam
-- ---------------------------------------------------------------------------

-- Legacy rows may contain several open attempts for the same learner and exam (the old
-- client-side flow inserted them directly). Keep the newest open one and close the rest.
WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY user_id, exam_id ORDER BY started_at DESC, id) AS rn
  FROM public.exam_attempts
  WHERE finished_at IS NULL
)
UPDATE public.exam_attempts a
SET finished_at = a.started_at,
    score = COALESCE(a.score, 0),
    passed = COALESCE(a.passed, false)
FROM ranked r
WHERE r.id = a.id AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS exam_attempts_one_open_per_user_exam
  ON public.exam_attempts (user_id, exam_id)
  WHERE finished_at IS NULL;

-- ---------------------------------------------------------------------------
-- 2. Shared helpers (not callable through the API)
-- ---------------------------------------------------------------------------

-- True when every module before the exam's module is passed by the user. A module with exams
-- is passed when each exam has a passed attempt; a module without exams is passed when every
-- class in it is completed (mirrors subjectPassed in lib/campus/module-gate.ts).
CREATE OR REPLACE FUNCTION public.exam_module_unlocked(p_user_id uuid, p_exam_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.exams e
    JOIN public.subjects s ON s.id = e.subject_id
    JOIN public.subjects ps
      ON ps.course_id = e.course_id
     AND COALESCE(ps.order_index, 0) < COALESCE(s.order_index, 0)
    WHERE e.id = p_exam_id
      AND (
        CASE
          WHEN EXISTS (SELECT 1 FROM public.exams pe WHERE pe.subject_id = ps.id) THEN
            EXISTS (
              SELECT 1 FROM public.exams pe
              WHERE pe.subject_id = ps.id
                AND NOT EXISTS (
                  SELECT 1 FROM public.exam_attempts pa
                  WHERE pa.exam_id = pe.id AND pa.user_id = p_user_id AND pa.passed IS TRUE
                )
            )
          ELSE
            EXISTS (
              SELECT 1 FROM public.classes pc
              WHERE pc.subject_id = ps.id
                AND NOT EXISTS (
                  SELECT 1 FROM public.lesson_progress lp
                  WHERE lp.class_id = pc.id AND lp.user_id = p_user_id AND lp.is_completed IS TRUE
                )
            )
        END
      )
  );
$$;

REVOKE ALL ON FUNCTION public.exam_module_unlocked(uuid, uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.exam_window_expired(p_started_at timestamptz, p_limit_minutes integer)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT p_limit_minutes IS NOT NULL
     AND now() > p_started_at + make_interval(mins => p_limit_minutes + 2);
$$;

-- ---------------------------------------------------------------------------
-- 3. Module exams: start (or resume) and submit
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.start_exam_attempt(p_exam_id uuid)
RETURNS public.exam_attempts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_exam public.exams;
  v_count bigint;
  r public.exam_attempts;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'start_exam_attempt: not authenticated';
  END IF;

  SELECT * INTO v_exam FROM public.exams WHERE id = p_exam_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'start_exam_attempt: exam_not_found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = v_uid AND course_id = v_exam.course_id AND status IN ('active', 'completed')
  ) THEN
    RAISE EXCEPTION 'start_exam_attempt: not_enrolled';
  END IF;

  IF NOT public.exam_module_unlocked(v_uid, p_exam_id) THEN
    RAISE EXCEPTION 'start_exam_attempt: module_locked';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.questions WHERE exam_id = p_exam_id) THEN
    RAISE EXCEPTION 'start_exam_attempt: no_questions';
  END IF;

  -- Serialize concurrent starts (two tabs) for this learner and exam.
  PERFORM pg_advisory_xact_lock(hashtextextended(v_uid::text || ':' || p_exam_id::text, 0));

  SELECT * INTO r
  FROM public.exam_attempts
  WHERE user_id = v_uid AND exam_id = p_exam_id AND finished_at IS NULL
  FOR UPDATE;

  IF FOUND THEN
    IF NOT public.exam_window_expired(r.started_at, v_exam.time_limit_minutes) THEN
      RETURN r;
    END IF;
    UPDATE public.exam_attempts
    SET score = 0, passed = false, finished_at = now()
    WHERE id = r.id;
  END IF;

  SELECT count(*) INTO v_count
  FROM public.exam_attempts
  WHERE exam_id = p_exam_id AND user_id = v_uid;

  IF v_count >= v_exam.max_attempts THEN
    RAISE EXCEPTION 'start_exam_attempt: max_attempts_reached';
  END IF;

  INSERT INTO public.exam_attempts (user_id, exam_id, started_at)
  VALUES (v_uid, p_exam_id, now())
  RETURNING * INTO r;

  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.start_exam_attempt(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_exam_attempt(uuid) TO authenticated;

-- Grade and close the caller's open attempt for this exam.
-- p_answers: {"<question_id>": "<option_id>", ...}. Unanswered questions score zero.
CREATE OR REPLACE FUNCTION public.submit_exam_attempt(p_exam_id uuid, p_answers jsonb)
RETURNS public.exam_attempts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_exam public.exams;
  v_total double precision := 0;
  v_earned double precision := 0;
  v_score double precision;
  r public.exam_attempts;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'submit_exam_attempt: not authenticated';
  END IF;

  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'object' THEN
    RAISE EXCEPTION 'submit_exam_attempt: invalid_answers';
  END IF;

  SELECT * INTO v_exam FROM public.exams WHERE id = p_exam_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'submit_exam_attempt: exam_not_found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = v_uid AND course_id = v_exam.course_id AND status IN ('active', 'completed')
  ) THEN
    RAISE EXCEPTION 'submit_exam_attempt: not_enrolled';
  END IF;

  -- A concurrent second submit waits here and then finds no open row.
  SELECT * INTO r
  FROM public.exam_attempts
  WHERE user_id = v_uid AND exam_id = p_exam_id AND finished_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'submit_exam_attempt: no_open_attempt';
  END IF;

  IF public.exam_window_expired(r.started_at, v_exam.time_limit_minutes) THEN
    UPDATE public.exam_attempts
    SET score = 0, passed = false, finished_at = now()
    WHERE id = r.id
    RETURNING * INTO r;
    RETURN r;
  END IF;

  IF EXISTS (
    SELECT 1 FROM jsonb_object_keys(p_answers) k
    WHERE NOT EXISTS (
      SELECT 1 FROM public.questions q WHERE q.exam_id = p_exam_id AND q.id::text = k
    )
  ) THEN
    RAISE EXCEPTION 'submit_exam_attempt: unknown_question';
  END IF;

  SELECT
    COALESCE(sum(q.points), 0),
    COALESCE(sum(q.points) FILTER (WHERE o.is_correct), 0)
  INTO v_total, v_earned
  FROM public.questions q
  LEFT JOIN public.options o
    ON o.question_id = q.id
   AND o.id::text = (p_answers ->> q.id::text)
  WHERE q.exam_id = p_exam_id;

  IF v_total = 0 THEN
    RAISE EXCEPTION 'submit_exam_attempt: no_questions';
  END IF;

  v_score := (v_earned / v_total) * 100;

  UPDATE public.exam_attempts
  SET score = v_score, passed = v_score >= v_exam.passing_score, finished_at = now()
  WHERE id = r.id
  RETURNING * INTO r;

  -- Passing a module exam gives credit for every class in that module.
  IF r.passed THEN
    INSERT INTO public.lesson_progress (user_id, class_id, is_completed, completed_at)
    SELECT v_uid, c.id, true, now()
    FROM public.classes c
    WHERE c.subject_id = v_exam.subject_id
    ON CONFLICT (user_id, class_id) DO UPDATE SET is_completed = true, completed_at = EXCLUDED.completed_at;
  END IF;

  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_exam_attempt(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_exam_attempt(uuid, jsonb) TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. Final exam sessions
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.final_exam_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  question_ids uuid[] NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  score double precision,
  passed boolean
);

COMMENT ON TABLE public.final_exam_sessions IS
  'One row per final exam sitting: the sampled question set, timing and result. Written only by start_final_exam / submit_final_exam.';

CREATE UNIQUE INDEX IF NOT EXISTS final_exam_sessions_one_open
  ON public.final_exam_sessions (user_id, course_id)
  WHERE finished_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_final_exam_sessions_course_id
  ON public.final_exam_sessions (course_id);

ALTER TABLE public.final_exam_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS final_exam_sessions_select_own ON public.final_exam_sessions;
CREATE POLICY final_exam_sessions_select_own ON public.final_exam_sessions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS final_exam_sessions_select_staff ON public.final_exam_sessions;
CREATE POLICY final_exam_sessions_select_staff ON public.final_exam_sessions
  FOR SELECT TO authenticated
  USING (
    public.has_role((SELECT auth.uid()), 'admin')
    OR public.has_role((SELECT auth.uid()), 'instructor')
  );

REVOKE ALL ON public.final_exam_sessions FROM anon;
GRANT SELECT ON public.final_exam_sessions TO authenticated;

CREATE OR REPLACE FUNCTION public.start_final_exam(p_course_id uuid)
RETURNS public.final_exam_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_course public.courses;
  v_ids uuid[];
  r public.final_exam_sessions;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'start_final_exam: not authenticated';
  END IF;

  SELECT * INTO v_course FROM public.courses WHERE id = p_course_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'start_final_exam: course_not_found';
  END IF;

  IF COALESCE(v_course.final_exam_question_count, 0) <= 0 THEN
    RAISE EXCEPTION 'start_final_exam: final_exam_not_configured';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = v_uid AND course_id = p_course_id AND status IN ('active', 'completed')
  ) THEN
    RAISE EXCEPTION 'start_final_exam: not_enrolled';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.exams e
    WHERE e.course_id = p_course_id
      AND NOT EXISTS (
        SELECT 1 FROM public.exam_attempts a
        WHERE a.exam_id = e.id AND a.user_id = v_uid AND a.passed IS TRUE
      )
  ) THEN
    RAISE EXCEPTION 'start_final_exam: modules_not_passed';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_uid::text || ':final:' || p_course_id::text, 0));

  SELECT * INTO r
  FROM public.final_exam_sessions
  WHERE user_id = v_uid AND course_id = p_course_id AND finished_at IS NULL
  FOR UPDATE;

  IF FOUND THEN
    IF NOT public.exam_window_expired(r.started_at, v_course.final_exam_time_limit_minutes) THEN
      RETURN r;
    END IF;
    UPDATE public.final_exam_sessions
    SET score = 0, passed = false, finished_at = now()
    WHERE id = r.id;
  END IF;

  -- Random sample from the course's module exam questions that have options to choose from.
  SELECT array_agg(t.id) INTO v_ids
  FROM (
    SELECT q.id
    FROM public.questions q
    JOIN public.exams e ON e.id = q.exam_id
    WHERE e.course_id = p_course_id
      AND EXISTS (SELECT 1 FROM public.options o WHERE o.question_id = q.id)
    ORDER BY random()
    LIMIT v_course.final_exam_question_count
  ) t;

  IF COALESCE(cardinality(v_ids), 0) < v_course.final_exam_question_count THEN
    RAISE EXCEPTION 'start_final_exam: not_enough_questions';
  END IF;

  INSERT INTO public.final_exam_sessions (user_id, course_id, question_ids, started_at)
  VALUES (v_uid, p_course_id, v_ids, now())
  RETURNING * INTO r;

  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.start_final_exam(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_final_exam(uuid) TO authenticated;

-- Grade the caller's open final exam session and, when passed, complete the enrollment.
CREATE OR REPLACE FUNCTION public.submit_final_exam(p_course_id uuid, p_answers jsonb)
RETURNS TABLE (score double precision, passed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_course public.courses;
  v_session public.final_exam_sessions;
  v_target integer;
  v_correct integer;
  v_score double precision;
  v_passed boolean;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'submit_final_exam: not authenticated';
  END IF;

  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'object' THEN
    RAISE EXCEPTION 'submit_final_exam: invalid_answers';
  END IF;

  SELECT * INTO v_course FROM public.courses WHERE id = p_course_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'submit_final_exam: course_not_found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = v_uid AND course_id = p_course_id AND status IN ('active', 'completed')
  ) THEN
    RAISE EXCEPTION 'submit_final_exam: not_enrolled';
  END IF;

  SELECT * INTO v_session
  FROM public.final_exam_sessions s
  WHERE s.user_id = v_uid AND s.course_id = p_course_id AND s.finished_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'submit_final_exam: no_open_attempt';
  END IF;

  IF public.exam_window_expired(v_session.started_at, v_course.final_exam_time_limit_minutes) THEN
    UPDATE public.final_exam_sessions s
    SET score = 0, passed = false, finished_at = now()
    WHERE s.id = v_session.id;
    RETURN QUERY SELECT 0::double precision, false;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM jsonb_object_keys(p_answers) k
    WHERE NOT (k = ANY (SELECT unnest(v_session.question_ids)::text))
  ) THEN
    RAISE EXCEPTION 'submit_final_exam: unknown_question';
  END IF;

  v_target := GREATEST(1, cardinality(v_session.question_ids));

  SELECT count(*) INTO v_correct
  FROM jsonb_each_text(p_answers) a
  JOIN public.options o ON o.id::text = a.value AND o.question_id::text = a.key
  WHERE o.is_correct;

  v_score := LEAST(100, (v_correct::double precision / v_target) * 100);
  v_passed := v_score >= COALESCE(v_course.final_exam_passing_score, 70);

  UPDATE public.final_exam_sessions s
  SET score = v_score, passed = v_passed, finished_at = now()
  WHERE s.id = v_session.id;

  IF v_passed THEN
    PERFORM set_config('hope.allow_completion', 'on', true);
    UPDATE public.enrollments
    SET status = 'completed'
    WHERE user_id = v_uid AND course_id = p_course_id AND status <> 'completed';
  END IF;

  RETURN QUERY SELECT v_score, v_passed;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_final_exam(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_final_exam(uuid, jsonb) TO authenticated;
