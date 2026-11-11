import { notFound, redirect } from "next/navigation";
import {
  completesCourse,
  getLearnerUser,
  neighbours,
  resumeItem,
  type CourseOutline,
} from "@/lib/campus/learning";
import { ExamRunner } from "@/components/features/campus/exam/ExamRunner";
import type { TranslatedText } from "@/types/database";

type AttemptRow = {
  score: number | null;
  passed: boolean | null;
  started_at: string;
  finished_at: string | null;
};

function summarize(rows: AttemptRow[]) {
  const finished = rows.filter((r) => r.finished_at);
  const open = rows
    .filter((r) => !r.finished_at)
    .sort((a, b) => b.started_at.localeCompare(a.started_at))[0];
  const scores = finished.map((r) => r.score).filter((s): s is number => typeof s === "number");
  return {
    attemptsUsed: finished.length,
    bestScore: scores.length ? Math.max(...scores) : null,
    passed: finished.some((r) => r.passed === true),
    openStartedAt: open?.started_at ?? null,
  };
}

/** Module exam inside the classroom (learner, or staff preview with nothing recorded). */
export async function ModuleExamScreen({
  outline,
  examId,
  preview,
}: {
  outline: CourseOutline;
  examId: string;
  preview: boolean;
}) {
  const { item, next } = neighbours(outline, examId);
  if (!item || item.kind !== "exam") notFound();
  if (item.locked) redirect(resumeItem(outline)?.href ?? `/campus/courses/${outline.courseId}`);

  const { supabase, user } = await getLearnerUser();
  if (!user) redirect("/auth/login?clear=1");

  const [examRes, countRes, attemptsRes] = await Promise.all([
    supabase
      .from("exams")
      .select("id, title, description, passing_score, time_limit_minutes, max_attempts")
      .eq("id", examId)
      .maybeSingle(),
    supabase.from("questions").select("id", { count: "exact", head: true }).eq("exam_id", examId),
    preview
      ? Promise.resolve({ data: [] as AttemptRow[] })
      : supabase
          .from("exam_attempts")
          .select("score, passed, started_at, finished_at")
          .eq("exam_id", examId)
          .eq("user_id", user.id),
  ]);

  const exam = examRes.data;
  if (!exam) notFound();
  const summary = summarize((attemptsRes.data ?? []) as AttemptRow[]);
  const moduleNumber = item.moduleIndex + 1;

  return (
    <ExamRunner
      key={examId}
      kind="module"
      courseId={outline.courseId}
      startUrl={`/api/exams/${examId}/start`}
      submitUrl={`/api/exams/${examId}/attempts`}
      intro={{
        title: exam.title as TranslatedText,
        eyebrow: { es: `Evaluación · Módulo ${moduleNumber}`, en: `Assessment · Module ${moduleNumber}` },
        instructions: (exam.description as TranslatedText | null) ?? null,
        questionCount: countRes.count ?? 0,
        timeLimitMinutes: exam.time_limit_minutes,
        passingScore: exam.passing_score,
        attemptsUsed: summary.attemptsUsed,
        maxAttempts: exam.max_attempts,
        bestScore: summary.bestScore,
        passed: summary.passed,
      }}
      next={next ? { href: next.href, title: next.title } : null}
      openAttemptStartedAt={summary.openStartedAt}
      completesCourse={completesCourse(outline, examId)}
      preview={preview}
    />
  );
}

/** Course final exam (random paper drawn on the server when it starts). */
export async function FinalExamScreen({ outline, preview }: { outline: CourseOutline; preview: boolean }) {
  const final = outline.items.find((i) => i.kind === "final");
  if (!outline.finalExam || !final) notFound();
  if (final.locked) redirect(resumeItem(outline)?.href ?? `/campus/courses/${outline.courseId}`);

  const { supabase, user } = await getLearnerUser();
  if (!user) redirect("/auth/login?clear=1");

  const sessionsRes = preview
    ? { data: [] as AttemptRow[] }
    : await supabase
        .from("final_exam_sessions")
        .select("score, passed, started_at, finished_at")
        .eq("course_id", outline.courseId)
        .eq("user_id", user.id);
  const summary = summarize((sessionsRes.data ?? []) as AttemptRow[]);

  return (
    <ExamRunner
      key="final-exam"
      kind="final"
      courseId={outline.courseId}
      startUrl={`/api/courses/${outline.courseId}/final-exam/start`}
      submitUrl={`/api/courses/${outline.courseId}/final-exam/submit`}
      intro={{
        title: { es: "Examen final", en: "Final exam" },
        eyebrow: outline.title,
        instructions: {
          es: "Preguntas al azar de todos los módulos del curso. Si aprobás, completás el curso y obtenés tu certificado.",
          en: "Random questions from every module of the course. Pass it to complete the course and get your certificate.",
        },
        questionCount: outline.finalExam.questionCount,
        timeLimitMinutes: outline.finalExam.timeLimitMinutes,
        passingScore: outline.finalExam.passingScore,
        attemptsUsed: summary.attemptsUsed,
        maxAttempts: null,
        bestScore: summary.bestScore,
        passed: !preview && outline.enrollmentStatus === "completed",
      }}
      next={null}
      openAttemptStartedAt={summary.openStartedAt}
      preview={preview}
    />
  );
}
