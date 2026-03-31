# Supabase (Hope Aviation)

This folder holds **SQL migrations** for the production PostgreSQL database (hosted on Supabase).

## Layout

| Path | Purpose |
|------|---------|
| `migrations/` | Ordered SQL migrations (schema, RLS, triggers, seeds). |
| `config.toml` | Local Supabase stack (ports, auth); required for `supabase start`. |

## Local development

Requires **Docker** and the [Supabase CLI](https://supabase.com/docs/guides/cli). From the repo root:

- **`npm run db:start`** — start the local stack (Postgres, Auth, Studio, etc.).
- **`npm run dev:local`** — start the local stack, then `next dev`; when you stop the dev server (e.g. Ctrl+C), the script runs `supabase stop` so containers shut down too.
- **`npm run dev`** — Next.js only; use when Supabase is already running or you target a remote project via env.

Other useful scripts: `db:stop`, `db:status`, `db:reset`, `db:push`, `db:diff`, `db:migration:new`, `db:types:linked` / `db:types:local` (see `package.json`).

## Apply migrations

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and log in.
2. Link the project: `supabase link --project-ref <your-project-ref>`.
3. Push: `supabase db push` (or run the SQL files manually in the Supabase SQL editor).

## Types

After the remote schema matches these migrations:

```bash
npm run db:types:linked
```

(equivalent to `supabase gen types typescript --linked > types/supabase.generated.ts`.)

Then merge or re-export from `types/database.ts` as needed.

## Notable objects

- **`public.has_role(uuid, text)`** — Used in RLS; checks `roles_users` + `roles.slug`.
- **`public.handle_new_user`** — Trigger on `auth.users` insert; creates `profiles` row.
- **Default roles** — `admin`, `instructor`, `student` (seeded in `20250331120001_seed_roles.sql`).

## First admin user

Only users with the `admin` role can insert into `roles_users`. Bootstrap the first admin once (SQL editor, **service role**, or dashboard as postgres), for example after you know the user’s `profiles.id`:

```sql
INSERT INTO public.roles_users (user_id, role_id)
SELECT '<profile-uuid>', r.id
FROM public.roles r
WHERE r.slug = 'admin';
```
