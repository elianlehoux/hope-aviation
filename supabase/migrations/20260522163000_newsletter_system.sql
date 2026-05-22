-- Hope Aviation: newsletter subscription system

-- Add newsletter column to profiles
ALTER TABLE public.profiles
  ADD COLUMN newsletter_opt_in boolean NOT NULL DEFAULT false;

-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  user_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Select policy: admin sees all, users see their own
CREATE POLICY newsletter_subscribers_select_admin_or_owner
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- Insert policy: admin can insert
CREATE POLICY newsletter_subscribers_insert_admin
  ON public.newsletter_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Delete policy: admin or owner can delete
CREATE POLICY newsletter_subscribers_delete_admin_or_owner
  ON public.newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- Trigger to sync profiles.newsletter_opt_in changes to newsletter_subscribers
CREATE OR REPLACE FUNCTION public.sync_profile_newsletter_subscription()
RETURNS trigger AS $$
BEGIN
  -- If email changed, delete the old subscriber record
  IF TG_OP = 'UPDATE' AND OLD.email <> NEW.email THEN
    DELETE FROM public.newsletter_subscribers WHERE email = OLD.email;
  END IF;

  IF NEW.newsletter_opt_in = true THEN
    INSERT INTO public.newsletter_subscribers (email, user_id)
    VALUES (NEW.email, NEW.id)
    ON CONFLICT (email) DO UPDATE SET user_id = NEW.id;
  ELSE
    DELETE FROM public.newsletter_subscribers
    WHERE user_id = NEW.id OR email = NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER sync_profile_newsletter_subscription_trigger
  AFTER INSERT OR UPDATE OF newsletter_opt_in, email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_newsletter_subscription();

-- RPC for subscribing (handles landing page form and non-registered emails)
CREATE OR REPLACE FUNCTION public.subscribe_to_newsletter(p_email text)
RETURNS boolean AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  -- Check if profile exists with this email
  SELECT id INTO v_profile_id FROM public.profiles WHERE email = p_email LIMIT 1;
  
  IF v_profile_id IS NOT NULL THEN
    -- If profile exists, set newsletter_opt_in = true (trigger will sync to newsletter_subscribers)
    UPDATE public.profiles SET newsletter_opt_in = true WHERE id = v_profile_id;
  ELSE
    -- If no profile, insert directly into newsletter_subscribers
    INSERT INTO public.newsletter_subscribers (email, user_id)
    VALUES (p_email, NULL)
    ON CONFLICT (email) DO NOTHING;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC for unsubscribing (handles unsubscribe link/form)
CREATE OR REPLACE FUNCTION public.unsubscribe_from_newsletter(p_email text)
RETURNS boolean AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  -- Check if profile exists with this email
  SELECT id INTO v_profile_id FROM public.profiles WHERE email = p_email LIMIT 1;
  
  IF v_profile_id IS NOT NULL THEN
    -- If profile exists, set newsletter_opt_in = false (trigger will sync to newsletter_subscribers)
    UPDATE public.profiles SET newsletter_opt_in = false WHERE id = v_profile_id;
  ELSE
    -- If no profile, delete directly
    DELETE FROM public.newsletter_subscribers WHERE email = p_email;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution to anon and authenticated
GRANT EXECUTE ON FUNCTION public.subscribe_to_newsletter(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.unsubscribe_from_newsletter(text) TO anon, authenticated;
