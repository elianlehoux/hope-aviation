# Campus Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the campus into one coherent product. It covers:
- one route map;
- full flows for learners, instructors and admins: accounts, exams, certificates, the course editor and people;
- five new database migrations, tested locally and applied to production last.

**Architecture:**
- Server components load data with `cache()` helpers and parallel queries, the same pattern as `lib/campus/learning.ts`.
- Client islands mutate through the existing `/api/...` route handlers and then call `router.refresh()`.
- Every sensitive state change lives in `SECURITY DEFINER` RPCs: exam start and submit, course completion, certificate issuance.
- Legacy panels are replaced screen by screen and deleted in the final task.

**Tech Stack:**
- Next.js 16 App Router (`cacheComponents`), React 19, Tailwind v4.
- Supabase (Postgres + RLS + RPC), `@hello-pangea/dnd`, lucide-react, sonner, zod.

**Spec:** `docs/superpowers/specs/2026-10-24-campus-redesign-design.md`

## Global Constraints

- **Branch:** work on `claude/campus-redesign` (PR #4). Commit after every task.
- **Comments:** code comments in English. UI copy goes in `lib/i18n/translations.ts` as `{ en, es }`. Spanish uses voseo.
- **Suspense:** uncached data and `usePathname` must sit inside `<Suspense>` (cacheComponents "blocking-route" error otherwise).
- **Colors and type** come from the `DESIGN.md` tokens only:
  - `primary #00263e`, `accent #1749ff`, `highlight #ffaa00`, `paper #f7f4ee`.
  - Fonts: Bricolage (display), Instrument Sans (body), IBM Plex Mono.
- **Buttons:** the primary CTA is an amber pill with navy text, secondary is a navy outline, and destructive (red) appears only inside confirmations.
- **Dependencies:** no new runtime dependency except `qrcode` (optional, Task 10). No PDF library, no table library.
- **Exam answers:** learners never receive `options.is_correct`, before, during or after an attempt. Results show score and "X of Y correct" only.
- **Migrations:**
  - New files only, under `supabase/migrations/`, named `20261025HHMMSS_<name>.sql`.
  - Apply to local Supabase only (container `supabase_db_hope-aviation-dev`, API port 55421).
  - **Never to production during this plan.**
- **Credentials:** local test accounts only: `admin@hope.test`, `instructor@hope.test` and `student@hope.test`, password `hope-dev-1234`.
- **Instructors:** any instructor can read and edit any course (user decision). Account controls (role, active) are admin-only.
- **Layout:** every screen works at 375 px with no horizontal scroll.
- **Dev server:** launch config `hope-dev-local` (port 3009, local Supabase).

## Review Focus

1. **Reloading mid-exam** keeps the chosen answers and the timer continues from the server `started_at`; it does not restart. *(Task 7 test `resume_returns_open_attempt`, Task 8 browser check.)*
2. **Double submit** from two tabs or a double click: the second submit gets a clear "already submitted" message and no crash, and no second attempt is recorded. *(Task 6 test `submit_twice_rejected`.)*
3. **An exam with zero questions**, or a question with no options, shows "This exam isn't available yet" instead of an empty runner, and the publish checklist blocks it. *(Task 8 browser check, Task 15 checklist test.)*
4. **A learner with no first or last name** who opens a certificate is asked for the name inline, and the certificate renders with it afterwards. *(Task 10 browser check.)*
5. **An expired or reused password-recovery link** shows "This link expired" with a button to request a new one; it never shows a blank form that fails on submit. *(Task 5 browser check.)*

---

## File map

| Area | Files |
|---|---|
| Test harness | `scripts/db-test.sh`, `supabase/tests/00_helpers.sql`, `supabase/tests/*.test.sql`, `tests/unit/*.test.ts`, `package.json` scripts |
| Routes | `next.config.ts` (redirects), delete `app/campus/students/**`, `app/campus/professors/**`, `app/campus/admin/{enrollments,exam-attempts,exams,users,user-management,roles}/**` |
| Nav | `lib/dev/campus-preview.ts` (link lists), `components/features/campus/nav/CampusNavList.tsx` (icons) |
| UI primitives | `components/features/campus/ui/{empty-state,data-list,status-badge,field,confirm-dialog}.tsx` |
| Auth | `app/api/auth/login/route.ts`, `app/api/auth/callback/route.ts`, `lib/auth/safe-next.ts`, `lib/supabase/proxy.ts`, `app/auth/{login,registro,recuperar,nueva-clave}/page.tsx`, `components/features/auth/*` |
| Exams (learner) | migration M2, `app/api/exams/[examId]/start/route.ts`, `app/api/courses/[courseId]/final-exam/start/route.ts`, submit routes, `components/features/campus/exam/*` |
| Completion & certificates | migrations M1, M3, `lib/campus/module-gate.ts`, `lib/campus/learning.ts`, `lib/campus/certificates.ts`, `app/campus/certificates/**`, `app/certificados/[codigo]/page.tsx`, `components/features/campus/certificate/*` |
| Profile | `app/campus/profile/page.tsx`, `components/features/campus/profile/*` (replaces `ProfileForm.tsx`) |
| Course management | `lib/campus/manage.ts`, `app/campus/admin/courses/**`, `components/features/manage/course/*`, `components/features/manage/exam/*` |
| People | migration M4, `app/campus/admin/people/**`, `components/features/manage/people/*` |
| Cleanup | migration M5, delete `components/features/admin/*Panel.tsx`, `UserAcademicDetail.tsx`, `PublishValidationModal.tsx` and orphaned API routes |

---

## Phase 1 — Base

### Task 1: Test harness and richer seed

**Files:**
- Create: `scripts/db-test.sh`, `supabase/tests/00_helpers.sql`, `supabase/tests/01_seed_sanity.test.sql`, `tests/unit/module-gate.test.ts`
- Modify: `package.json` (scripts), `tsconfig.json` (exclude `tests/unit`), `supabase/seed.sql`

**Interfaces — Produces:**
- `scripts/db-test.sh`: runs `00_helpers.sql`, then each `*.test.sql` in name order.
  - Uses `docker exec -i supabase_db_hope-aviation-dev psql -U postgres -v ON_ERROR_STOP=1 -q`.
  - Each test file is wrapped in `BEGIN; … ROLLBACK;` by its author.
  - Exit code is non-zero on the first failure.
- In `00_helpers.sql`, schema `tests` (created if missing):
  - `tests.as_user(p_uid uuid) RETURNS void`: `set_config('request.jwt.claims', json_build_object('sub',p_uid,'role','authenticated')::text, true)` plus `SET LOCAL ROLE authenticated`.
  - `tests.as_postgres() RETURNS void`: `RESET ROLE`.
  - `tests.expect_error(p_sql text, p_fragment text) RETURNS void`: runs `EXECUTE p_sql` and raises `'expected error % not raised'` unless an exception whose `SQLERRM` contains `p_fragment` is caught.
  - `tests.ok(p_name text) RETURNS void`: `RAISE NOTICE 'ok - %', p_name`.
- `package.json` scripts:
  - `"test:db": "bash scripts/db-test.sh"`
  - `"test:unit": "node --test --experimental-strip-types tests/unit/"`
- Seed additions (fixed UUIDs, all ids prefixed as noted):
  - **Instructor 2:** `instructor2@hope.test`, `00000000-0000-4000-a000-000000000004`.
  - **Student 2:** `student2@hope.test`, `…0005`, with empty `first_name` and `last_name`.
  - **Course B:** `10000000-0000-4000-a000-000000000002`, published, `final_exam_question_count` NULL.
    - Subject `2000…03` has classes `3000…05` and `3000…06` and **no exam**.
    - Subject `2000…04` has class `3000…07`, plus exam `4000…03` with 2 questions and `time_limit_minutes = 1`.
  - Student 2 is enrolled in Course B. No progress.

- [ ] **Step 1:** Write `supabase/tests/01_seed_sanity.test.sql`.
  - Asserts the seed counts: 5 users, 2 courses, Course B with 2 subjects, student2 enrolled in Course B.
  - Calls `tests.ok('seed')`.
- [ ] **Step 2:** Write `tests/unit/module-gate.test.ts` importing `../../lib/campus/module-gate.ts`.
  - Asserts `subjectExamsPassed({exams: []}) === true` (current behaviour, changed in Task 9).
  - Asserts `isSubjectUnlocked([{exams:[{exam_attempts:[]}]}, {exams:[]}], 1) === false`.
- [ ] **Step 3:** Add the scripts, the tsconfig exclude and the helpers. Run `pnpm db:reset`, or `supabase db reset --workdir <scratch>` if that is how local is started (check `supabase status`).
- [ ] **Step 4:** Run `pnpm test:db` and `pnpm test:unit`. Expected: `ok - seed`, 2 passing unit tests.
- [ ] **Step 5:** Commit `test: db and unit test harness, richer local seed`.

### Task 2: Route map, redirects and navigation

**Files:**
- Modify: `next.config.ts`, `lib/dev/campus-preview.ts`, `components/features/campus/nav/CampusNavList.tsx`, `app/campus/admin/page.tsx`
- Delete: every `page.tsx` under `app/campus/students/`, `app/campus/professors/`, `app/campus/admin/enrollments/`, `app/campus/admin/exam-attempts/` and `app/campus/admin/(admin-only)/roles/`
- Delete in Task 18: `app/campus/admin/exams/page.tsx`, `app/campus/admin/(admin-only)/users/`, `app/campus/admin/(admin-only)/user-management/`. They are replaced first, in Tasks 14 and 17.
- Create: `app/campus/admin/exams/[examId]/page.tsx`, rewritten in Task 14 as a lookup-and-redirect.

**Interfaces — Produces:**
- `next.config.ts` `redirects()` (all `permanent: true`):
  - `/campus/students` → `/campus`
  - `/campus/students/courses` → `/campus/courses`
  - `/campus/students/courses/:courseId` → `/campus/courses/:courseId`
  - `/campus/students/courses/:courseId/subjects/:subjectId` → `/campus/courses/:courseId`
  - `/campus/students/courses/:courseId/subjects/:subjectId/classes/:classId` → `/campus/courses/:courseId/learn/:classId`
  - `/campus/students/:path*` → `/campus`
  - `/campus/professors/courses/:courseId/:path*` → `/campus/admin/courses/:courseId`
  - `/campus/professors/exams/:examId` → `/campus/admin/exams/:examId`
  - `/campus/professors/:path*` → `/campus/admin/courses`
  - `/campus/admin/enrollments` → `/campus/admin/people`
  - `/campus/admin/exam-attempts` → `/campus/admin/people`
  - `/campus/admin/roles` → `/campus/admin/people`
  - `/campus/admin/users` → `/campus/admin/people`
  - `/campus/admin/user-management` → `/campus/admin/people`
  - `/campus/admin/user-management/:userId` → `/campus/admin/people/:userId`
  - `/campus/admin/exams` → `/campus/admin/courses`
  - The last four only take effect once their pages are deleted in Task 18, because pages win over redirects. Add them now anyway.
- Nav links:
  - **Learner:** `/campus`, `/campus/courses`, `/campus/certificates`, `/campus/profile`.
  - **Staff, adds:** `/campus/admin/courses` (`campus.manageCourses`) and `/campus/admin/people` (`campus.people`, new key: "Personas" / "People").
  - **Admin, adds:** `/campus/admin/newsletter`.
  - Icons: `Users` for people. Exams, roles, users and user-management are removed from the nav.
- `app/campus/admin/page.tsx` becomes a server `redirect("/campus/admin/courses")`.

- [ ] **Step 1:** Add the redirects and delete the legacy redirect pages.
- [ ] **Step 2:** Update the nav lists and icons, and replace the admin home with the redirect.
- [ ] **Step 3:** Run `pnpm build`. Expected: success.
- [ ] **Step 4:** Browser check (preview `hope-dev-local`):
  - `/campus/students/courses/10000000-0000-4000-a000-000000000001` lands on the course page.
  - `/campus/professors` lands on manage courses.
  - The nav shows four learner items, plus two for the instructor and three for the admin.
- [ ] **Step 5:** Commit `refactor(campus): single route map with permanent redirects`.

### Task 3: Campus UI primitives

**Files:**
- Create: `components/features/campus/ui/empty-state.tsx`, `data-list.tsx`, `status-badge.tsx`, `field.tsx`, `confirm-dialog.tsx`
- Modify: `components/features/campus/ui/surface.tsx` (keep its exports and re-export `CampusEmpty` as an alias of `EmptyState`)

**Interfaces — Produces:**
- `EmptyState({ icon?: LucideIcon; title: string; description?: string; action?: ReactNode })`
- `DataList<T>`:
  - Props: `{ rows: T[]; columns: { key: string; header: string; cell: (row: T) => ReactNode; className?: string; hideOnMobile?: boolean }[]; rowHref?: (row: T) => string; empty: ReactNode }`.
  - Desktop (`md:` and up) renders a `<table>`. Below `md` it renders stacked cards that show the first column as the title and the rest as label/value pairs.
  - With `rowHref`, the whole row is a `Link`.
- `StatusBadge({ status: "draft" | "published" | "archived" | "active" | "completed" | "cancelled" | "passed" | "failed" | "inactive" })`. It always renders an icon and a translated label.
- `Field({ label: string; htmlFor: string; hint?: string; error?: string; children: ReactNode })`
- `ConfirmDialog({ open; onOpenChange; title: string; description?: string; confirmLabel: string; destructive?: boolean; onConfirm: () => Promise<void> | void })`. The confirm button shows a spinner while the promise is pending and closes the dialog when it resolves.
- Translations: `status.*` keys for every StatusBadge value, es and en.

- [ ] **Step 1:** Implement the five components using `DESIGN.md` tokens and the existing `components/ui/{button,dialog}`.
- [ ] **Step 2:** Add a temporary showcase of every primitive in `app/componentsdev/page.tsx`.
- [ ] **Step 3:** Run `pnpm exec tsc --noEmit`.
- [ ] **Step 4:** Browser check `/componentsdev` at 1280 px and 375 px: the DataList switches between table and cards, and the badges carry text plus icon.
- [ ] **Step 5:** Commit `feat(campus): shared UI primitives`.

---

## Phase 2 — Accounts

### Task 4: Login without implicit sign-up, safe `next`

**Files:**
- Create: `lib/auth/safe-next.ts`, `tests/unit/safe-next.test.ts`
- Modify: `app/api/auth/login/route.ts`, `app/api/auth/callback/route.ts`, `lib/supabase/proxy.ts`

**Interfaces — Produces:** `safeNext(raw: string | null | undefined, fallback = "/campus"): string`. It returns `raw` only if it starts with `/`, does not start with `//` or `/\`, and has no scheme; otherwise it returns `fallback`.

- [ ] **Step 1:** Write tests that assert all of these:
  - `safeNext("/campus/courses") === "/campus/courses"`
  - `safeNext("//evil.com") === "/campus"`
  - `safeNext("https://evil.com") === "/campus"`
  - `safeNext("/\\evil") === "/campus"`
  - `safeNext(null) === "/campus"`
- [ ] **Step 2:** Run `pnpm test:unit`. Expected: FAIL (module missing).
- [ ] **Step 3:** Implement `safeNext`. Then:
  - Remove the whole `signUp` branch from the login route (401 `invalid_credentials` on any sign-in error).
  - Use `safeNext` in the callback.
  - In the proxy, set `url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search)` on the login redirect.
- [ ] **Step 4:** Run `pnpm test:unit`. Expected: PASS.
- [ ] **Step 5:** `curl -s -X POST localhost:3009/api/auth/login -H 'content-type: application/json' -d '{"email":"nobody@hope.test","password":"x12345678"}'` returns 401. Then confirm with `select count(*) from auth.users where email='nobody@hope.test'` that the count is 0.
- [ ] **Step 6:** Commit `fix(auth): login never creates accounts; sanitize next`.

### Task 5: Auth screens

**Files:**
- Create:
  - `components/features/auth/AuthShell.tsx`: brand panel plus form column, used by all four pages.
  - `components/features/auth/{LoginForm,SignupForm,RecoverForm,NewPasswordForm}.tsx`
  - `app/auth/registro/page.tsx`, `app/auth/recuperar/page.tsx`, `app/auth/nueva-clave/page.tsx`
- Modify: `app/auth/login/page.tsx`, `app/auth/layout.tsx`, `lib/i18n/translations.ts` (`auth.*`)

**Behaviour (copy pinned by the spec):**
- **Login:**
  - Error copy: "Mail o clave incorrectos" / "Wrong email or password".
  - Links to `/auth/recuperar` and `/auth/registro`.
  - Google button kept.
  - On success: `router.replace(safeNext(searchParams.get("next")))`.
- **Sign-up:**
  - Fields: first name, last name, email, password (min 8).
  - Calls the browser client's `supabase.auth.signUp({ email, password, options: { data: { first_name, last_name }, emailRedirectTo: origin + "/api/auth/callback?next=/campus" } })`.
  - `handle_new_user` already reads `first_name` from metadata. Make it also read `last_name` in M1 (Task 9).
  - With no session, show "Revisá tu mail" plus a resend button (`supabase.auth.resend({ type: "signup", email })`).
  - With a session, go to `/campus`.
- **Recover:** `resetPasswordForEmail(email, { redirectTo: origin + "/api/auth/callback?next=/auth/nueva-clave" })`. Always show "Si existe una cuenta, te mandamos un link".
- **New password:**
  - When there is no session (expired or used link), show "Este link venció" plus a button to `/auth/recuperar`.
  - Otherwise `updateUser({ password })`, then `/campus`.

- [ ] **Step 1:** Build AuthShell and the four forms, plus the i18n keys in es and en.
- [ ] **Step 2:** Run `pnpm exec tsc --noEmit` and `pnpm lint app/auth components/features/auth`.
- [ ] **Step 3:** Browser checks against local (Inbucket at `http://127.0.0.1:55424` or the port shown by `supabase status`):
  - Sign up `new1@hope.test`; the confirmation mail arrives; the link logs in to `/campus`.
  - A wrong password shows the error and creates no user.
  - Recover `student@hope.test`; the mail link leads to the new password page; the new password logs in. Reset it back to `hope-dev-1234`.
  - Opening `/auth/nueva-clave` logged out shows the expired state (Review Focus 5).
  - Logged out, `/campus/courses` leads to login with `next`, and logging in returns to `/campus/courses`.
