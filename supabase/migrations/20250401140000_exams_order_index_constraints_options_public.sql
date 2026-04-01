-- Exams: stable ordering within subject; integrity checks; student-safe options view.

ALTER TABLE public.exams
  ADD COLUMN IF NOT EXISTS order_index integer;

ALTER TABLE public.exams
  ADD CONSTRAINT exams_passing_score_range
  CHECK (passing_score >= 0::double precision AND passing_score <= 100::double precision);

ALTER TABLE public.exams
  ADD CONSTRAINT exams_max_attempts_min
  CHECK (max_attempts >= 1);

ALTER TABLE public.questions
  ADD CONSTRAINT questions_points_positive
  CHECK (points > 0::double precision);

-- At most one correct option per question (multiple FALSE allowed).
CREATE UNIQUE INDEX IF NOT EXISTS idx_options_one_correct_per_question
  ON public.options (question_id)
  WHERE is_correct = true;

-- Expose options without is_correct for API clients that must not see answers.
CREATE OR REPLACE VIEW public.options_public AS
SELECT id, question_id, content
FROM public.options;

COMMENT ON VIEW public.options_public IS
  'Multiple-choice rows without correctness; RLS on public.options still applies.';

GRANT SELECT ON public.options_public TO authenticated;
