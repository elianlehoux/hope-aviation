import { cache } from "react";
import { redirect } from "next/navigation";
import { getLearnerUser, getUserRoles } from "@/lib/campus/learning";
import { readingMinutes } from "@/lib/campus/lesson-blocks";
import { summarizeQuestions } from "@/lib/campus/publish-checklist";
import type {
  Class,
  Course,
  CourseStatus,
  EnrollmentStatus,
  Exam,
  Option,
  Question,
  Subject,
  TranslatedText,
} from "@/types/database";

/**
 * Server loaders for the staff course editor. Same pattern as the classroom:
 * memoized per request with `cache()`, light columns, parallel queries.
 * RLS stays the authorization layer; `requireStaff` only keeps the UI honest.
 */

export type ManageClass = Pick<
  Class,
  "id" | "subject_id" | "title" | "description" | "video_url" | "resource_url" | "duration_minutes" | "order_index"
> & { has_content: boolean; reading_minutes: number | null };

export type ManageExam = Pick<
  Exam,
  | "id"
  | "course_id"
  | "subject_id"
  | "title"
  | "description"
  | "passing_score"
  | "time_limit_minutes"
  | "max_attempts"
  | "order_index"
> & { questionCount: number; invalidQuestionCount: number };

export type ManageSubject = Pick<Subject, "id" | "course_id" | "title" | "description" | "order_index"> & {
  classes: ManageClass[];
  exams: ManageExam[];
};

/** Mirrors `/api/courses/[id]/tree`, plus content flags and question health per exam. */
export type ManageCourseTree = {
  course: Course & { total_questions_count: number };
  subjects: ManageSubject[];
};

export type ManagedCourseRow = {
  id: string;
  title: TranslatedText;
  status: CourseStatus;
  moduleCount: number;
  lessonCount: number;
  learnerCount: number;
  updatedAt: string;
};

export type ExamEditorQuestion = Pick<Question, "id" | "content" | "points" | "order_index"> & {
  options: Pick<Option, "id" | "content" | "is_correct">[];
};

export type ExamEditorData = {
  courseId: string;
  courseTitle: TranslatedText;
  subjectTitle: TranslatedText;
  exam: ManageExam;
  questions: ExamEditorQuestion[];
};

export type CourseLearnerRow = {
  userId: string;
  fullName: string;
  email: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  progress: number;
  lastExam: { title: TranslatedText; score: number; passed: boolean } | null;
};

type Ordered = { order_index: number | null; id: string; created_at?: string | null };

const byOrder = (a: Ordered, b: Ordered) =>
  (a.order_index ?? Number.MAX_SAFE_INTEGER) - (b.order_index ?? Number.MAX_SAFE_INTEGER) ||
  (a.created_at ?? "").localeCompare(b.created_at ?? "") ||
  a.id.localeCompare(b.id);

const countOf = (rel: { count: number }[] | null | undefined) => rel?.[0]?.count ?? 0;

/** Signed-in staff (admin or instructor) or a redirect away. */
export const requireStaff = cache(async () => {
  const [{ supabase, user }, roles] = await Promise.all([getLearnerUser(), getUserRoles()]);
  if (!user) redirect("/auth/login?clear=1");
  const isAdmin = roles.includes("admin");
  if (!isAdmin && !roles.includes("instructor")) redirect("/campus");
  return { supabase, userId: user.id, isAdmin };
});

export const listManagedCourses = cache(async (): Promise<ManagedCourseRow[]> => {
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from("courses")
    .select("id, title, status, created_at, updated_at, subjects ( id, classes ( count ) ), enrollments ( count )")
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  type Row = {
    id: string;
    title: TranslatedText;
    status: CourseStatus;
    created_at: string;
    updated_at: string | null;
    subjects: { id: string; classes: { count: number }[] }[] | null;
    enrollments: { count: number }[] | null;
  };

  return ((data ?? []) as Row[]).map((c) => ({
    id: c.id,
    title: c.title,
    status: c.status,
    moduleCount: c.subjects?.length ?? 0,
    lessonCount: (c.subjects ?? []).reduce((n, s) => n + countOf(s.classes), 0),
    learnerCount: countOf(c.enrollments),
    updatedAt: c.updated_at ?? c.created_at,
  }));
});

type TreeRow = Course & {
  subjects:
    | (Pick<Subject, "id" | "course_id" | "title" | "description" | "order_index" | "created_at"> & {
        classes:
          | (Pick<
              Class,
              | "id"
              | "subject_id"
              | "title"
              | "description"
              | "video_url"
              | "resource_url"
              | "duration_minutes"
              | "order_index"
              | "created_at"
            > & { has_content: boolean | null; content: TranslatedText | null })[]
          | null;
        exams:
          | (Omit<ManageExam, "questionCount" | "invalidQuestionCount"> & {
              created_at: string;
              questions: { id: string; options: { is_correct: boolean }[] | null }[] | null;
            })[]
          | null;
      })[]
    | null;
};

