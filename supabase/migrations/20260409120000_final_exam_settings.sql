-- Add final exam configurability to courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS final_exam_question_count integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS final_exam_passing_score double precision DEFAULT 70.0,
  ADD COLUMN IF NOT EXISTS final_exam_time_limit_minutes integer DEFAULT NULL;

-- Security Definer RPC to mark course enrollment as 'completed'
CREATE OR REPLACE FUNCTION public.complete_course_enrollment(p_course_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.enrollments
  SET status = 'completed'
  WHERE user_id = auth.uid() AND course_id = p_course_id;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_course_enrollment(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_course_enrollment(uuid) TO authenticated;

-- Update RLS policies so completed enrollments don't lose read access
DROP POLICY IF EXISTS subjects_select_staff_or_published_course ON public.subjects;
CREATE POLICY subjects_select_staff_or_published_course ON public.subjects FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = subjects.course_id AND (c.status = 'published' OR public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor')))
    OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = subjects.course_id AND e.user_id = (SELECT auth.uid()) AND e.status IN ('active', 'completed'))
);

DROP POLICY IF EXISTS classes_select_visible ON public.classes;
CREATE POLICY classes_select_visible ON public.classes FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.subjects s JOIN public.courses c ON c.id = s.course_id WHERE s.id = classes.subject_id AND (c.status = 'published' OR public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor')))
    OR EXISTS (SELECT 1 FROM public.subjects s JOIN public.enrollments e ON e.course_id = s.course_id WHERE s.id = classes.subject_id AND e.user_id = (SELECT auth.uid()) AND e.status IN ('active', 'completed'))
);

DROP POLICY IF EXISTS exams_select_visible ON public.exams;
CREATE POLICY exams_select_visible ON public.exams FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = exams.course_id AND (c.status = 'published' OR public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor')))
    OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = exams.course_id AND e.user_id = (SELECT auth.uid()) AND e.status IN ('active', 'completed'))
);

DROP POLICY IF EXISTS questions_select_via_exam ON public.questions;
CREATE POLICY questions_select_via_exam ON public.questions FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.exams e WHERE e.id = questions.exam_id AND (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = e.course_id AND (c.status = 'published' OR public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor'))) OR EXISTS (SELECT 1 FROM public.enrollments en WHERE en.course_id = e.course_id AND en.user_id = (SELECT auth.uid()) AND en.status IN ('active', 'completed'))))
);

DROP POLICY IF EXISTS options_select_via_question ON public.options;
CREATE POLICY options_select_via_question ON public.options FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.questions q JOIN public.exams e ON e.id = q.exam_id WHERE q.id = options.question_id AND (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = e.course_id AND (c.status = 'published' OR public.has_role((SELECT auth.uid()), 'admin') OR public.has_role((SELECT auth.uid()), 'instructor'))) OR EXISTS (SELECT 1 FROM public.enrollments en WHERE en.course_id = e.course_id AND en.user_id = (SELECT auth.uid()) AND en.status IN ('active', 'completed'))))
);
