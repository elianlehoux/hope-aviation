-- Atomic finished exam attempt: lock exam row, enforce max_attempts, insert one row.
-- Replaces the prior app-level count+insert race (two concurrent POSTs could exceed max_attempts).
-- Scoring stays in the app; this only serializes limit + insert for auth.uid().

CREATE OR REPLACE FUNCTION public.complete_exam_attempt(
  p_exam_id uuid,
  p_score double precision,
  p_passed boolean
)
RETURNS public.exam_attempts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_max integer;
  v_count bigint;
  r public.exam_attempts;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'complete_exam_attempt: not authenticated';
  END IF;

  SELECT e.max_attempts
  INTO v_max
  FROM public.exams e
  WHERE e.id = p_exam_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'complete_exam_attempt: exam_not_found';
  END IF;

  SELECT count(*)::bigint
  INTO v_count
  FROM public.exam_attempts ea
  WHERE ea.exam_id = p_exam_id
    AND ea.user_id = v_uid
    AND ea.finished_at IS NOT NULL;

  IF v_count >= v_max THEN
    RAISE EXCEPTION 'complete_exam_attempt: max_attempts_reached';
  END IF;

  INSERT INTO public.exam_attempts (
    user_id,
    exam_id,
    score,
    passed,
    finished_at
  )
  VALUES (
    v_uid,
    p_exam_id,
    p_score,
    p_passed,
    now()
  )
  RETURNING * INTO r;

  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_exam_attempt(uuid, double precision, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_exam_attempt(uuid, double precision, boolean) TO authenticated;
