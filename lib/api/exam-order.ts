/**
 * Sort questions: order_index ascending, nulls last, then id.
 */
export function sortQuestionsByOrderThenId<
  T extends { order_index: number | null; id: string },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ai = a.order_index ?? Number.MAX_SAFE_INTEGER;
    const bi = b.order_index ?? Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Sort exams: order_index ascending, nulls last, then created_at.
 */
export function sortExamsByOrderThenCreated<
  T extends { order_index: number | null; created_at: string },
>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ai = a.order_index ?? Number.MAX_SAFE_INTEGER;
    const bi = b.order_index ?? Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

/** Options have no order_index; stable by id. */
export function sortOptionsById<
  T extends { id: string },
>(items: T[]): T[] {
  return [...items].sort((a, b) => a.id.localeCompare(b.id));
}
