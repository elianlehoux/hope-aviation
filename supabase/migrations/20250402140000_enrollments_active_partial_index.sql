-- Partial index for active enrollment lookups (course + user, status = active).
-- Speeds guards and RLS-style patterns that filter enrollments by active status.

CREATE INDEX idx_enrollments_course_user_active
  ON public.enrollments (course_id, user_id)
  WHERE status = 'active';
