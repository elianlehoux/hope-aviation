import { cache } from "react";
import { redirect } from "next/navigation";
import { getLearnerUser, getUserRoles } from "@/lib/campus/learning";
import type { TranslatedText } from "@/types/database";

/**
 * People directory data for staff. Reads run with the user's session, so RLS decides
 * which profiles, enrollments and attempts are visible (admins see everyone; instructors
 * see learners once `instructor_read_all` is applied). Role data (`roles_users`) is only
 * readable by admins, so role columns and filters are admin-only.
 */

export const PEOPLE_PAGE_SIZE = 25;

export type PersonRole = "admin" | "instructor" | "student";
export type PersonStatus = "active" | "inactive";

export type PeopleRow = {
  id: string;
  fullName: string;
  email: string;
  role: PersonRole | null;
  isActive: boolean;
  courses: number;
  joinedAt: string;
};

export type PersonEnrollment = {
  courseId: string;
  title: TranslatedText;
  status: "active" | "completed" | "cancelled";
  progress: number;
  completedAt: string | null;
};

export type PersonExamAttempts = {
  examId: string;
  examTitle: TranslatedText;
  courseId: string;
  courseTitle: TranslatedText;
  attempts: number;
  maxAttempts: number;
  best: number | null;
  passed: boolean;
};

export type PersonDetail = {
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    createdAt: string;
  };
  role: PersonRole | null;
  isActive: boolean;
  enrollments: PersonEnrollment[];
  attempts: PersonExamAttempts[];
  /** Assignable roles (admin only; empty for instructors). */
  roles: { id: string; slug: PersonRole; name: string }[];
};

const ROLE_SLUGS: PersonRole[] = ["admin", "instructor", "student"];

function asRole(slug: unknown): PersonRole | null {
  return typeof slug === "string" && (ROLE_SLUGS as string[]).includes(slug) ? (slug as PersonRole) : null;
}

/** Unwraps a PostgREST embed that may come back as an object or a one-element array. */
function one<T>(rel: T | T[] | null | undefined): T | null {
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel ?? null;
}

function roleFromEmbed(rolesUsers: unknown): PersonRole | null {
  const ru = one(rolesUsers as { roles?: unknown } | { roles?: unknown }[] | null);
  const role = one(ru?.roles as { slug?: string } | { slug?: string }[] | null | undefined);
  return asRole(role?.slug);
}

function fullName(first: string | null, last: string | null, email: string) {
  const name = `${first ?? ""} ${last ?? ""}`.trim();
  return name || email;
}

/** Strips PostgREST filter metacharacters so user input cannot alter the `or()` expression. */
function searchTokens(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .slice(0, 100)
    .replace(/[%_,().*\\]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3);
}

/** Staff guard for people pages: redirects non-staff to /campus. */
export const requireStaffForPeople = cache(async () => {
  const { supabase, user } = await getLearnerUser();
  if (!user) redirect("/auth/login?clear=1");
  const roles = await getUserRoles();
  const isAdmin = roles.includes("admin");
  if (!isAdmin && !roles.includes("instructor")) redirect("/campus");
  return { supabase, userId: user.id, isAdmin };
});

