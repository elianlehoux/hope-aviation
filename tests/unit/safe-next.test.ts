import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNext } from "../../lib/auth/safe-next.ts";

test("keeps same-origin relative paths", () => {
  assert.equal(safeNext("/campus/courses"), "/campus/courses");
  assert.equal(safeNext("/campus/courses?tab=2#top"), "/campus/courses?tab=2#top");
  assert.equal(safeNext("/auth/nueva-clave"), "/auth/nueva-clave");
});

test("rejects protocol-relative and backslash tricks", () => {
  assert.equal(safeNext("//evil.com"), "/campus");
  assert.equal(safeNext("/\\evil"), "/campus");
  assert.equal(safeNext("/\\/evil.com"), "/campus");
  assert.equal(safeNext("/\t/evil.com"), "/campus");
  assert.equal(safeNext("/\n/evil.com"), "/campus");
});

test("rejects absolute URLs and schemes", () => {
  assert.equal(safeNext("https://evil.com"), "/campus");
  assert.equal(safeNext("javascript:alert(1)"), "/campus");
  assert.equal(safeNext("evil.com/campus"), "/campus");
});

test("falls back on empty input", () => {
  assert.equal(safeNext(null), "/campus");
  assert.equal(safeNext(undefined), "/campus");
  assert.equal(safeNext(""), "/campus");
});

test("uses a custom fallback", () => {
  assert.equal(safeNext("//evil.com", "/"), "/");
  assert.equal(safeNext(null, "/auth/login"), "/auth/login");
});
