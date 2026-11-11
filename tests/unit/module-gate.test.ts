import { test } from "node:test";
import assert from "node:assert/strict";
import {
  allModuleExamsPassed,
  isSubjectUnlocked,
  subjectExamsPassed,
  subjectPassed,
} from "../../lib/campus/module-gate.ts";

test("a subject without exams has no exam to pass", () => {
  assert.equal(subjectExamsPassed({ exams: [] }), true);
});

test("a later subject stays locked until the earlier exam is passed", () => {
  assert.equal(isSubjectUnlocked([{ exams: [{ exam_attempts: [] }] }, { exams: [] }], 1), false);
});

test("subject without exams and an incomplete class is not passed", () => {
  assert.equal(subjectPassed({ exams: [], classes: [{ lesson_progress: [] }] }), false);
});

test("subject without exams and every class completed is passed", () => {
  assert.equal(subjectPassed({ exams: [], classes: [{ lesson_progress: [{ is_completed: true }] }] }), true);
});

test("subject with exams ignores class progress and needs every exam passed", () => {
  const classes = [{ lesson_progress: [] }];
  assert.equal(subjectPassed({ exams: [{ exam_attempts: [{ passed: true }] }], classes }), true);
  assert.equal(
    subjectPassed({ exams: [{ exam_attempts: [{ passed: true }] }, { exam_attempts: [{ passed: false }] }] }),
    false,
  );
});

test("module without exam unlocks the next one only when its classes are complete", () => {
  const next = { exams: [{ exam_attempts: [] }] };
  assert.equal(isSubjectUnlocked([{ exams: [], classes: [{ lesson_progress: [] }] }, next], 1), false);
  assert.equal(
    isSubjectUnlocked([{ exams: [], classes: [{ lesson_progress: [{ is_completed: true }] }] }, next], 1),
    true,
  );
});

test("allModuleExamsPassed applies the same rule to every subject", () => {
  assert.equal(
    allModuleExamsPassed([
      { exams: [{ exam_attempts: [{ passed: true }] }] },
      { exams: [], classes: [{ lesson_progress: [{ is_completed: false }] }] },
    ]),
    false,
  );
  assert.equal(allModuleExamsPassed([{ exams: [], classes: [] }]), true);
});