export async function listPeople({
  q,
  role,
  status,
  page,
}: {
  q?: string;
  role?: PersonRole;
  status?: PersonStatus;
  page: number;
}): Promise<{ rows: PeopleRow[]; total: number }> {
  const { supabase, isAdmin } = await requireStaffForPeople();
  const safePage = Math.max(1, Math.floor(page) || 1);
  const from = (safePage - 1) * PEOPLE_PAGE_SIZE;
  const filterRole = isAdmin && role ? role : undefined;

  const roleEmbed = filterRole ? "roles_users!inner(roles!inner(slug))" : "roles_users(roles(slug))";
  let query = supabase
    .from("profiles")
    .select(`id, first_name, last_name, email, is_active, created_at, ${roleEmbed}, enrollments(count)`, {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, from + PEOPLE_PAGE_SIZE - 1);

  if (filterRole) query = query.eq("roles_users.roles.slug", filterRole);
  if (status) query = query.eq("is_active", status === "active");
  // Each word must match first name, last name or email (so "ana perez" finds Ana Pérez).
  const tokens = searchTokens(q);
  if (tokens.length > 0) {
    const clause = (t: string) => `first_name.ilike.%${t}%,last_name.ilike.%${t}%,email.ilike.%${t}%`;
    query = query.or(tokens.length === 1 ? clause(tokens[0]) : `and(${tokens.map((t) => `or(${clause(t)})`).join(",")})`);
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const rows: PeopleRow[] = (data ?? []).map((p) => {
    const enrollments = one(p.enrollments as { count: number } | { count: number }[] | null);
    return {
      id: p.id as string,
      fullName: fullName(p.first_name, p.last_name, p.email),
      email: p.email as string,
      role: roleFromEmbed(p.roles_users),
      isActive: Boolean(p.is_active),
      courses: enrollments?.count ?? 0,
      joinedAt: p.created_at as string,
    };
  });

  return { rows, total: count ?? rows.length };
}

type ExamRow = {
  id: string;
  title: TranslatedText;
  max_attempts: number;
  order_index: number | null;
  course_id: string;
  subjects: { order_index: number | null } | { order_index: number | null }[] | null;
  courses: { title: TranslatedText } | { title: TranslatedText }[] | null;
};

export const getPerson = cache(async (userId: string): Promise<PersonDetail | null> => {
  const { supabase, isAdmin } = await requireStaffForPeople();

  const [profileRes, enrollmentsRes, attemptsRes, progressRes, rolesRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, first_name, last_name, email, avatar_url, created_at, is_active, roles_users(roles(slug))")
      .eq("id", userId)
      .maybeSingle(),
    // `*` so `completed_at` is picked up once the certificates migration adds it.
    supabase.from("enrollments").select("*, courses(id, title)").eq("user_id", userId).order("enrolled_at"),
    supabase.from("exam_attempts").select("exam_id, score, passed, finished_at").eq("user_id", userId),
    supabase
      .from("lesson_progress")
      .select("class_id, classes!inner(subjects!inner(course_id))")
      .eq("user_id", userId)
      .eq("is_completed", true),
    isAdmin ? supabase.from("roles").select("id, slug, name") : Promise.resolve({ data: [] }),
  ]);

  if (profileRes.error) throw new Error(profileRes.error.message);
  const p = profileRes.data;
  if (!p) return null;

  // Lesson totals per enrolled course, to turn completed lessons into a percentage.
  const enrollmentRows = (enrollmentsRes.data ?? []) as Record<string, unknown>[];
  const courseIds = enrollmentRows.map((e) => e.course_id as string);
  const examIds = [...new Set((attemptsRes.data ?? []).map((a) => a.exam_id as string))];

  const [classesRes, examsRes] = await Promise.all([
    courseIds.length
      ? supabase.from("classes").select("id, subjects!inner(course_id)").in("subjects.course_id", courseIds)
      : Promise.resolve({ data: [] as { id: string; subjects: unknown }[] }),
    examIds.length
      ? supabase
          .from("exams")
          .select("id, title, max_attempts, order_index, course_id, subjects(order_index), courses(title)")
          .in("id", examIds)
      : Promise.resolve({ data: [] as ExamRow[] }),
  ]);

  const courseOf = (subjects: unknown) =>
    one(subjects as { course_id: string } | { course_id: string }[] | null)?.course_id;

  const totalByCourse = new Map<string, number>();
  for (const c of classesRes.data ?? []) {
    const id = courseOf(c.subjects);
    if (id) totalByCourse.set(id, (totalByCourse.get(id) ?? 0) + 1);
  }
  const doneByCourse = new Map<string, number>();
  for (const lp of progressRes.data ?? []) {
    const cls = one(lp.classes as { subjects: unknown } | { subjects: unknown }[] | null);
    const id = courseOf(cls?.subjects);
    if (id) doneByCourse.set(id, (doneByCourse.get(id) ?? 0) + 1);
  }

  const enrollments: PersonEnrollment[] = enrollmentRows.map((e) => {
    const courseId = e.course_id as string;
    const status = e.status as PersonEnrollment["status"];
    const total = totalByCourse.get(courseId) ?? 0;
    const done = doneByCourse.get(courseId) ?? 0;
    const course = one(e.courses as { title: TranslatedText } | { title: TranslatedText }[] | null);
    return {
      courseId,
      title: course?.title ?? {},
      status,
      progress: status === "completed" ? 100 : total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0,
      completedAt: (e.completed_at as string | null | undefined) ?? null,
    };
  });

  const exams = new Map((examsRes.data as ExamRow[] | null ?? []).map((ex) => [ex.id, ex]));
  const grouped = new Map<string, { attempts: number; best: number | null; passed: boolean }>();
  for (const a of attemptsRes.data ?? []) {
    const g = grouped.get(a.exam_id) ?? { attempts: 0, best: null, passed: false };
    g.attempts += 1;
    if (a.finished_at && typeof a.score === "number") g.best = Math.max(g.best ?? 0, a.score);
    if (a.passed) g.passed = true;
    grouped.set(a.exam_id, g);
  }

  // Course, then module order, then exam order within the module.
  const sortKey = (examId: string) => {
    const ex = exams.get(examId);
    return [ex?.course_id ?? "", one(ex?.subjects)?.order_index ?? 0, ex?.order_index ?? 0] as const;
  };
  const attempts: PersonExamAttempts[] = [...grouped.keys()]
    .sort((x, y) => {
      const [ca, sa, oa] = sortKey(x);
      const [cb, sb, ob] = sortKey(y);
      return ca.localeCompare(cb) || sa - sb || oa - ob;
    })
    .map((examId) => {
      const g = grouped.get(examId)!;
      const ex = exams.get(examId);
      return {
        examId,
        examTitle: ex?.title ?? {},
        courseId: ex?.course_id ?? "",
        courseTitle: one(ex?.courses)?.title ?? {},
        attempts: g.attempts,
        maxAttempts: ex?.max_attempts ?? 1,
        best: g.best === null ? null : Math.round(g.best),
        passed: g.passed,
      };
    });

  const roles = ((rolesRes.data ?? []) as { id: string; slug: string; name: string }[])
    .map((r) => ({ id: r.id, slug: asRole(r.slug), name: r.name }))
    .filter((r): r is { id: string; slug: PersonRole; name: string } => r.slug !== null)
    .sort((a, b) => ROLE_SLUGS.indexOf(b.slug) - ROLE_SLUGS.indexOf(a.slug));

  return {
    profile: {
      id: p.id,
      firstName: p.first_name ?? "",
      lastName: p.last_name ?? "",
      fullName: fullName(p.first_name, p.last_name, p.email),
      email: p.email,
      avatarUrl: p.avatar_url ?? null,
      createdAt: p.created_at,
    },
    role: roleFromEmbed(p.roles_users),
    isActive: Boolean(p.is_active),
    enrollments,
    attempts,
    roles,
  };
});