- [ ] **Step 4:** Commit `feat(auth): sign-up, password recovery, redesigned login`.

---

## Phase 3 — Exams (learner)

### Task 6: M2 exam timing migration

**Files:**
- Create: `supabase/migrations/20261025100000_exam_timing.sql`, `supabase/tests/10_exam_timing.test.sql`

**Interfaces — Produces (SQL):**
- **`start_exam_attempt(p_exam_id uuid) RETURNS public.exam_attempts`**
  - SECURITY DEFINER, `search_path = public`, granted to `authenticated` only.
  - Same checks as `submit_exam_attempt` (auth, enrolled `active`, module gate), plus `no_questions` if the exam has no questions.
  - If an open attempt exists (`finished_at IS NULL`) and is not expired, return it.
  - If an open attempt is expired, close it first with `score 0, passed false, finished_at now()`.
  - Then raise `max_attempts_reached` if `count(*) >= max_attempts`; otherwise insert and return a new attempt.
  - Expired means `time_limit_minutes IS NOT NULL AND now() > started_at + make_interval(mins => time_limit_minutes + 2)`.
- **`submit_exam_attempt(p_exam_id uuid, p_answers jsonb) RETURNS public.exam_attempts`**, redefined:
  - Requires an open attempt, otherwise raises `no_open_attempt`.
  - If it is expired, it closes it with score 0 and returns it.
  - Otherwise it grades exactly as today, updates that row (not an insert), and keeps the lesson_progress upsert on pass.
