/** Client-side calls to the existing admin API routes used by the people screens. */

async function send(url: string, method: string, body: unknown): Promise<void> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(json?.error?.message ?? `Request failed (${res.status})`);
  }
}

export function setPersonRole(userId: string, roleId: string) {
  return send(`/api/admin/users/${userId}/role`, "PUT", { roleId });
}

export function setPersonActive(userId: string, isActive: boolean) {
  return send(`/api/admin/users/${userId}`, "PATCH", { is_active: isActive });
}

export function resetExamAttempts(userId: string, examId: string) {
  return send(`/api/admin/user-management/${userId}/reset-attempts`, "POST", { examId });
}
