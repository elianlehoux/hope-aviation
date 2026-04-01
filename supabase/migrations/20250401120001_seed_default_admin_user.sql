-- Dev/staging only: default admin user for local testing.
-- Email: test.admin@test.com — Password: 1234 (weak; do not use in production).
-- After apply, verify signInWithPassword against your project Auth settings (min length).
-- Requires public.handle_new_user trigger on auth.users for public.profiles.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  v_email text := 'test.admin@test.com';
  v_password text := '1234';
  v_user_id uuid;
  v_instance_id uuid;
  v_admin_role_id uuid;
  v_encrypted_pw text;
BEGIN
  SELECT id INTO v_admin_role_id FROM public.roles WHERE slug = 'admin' LIMIT 1;
  IF v_admin_role_id IS NULL THEN
    RAISE EXCEPTION 'admin role not found';
  END IF;

  v_instance_id := COALESCE(
    (SELECT instance_id FROM auth.users LIMIT 1),
    '00000000-0000-0000-0000-000000000000'::uuid
  );

  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email LIMIT 1;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    v_encrypted_pw := extensions.crypt(v_password, extensions.gen_salt('bf'));

    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      v_user_id,
      v_instance_id,
      'authenticated',
      'authenticated',
      v_email,
      v_encrypted_pw,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"first_name": "Test", "last_name": "Admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      'email',
      v_user_id::text,
      now(),
      now(),
      now()
    );
  ELSE
    IF NOT EXISTS (
      SELECT 1
      FROM auth.identities
      WHERE user_id = v_user_id AND provider = 'email'
    ) THEN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      )
      VALUES (
        gen_random_uuid(),
        v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', v_email),
        'email',
        v_user_id::text,
        now(),
        now(),
        now()
      );
    END IF;
  END IF;

  INSERT INTO public.roles_users (user_id, role_id)
  VALUES (v_user_id, v_admin_role_id)
  ON CONFLICT (user_id) DO UPDATE SET
    role_id = EXCLUDED.role_id,
    assigned_at = now();
END $$;