- **`final_exam_sessions` table:**
  - Columns: `id uuid pk default gen_random_uuid()`, `user_id uuid not null references profiles on delete cascade`, `course_id uuid not null references courses on delete cascade`, `question_ids uuid[] not null`, `started_at timestamptz not null default now()`, `finished_at timestamptz`, `score double precision`, `passed boolean`.
  - Partial unique index on `(user_id, course_id) WHERE finished_at IS NULL`.
  - RLS enabled. Select own: `user_id = auth.uid()`. Select staff: `has_role(admin) or has_role(instructor)`. No insert, update or delete policies.
- **`start_final_exam(p_course_id uuid) RETURNS public.final_exam_sessions`**
  - Raises `final_exam_not_configured` when `final_exam_question_count` is null or 0.
  - Also checks auth, enrolled, all module exams passed (`modules_not_passed`), and resume or expiry with `final_exam_time_limit_minutes`.
  - Samples `final_exam_question_count` question ids at random (`ORDER BY random() LIMIT n`) from questions of the course's exams. It raises `not_enough_questions` if fewer exist.
- **`submit_final_exam(p_course_id uuid, p_answers jsonb) RETURNS TABLE(score double precision, passed boolean)`**, redefined:
  - Grades only against the open session's `question_ids`; `unknown_question` applies to any key outside it.
  - Target = `cardinality(question_ids)`.
  - Closes the session; on pass it completes the enrollment as today.
  - Expired → score 0, not passed.
