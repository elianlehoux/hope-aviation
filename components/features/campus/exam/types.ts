import type { TranslatedText } from "@/types/database";

/** One question of a paper as the learner sees it: never includes `is_correct`. */
export type PaperQuestion = {
  id: string;
  content: TranslatedText;
  options: { id: string; content: TranslatedText }[];
};

/** Structurally identical to `ExamPaper` in `lib/campus/exam-paper.ts` (start endpoints). */
export type ExamPaper = {
  attemptId: string;
  startedAt: string;
  deadline: string | null;
  questions: PaperQuestion[];
};

export type ExamOutcome = { score: number; passed: boolean; correct: number; total: number };

export type ExamIntroData = {
  title: TranslatedText;
  /** Small line above the title, e.g. "Módulo 2". */
  eyebrow: TranslatedText | null;
  instructions: TranslatedText | null;
  questionCount: number;
  timeLimitMinutes: number | null;
  passingScore: number;
  attemptsUsed: number;
  /** null = unlimited (final exam). */
  maxAttempts: number | null;
  bestScore: number | null;
  /** Already passed (module exam) or course completed (final exam). */
  passed: boolean;
};

export type ExamRunnerProps = {
  kind: "module" | "final";
  courseId: string;
  startUrl: string;
  submitUrl: string;
  intro: ExamIntroData;
  /** Next outline item, shown as the call to action after a pass. */
  next: { href: string; title: TranslatedText } | null;
  /** Start time of an attempt left open (reload / closed tab); the runner resumes it. */
  openAttemptStartedAt: string | null;
  /** Staff preview: the paper renders read-only and nothing is recorded. */
  preview: boolean;
};
