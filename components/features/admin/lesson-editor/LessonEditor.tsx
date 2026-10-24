"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Eye, Loader2, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import { readingMinutes } from "@/lib/campus/lesson-blocks";
import { LessonMarkdown } from "@/components/features/campus/lesson/LessonMarkdown";
import type { TranslatedText } from "@/types/database";
import { LESSON_SNIPPETS } from "./snippets";

type Locale = "es" | "en";

/**
 * Split-view Markdown editor for a lesson's written content, with the same renderer
 * learners see. Saves both locales in one PATCH.
 */
export function LessonEditor({
  courseId,
  subjectId,
  classId,
  title,
  initialContent,
}: {
  courseId: string;
  subjectId: string;
  classId: string;
  title: TranslatedText;
  initialContent: TranslatedText;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const [locale, setLocale] = React.useState<Locale>("es");
  const [content, setContent] = React.useState<Record<Locale, string>>({
    es: initialContent.es ?? "",
    en: initialContent.en ?? "",
  });
  const [saved, setSaved] = React.useState(content);
  const [saving, setSaving] = React.useState(false);
  const [mobileView, setMobileView] = React.useState<"write" | "preview">("write");
  const textarea = React.useRef<HTMLTextAreaElement>(null);

  const dirty = content.es !== saved.es || content.en !== saved.en;
  const value = content[locale];

  React.useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = React.useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/subjects/${subjectId}/classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { es: content.es, en: content.en } }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error?.message ?? res.statusText);
      setSaved(content);
      toast.success(es ? "Contenido guardado" : "Content saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : es ? "No se pudo guardar" : "Could not save");
    } finally {
      setSaving(false);
    }
  }, [classId, content, courseId, es, subjectId]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (dirty && !saving) void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, save, saving]);

  const insert = (snippet: string) => {
    const el = textarea.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + snippet + value.slice(end);
    setContent((c) => ({ ...c, [locale]: next }));
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + snippet.length;
      el?.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            href={`/campus/admin/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary/55 hover:text-primary"
          >
            <ArrowLeft className="size-4" aria-hidden /> {es ? "Volver al curso" : "Back to course"}
          </Link>
          <h1 className="mt-1 truncate font-display text-2xl font-semibold text-primary">
            {getLocalizedText(title, lang)}
          </h1>
          <p className="text-sm text-primary/55">
            {es ? "Contenido escrito de la clase" : "Written lesson content"} ·{" "}
            {value.trim() ? `${readingMinutes(value)} min ${es ? "de lectura" : "read"}` : es ? "vacío" : "empty"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-primary/15 bg-white p-0.5" role="tablist">
            {(["es", "en"] as const).map((l) => (
              <button
                key={l}
                role="tab"
                aria-selected={locale === l}
                onClick={() => setLocale(l)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase transition-colors",
                  locale === l ? "bg-primary text-white" : "text-primary/60 hover:text-primary",
                )}
              >
                {l}
                {content[l] !== saved[l] ? " •" : ""}
              </button>
            ))}
          </div>
          <Button onClick={() => void save()} disabled={!dirty || saving}>
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
            {dirty ? (es ? "Guardar" : "Save") : es ? "Guardado" : "Saved"}
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5" aria-label={es ? "Insertar bloque" : "Insert block"}>
        {LESSON_SNIPPETS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => insert(s.text)}
            className="rounded-full border border-primary/15 bg-white px-3 py-1.5 text-xs font-medium text-primary/75 transition-colors hover:border-primary/30 hover:text-primary"
          >
            + {es ? s.es : s.en}
          </button>
        ))}
      </div>

      <div className="inline-flex w-fit rounded-full border border-primary/15 bg-white p-0.5 lg:hidden">
        {(["write", "preview"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setMobileView(v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold",
              mobileView === v ? "bg-primary text-white" : "text-primary/60",
            )}
          >
            {v === "write" ? <PencilLine className="size-3.5" /> : <Eye className="size-3.5" />}
            {v === "write" ? (es ? "Escribir" : "Write") : es ? "Vista previa" : "Preview"}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <label className={cn("flex flex-col", mobileView === "preview" && "max-lg:hidden")}>
          <span className="sr-only">{es ? "Markdown" : "Markdown"}</span>
          <textarea
            ref={textarea}
            value={value}
            onChange={(e) => setContent((c) => ({ ...c, [locale]: e.target.value }))}
            spellCheck
            placeholder={
              es
                ? "Escribí la clase en Markdown. Usá los botones de arriba para insertar notas, gráficos, pasos o preguntas de repaso."
                : "Write the lesson in Markdown. Use the buttons above to insert notes, charts, steps or quick checks."
            }
            className="min-h-[70vh] w-full resize-y rounded-2xl border border-primary/15 bg-white p-5 font-mono text-[13px] leading-relaxed text-primary outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/15"
          />
        </label>
        <div
          className={cn(
            "max-h-[calc(70vh+2px)] min-h-[70vh] overflow-y-auto rounded-2xl border border-primary/10 bg-paper px-6 py-6 sm:px-8",
            mobileView === "write" && "max-lg:hidden",
          )}
          aria-label={es ? "Vista previa" : "Preview"}
        >
          {value.trim() ? (
            <LessonMarkdown source={value} />
          ) : (
            <p className="text-sm text-primary/45">{es ? "La vista previa aparece acá." : "The preview appears here."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
