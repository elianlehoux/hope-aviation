import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isQuestionValid,
  publishChecklist,
  summarizeQuestions,
} from "../../lib/campus/publish-checklist.ts";
import type { ManageClass, ManageCourseTree, ManageExam, ManageSubject } from "../../lib/campus/manage.ts";

const COURSE_ID = "10000000-0000-4000-a000-000000000001";

const validQuestion = { options: [{ is_correct: true }, { is_correct: false }] };

function cls(id: string, over: Partial<ManageClass> = {}): ManageClass {
  return {
    id,
    subject_id: "s1",
    title: { es: `Clase ${id}`, en: `Class ${id}` },
    description: null,
    video_url: "dQw4w9WgXcQ",
    resource_url: null,
    duration_minutes: 10,
    order_index: 0,
    has_content: false,
    reading_minutes: null,
    ...over,
  };
}

function exam(id: string, questions: { options: { is_correct: boolean }[] }[]): ManageExam {
  return {
    id,
    course_id: COURSE_ID,
    subject_id: "s1",
    title: { es: `Examen ${id}`, en: `Exam ${id}` },
    description: null,
    passing_score: 70,
    time_limit_minutes: null,
    max_attempts: 1,
    order_index: 0,
    ...summarizeQuestions(questions),
  };
}

function subject(id: string, over: Partial<ManageSubject> = {}): ManageSubject {
  return {
    id,
    course_id: COURSE_ID,
    title: { es: `Módulo ${id}`, en: `Module ${id}` },
    description: null,
    order_index: 0,
    classes: [cls(`${id}-c1`)],
    exams: [exam(`${id}-e1`, [validQuestion, validQuestion, validQuestion])],
    ...over,
  };
}

function tree(subjects: ManageSubject[]): ManageCourseTree {
  return {
    course: {
      id: COURSE_ID,
      title: { es: "Curso", en: "Course" },
      description: null,
      thumbnail_url: null,
      status: "draft",
      final_exam_question_count: null,
      final_exam_passing_score: 70,
      final_exam_time_limit_minutes: null,
      created_at: "2026-10-24T00:00:00Z",
      updated_at: null,
      total_questions_count: subjects.reduce(
        (n, s) => n + s.exams.reduce((m, e) => m + e.questionCount, 0),
        0,
      ),
    },
    subjects,
  };
}

const codes = (t: ManageCourseTree, final: number | null = null) => publishChecklist(t, final).map((i) => i.code);

test("an empty tree only reports no_modules", () => {
  assert.deepEqual(codes(tree([])), ["no_modules"]);
});

test("a module with no classes is reported and links to the module", () => {
  const issues = publishChecklist(tree([subject("s1", { classes: [] })]), null);
  assert.deepEqual(issues.map((i) => i.code), ["module_without_classes"]);
  assert.equal(issues[0].href, `/campus/admin/courses/${COURSE_ID}?item=module:s1`);
});

test("a class with neither video nor written content is reported", () => {
  const t = tree([subject("s1", { classes: [cls("c1", { video_url: null, has_content: false })] })]);
  const issues = publishChecklist(t, null);
  assert.deepEqual(issues.map((i) => i.code), ["class_without_content"]);
  assert.equal(issues[0].href, `/campus/admin/courses/${COURSE_ID}?item=class:c1`);
});

test("a class with written content and no video is fine", () => {
  const t = tree([subject("s1", { classes: [cls("c1", { video_url: "", has_content: true })] })]);
  assert.deepEqual(codes(t), []);
});

test("an exam with zero questions is reported and links to the exam editor", () => {
  const issues = publishChecklist(tree([subject("s1", { exams: [exam("e1", [])] })]), null);
  assert.deepEqual(issues.map((i) => i.code), ["exam_without_questions"]);
  assert.equal(issues[0].href, `/campus/admin/courses/${COURSE_ID}/exams/e1`);
});

test("a question with two correct options is invalid", () => {
  const twoCorrect = { options: [{ is_correct: true }, { is_correct: true }] };
  assert.equal(isQuestionValid(twoCorrect.options), false);
  const t = tree([subject("s1", { exams: [exam("e1", [validQuestion, twoCorrect])] })]);
  assert.deepEqual(codes(t), ["question_invalid"]);
});

test("a question with a single option or no correct option is invalid", () => {
  assert.equal(isQuestionValid([{ is_correct: true }]), false);
  assert.equal(isQuestionValid([{ is_correct: false }, { is_correct: false }]), false);
  assert.equal(isQuestionValid([]), false);
});

test("a final exam larger than the question pool is reported", () => {
  const t = tree([subject("s1")]);
  assert.equal(t.course.total_questions_count, 3);
  const issues = publishChecklist(t, 10);
  assert.deepEqual(issues.map((i) => i.code), ["final_exceeds_pool"]);
  assert.equal(issues[0].href, `/campus/admin/courses/${COURSE_ID}/settings`);
});

test("a final exam within the pool, or no final exam, is fine", () => {
  const t = tree([subject("s1")]);
  assert.deepEqual(codes(t, 3), []);
  assert.deepEqual(codes(t, 0), []);
  assert.deepEqual(codes(t, null), []);
});

test("the valid seed-like tree has no issues", () => {
  const t = tree([
    subject("s1"),
    subject("s2", { classes: [cls("s2-c1"), cls("s2-c2", { video_url: null, has_content: true })] }),
  ]);
  assert.deepEqual(codes(t, 4), []);
});

test("every issue carries both languages", () => {
  const t = tree([subject("s1", { classes: [], exams: [exam("e1", [])] })]);
  for (const issue of publishChecklist(t, 5)) {
    assert.ok(issue.label.es.length > 0);
    assert.ok(issue.label.en.length > 0);
  }
});
