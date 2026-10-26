"use client";

import * as React from "react";
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { AlertTriangle, Check, GripVertical, Loader2, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fieldControl } from "@/components/features/campus/ui/field";
import { useTranslation } from "@/lib/i18n/context";
import { isQuestionValid } from "@/lib/campus/publish-checklist";
import { cn } from "@/lib/utils";
import type { ExamEditorQuestion } from "@/lib/campus/manage";
import { api, cleanText, courseRoutes } from "../course/api";
import { ReorderButtons } from "../course/ReorderButtons";

export type Locale = "es" | "en";

type DraftOption = { key: string; id?: string; es: string; en: string; correct: boolean };
type Draft = { es: string; en: string; options: DraftOption[] };

let seq = 0;
const newKey = () => `new-${++seq}`;

const draftOf = (q?: ExamEditorQuestion): Draft =>
  q
    ? {
        es: q.content.es ?? "",
        en: q.content.en ?? "",
        options: q.options.map((o) => ({
          key: o.id,
          id: o.id,
          es: o.content.es ?? "",
          en: o.content.en ?? "",
          correct: o.is_correct,
        })),
      }
    : {
        es: "",
        en: "",
        options: [
          { key: newKey(), es: "", en: "", correct: false },
          { key: newKey(), es: "", en: "", correct: false },
        ],
      };

/**
 * One question edited in place: statement, options and the single correct answer.
 * Saving PATCHes/POSTs the question, then deletes, updates and creates options.
 * Invalid questions (not exactly one correct, fewer than 2 options) can be saved but
 * show an inline warning; the publish checklist blocks them.
 */
