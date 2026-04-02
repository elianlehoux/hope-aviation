-- Instructor SELECT on exam_attempts for exams in courses they teach.
-- Profiles: instructors can read students enrolled in courses they instruct (for submissions UI).
-- Enrollments: instructors can UPDATE rows for their courses (API limits to status).
-- Index: speeds (exam_id, user_id) filters used by attempt history and max_attempts counting.

-- ---------------------------------------------------------------------------
-- exam_attempts: instructors read attempts for exams in assigned courses
-- ---------------------------------------------------------------------------
CREATE POLICY exam_attempts_select_course_instructor
  ON public.exam_attempts
  FOR SELECT
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

-- ---------------------------------------------------------------------------
-- profiles: instructors read profiles of users enrolled in courses they teach
-- ---------------------------------------------------------------------------
CREATE POLICY profiles_select_enrolled_in_my_courses
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    public.has_role((SELECT auth.uid()), 'instructor')
    AND EXISTS (
      SELECT 1
      FROM public.enrollments e
      WHERE e.user_id = profiles.id
        AND public.is_course_instructor((SELECT auth.uid()), e.course_id)
    )
  );

-- ---------------------------------------------------------------------------
-- enrollments: instructors update enrollments for assigned courses
-- (column-level restriction is not available in RLS; API must only PATCH status.)
-- ---------------------------------------------------------------------------
CREATE POLICY enrollments_update_course_instructor
  ON public.enrollments
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role((SELECT auth.uid()), 'instructor')
    AND public.is_course_instructor((SELECT auth.uid()), enrollments.course_id)
  )
  WITH CHECK (
    public.has_role((SELECT auth.uid()), 'instructor')
    AND public.is_course_instructor((SELECT auth.uid()), enrollments.course_id)
  );

-- ---------------------------------------------------------------------------
-- Performance: composite key matches filters on exam_id + user_id (history, counts).
-- Note: application still has a race on max_attempts (two concurrent POSTs can both
-- pass the count check); resolving that needs a transactional lock or SECURITY DEFINER RPC.
-- ---------------------------------------------------------------------------
CREATE INDEX idx_exam_attempts_exam_id_user_id
  ON public.exam_attempts (exam_id, user_id);
