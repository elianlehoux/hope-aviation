/**
 * Canonical Next.js API paths for client/server fetch calls.
 * Keep in sync with handlers under `app/api`.
 */

const q = (params: Record<string, string | undefined>) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
};

export const apiRoutes = {
  authMe: () => "/api/auth/me",
  /** Current user's profile (GET/PATCH). */
  meProfile: () => "/api/me/profile",
  /** Learner: own attempts + limits for an exam. */
  examAttempts: (examId: string) => `/api/exams/${examId}/attempts`,
  /** GET exam paper (questions) for a learner. */
  examPaper: (examId: string) => `/api/exams/${examId}/paper`,
  /** Admin or course instructor: all attempts for an exam. */
  courseExamAttempts: (courseId: string, examId: string) =>
    `/api/courses/${courseId}/exams/${examId}/attempts`,
  /** Aggregated lesson progress for a course (optional `user_id` for staff). */
  courseProgress: (courseId: string, opts?: { userId?: string }) =>
    `/api/courses/${courseId}/progress${q(opts?.userId ? { user_id: opts.userId } : {})}`,
  /** Single-class progress (GET/PUT). */
  classProgress: (
    courseId: string,
    subjectId: string,
    classId: string,
  ) =>
    `/api/courses/${courseId}/subjects/${subjectId}/classes/${classId}/progress`,
  enrollmentById: (enrollmentId: string) => `/api/enrollments/${enrollmentId}`,
  enrollments: () => "/api/enrollments",
  courseEnrollments: (courseId: string) => `/api/courses/${courseId}/enrollments`,
  courseTree: (courseId: string) => `/api/courses/${courseId}/tree`,
} as const;
