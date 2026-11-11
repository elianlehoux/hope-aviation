-- Completing a course that has no final exam.
--
-- Until now an enrollment could only become 'completed' by passing the final exam. Courses
-- without one (final_exam_question_count NULL or 0) are completed through complete_course,
-- which checks that every lesson is done and every module exam is passed.

CREATE OR REPLACE FUNCTION public.complete_course(p_course_id uuid)
RETURNS public.enrollments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_course public.courses;
  r public.enrollments;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'complete_course: not authenticated';
  END IF;

  SELECT * INTO v_course FROM public.courses WHERE id = p_course_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'complete_course: course_not_found';
  END IF;

  SELECT * INTO r
  FROM public.enrollments
  WHERE user_id = v_uid AND course_id = p_course_id
  FOR UPDATE;

  IF NOT FOUND OR r.status NOT IN ('active', 'completed') THEN
    RAISE EXCEPTION 'complete_course: not_enrolled';
  END IF;

  -- Idempotent: a second call (double click) returns the completed row.
  IF r.status = 'completed' THEN
    RETURN r;
  END IF;

  IF COALESCE(v_course.final_exam_question_count, 0) > 0 THEN
    RAISE EXCEPTION 'complete_course: final_exam_required';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.classes cl
    JOIN public.subjects s ON s.id = cl.subject_id
    WHERE s.course_id = p_course_id
      AND NOT EXISTS (
        SELECT 1 FROM public.lesson_progress lp
        WHERE lp.class_id = cl.id AND lp.user_id = v_uid AND lp.is_completed IS TRUE
      )
  ) THEN
    RAISE EXCEPTION 'complete_course: lessons_incomplete';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.exams e
    WHERE e.course_id = p_course_id
      AND NOT EXISTS (
        SELECT 1 FROM public.exam_attempts a
        WHERE a.exam_id = e.id AND a.user_id = v_uid AND a.passed IS TRUE
      )
  ) THEN
    RAISE EXCEPTION 'complete_course: modules_not_passed';
  END IF;

  PERFORM set_config('hope.allow_completion', 'on', true);

  UPDATE public.enrollments
  SET status = 'completed'
  WHERE id = r.id
  RETURNING * INTO r;

  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_course(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_course(uuid) TO authenticated;
