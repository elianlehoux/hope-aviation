-- Follow-ups to instructor_read_all:
-- 1. Any instructor may reset attempts in any course (instructors already edit every course).
-- 2. Published courses are readable by anonymous visitors so the landing can show the catalog.

DROP POLICY IF EXISTS exam_attempts_delete_course_instructor ON public.exam_attempts;

CREATE POLICY exam_attempts_delete_instructor
  ON public.exam_attempts
  FOR DELETE
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'instructor'));

CREATE POLICY courses_select_published_anon
  ON public.courses
  FOR SELECT
  TO anon
  USING (status = 'published');
