/**
 * Thin client for the existing `/api/courses/...` route handlers used by the course
 * and exam editors. Responses follow `{ data }` / `{ error: { code, message } }`.
 */

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; code: string; message: string };

export async function api<T = unknown>(
  url: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
  body?: unknown,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.status === 204) return { ok: true, data: undefined as T };
    const json = (await res.json().catch(() => ({}))) as {
      data?: T;
      error?: { code?: string; message?: string };
    };
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        code: json.error?.code ?? "error",
        message: json.error?.message ?? res.statusText,
      };
    }
    return { ok: true, data: json.data as T };
  } catch (err) {
    return { ok: false, status: 0, code: "network", message: err instanceof Error ? err.message : "Network error" };
  }
}

/** Route builders for one course (mirrors `app/api/courses/[courseId]/**`). */
export function courseRoutes(courseId: string) {
  const c = `/api/courses/${courseId}`;
  const s = (subjectId: string) => `${c}/subjects/${subjectId}`;
  const e = (subjectId: string, examId: string) => `${s(subjectId)}/exams/${examId}`;
  const q = (subjectId: string, examId: string, questionId: string) => `${e(subjectId, examId)}/questions/${questionId}`;
  return {
    course: c,
    enrollments: `${c}/enrollments`,
    subjects: `${c}/subjects`,
    subjectsReorder: `${c}/subjects/reorder`,
    subject: s,
    classes: (subjectId: string) => `${s(subjectId)}/classes`,
    classesReorder: (subjectId: string) => `${s(subjectId)}/classes/reorder`,
    class: (subjectId: string, classId: string) => `${s(subjectId)}/classes/${classId}`,
    exams: (subjectId: string) => `${s(subjectId)}/exams`,
    exam: e,
    questions: (subjectId: string, examId: string) => `${e(subjectId, examId)}/questions`,
    questionsReorder: (subjectId: string, examId: string) => `${e(subjectId, examId)}/questions/reorder`,
    questionsBatch: (subjectId: string, examId: string) => `${e(subjectId, examId)}/questions/batch`,
    question: q,
    options: (subjectId: string, examId: string, questionId: string) => `${q(subjectId, examId, questionId)}/options`,
    option: (subjectId: string, examId: string, questionId: string, optionId: string) =>
      `${q(subjectId, examId, questionId)}/options/${optionId}`,
  };
}

/** Admin editor URLs. */
export const manageHref = {
  courses: "/campus/admin/courses",
  course: (courseId: string, item?: string) =>
    `/campus/admin/courses/${courseId}${item ? `?item=${item}` : ""}`,
  settings: (courseId: string) => `/campus/admin/courses/${courseId}/settings`,
  learners: (courseId: string) => `/campus/admin/courses/${courseId}/learners`,
  lesson: (courseId: string, classId: string) => `/campus/admin/courses/${courseId}/lessons/${classId}`,
  exam: (courseId: string, examId: string) => `/campus/admin/courses/${courseId}/exams/${examId}`,
  preview: (courseId: string) => `/campus/courses/${courseId}/learn?preview=1`,
  person: (userId: string) => `/campus/admin/people/${userId}`,
};

/** Trimmed es/en pair, dropping empty locales (the API rejects empty strings). */
export function cleanText(es: string, en: string): { es?: string; en?: string } {
  const out: { es?: string; en?: string } = {};
  if (es.trim()) out.es = es.trim();
  if (en.trim()) out.en = en.trim();
  return out;
}

/** Optional description: null when both locales are empty. */
export function cleanOptionalText(es: string, en: string) {
  const t = cleanText(es, en);
  return t.es || t.en ? t : null;
}
