-- Add DELETE policy for exam_attempts so that admins and course instructors can reset student attempts.

CREATE POLICY exam_attempts_delete_admin
  ON public.exam_attempts
  FOR DELETE
  TO authenticated
  USING (
    public.has_role((SELECT auth.uid()), 'admin')
  );

CREATE POLICY exam_attempts_delete_course_instructor
  ON public.exam_attempts
  FOR DELETE
  TO authenticated
  USING (
    public.has_role((SELECT auth.uid()), 'instructor')
    AND EXISTS (
      SELECT 1
      FROM public.exams ex
      WHERE ex.id = exam_attempts.exam_id
        AND public.is_course_instructor((SELECT auth.uid()), ex.course_id)
    )
  );