- Drop `app/api/courses/[courseId]/final-exam/generate` in Task 7; its random sampling now lives in SQL.

- [ ] **Step 1:** Write `10_exam_timing.test.sql`. One `DO` block per case, each ending in `tests.ok`:
  - `start_creates_open_attempt`
  - `resume_returns_open_attempt`: same id on the second call.
  - `submit_without_start_rejected`: `no_open_attempt`.
  - `submit_twice_rejected`: the second call raises `no_open_attempt`, and there is exactly 1 row.
  - `expired_attempt_scores_zero`: as postgres, set `started_at = now() - interval '10 minutes'` on the Course B exam (limit 1); the submit returns `score = 0, passed = false`.
  - `max_attempts_enforced`
  - `final_session_samples_n_questions`: `cardinality = final_exam_question_count`.
  - `final_unknown_question_rejected`
  - `final_pass_completes_enrollment`
  - `learner_cannot_insert_session`: a direct insert raises an RLS error.
- [ ] **Step 2:** Run `pnpm test:db`. Expected: FAIL at `start_exam_attempt does not exist`.
- [ ] **Step 3:** Write the migration and apply it locally (`docker exec -i … psql < file`, or `supabase migration up --local`).
- [ ] **Step 4:** Run `pnpm test:db`. Expected: all `ok -` lines, exit 0.
- [ ] **Step 5:** Commit `feat(db): server-timed exam attempts and final exam sessions`.

### Task 7: Exam API routes

**Files:**
- Create: `app/api/exams/[examId]/start/route.ts`, `app/api/courses/[courseId]/final-exam/start/route.ts`, `lib/campus/exam-paper.ts`
- Modify: `app/api/exams/[examId]/attempts/route.ts`, `app/api/courses/[courseId]/final-exam/submit/route.ts`
- Delete: `app/api/courses/[courseId]/final-exam/generate/route.ts`, `app/api/exams/[examId]/paper/route.ts` (folded into start)

**Interfaces — Produces:**
- `type ExamPaper = { attemptId: string; startedAt: string; deadline: string | null; questions: { id: string; content: TranslatedText; options: { id: string; content: TranslatedText }[] }[] }`, in `lib/campus/exam-paper.ts`.
- `loadPaper(supabase, questionIds: string[] | { examId: string }): Promise<ExamPaper["questions"]>`. Questions are ordered by `order_index`; for the final exam they keep the session order. Options come via `options_public`.
- `POST /api/exams/:examId/start` → `200 ExamPaper`, or `{ error: { code } }` with these mappings:
  - `not_enrolled` → 403
  - `module_locked` → 403
  - `max_attempts_reached` → 409
  - `no_questions` → 409
- `POST /api/courses/:courseId/final-exam/start` → `200 ExamPaper`, with the same error mapping plus:
  - `modules_not_passed` → 403
  - `final_exam_not_configured` → 404
  - `not_enough_questions` → 409
- The submit routes add `no_open_attempt` → 409 to `SUBMIT_ERRORS`. The response is `{ score, passed, correct, total }` (`correct` = round(score × total / 100)).
- `deadline` = `started_at + limit` (without the grace), or null.

- [ ] **Step 1:** Implement the routes on top of the RPCs from Task 6.
- [ ] **Step 2:** curl as the student, with cookies from a browser login, against local:
  - start → a paper with no `is_correct` key anywhere (`grep -c is_correct` = 0);
  - start again → same `attemptId`;
  - submit → 200;
  - submit again → 409.
- [ ] **Step 3:** Commit `feat(api): exam start endpoints with server-side papers`.

### Task 8: Exam runner UI

