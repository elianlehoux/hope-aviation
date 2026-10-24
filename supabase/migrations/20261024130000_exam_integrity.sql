-- Exam and certificate integrity.
--
-- Before this migration a signed-in student could, using only the public API:
--   * read options.is_correct for every published exam (answer leak),
--   * insert/update their own exam_attempts with passed = true,
--   * call complete_exam_attempt with a client-chosen score,
--   * call complete_course_enrollment, or update/insert their enrollment as 'completed'.
-- Any of those yields a course completion (and certificate) without passing anything.
--
-- After it: grading happens only inside SECURITY DEFINER functions that read the answer
-- key server-side; students can no longer read is_correct or write attempts/completions.

-- ---------------------------------------------------------------------------
-- 1. Answer key: options readable in full only by staff
-- ---------------------------------------------------------------------------

-- Staff keep full access through options_write_admin_or_instructor (FOR ALL).
DROP POLICY IF EXISTS options_select_via_question ON public.options;

-- Learners read options through this view (no is_correct). The view runs with its owner's
-- rights, so visibility is enforced in its WHERE clause: published courses, staff, or an
-- active/completed enrollment in the course.
DROP VIEW IF EXISTS public.options_public;
CREATE VIEW public.options_public WITH (security_barrier = true) AS
SELECT o.id, o.question_id, o.content
FROM public.options o
JOIN public.questions q ON q.id = o.question_id
JOIN public.exams e ON e.id = q.exam_id
JOIN public.courses c ON c.id = e.course_id
WHERE (SELECT auth.uid()) IS NOT NULL
  AND (
    c.status = 'published'
    OR public.has_role((SELECT auth.uid()), 'admin')
    OR public.has_role((SELECT auth.uid()), 'instructor')
    OR EXISTS (
      SELECT 1 FROM public.enrollments en
      WHERE en.course_id = c.id
        AND en.user_id = (SELECT auth.uid())
        AND en.status IN ('active', 'completed')
    )
  );

COMMENT ON VIEW public.options_public IS
  'Multiple-choice options without correctness, filtered to courses the caller can see.';

REVOKE ALL ON public.options_public FROM PUBLIC, anon;
GRANT SELECT ON public.options_public TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Attempts: no direct writes by learners
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS exam_attempts_insert_own ON public.exam_attempts;
DROP POLICY IF EXISTS exam_attempts_update_own ON public.exam_attempts;

DROP FUNCTION IF EXISTS public.complete_exam_attempt(uuid, double precision, boolean);

-- Grade a module exam server-side and record the attempt.
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
  v_subject_order integer;
  v_count bigint;
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

  SELECT * INTO v_exam FROM public.exams WHERE id = p_exam_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'submit_exam_attempt: exam_not_found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.enrollments
    WHERE user_id = v_uid AND course_id = v_exam.course_id AND status IN ('active', 'completed')
  ) THEN
    RAISE EXCEPTION 'submit_exam_attempt: not_enrolled';
  END IF;

  -- Module gate: every exam in earlier modules must already be passed.
  SELECT s.order_index INTO v_subject_order FROM public.subjects s WHERE s.id = v_exam.subject_id;
  IF EXISTS (
    SELECT 1
    FROM public.exams pe
    JOIN public.subjects ps ON ps.id = pe.subject_id
    WHERE pe.course_id = v_exam.course_id
      AND COALESCE(ps.order_index, 0) < COALESCE(v_subject_order, 0)
      AND NOT EXISTS (
        SELECT 1 FROM public.exam_attempts pa
        WHERE pa.exam_id = pe.id AND pa.user_id = v_uid AND pa.passed IS TRUE
      )
  ) THEN
    RAISE EXCEPTION 'submit_exam_attempt: module_locked';
  END IF;

  SELECT count(*) INTO v_count
  FROM public.exam_attempts
  WHERE exam_id = p_exam_id AND user_id = v_uid AND finished_at IS NOT NULL;

  IF v_count >= v_exam.max_attempts THEN
    RAISE EXCEPTION 'submit_exam_attempt: max_attempts_reached';
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

  INSERT INTO public.exam_attempts (user_id, exam_id, score, passed, finished_at)
  VALUES (v_uid, p_exam_id, v_score, v_score >= v_exam.passing_score, now())
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
-- 3. Course completion only through a graded final exam
-- ---------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.complete_course_enrollment(uuid);

-- Grade the final exam (questions drawn from the course's module exams) and, when passed,
-- mark the enrollment completed. Requires every module exam to be passed first.
CREATE OR REPLACE FUNCTION public.submit_final_exam(p_course_id uuid, p_answers jsonb)
RETURNS TABLE (score double precision, passed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_course public.courses;
  v_answered integer;
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

  IF EXISTS (
    SELECT 1 FROM public.exams e
    WHERE e.course_id = p_course_id
      AND NOT EXISTS (
        SELECT 1 FROM public.exam_attempts a
        WHERE a.exam_id = e.id AND a.user_id = v_uid AND a.passed IS TRUE
      )
  ) THEN
    RAISE EXCEPTION 'submit_final_exam: modules_not_passed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM jsonb_object_keys(p_answers) k
    WHERE NOT EXISTS (
      SELECT 1 FROM public.questions q
      JOIN public.exams e ON e.id = q.exam_id
      WHERE e.course_id = p_course_id AND q.id::text = k
    )
  ) THEN
    RAISE EXCEPTION 'submit_final_exam: unknown_question';
  END IF;

  SELECT count(*) INTO v_answered FROM jsonb_object_keys(p_answers);
  v_target := GREATEST(1, COALESCE(v_course.final_exam_question_count, v_answered));

  SELECT count(*) INTO v_correct
  FROM jsonb_each_text(p_answers) a
  JOIN public.options o ON o.id::text = a.value AND o.question_id::text = a.key
  WHERE o.is_correct;

  v_score := LEAST(100, (v_correct::double precision / v_target) * 100);
  v_passed := v_score >= COALESCE(v_course.final_exam_passing_score, 70);

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

-- ---------------------------------------------------------------------------
-- 4. Enrollments: learners can enroll (active) and cancel, never self-complete
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.enrollments_restrict_non_admin_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'active' THEN
      RAISE EXCEPTION 'enrollments: invalid_status';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.courses WHERE id = NEW.course_id AND status = 'published') THEN
      RAISE EXCEPTION 'enrollments: course_not_published';
    END IF;
    NEW.enrolled_at := now();
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.course_id IS DISTINCT FROM OLD.course_id
     OR NEW.enrolled_at IS DISTINCT FROM OLD.enrolled_at THEN
    RAISE EXCEPTION 'enrollments_update: immutable_fields';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     AND (NEW.status = 'completed' OR OLD.status = 'completed')
     AND current_setting('hope.allow_completion', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'enrollments_update: completion_requires_final_exam';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enrollments_restrict_non_admin_update ON public.enrollments;
DROP FUNCTION IF EXISTS public.enrollments_restrict_non_admin_update();

CREATE TRIGGER enrollments_restrict_non_admin_write
  BEFORE INSERT OR UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.enrollments_restrict_non_admin_write();
