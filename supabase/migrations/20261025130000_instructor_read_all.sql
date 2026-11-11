-- Instructors read learner data for every course.
--
-- Product decision: any instructor can read and edit any course, so the per-course read
-- policies (based on course_instructors) are replaced by role-based ones. Write policies
-- are unchanged: account controls stay admin-only and enrollment updates by instructors
-- still require a course assignment.

DROP POLICY IF EXISTS enrollments_select_course_instructor ON public.enrollments;
DROP POLICY IF EXISTS enrollments_select_instructor ON public.enrollments;
CREATE POLICY enrollments_select_instructor ON public.enrollments
  FOR SELECT TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'instructor'));

DROP POLICY IF EXISTS lesson_progress_select_course_instructor ON public.lesson_progress;
DROP POLICY IF EXISTS lesson_progress_select_instructor ON public.lesson_progress;
CREATE POLICY lesson_progress_select_instructor ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'instructor'));

DROP POLICY IF EXISTS exam_attempts_select_course_instructor ON public.exam_attempts;
DROP POLICY IF EXISTS exam_attempts_select_instructor ON public.exam_attempts;
CREATE POLICY exam_attempts_select_instructor ON public.exam_attempts
  FOR SELECT TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'instructor'));

DROP POLICY IF EXISTS profiles_select_enrolled_in_my_courses ON public.profiles;
DROP POLICY IF EXISTS profiles_select_instructor ON public.profiles;
CREATE POLICY profiles_select_instructor ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'instructor'));
