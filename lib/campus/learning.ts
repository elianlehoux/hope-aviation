import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { TranslatedText } from "@/types/database";

/**
 * Learner classroom data. One course-tree query (light columns only) runs in parallel
 * with the enrollment lookup, and everything is memoized per request so the learn
 * layout and the page share it.
 */

export type OutlineItem =
  | {
      kind: "class";
      id: string;
      href: string;
      title: TranslatedText;
      durationMinutes: number | null;
      hasVideo: boolean;
      hasText: boolean;
      completed: boolean;
      locked: boolean;
      moduleIndex: number;
    }
  | {
      kind: "exam";
      id: string;
      href: string;
      title: TranslatedText;
      passed: boolean;
      attemptsUsed: number;
      maxAttempts: number;
      locked: boolean;
      moduleIndex: number;
    }
  | {
      kind: "final";
      id: "final-exam";
      href: string;
      title: TranslatedText;
      passed: boolean;
      locked: boolean;
      moduleIndex: number;
    };

export type OutlineModule = {
  id: string;
  index: number;
  title: TranslatedText;
  locked: boolean;
  passed: boolean;
  items: OutlineItem[];
};

export type CourseOutline = {
  courseId: string;
  title: TranslatedText;
  enrollmentStatus: "active" | "completed";
  modules: OutlineModule[];
  /** Every navigable item in order, including the final exam when configured. */
  items: OutlineItem[];
  progress: number;
  finalExam: { questionCount: number; passingScore: number; timeLimitMinutes: number | null } | null;
};

type Attempt = { passed: boolean | null; finished_at: string | null };

type CourseTreeRow = {
  id: string;
  title: TranslatedText;
  final_exam_question_count: number | null;
  final_exam_passing_score: number | null;
  final_exam_time_limit_minutes: number | null;
  subjects: {
    id: string;
    title: TranslatedText;
    order_index: number | null;
    classes: {
      id: string;
      title: TranslatedText;
      duration_minutes: number | null;
      video_url: string | null;
      has_content: boolean | null;
      order_index: number | null;
      lesson_progress: { is_completed: boolean }[];
    }[];
    exams: {
      id: string;
      title: TranslatedText;
      max_attempts: number;
      order_index: number | null;
      exam_attempts: Attempt[];
    }[];
  }[];
};

const byOrder = <T extends { order_index: number | null; id: string }>(a: T, b: T) =>
  (a.order_index ?? Number.MAX_SAFE_INTEGER) - (b.order_index ?? Number.MAX_SAFE_INTEGER) ||
  a.id.localeCompare(b.id);

/**
 * Signed-in user for this request, shared by every caller. Uses getClaims, which verifies
 * the JWT locally when the project has asymmetric signing keys (no Auth round trip) and
 * falls back to the Auth server otherwise.
 */
export const getLearnerUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const user = claims?.sub
    ? {
        id: claims.sub as string,
        email: (claims.email as string | undefined) ?? undefined,
        user_metadata: (claims.user_metadata as Record<string, unknown> | undefined) ?? {},
      }
    : null;
  return { supabase, user };
});

/** Role slugs of the current user (memoized per request). */
export const getUserRoles = cache(async (): Promise<string[]> => {
  const { supabase, user } = await getLearnerUser();
  if (!user) return [];
  const { data } = await supabase.from("roles_users").select("roles(slug)").eq("user_id", user.id);
  return (data ?? [])
    .map((r) => {
      const rel = r.roles as { slug?: string } | { slug?: string }[] | null;
      return Array.isArray(rel) ? rel[0]?.slug : rel?.slug;
    })
    .filter((s): s is string => Boolean(s));
});

