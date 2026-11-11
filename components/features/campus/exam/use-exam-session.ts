"use client";

import * as React from "react";

export type ExamAnswers = Record<string, string>;

const PREFIX = "exam:";

/** Answers stored for an attempt (empty when none or storage is unavailable). */
export function readExamAnswers(key: string): ExamAnswers {
  try {
    const raw = window.sessionStorage.getItem(PREFIX + key);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string",
      ),
    );
  } catch {
    return {};
  }
}

function write(key: string, answers: ExamAnswers) {
  try {
    window.sessionStorage.setItem(PREFIX + key, JSON.stringify(answers));
  } catch {
    // Storage can be unavailable (private mode, quota); answers still live in memory.
  }
}

/**
 * Chosen answers for one attempt, mirrored to sessionStorage under `exam:<attemptId>` so a
 * reload mid-exam keeps them. Pass null before the attempt exists.
 */
export function useExamSession(storageKey: string | null) {
  const [state, setState] = React.useState<{ key: string | null; answers: ExamAnswers }>({
    key: null,
    answers: {},
  });

  // Re-read storage when the attempt changes (derived state, adjusted during render).
  let current = state;
  if (state.key !== storageKey) {
    current = { key: storageKey, answers: storageKey ? readExamAnswers(storageKey) : {} };
    setState(current);
  }

  React.useEffect(() => {
    if (state.key && Object.keys(state.answers).length > 0) write(state.key, state.answers);
  }, [state]);

  const setAnswer = React.useCallback((questionId: string, optionId: string) => {
    setState((prev) => ({ ...prev, answers: { ...prev.answers, [questionId]: optionId } }));
  }, []);

  const clear = React.useCallback(() => {
    setState((prev) => {
      if (prev.key) {
        try {
          window.sessionStorage.removeItem(PREFIX + prev.key);
        } catch {
          // ignore
        }
      }
      return { key: prev.key, answers: {} };
    });
  }, []);

  return { answers: current.answers, setAnswer, clear };
}
