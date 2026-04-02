-- Course ↔ instructor assignments and RLS so assigned instructors can read
-- enrollments and lesson_progress for those courses (no RLS recursion on reads).

CREATE TABLE public.course_instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_id)
);

CREATE INDEX idx_course_instructors_course_id ON public.course_instructors (course_id);
CREATE INDEX idx_course_instructors_user_id ON public.course_instructors (user_id);

-- SECURITY DEFINER: avoids self-referential RLS on course_instructors in policies.
CREATE OR REPLACE FUNCTION public.is_course_instructor(p_user_id uuid, p_course_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.course_instructors ci
    WHERE ci.course_id = p_course_id
      AND ci.user_id = p_user_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_course_instructor(uuid, uuid) TO authenticated;

ALTER TABLE public.course_instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY course_instructors_select_admin
  ON public.course_instructors
  FOR SELECT
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY course_instructors_select_assigned_instructor
  ON public.course_instructors
  FOR SELECT
  TO authenticated
  USING (
    public.has_role((SELECT auth.uid()), 'instructor')
    AND public.is_course_instructor((SELECT auth.uid()), course_instructors.course_id)
  );

CREATE POLICY course_instructors_insert_admin
  ON public.course_instructors
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY course_instructors_delete_admin
  ON public.course_instructors
  FOR DELETE
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- Instructors assigned to the course can list all enrollments for that course.
CREATE POLICY enrollments_select_course_instructor
  ON public.enrollments
  FOR SELECT
  TO authenticated
  USING (
    public.has_role((SELECT auth.uid()), 'instructor')
    AND public.is_course_instructor((SELECT auth.uid()), enrollments.course_id)
  );

-- Instructors can read student lesson progress for classes in courses they teach.
CREATE POLICY lesson_progress_select_course_instructor
  ON public.lesson_progress
  FOR SELECT
  TO authenticated
  USING (
    public.has_role((SELECT auth.uid()), 'instructor')
    AND EXISTS (
      SELECT 1
      FROM public.classes cl
      JOIN public.subjects s ON s.id = cl.subject_id
      WHERE cl.id = lesson_progress.class_id
        AND public.is_course_instructor((SELECT auth.uid()), s.course_id)
    )
  );