**Files:**
- Create: `components/features/campus/exam/{ExamRunner,ExamIntro,ExamQuestion,ExamMap,ExamReview,ExamResult,ExamTimer}.tsx`, `components/features/campus/exam/use-exam-session.ts`
- Modify: `app/campus/courses/[courseId]/learn/exam/[examId]/page.tsx`, `app/campus/courses/[courseId]/learn/final-exam/page.tsx`
- Delete: `components/features/campus/learning/{ExamViewClient,FinalExamViewClient,ExamPreFlight,ExamQuestionView,ExamResults}.tsx`

**Interfaces:**
- **Consumes:**
  - `ExamPaper` and the routes from Task 7;
  - `getCourseOutline` and `neighbours` from `lib/campus/learning.ts`.
- **Produces:**
  - `ExamRunner` props: `{ kind: "module" | "final"; startUrl: string; submitUrl: string; intro: { title: TranslatedText; instructions: TranslatedText | null; questionCount: number; timeLimitMinutes: number | null; passingScore: number; attemptsUsed: number; maxAttempts: number | null; bestScore: number | null }; next: { href: string; label: string } | null; retryAllowed: boolean; preview: boolean }`.
  - `useExamSession(storageKey: string)` returns `{ answers: Record<string,string>; setAnswer(qid, oid): void; clear(): void }`, persisted in `sessionStorage` under `exam:<attemptId>`.
- **States:** `intro → running → review → submitting → result`, plus `unavailable` for zero questions or a 409 `no_questions` (copy: "Este examen todavía no está disponible").
- **Timer:**
  - Counts down to `deadline`.
  - At 0 it submits automatically.
  - Under 60 s left it shows a warning tone, using the `warning` token plus text, not colour alone.
- **Result copy:**
  - Score in large type, "Aprobado" or "No aprobado", and "X de Y correctas".
  - Next step:
    - `next.label` on pass;
    - "Reintentar (te quedan N)" if allowed;
    - otherwise "Escribile a tu instructor".
  - For the final exam on pass: "¡Curso completado!" plus "Ver certificado" → `/campus/certificates`.
- **Preview (`preview` true):** the intro shows a "Vista previa" banner and Start renders the paper read-only, with no submit.

- [ ] **Step 1:** Build the runner and wire both exam pages to it.
- [ ] **Step 2:** Run `pnpm exec tsc --noEmit` and `pnpm lint components/features/campus/exam`.
- [ ] **Step 3:** Browser checks as `student@hope.test` on local:
  - Module 2 exam:
    - answer 1 question, then reload: the answer is kept and the timer is not reset (Review Focus 1);
    - review shows the unanswered questions; the confirm dialog appears;
    - the result shows X of Y; the network responses contain no `is_correct`.
  - As `student2`, the Course B module 2 exam (1-minute limit): wait it out and confirm it auto-submits.
  - Both runs at 375 px.
  - Stop any video played.
- [ ] **Step 4:** Commit `feat(campus): redesigned exam runner`.

---

## Phase 4 — Completion, certificates, profile

### Task 9: M1 certificates and M3 completion without a final exam

**Files:**
- Create: `supabase/migrations/20261025110000_certificates.sql`, `supabase/migrations/20261025120000_course_completion_without_final.sql`, `supabase/tests/20_certificates.test.sql`, `supabase/tests/21_complete_course.test.sql`
- Modify: `lib/campus/module-gate.ts`, `lib/campus/learning.ts`, `tests/unit/module-gate.test.ts`, `components/features/campus/learn/LessonView.tsx`, `app/api/courses/[courseId]/progress/route.ts` (or a new `app/api/courses/[courseId]/complete/route.ts`)

**Interfaces — Produces:**
- **M1:**
  - `enrollments.completed_at timestamptz`, `enrollments.certificate_code text UNIQUE`.
  - Trigger `enrollments_issue_certificate`, BEFORE UPDATE:
    - when `NEW.status = 'completed' AND OLD.status <> 'completed'`, set `completed_at = now()`;
    - set `certificate_code = COALESCE(OLD.certificate_code, 'HA-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)))`.
  - Backfill existing completed rows: `completed_at = COALESCE(completed_at, enrolled_at)` plus a code.
  - `verify_certificate(p_code text) RETURNS TABLE(full_name text, course_title jsonb, completed_at timestamptz)`: SECURITY DEFINER, granted to `anon, authenticated`. It returns zero rows for unknown codes.
  - `handle_new_user` also copies `raw_user_meta_data->>'last_name'`.
- **M3:**
  - `complete_course(p_course_id uuid) RETURNS public.enrollments`: SECURITY DEFINER, granted to `authenticated`.
  - Errors:
    - `not_enrolled`;
    - `final_exam_required` if `final_exam_question_count > 0`;
    - `lessons_incomplete` if any class of the course lacks `lesson_progress.is_completed` for the user;
    - `modules_not_passed`.
  - Then `set_config('hope.allow_completion','on',true)`, update to `completed`, and return the row.
- **Gate rule (TS):**
  - `subjectPassed(subject: GateSubject & { classes?: { lesson_progress?: { is_completed: boolean }[] | null }[] | null }): boolean`.
  - With exams, all exams must be passed. Without exams, all classes must be completed.
  - `isSubjectUnlocked` and `allModuleExamsPassed` use it. In `learning.ts`, replace the inline `exams.every(...)` with `subjectPassed`.
- **Outline:** `CourseOutline` adds `canComplete: boolean`, which is true when there is no final exam, the status is `active`, and every item is done.
- **LessonView:** when `canComplete` becomes true after "Completar y seguir" on the last item, it POSTs `/api/courses/:courseId/complete` (RPC `complete_course`) and routes to `/campus/certificates?new=<courseId>`.

- [ ] **Step 1:** SQL tests:
  - `code_issued_on_completion`
  - `code_stable_on_repeat_update`
  - `verify_unknown_returns_none`
  - `verify_anon_allowed`
  - `complete_course_requires_lessons`
  - `complete_course_rejected_when_final_configured`
  - `complete_course_ok_for_course_b` (seed progress as postgres, then call as student2)
- [ ] **Step 2:** Unit test cases:
  - `subjectPassed({exams:[], classes:[{lesson_progress:[]}]}) === false`
  - `subjectPassed({exams:[], classes:[{lesson_progress:[{is_completed:true}]}]}) === true`
