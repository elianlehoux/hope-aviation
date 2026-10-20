/**
 * Shared module-gating rules for the learner classroom.
 * A subject with no exams is treated as passed. A subject with exams is passed
 * only when every exam has at least one passed attempt.
 */

export type GateExam = {
  exam_attempts?: { passed: boolean | null }[] | null;
};

export type GateSubject = {
  exams?: GateExam[] | null;
};

export function subjectExamsPassed(subject: GateSubject): boolean {
  const exams = subject.exams ?? [];
  if (exams.length === 0) return true;
  return exams.every((exam) => (exam.exam_attempts ?? []).some((attempt) => attempt.passed === true));
}

export function isSubjectUnlocked(subjects: GateSubject[], index: number): boolean {
  if (index <= 0) return true;
  return subjects.slice(0, index).every(subjectExamsPassed);
}

export function allModuleExamsPassed(subjects: GateSubject[]): boolean {
  return subjects.every(subjectExamsPassed);
}
