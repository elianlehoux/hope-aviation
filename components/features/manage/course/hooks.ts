"use client";

import * as React from "react";

/** Warns before closing/reloading the tab while there are unsaved changes. */
export function useBeforeUnload(dirty: boolean) {
  React.useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
}

/** Cmd/Ctrl+S runs `save` while `enabled`. */
export function useSaveShortcut(save: () => void, enabled: boolean) {
  const ref = React.useRef(save);
  React.useEffect(() => {
    ref.current = save;
  });
  React.useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        ref.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}

/** `true` from `lg` up; `null` until mounted so SSR renders the desktop column. */
export function useIsDesktop() {
  const [desktop, setDesktop] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}