- [ ] **Step 3:** Run `pnpm test:db` and `pnpm test:unit`. Expected: FAIL.
- [ ] **Step 4:** Write the migrations and apply them locally. Then change the gate, the outline and LessonView.
- [ ] **Step 5:** Run `pnpm test:db` and `pnpm test:unit`. Expected: PASS.
- [ ] **Step 6:** Browser check as `student2` on Course B:
  - module 2 stays locked until both classes of module 1 are complete;
  - passing the module 2 exam and completing the last class leads to the certificates page.
- [ ] **Step 7:** Commit `feat: certificates codes and completion for courses without a final exam`.

### Task 10: Certificates screens and public verification

**Files:**
- Create:
  - `lib/campus/certificates.ts`
  - `app/campus/certificates/[enrollmentId]/page.tsx`
  - `app/certificados/[codigo]/page.tsx`
  - `components/features/campus/certificate/{CertificateList,CertificateSheet,NameGate}.tsx`
- Modify: `app/campus/certificates/page.tsx`, `lib/supabase/proxy.ts` (public path `/certificados`)

**Interfaces — Produces:**
- `getMyCertificates(): Promise<{ enrollmentId: string; courseId: string; courseTitle: TranslatedText; completedAt: string; code: string }[]>`, wrapped in `cache()` and filtered to the current user with `status = 'completed'`.
- `getCertificate(enrollmentId: string)`: the same shape plus `fullName: string | null`.
- **CertificateSheet:**
  - A4 landscape, branded: navy, amber flight paths, and the Hope logo from `public/`.
  - Shows name, course, date (localized long form), code and the URL `${NEXT_PUBLIC_SITE_URL}/certificados/<code>`.
  - QR as server-rendered SVG via `qrcode` (`QRCode.toString(url, { type: "svg" })`). If adding `qrcode` is rejected in review, omit the QR and keep the URL.
  - `@media print` hides everything except the sheet. The "Descargar PDF" button calls `window.print()`.
- **NameGate:** when `fullName` is empty, it shows the first and last name form inline. It saves through the existing `PATCH /api/me/profile`, then calls `router.refresh()`.
- **Public page:** valid → name, course, date and "Certificado válido"; unknown → "No encontramos este certificado".
- **List:**
  - Empty state links to `/campus/courses`.
  - `?new=<courseId>` shows a celebratory banner on that card.

- [ ] **Step 1:** Implement the screens.
- [ ] **Step 2:** Browser checks:
  - as student2 (empty name), open the certificate: the NameGate appears, the name is saved, and the sheet renders (Review Focus 4);
  - print preview shows a single landscape page;
  - `/certificados/<code>` logged out shows "valid";
  - `/certificados/NOPE` shows "not found".
- [ ] **Step 3:** Commit `feat(campus): certificates with print-to-PDF and public verification`.

### Task 11: Profile

**Files:**
- Create: `components/features/campus/profile/{ProfileDetails,AccountSection}.tsx`
- Modify: `app/campus/profile/page.tsx` (server-loads the profile)
- Delete: `components/features/campus/ProfileForm.tsx`

**Behaviour:**
- **Sections:**
  - "Tus datos": first name, last name, birth date, country, phone. Saved via `PATCH /api/me/profile`.
  - "Preferencias": language, which mirrors `LanguageToggle`, and a newsletter switch.
  - "Cuenta": email (read-only), change password (`updateUser`), sign out.
- Inline field errors use `Field`. Saving shows a toast.

- [ ] **Step 1:** Implement the profile page.
- [ ] **Step 2:** Run `tsc` and lint.
- [ ] **Step 3:** Browser check: edit the name, reload, and the change persists; changing the password works and is then reverted; 375 px layout.
- [ ] **Step 4:** Commit `feat(campus): redesigned profile`.

---

## Phase 5 — Course management

### Task 12: Manage loaders and course list

**Files:**
- Create: `lib/campus/manage.ts`, `components/features/manage/course/{CourseList,NewCourseDialog}.tsx`
- Modify: `app/campus/admin/courses/page.tsx`

**Interfaces — Produces (in `lib/campus/manage.ts`, all wrapped in `cache()`):**
- `requireStaff(): Promise<{ supabase; userId: string; isAdmin: boolean }>`. It redirects to `/campus` when the user is not staff. Uses `getLearnerUser` and `getUserRoles`.
- `listManagedCourses(): Promise<{ id; title: TranslatedText; status: "draft" | "published" | "archived"; moduleCount: number; lessonCount: number; learnerCount: number; updatedAt: string }[]>`
- `getCourseTree(courseId: string): Promise<ManageCourseTree | null>`. `ManageCourseTree` mirrors the existing `/api/courses/[id]/tree` response, plus `has_content` per class and `questionCount` and `invalidQuestionCount` per exam. `invalidQuestionCount` counts questions without exactly one correct option or with fewer than 2 options.

**Behaviour:**
- The list is a `DataList` with columns: title, status badge, modules/lessons, learners and updated date.
- Filter chips: Todos / Borradores / Publicados / Archivados.
- "Nuevo curso" opens a dialog with title es/en, POSTs `/api/courses`, then routes to the editor.

- [ ] **Step 1:** Implement the loaders and the list.
- [ ] **Step 2:** Browser check as the instructor: both seed courses are listed; creating "Curso prueba" lands in its editor.
- [ ] **Step 3:** Commit `feat(manage): server-loaded course list`.

### Task 13: Course editor — Contenido tab

**Files:**
- Create:
  - `app/campus/admin/courses/[courseId]/layout.tsx`: header with title, status badge, tabs, Preview and Publish buttons.
  - `app/campus/admin/courses/[courseId]/page.tsx`: Contenido.
  - `components/features/manage/course/{CourseTree,ModulePanel,ClassPanel,ExamSummaryPanel,ReorderButtons}.tsx`
- The URL state for the selected item is `?item=module:<id>`, `?item=class:<id>` or `?item=exam:<id>`.

**Behaviour:**
- **Desktop:** the tree sits on the left (`w-80`, sticky); the panel for the selected item is on the right.
- **Mobile:** the tree fills the screen and selecting opens the panel in a `Sheet`.
- **Tree:**
  - Lists modules → classes (video and/or text icons) → module exam (question count, or a warning icon if 0 or invalid).
  - "+ Módulo", "+ Clase" and "+ Examen" (only when the module has none) use the existing POST routes.
  - Reorder with `@hello-pangea/dnd`, plus up/down buttons for keyboard users. Both use the existing `reorder` routes.
