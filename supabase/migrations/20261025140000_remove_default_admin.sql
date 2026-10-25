-- Remove the default admin seeded by 20250401120001_seed_default_admin_user.sql
-- (test.admin@test.com with a 4-character password). Real admins are assigned explicitly;
-- local development uses the accounts in supabase/seed.sql.
-- Deleting the auth user cascades to public.profiles and its role assignments.

DELETE FROM auth.users WHERE email = 'test.admin@test.com';
