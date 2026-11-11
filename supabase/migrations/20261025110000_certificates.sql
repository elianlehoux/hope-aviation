-- Certificates: completion date, a public verification code, and anonymous verification.
--
-- * enrollments.completed_at is set when an enrollment becomes 'completed'.
-- * enrollments.certificate_code ('HA-' + 10 hex chars) is issued on first completion and
--   kept forever after (re-completing reuses it), so printed certificates stay valid.
-- * verify_certificate(code) lets anyone check a code without reading the enrollments table.
-- * handle_new_user copies first_name and last_name from sign-up metadata.

ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS certificate_code text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'enrollments_certificate_code_key'
  ) THEN
    ALTER TABLE public.enrollments
      ADD CONSTRAINT enrollments_certificate_code_key UNIQUE (certificate_code);
  END IF;
END $$;

COMMENT ON COLUMN public.enrollments.completed_at IS 'When the enrollment last became completed.';
COMMENT ON COLUMN public.enrollments.certificate_code IS
  'Public certificate code (HA-XXXXXXXXXX), issued on first completion and never changed.';

CREATE OR REPLACE FUNCTION public.new_certificate_code()
RETURNS text
LANGUAGE sql
VOLATILE
AS $$
  SELECT 'HA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
$$;

CREATE OR REPLACE FUNCTION public.enrollments_issue_certificate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'completed' THEN
      NEW.completed_at := COALESCE(NEW.completed_at, now());
      NEW.certificate_code := COALESCE(NEW.certificate_code, public.new_certificate_code());
    ELSIF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
      NEW.completed_at := NULL;
      NEW.certificate_code := NULL;
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    NEW.completed_at := now();
    NEW.certificate_code := COALESCE(OLD.certificate_code, public.new_certificate_code());
  ELSIF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    -- Learners and instructors can never edit certificate fields directly.
    NEW.completed_at := OLD.completed_at;
    NEW.certificate_code := OLD.certificate_code;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enrollments_issue_certificate ON public.enrollments;
CREATE TRIGGER enrollments_issue_certificate
  BEFORE INSERT OR UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.enrollments_issue_certificate();

-- Backfill: enrollments completed before this migration get a date and a code.
UPDATE public.enrollments
SET completed_at = COALESCE(completed_at, enrolled_at),
    certificate_code = COALESCE(certificate_code, public.new_certificate_code())
WHERE status = 'completed'
  AND (completed_at IS NULL OR certificate_code IS NULL);

-- Public verification: zero rows for unknown codes or enrollments no longer completed.
CREATE OR REPLACE FUNCTION public.verify_certificate(p_code text)
RETURNS TABLE (full_name text, course_title jsonb, completed_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    btrim(concat_ws(' ', NULLIF(btrim(p.first_name), ''), NULLIF(btrim(p.last_name), ''))),
    c.title,
    e.completed_at
  FROM public.enrollments e
  JOIN public.profiles p ON p.id = e.user_id
  JOIN public.courses c ON c.id = e.course_id
  WHERE e.certificate_code = upper(btrim(p_code))
    AND e.status = 'completed';
$$;

REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

-- Sign-up metadata: copy first and last name (email prefix as a first-name fallback).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      btrim(NEW.raw_user_meta_data->>'first_name'),
      split_part(COALESCE(NEW.email, 'user'), '@', 1)
    ),
    COALESCE(btrim(NEW.raw_user_meta_data->>'last_name'), '')
  );
  RETURN NEW;
END;
$$;
