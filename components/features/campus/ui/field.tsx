import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Label + control + hint/error, with ids wired for screen readers via `htmlFor`. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-primary/80">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-primary/65">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Shared input styling for campus forms (use on <input>, <textarea>, <select>). */
export const fieldControl =
  "w-full rounded-xl border border-primary/15 bg-white px-3.5 py-2.5 text-sm text-primary outline-none transition-colors placeholder:text-primary/65 focus:border-accent focus:ring-[3px] focus:ring-accent/15 disabled:bg-paper disabled:text-primary/65 aria-[invalid=true]:border-destructive";