- **ModulePanel:** title and description es/en. Save uses PATCH; delete goes through ConfirmDialog.
- **ClassPanel:**
  - Fields: title es/en, duration, video URL (YouTube validation), resource URL, description es/en.
  - A "Escribir texto" / "Editar texto" link goes to `/campus/admin/courses/:id/lessons/:classId` with a reading-time chip.
  - Save, delete.
- **ExamSummaryPanel:** config summary plus "Editar preguntas" → `/campus/admin/courses/:id/exams/:examId`.
- **Saving:** each panel saves with a button and `Cmd/Ctrl+S`, warns on unsaved changes when switching item, and calls `router.refresh()` after saving.

- [ ] **Step 1:** Implement the layout, tree and panels.
- [ ] **Step 2:** Run `tsc` and lint.
- [ ] **Step 3:** Browser check as the instructor on "Curso prueba":
  - add 2 modules and 2 classes; reorder by drag and by buttons; reload and the order persists;
  - edit a class; the unsaved-changes guard fires when switching;
  - delete a class through the confirmation;
  - 375 px works through the sheet.
- [ ] **Step 4:** Commit `feat(manage): unified course editor content tab`.

### Task 14: Exam editor

**Files:**
- Create: `app/campus/admin/courses/[courseId]/exams/[examId]/page.tsx`, `components/features/manage/exam/{ExamSettingsForm,QuestionList,QuestionCard,BatchImportDialog}.tsx`
- Modify: `app/campus/admin/exams/[examId]/page.tsx`. It becomes a server lookup of `course_id` followed by `redirect` to the new route.
- Delete: `app/campus/admin/exams/page.tsx`

**Behaviour:**
- **Settings form:**
  - Fields: title es/en, instructions es/en, passing score (0–100), time limit (empty = none), max attempts (≥ 1).
  - PATCH to the existing exam route.
- **QuestionList:**
  - Shows inline cards. Each has statement es/en and options with an es/en text pair, a "Correcta" radio (exactly one), and add/remove buttons.
  - Saving a card PATCHes the question and PUTs/POSTs/DELETEs the options through the existing routes.
  - A card with no correct option or fewer than 2 options shows an inline error and is counted in a header warning.
- **Ordering:** reorder by drag and buttons through `questions/reorder`.
- **BatchImportDialog:** reuses the current batch format and the "copiar prompt" text from `ExamEditorPanel`. Port the parsing code, don't rewrite it.

- [ ] **Step 1:** Implement the editor.
- [ ] **Step 2:** Browser check:
  - create an exam on "Curso prueba" and add 3 questions inline, one of them deliberately with no correct option, so the warning shows;
  - fix it; batch import 2 more; reorder;
  - `/campus/admin/exams/<id>` redirects to the new URL.
- [ ] **Step 3:** Commit `feat(manage): inline exam editor inside the course`.

### Task 15: Ajustes tab, publish checklist, learner preview

**Files:**
- Create:
  - `app/campus/admin/courses/[courseId]/settings/page.tsx`
  - `components/features/manage/course/{CourseSettingsForm,PublishChecklist}.tsx`
  - `lib/campus/publish-checklist.ts`, `tests/unit/publish-checklist.test.ts`
- Modify: `lib/campus/learning.ts` (add `getPreviewOutline`), `app/campus/courses/[courseId]/learn/layout.tsx`, `learn/[classId]/page.tsx`, the exam pages, `components/features/campus/learn/{ClassroomFrame,LessonView}.tsx`

**Interfaces — Produces:**
- `type ChecklistIssue = { code: "no_modules" | "module_without_classes" | "class_without_content" | "exam_without_questions" | "question_invalid" | "final_exceeds_pool"; href: string; label: { es: string; en: string } }`.
- `publishChecklist(tree: ManageCourseTree, finalQuestionCount: number | null): ChecklistIssue[]`. It is a pure function with no imports beyond types.
- `getPreviewOutline(courseId: string): Promise<CourseOutline | null>`, wrapped in `cache()`. It is staff-only and returns null otherwise. It returns the same shape with every item unlocked, no progress, `preview: true` (new optional field on `CourseOutline`) and `enrollmentStatus: "active"`.

**Behaviour:**
- **Settings:** title, description and cover URL es/en, plus final exam (question count, passing score, time limit). It uses the course PATCH and shows "N preguntas disponibles" next to the count.
- **Publish:**
  - The header button opens the checklist. With issues, each one is a link and "Publicar" stays disabled. With none, it PATCHes `status: "published"`.
  - "Pasar a borrador" and "Archivar" sit in an overflow menu.
- **Preview:**
  - The header "Vista previa" opens `/campus/courses/:id/learn?preview=1`.
  - The learn layout uses `getPreviewOutline` when `preview=1` and the user is staff.
  - ClassroomFrame shows an amber "Vista previa — no se guarda progreso" ribbon.
  - LessonView hides the complete buttons.
  - The exam runner gets `preview: true`.

- [ ] **Step 1:** Unit tests for `publishChecklist`:
  - an empty tree gives `["no_modules"]`;
  - a module with no classes gives `module_without_classes`;
  - a class with neither video nor content gives `class_without_content`;
  - an exam with 0 questions gives `exam_without_questions`;
  - a question with 2 correct options gives `question_invalid`;
  - a final count of 10 with a pool of 3 gives `final_exceeds_pool`;
  - the valid seed-like tree gives `[]`.
- [ ] **Step 2:** Run `pnpm test:unit`. Expected: FAIL.
- [ ] **Step 3:** Implement the checklist, settings, publish flow and preview.
- [ ] **Step 4:** Run `pnpm test:unit`. Expected: PASS.
- [ ] **Step 5:** Browser check:
  - "Curso prueba" publish is blocked; clicking an issue opens the item; after fixing, it publishes and appears in the learner catalog;
  - preview as the instructor (not enrolled) opens a lesson with the ribbon and no complete button.
- [ ] **Step 6:** Commit `feat(manage): settings, publish checklist and learner preview`.

### Task 16: M4 instructor read access and the Alumnos tab

**Files:**
- Create:
  - `supabase/migrations/20261025130000_instructor_read_all.sql`, `supabase/tests/30_instructor_read.test.sql`
  - `app/campus/admin/courses/[courseId]/learners/page.tsx`, `components/features/manage/course/{LearnerTable,EnrollByEmailDialog}.tsx`
- Modify: `lib/campus/manage.ts` (add `listCourseLearners`)

