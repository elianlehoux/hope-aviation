# Agent instructions: Backend & database

This file is for **Cursor agents** working on the Hope Aviation **Supabase database** and **Next.js backend** (API routes, server actions, `lib/supabase`).

## What to read first

1. **`supabase/migrations/`** — Current SQL schema, triggers, and Row Level Security policies.
2. **`types/database.ts`** — TypeScript shapes aligned with `public` tables (JSONB translations, status enums).
3. **`.cursor/rules/hope-aviation-database-backend.mdc`** — Project rules when editing SQL, API routes, actions, or Supabase clients.

## Conventions

- **Comments in code** must remain **English** (see `GEMINI.md`).
- **Business-facing copy** may be localized via JSONB fields (`es` / `en`), not separate tables for this phase.
- Treat **RLS** as the primary authorization layer; the backend must still validate inputs and enforce invariants.

## Workflow for schema changes

1. Add a new migration under `supabase/migrations/` (do not rewrite history of applied migrations).
2. Apply to the linked project (`supabase db push` or paste SQL in the Supabase SQL editor).
3. Run `supabase gen types typescript --linked` and replace or merge generated types as needed.

## Security

- Never expose **service role** keys to the client or commit them.
- Prefer the user’s session (server client) for normal operations; use service role only for trusted server-only tasks.
