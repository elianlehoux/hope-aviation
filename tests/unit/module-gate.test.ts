import { test } from "node:test";
import assert from "node:assert/strict";
import { isSubjectUnlocked, subjectExamsPassed } from "../../lib/campus/module-gate.ts";

test("a subject without exams counts as passed (current rule)", () => {
  assert.equal(subjectExamsPassed({ exams: [] }), true);
});

test("a later subject stays locked until the earlier exam is passed", () => {
  assert.equal(isSubjectUnlocked([{ exams: [{ exam_attempts: [] }] }, { exams: [] }], 1), false);
});