**Interfaces — Produces:**
- **M4:**
  - Drop the policies `enrollments_select_course_instructor`, `lesson_progress_select_course_instructor`, `exam_attempts_select_course_instructor` and `profiles_select_enrolled_in_my_courses`.
  - Create `*_select_instructor` replacements using `public.has_role((SELECT auth.uid()), 'instructor')`.
  - Write policies are unchanged.
- `listCourseLearners(courseId: string): Promise<{ userId; fullName; email; status; enrolledAt; progress: number; lastExam: { title: TranslatedText; score: number; passed: boolean } | null }[]>`
- **Enroll by email** is admin only. It POSTs to the existing `app/api/courses/[courseId]/enrollments/route.ts`; extend that route to accept `{ email }` for admins and return 404 `user_not_found`.

- [ ] **Step 1:** SQL tests:
  - `unassigned_instructor_reads_enrollments`: instructor2 sees Course A enrollments.
  - `student_cannot_read_others`
  - `instructor_cannot_update_enrollment_status`
- [ ] **Step 2:** Run `pnpm test:db`. Expected: FAIL on the first test.
- [ ] **Step 3:** Write and apply the migration; build the tab.
- [ ] **Step 4:** Run `pnpm test:db`. Expected: PASS.
- [ ] **Step 5:** Browser check:
  - as instructor2, Course A Alumnos lists the student with 43% (or the current seed value);
  - as admin, enroll `student2@hope.test` in Course A, and it appears;
  - a row click leads to `/campus/admin/people/<id>` (Task 17).
- [ ] **Step 6:** Commit `feat(manage): learners tab; instructors read all learner data`.

---

## Phase 6 — People

### Task 17: People list and detail

**Files:**
- Create:
  - `app/campus/admin/people/page.tsx`, `app/campus/admin/people/[userId]/page.tsx`
  - `components/features/manage/people/{PeopleFilters,PersonAccountCard,PersonCourses,PersonAttempts}.tsx`
- Modify: `lib/campus/manage.ts` (add `listPeople`, `getPerson`), `app/api/admin/users/[userId]/route.ts` (if needed)
- Delete: `app/campus/admin/(admin-only)/users/`, `app/campus/admin/(admin-only)/user-management/` (the redirects from Task 2 now apply)

**Interfaces — Produces:**
- `listPeople({ q, role, status, page }: { q?: string; role?: "admin" | "instructor" | "student"; status?: "active" | "inactive"; page: number }): Promise<{ rows: { id; fullName; email; role; isActive: boolean; courses: number; joinedAt: string }[]; total: number }>`
  - Page size 25.
  - Search is `ilike` on first name, last name and email, run server-side.
  - Filters live in URL search params.
- `getPerson(userId: string): Promise<{ profile; role; isActive; enrollments: { courseId; title; status; progress; completedAt }[]; attempts: { examId; examTitle; courseTitle; attempts: number; best: number | null; passed: boolean }[] } | null>`

**Behaviour:**
- **Detail page:**
  - **Account card** (admin only): role select via `PATCH /api/admin/users/:id/role`, plus an active toggle through ConfirmDialog.
  - **Courses:** progress bars.
  - **Attempts:** "Reiniciar intentos" per exam via the existing `reset-attempts` route, behind confirmation.
- **Instructors** see the same page without the account card.

- [ ] **Step 0:** Restyle `NewsletterAdminPanel`'s page shell with `CampusPageHeader`, `Surface` and `Field`. The behaviour and API stay the same; this is the spec's "retoque visual".
- [ ] **Step 1:** Implement the list and detail; delete the old pages.
- [ ] **Step 2:** Browser checks:
  - as admin: search "student" finds 2; filter by role; change student2 to instructor and back; deactivate then reactivate; reset student's module 1 attempts, then the outline relocks module 2 for student;
  - as instructor: no account card;
  - `/campus/admin/users` and `/campus/admin/user-management/<id>` redirect.
- [ ] **Step 3:** Commit `feat(manage): people directory and person detail`.

---

## Phase 7 — Cleanup and handoff

### Task 18: Cleanup, M5, full verification, PR

**Files:**
- Create: `supabase/migrations/20261025140000_remove_default_admin.sql`. It deletes from `auth.users` where `email = 'test.admin@test.com'` (cascades to the profile).
- Delete:
  - `components/features/admin/{CourseDetailPanel,CoursesPanel,ExamsListPanel,ExamEditorPanel,UsersPanel,UserManagementPanel,UserAcademicDetail,RolesPanel,PublishValidationModal}.tsx`
  - `app/api/admin/roles/**`
  - `app/api/admin/user-management/route.ts`, if unused after Task 17 (keep `[userId]/reset-attempts` and `[userId]/academic` only if referenced)
  - `app/campus/admin/exams/page.tsx`, if still present
  - The temporary showcase block in `/componentsdev`
- Modify:
  - `lib/i18n/translations.ts`: remove keys no longer referenced; check each with `grep -r "<ns>.<key>"` before deleting.
  - `types/supabase.generated.ts`: `pnpm db:types:local`.
  - `README.md`: test commands and local accounts.

- [ ] **Step 1:** Delete the dead code. For each file, run `grep -rn <ComponentName> app components lib` and confirm it returns nothing before deleting.
- [ ] **Step 2:** Apply M5 locally. Run `pnpm test:db`, `pnpm test:unit`, `pnpm exec tsc --noEmit`, `pnpm lint` and `pnpm build`. Expected: every one passes with zero lint errors in files touched by this plan.
- [ ] **Step 3:** Full browser run, per the spec section 5 diagrams, at 1280 px and 375 px:
  - **Learner (new account):** sign up → enroll in Course A → lessons → module exams → final → certificate → public verify.
  - **Instructor:** create a course → build it → publish checklist → publish → preview.
  - **Admin:** people → role change → reset attempts.
  - Stop any video played.
- [ ] **Step 4:** Commit `chore: remove legacy admin panels and dead routes; drop default admin`. Push, then update the PR #4 description with the deploy order:
  1. `supabase db push`, which applies 20261024120000, 20261024130000 and the five 20261025* migrations;
  2. deploy the app;
  3. smoke-test login, an exam and a certificate in production.

---

## Execution note

Applying the migrations to production (`supabase db push`) and deploying are **not** part of this plan. They happen afterwards, with the user, as spec §9 step 8.
