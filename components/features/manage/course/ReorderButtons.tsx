"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

/** Keyboard-friendly alternative to drag and drop: move an item one step up or down. */
export function ReorderButtons({
  index,
  count,
  onMove,
  label,
  disabled,
  className,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  /** Item name for screen readers ("Subir «Clase 1»"). */
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const btn =
    "grid size-7 place-items-center rounded-full text-primary/65 transition-colors hover:bg-paper hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30";

  return (
    <span className={cn("inline-flex items-center", className)}>
      <button
        type="button"
        className={btn}
        disabled={disabled || index === 0}
        onClick={() => onMove(index, index - 1)}
        aria-label={es ? `Subir «${label}»` : `Move “${label}” up`}
      >
        <ChevronUp className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        className={btn}
        disabled={disabled || index === count - 1}
        onClick={() => onMove(index, index + 1)}
        aria-label={es ? `Bajar «${label}»` : `Move “${label}” down`}
      >
        <ChevronDown className="size-4" aria-hidden />
      </button>
    </span>
  );
}

/** Returns a copy of `list` with the item at `from` moved to `to`. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