export function QuestionCard({
  courseId,
  subjectId,
  examId,
  question,
  index,
  count,
  locale,
  dragHandle,
  onMove,
  onCreated,
  onSaved,
  onRemove,
  onDirtyChange,
}: {
  courseId: string;
  subjectId: string;
  examId: string;
  question?: ExamEditorQuestion;
  index: number;
  count: number;
  locale: Locale;
  dragHandle?: DraggableProvidedDragHandleProps | null;
  onMove?: (from: number, to: number) => void;
  onCreated?: (questionId: string) => void;
  onSaved: () => void;
  onRemove: (questionId: string | undefined) => void;
  onDirtyChange: (key: string, dirty: boolean) => void;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const routes = courseRoutes(courseId);
  const [cardKey] = React.useState(() => question?.id ?? newKey());
  const [questionId, setQuestionId] = React.useState(question?.id);
  const [saved, setSaved] = React.useState<Draft>(() => draftOf(question));
  const [draft, setDraft] = React.useState<Draft>(saved);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const dirty = !questionId || JSON.stringify(draft) !== JSON.stringify(saved);
  React.useEffect(() => onDirtyChange(cardKey, dirty), [cardKey, dirty, onDirtyChange]);
  React.useEffect(() => () => onDirtyChange(cardKey, false), [cardKey, onDirtyChange]);

  const valid = isQuestionValid(draft.options.map((o) => ({ is_correct: o.correct })));
  const other: Locale = locale === "es" ? "en" : "es";
  const missingOther = Boolean(draft[locale].trim()) && !draft[other].trim();

  const setOption = (key: string, patch: Partial<DraftOption>) =>
    setDraft((d) => ({ ...d, options: d.options.map((o) => (o.key === key ? { ...o, ...patch } : o)) }));

  const setCorrect = (key: string) =>
    setDraft((d) => ({ ...d, options: d.options.map((o) => ({ ...o, correct: o.key === key })) }));

  const save = async () => {
    if (saving) return;
    const content = cleanText(draft.es, draft.en);
    if (!content.es && !content.en) {
      setError(es ? "Escribí el enunciado." : "Write the question.");
      return;
    }
    if (draft.options.some((o) => !o.es.trim() && !o.en.trim())) {
      setError(es ? "Completá el texto de cada opción o quitá las vacías." : "Fill in every option or remove empty ones.");
      return;
    }
    setError(null);
    setSaving(true);

    let qid = questionId;
    let ok = true;
    if (!qid) {
      const res = await api<{ question: { id: string } }>(routes.questions(subjectId, examId), "POST", {
        content,
        points: 1,
        order_index: index,
      });
      if (res.ok) qid = res.data.question.id;
      else ok = false;
    } else if (draft.es !== saved.es || draft.en !== saved.en) {
      ok = (await api(routes.question(subjectId, examId, qid), "PATCH", { content })).ok;
    }

    const options = [...draft.options];
    if (ok && qid) {
      const removed = saved.options.filter((s) => s.id && !draft.options.some((o) => o.id === s.id));
      for (const r of removed) {
        ok = (await api(routes.option(subjectId, examId, qid, r.id!), "DELETE")).ok && ok;
      }
      for (const [i, o] of options.entries()) {
        const body = { content: cleanText(o.es, o.en), is_correct: o.correct };
        if (o.id) {
          const before = saved.options.find((s) => s.id === o.id);
          if (before && before.es === o.es && before.en === o.en && before.correct === o.correct) continue;
          ok = (await api(routes.option(subjectId, examId, qid, o.id), "PATCH", body)).ok && ok;
        } else {
          const res = await api<{ option: { id: string } }>(routes.options(subjectId, examId, qid), "POST", body);
          if (res.ok) options[i] = { ...o, id: res.data.option.id };
          else ok = false;
        }
      }
    }

    setSaving(false);
    if (qid && !questionId) {
      setQuestionId(qid);
      onCreated?.(qid);
    }
    const next = { ...draft, options };
    setDraft(next);
    if (!ok) {
      setError(es ? "Algunos cambios no se guardaron. Probá de nuevo." : "Some changes weren't saved. Try again.");
      // Keep the baseline as-is for the parts that failed; options with ids are persisted.
      setSaved((s) => ({ ...s, options: options.filter((o) => o.id) }));
    } else {
      setSaved(next);
    }
    onSaved();
  };

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white",
        !valid ? "border-highlight/70" : "border-primary/10",
        !questionId && "border-dashed",
      )}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
          void save();
        }
      }}
    >
      <header className="flex items-center gap-1 border-b border-primary/5 py-2 pl-2 pr-3">
        {dragHandle ? (
          <span
            {...dragHandle}
            className="grid size-8 cursor-grab place-items-center rounded-full text-primary/30 hover:text-primary/60"
            aria-label={es ? `Arrastrar pregunta ${index + 1}` : `Drag question ${index + 1}`}
          >
            <GripVertical className="size-4" aria-hidden />
          </span>
        ) : (
          <span className="size-8" />
        )}
        <span className="font-display text-sm font-semibold tabular-nums text-primary/40">
          {String(index + 1).padStart(2, "0")}
        </span>
        {!questionId ? (
          <span className="ml-2 rounded-full bg-paper px-2 py-0.5 text-[11px] font-semibold text-primary/55">
            {es ? "Nueva" : "New"}
          </span>
        ) : null}
        <span className="ml-auto flex items-center">
          {onMove ? (
            <ReorderButtons index={index} count={count} onMove={onMove} label={es ? `Pregunta ${index + 1}` : `Question ${index + 1}`} />
          ) : null}
          <button
            type="button"
            onClick={() => onRemove(questionId)}
            className="grid size-8 place-items-center rounded-full text-primary/40 hover:bg-paper hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            aria-label={es ? `Eliminar pregunta ${index + 1}` : `Delete question ${index + 1}`}
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </span>
      </header>

      <div className="space-y-4 p-4 sm:p-5">
        <div>
          <label htmlFor={`q-${cardKey}-${locale}`} className="sr-only">
            {es ? "Enunciado" : "Question"}
          </label>
          <textarea
            id={`q-${cardKey}-${locale}`}
            rows={2}
            value={draft[locale]}
            onChange={(e) => setDraft((d) => ({ ...d, [locale]: e.target.value }))}
            placeholder={locale === "es" ? "¿Cuál es la función del timón de dirección?" : "What does the rudder control?"}
            className={cn(fieldControl, "resize-y font-medium leading-relaxed")}
          />
          {missingOther ? (
            <p className="mt-1 text-xs text-primary/45">
              {other === "en" ? (es ? "Falta la versión en inglés." : "English version missing.") : es ? "Falta la versión en español." : "Spanish version missing."}
            </p>
          ) : null}
        </div>

        <fieldset>
          <legend className="mb-2 text-xs font-semibold text-primary/55">
            {es ? "Opciones · marcá la correcta" : "Options · mark the correct one"}
          </legend>
          <ul className="space-y-2">
            {draft.options.map((o, i) => (
              <li key={o.key} className="flex items-center gap-2">
                <label
                  className={cn(
                    "relative grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border transition-colors focus-within:ring-[3px] focus-within:ring-ring",
                    o.correct ? "border-success bg-success text-white" : "border-primary/20 text-transparent hover:border-primary/40",
                  )}
                >
                  <input
                    type="radio"
                    name={`correct-${cardKey}`}
                    className="sr-only"
                    checked={o.correct}
                    onChange={() => setCorrect(o.key)}
                    aria-label={es ? `Opción ${i + 1} es la correcta` : `Option ${i + 1} is correct`}
                  />
                  <Check className="size-4" aria-hidden />
                </label>
                <input
                  value={o[locale]}
                  onChange={(e) => setOption(o.key, { [locale]: e.target.value })}
                  placeholder={(locale === "es" ? "Opción " : "Option ") + (i + 1)}
                  aria-label={es ? `Texto de la opción ${i + 1}` : `Option ${i + 1} text`}
                  className={cn(fieldControl, o.correct && "border-success/50")}
                />
                <button
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, options: d.options.filter((x) => x.key !== o.key) }))}
                  className="grid size-9 shrink-0 place-items-center rounded-full text-primary/35 hover:bg-paper hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  aria-label={es ? `Quitar opción ${i + 1}` : `Remove option ${i + 1}`}
                >
                  <X className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() =>
              setDraft((d) => ({ ...d, options: [...d.options, { key: newKey(), es: "", en: "", correct: false }] }))
            }
            className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-primary/60 hover:bg-paper hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <Plus className="size-3.5" aria-hidden />
            {es ? "Opción" : "Option"}
          </button>
        </fieldset>

        {!valid ? (
          <p role="status" className="flex items-start gap-2 rounded-xl bg-highlight/15 px-3 py-2 text-xs leading-relaxed text-primary">
            <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
            {draft.options.length < 2
              ? es
                ? "Necesita al menos 2 opciones."
                : "It needs at least 2 options."
              : es
                ? "Marcá exactamente una opción como correcta."
                : "Mark exactly one option as correct."}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      {dirty ? (
        <footer className="flex items-center justify-end gap-3 border-t border-primary/5 px-4 py-3 sm:px-5">
          <span className="hidden text-xs text-primary/45 sm:inline">⌘S</span>
          {!questionId ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(undefined)}>
              {es ? "Descartar" : "Discard"}
            </Button>
          ) : (
            <Button type="button" variant="ghost" size="sm" onClick={() => setDraft(saved)}>
              {es ? "Deshacer" : "Undo"}
            </Button>
          )}
          <Button type="button" size="sm" onClick={() => void save()} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {es ? "Guardar pregunta" : "Save question"}
          </Button>
        </footer>
      ) : null}
    </article>
  );
}