export const getCourseTree = cache(async (courseId: string): Promise<ManageCourseTree | null> => {
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from("courses")
    .select(
      `id, title, description, thumbnail_url, status, final_exam_question_count, final_exam_passing_score,
       final_exam_time_limit_minutes, created_at, updated_at,
       subjects (
         id, course_id, title, description, order_index, created_at,
         classes ( id, subject_id, title, description, video_url, resource_url, duration_minutes, order_index, created_at, has_content, content ),
         exams ( id, course_id, subject_id, title, description, passing_score, time_limit_minutes, max_attempts, order_index, created_at,
                 questions ( id, options ( is_correct ) ) )
       )`,
    )
    .eq("id", courseId)
    .maybeSingle();

  const row = data as TreeRow | null;
  if (!row) return null;

  const { subjects: rawSubjects, ...course } = row;
  let total = 0;

  const subjects: ManageSubject[] = [...(rawSubjects ?? [])].sort(byOrder).map((s) => ({
    id: s.id,
    course_id: s.course_id,
    title: s.title,
    description: s.description,
    order_index: s.order_index,
    classes: [...(s.classes ?? [])].sort(byOrder).map(({ content, ...c }) => {
      const body = content?.es?.trim() || content?.en?.trim() || "";
      return { ...c, has_content: Boolean(c.has_content), reading_minutes: body ? readingMinutes(body) : null };
    }),
    exams: [...(s.exams ?? [])].sort(byOrder).map(({ questions, ...e }) => {
      const summary = summarizeQuestions(questions ?? []);
      total += summary.questionCount;
      return { ...e, ...summary };
    }),
  }));

  return { course: { ...course, total_questions_count: total }, subjects };
});

export const getExamEditor = cache(async (courseId: string, examId: string): Promise<ExamEditorData | null> => {
  const { supabase } = await requireStaff();
  const { data } = await supabase
    .from("exams")
    .select(
      `id, course_id, subject_id, title, description, passing_score, time_limit_minutes, max_attempts, order_index,
       courses ( title ), subjects ( title ),
       questions ( id, content, points, order_index, options ( id, content, is_correct ) )`,
    )
    .eq("id", examId)
    .eq("course_id", courseId)
    .maybeSingle();

  type Row = Omit<ManageExam, "questionCount" | "invalidQuestionCount"> & {
    courses: { title: TranslatedText } | { title: TranslatedText }[] | null;
    subjects: { title: TranslatedText } | { title: TranslatedText }[] | null;
    questions: (ExamEditorQuestion & { options: ExamEditorQuestion["options"] | null })[] | null;
  };
  const row = data as Row | null;
  if (!row) return null;

  const one = <T,>(rel: T | T[] | null) => (Array.isArray(rel) ? rel[0] : rel) ?? null;
  const { courses, subjects, questions: rawQuestions, ...exam } = row;
  const questions = [...(rawQuestions ?? [])]
    .sort(byOrder)
    .map((q) => ({ ...q, options: [...(q.options ?? [])].sort((a, b) => a.id.localeCompare(b.id)) }));

  return {
    courseId,
    courseTitle: one(courses)?.title ?? {},
    subjectTitle: one(subjects)?.title ?? {},
    exam: { ...exam, ...summarizeQuestions(questions) },
    questions,
  };
});

export const listCourseLearners = cache(async (courseId: string): Promise<CourseLearnerRow[]> => {
  const { supabase } = await requireStaff();
  const [enrollmentsRes, tree] = await Promise.all([
    supabase
      .from("enrollments")
      .select("user_id, status, enrolled_at, profiles ( first_name, last_name, email )")
      .eq("course_id", courseId)
      .order("enrolled_at", { ascending: false }),
    getCourseTree(courseId),
  ]);

  type Row = {
    user_id: string;
    status: EnrollmentStatus;
    enrolled_at: string;
    profiles:
      | { first_name: string | null; last_name: string | null; email: string | null }
      | { first_name: string | null; last_name: string | null; email: string | null }[]
      | null;
  };
  const enrollments = (enrollmentsRes.data ?? []) as Row[];
  if (enrollments.length === 0 || !tree) return [];

  const userIds = enrollments.map((e) => e.user_id);
  const classIds = tree.subjects.flatMap((s) => s.classes.map((c) => c.id));
  const exams = new Map(tree.subjects.flatMap((s) => s.exams.map((e) => [e.id, e.title] as const)));

  const [progressRes, attemptsRes] = await Promise.all([
    classIds.length
      ? supabase
          .from("lesson_progress")
          .select("user_id, class_id")
          .eq("is_completed", true)
          .in("class_id", classIds)
          .in("user_id", userIds)
      : Promise.resolve({ data: [] as { user_id: string; class_id: string }[] }),
    exams.size
      ? supabase
          .from("exam_attempts")
          .select("user_id, exam_id, score, passed, finished_at")
          .in("exam_id", [...exams.keys()])
          .in("user_id", userIds)
          .not("finished_at", "is", null)
          .order("finished_at", { ascending: false })
      : Promise.resolve({
          data: [] as { user_id: string; exam_id: string; score: number | null; passed: boolean | null; finished_at: string }[],
        }),
  ]);

  const completed = new Map<string, number>();
  for (const p of progressRes.data ?? []) completed.set(p.user_id, (completed.get(p.user_id) ?? 0) + 1);

  const lastExam = new Map<string, CourseLearnerRow["lastExam"]>();
  for (const a of attemptsRes.data ?? []) {
    if (lastExam.has(a.user_id)) continue;
    lastExam.set(a.user_id, {
      title: exams.get(a.exam_id) ?? {},
      score: Math.round(Number(a.score ?? 0)),
      passed: Boolean(a.passed),
    });
  }

  return enrollments.map((e) => {
    const p = Array.isArray(e.profiles) ? e.profiles[0] : e.profiles;
    const fullName = [p?.first_name, p?.last_name].filter((s) => s?.trim()).join(" ");
    return {
      userId: e.user_id,
      fullName,
      email: p?.email ?? "",
      status: e.status,
      enrolledAt: e.enrolled_at,
      progress: classIds.length ? Math.round(((completed.get(e.user_id) ?? 0) / classIds.length) * 100) : 0,
      lastExam: lastExam.get(e.user_id) ?? null,
    };
  });
});
