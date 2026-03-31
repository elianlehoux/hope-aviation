/**
 * Stable ordering for subjects/classes: order_index ascending, nulls last, then created_at.
 */
export function sortByOrderThenCreated<
  T extends { order_index: number | null; created_at: string },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ai = a.order_index ?? Number.MAX_SAFE_INTEGER;
    const bi = b.order_index ?? Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}