export const getCourseOutline = cache(async (courseId: string): Promise<CourseOutline | null> => {
  const { supabase, user } = await getLearnerUser();
  if (!user) return null;

  const [courseRes, enrollmentRes] = await Promise.all([
    supabase
      .from("courses")
      .select(
        `id, title, final_exam_question_count, final_exam_passing_score, final_exam_time_limit_minutes,
         subjects (
           id, title, order_index,
           classes ( id, title, duration_minutes, video_url, has_content, order_index, lesson_progress ( is_completed ) ),
           exams ( id, title, max_attempts, order_index, exam_attempts ( passed, finished_at ) )
         )`,
      )
      .eq("id", courseId)
      .eq("subjects.classes.lesson_progress.user_id", user.id)
      .eq("subjects.exams.exam_attempts.user_id", user.id)
      .maybeSingle(),
    supabase
      .from("enrollments")
      .select("status")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle(),
  ]);

  const course = courseRes.data as CourseTreeRow | null;
  const status = enrollmentRes.data?.status;
  if (!course || (status !== "active" && status !== "completed")) return null;

  const base = `/campus/courses/${courseId}/learn`;
  const subjects = [...(course.subjects ?? [])].sort(byOrder);

  const modules: OutlineModule[] = [];
  let unlocked = true;

  subjects.forEach((subject, index) => {
    const exams = [...(subject.exams ?? [])].sort(byOrder);
    const passed = exams.every((e) => e.exam_attempts?.some((a) => a.passed === true));
    const locked = !unlocked;

    const items: OutlineItem[] = [
      ...[...(subject.classes ?? [])].sort(byOrder).map(
        (c): OutlineItem => ({
          kind: "class",
          id: c.id,
          href: `${base}/${c.id}`,
          title: c.title,
          durationMinutes: c.duration_minutes,
          hasVideo: Boolean(c.video_url),
          hasText: Boolean(c.has_content),
          completed: Boolean(c.lesson_progress?.some((p) => p.is_completed)),
          locked,
          moduleIndex: index,
        }),
      ),
      ...exams.map(
        (e): OutlineItem => ({
          kind: "exam",
          id: e.id,
          href: `${base}/exam/${e.id}`,
          title: e.title,
          passed: Boolean(e.exam_attempts?.some((a) => a.passed === true)),
          attemptsUsed: (e.exam_attempts ?? []).filter((a) => a.finished_at).length,
          maxAttempts: e.max_attempts,
          locked,
          moduleIndex: index,
        }),
      ),
    ];

    modules.push({ id: subject.id, index, title: subject.title, locked, passed, items });
    if (!passed) unlocked = false;
  });

  const items = modules.flatMap((m) => m.items);

  const finalExam =
    (course.final_exam_question_count ?? 0) > 0
      ? {
          questionCount: course.final_exam_question_count ?? 0,
          passingScore: course.final_exam_passing_score ?? 70,
          timeLimitMinutes: course.final_exam_time_limit_minutes,
        }
      : null;

  if (finalExam) {
    items.push({
      kind: "final",
      id: "final-exam",
      href: `${base}/final-exam`,
      title: { es: "Examen final", en: "Final exam" },
      passed: status === "completed",
      locked: !unlocked,
      moduleIndex: modules.length,
    });
  }

  const done = items.filter((i) =>
    i.kind === "class" ? i.completed : i.passed,
  ).length;

  return {
    courseId,
    title: course.title,
    enrollmentStatus: status,
    modules,
    items,
    progress: items.length ? Math.round((done / items.length) * 100) : 0,
    finalExam,
  };
});

/** Previous / next navigable items around `id` in the outline. */
export function neighbours(outline: CourseOutline, id: string) {
  const index = outline.items.findIndex((i) => i.id === id);
  return {
    item: index >= 0 ? outline.items[index] : null,
    previous: index > 0 ? outline.items[index - 1] : null,
    next: index >= 0 && index < outline.items.length - 1 ? outline.items[index + 1] : null,
  };
}

/** First item a learner should open: the first incomplete, unlocked one. */
export function resumeItem(outline: CourseOutline) {
  return (
    outline.items.find((i) => !i.locked && (i.kind === "class" ? !i.completed : !i.passed)) ??
    outline.items[0] ??
    null
  );
}
