-- Admin: RLS on roles, one role per user, RESTRICT on role delete, atomic role assignment RPC

-- ---------------------------------------------------------------------------
-- One role per user: remove duplicate assignments (keep row with smallest id)
-- ---------------------------------------------------------------------------

DELETE FROM public.roles_users ru
WHERE EXISTS (
  SELECT 1
  FROM public.roles_users ru2
  WHERE ru2.user_id = ru.user_id
    AND ru2.id < ru.id
);

ALTER TABLE public.roles_users
  DROP CONSTRAINT IF EXISTS roles_users_user_id_role_id_key;

ALTER TABLE public.roles_users
  ADD CONSTRAINT roles_users_user_id_key UNIQUE (user_id);

-- ---------------------------------------------------------------------------
-- Deleting a role must fail if still assigned (do not cascade assignments away)
-- ---------------------------------------------------------------------------

ALTER TABLE public.roles_users
  DROP CONSTRAINT IF EXISTS roles_users_role_id_fkey;

ALTER TABLE public.roles_users
  ADD CONSTRAINT roles_users_role_id_fkey
  FOREIGN KEY (role_id)
  REFERENCES public.roles (id)
  ON DELETE RESTRICT;

-- ---------------------------------------------------------------------------
-- RLS: admin may manage roles
-- ---------------------------------------------------------------------------

CREATE POLICY roles_insert_admin
  ON public.roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY roles_update_admin
  ON public.roles
  FOR UPDATE
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY roles_delete_admin
  ON public.roles
  FOR DELETE
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));

CREATE POLICY roles_users_update_admin
  ON public.roles_users
  FOR UPDATE
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

-- ---------------------------------------------------------------------------
-- Atomic role assignment (SECURITY DEFINER; enforces admin inside function)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_set_user_role(p_user_id uuid, p_role_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'profile not found';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.roles WHERE id = p_role_id) THEN
    RAISE EXCEPTION 'role not found';
  END IF;

  INSERT INTO public.roles_users (user_id, role_id)
  VALUES (p_user_id, p_role_id)
  ON CONFLICT (user_id) DO UPDATE
  SET
    role_id = EXCLUDED.role_id,
    assigned_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_user_role(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, uuid) TO authenticated;
