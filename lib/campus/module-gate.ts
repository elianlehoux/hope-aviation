/**
 * Shared module-gating rules for the learner classroom.
 * A subject with exams is passed only when every exam has at least one passed attempt.
 * A subject without exams is passed when every one of its classes is completed
 * (an empty subject, with neither exams nor classes, counts as passed).
 */

export type GateExam = {
  exam_attempts?: { passed: boolean | null }[] | null;
};

export type GateClass = {
  lesson_progress?: { is_completed: boolean }[] | null;
};

export type GateSubject = {
  exams?: GateExam[] | null;
  classes?: GateClass[] | null;
};

export function subjectExamsPassed(subject: GateSubject): boolean {
  const exams = subject.exams ?? [];
  if (exams.length === 0) return true;
  return exams.every((exam) => (exam.exam_attempts ?? []).some((attempt) => attempt.passed === true));
}

export function subjectPassed(subject: GateSubject): boolean {
  const exams = subject.exams ?? [];
  if (exams.length > 0) return subjectExamsPassed(subject);
  return (subject.classes ?? []).every((c) => (c.lesson_progress ?? []).some((p) => p.is_completed === true));
}

export function isSubjectUnlocked(subjects: GateSubject[], index: number): boolean {
  if (index <= 0) return true;
  return subjects.slice(0, index).every(subjectPassed);
}

export function allModuleExamsPassed(subjects: GateSubject[]): boolean {
  return subjects.every(subjectPassed);
}
