"use client";

import * as React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampusSurface } from "@/components/features/campus/ui/surface";
import { fieldControl } from "@/components/features/campus/ui/field";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export type Pair = { es: string; en: string };

export const pairOf = (t: { es?: string; en?: string } | null | undefined): Pair => ({
  es: t?.es ?? "",
  en: t?.en ?? "",
});

/**
 * One translatable field: a label and an es/en pair of inputs stacked, each tagged
 * with its locale. Compact enough for the side panel and for 375px.
 */
export function BilingualField({
  id,
  label,
  value,
  onChange,
  multiline,
  rows = 3,
  hint,
  error,
  placeholder,
}: {
  id: string;
  label: string;
  value: Pair;
  onChange: (next: Pair) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  error?: string;
  placeholder?: Partial<Pair>;
}) {
  const { lang } = useTranslation();
  const names = lang === "es" ? { es: "español", en: "inglés" } : { es: "Spanish", en: "English" };

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-semibold text-primary/80">{label}</legend>
      <div className="grid gap-2">
        {(["es", "en"] as const).map((loc) => {
          const common = {
            id: `${id}-${loc}`,
            value: value[loc],
            "aria-label": `${label} (${names[loc]})`,
            "aria-invalid": Boolean(error) || undefined,
            placeholder: placeholder?.[loc],
            className: cn(fieldControl, "pl-12"),
          };
          return (
            <div key={loc} className="relative">
              <span
                aria-hidden
                className="pointer-events-none absolute left-3 top-[0.7rem] rounded-md bg-paper px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary/65"
              >
                {loc}
              </span>
              {multiline ? (
                <textarea
                  {...common}
                  rows={rows}
                  className={cn(common.className, "resize-y leading-relaxed")}
                  onChange={(e) => onChange({ ...value, [loc]: e.target.value })}
                />
              ) : (
                <input {...common} onChange={(e) => onChange({ ...value, [loc]: e.target.value })} />
              )}
            </div>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-primary/65">{hint}</p>
      ) : null}
    </fieldset>
  );
}

/** White panel with an eyebrow + title header, a padded body and an optional sticky footer. */
export function PanelShell({
  eyebrow,
  title,
  aside,
  footer,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CampusSurface className={cn("flex flex-col", className)}>
      <header className="flex items-start justify-between gap-3 border-b border-primary/10 px-5 pb-4 pt-5 sm:px-7">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/65">{eyebrow}</p>
          <h2 className="mt-1 break-words font-display text-xl font-semibold tracking-tight text-primary sm:text-2xl">
            {title}
          </h2>
        </div>
        {aside}
      </header>
      <div className="space-y-6 px-5 py-6 sm:px-7">{children}</div>
      {footer ? (
        <footer className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-primary/10 bg-white/95 px-5 py-3 backdrop-blur sm:px-7">
          {footer}
        </footer>
      ) : null}
    </CampusSurface>
  );
}

/** Footer actions for an editable panel: quiet delete on the left, save on the right. */
export function SaveBar({
  dirty,
  saving,
  onSave,
  onDelete,
  deleteLabel,
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  return (
    <>
      {onDelete ? (
        <Button type="button" variant="ghost" size="sm" onClick={onDelete} className="-ml-3">
          <Trash2 aria-hidden />
          {deleteLabel}
        </Button>
      ) : (
        <span />
      )}
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-xs text-primary/65 sm:inline" aria-live="polite">
          {dirty ? (es ? "Cambios sin guardar · ⌘S" : "Unsaved changes · ⌘S") : es ? "Todo guardado" : "All saved"}
        </span>
        <Button type="button" onClick={onSave} disabled={!dirty || saving}>
          {saving ? <Loader2 className="animate-spin" aria-hidden /> : null}
          {es ? "Guardar" : "Save"}
        </Button>
      </div>
    </>
  );
}
