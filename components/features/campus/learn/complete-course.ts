/**
 * Close a course without a final exam (POST /api/courses/:id/complete, RPC complete_course).
 * Returns the domain error code on failure (lessons_incomplete, modules_not_passed, ...).
 */
export async function completeCourse(courseId: string): Promise<{ ok: true } | { ok: false; code: string }> {
  try {
    const res = await fetch(`/api/courses/${courseId}/complete`, { method: "POST" });
    if (res.ok) return { ok: true };
    const body = (await res.json().catch(() => null)) as { error?: { code?: string } } | null;
    return { ok: false, code: body?.error?.code ?? "unknown" };
  } catch {
    return { ok: false, code: "network" };
  }
}
