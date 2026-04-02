-- Single round-trip for nested exam routes: subject-in-course and exam-in-chain checks (RLS applies).

CREATE OR REPLACE FUNCTION public.course_subject_exam_chain_status(
  p_course_id uuid,
  p_subject_id uuid,
  p_exam_id uuid
)
RETURNS TABLE (subject_ok boolean, exam_ok boolean)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.subjects s
      WHERE s.id = p_subject_id
        AND s.course_id = p_course_id
    ),
    EXISTS (
      SELECT 1
      FROM public.exams e
      WHERE e.id = p_exam_id
        AND e.course_id = p_course_id
        AND e.subject_id = p_subject_id
    );
$$;

REVOKE ALL ON FUNCTION public.course_subject_exam_chain_status(uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.course_subject_exam_chain_status(uuid, uuid, uuid) TO authenticated;
