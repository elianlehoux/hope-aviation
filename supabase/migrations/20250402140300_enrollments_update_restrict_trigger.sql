-- Non-admins may only change enrollment status; FK columns and enrolled_at stay immutable.

CREATE OR REPLACE FUNCTION public.enrollments_restrict_non_admin_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.course_id IS DISTINCT FROM OLD.course_id
     OR NEW.enrolled_at IS DISTINCT FROM OLD.enrolled_at THEN
    RAISE EXCEPTION 'enrollments_update: immutable_fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enrollments_restrict_non_admin_update ON public.enrollments;

CREATE TRIGGER enrollments_restrict_non_admin_update
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.enrollments_restrict_non_admin_update();
