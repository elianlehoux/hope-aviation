"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { AlertTriangle, FileJson, ListChecks, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/features/campus/ui/confirm-dialog";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import type { ExamEditorQuestion } from "@/lib/campus/manage";
import { api, courseRoutes } from "../course/api";
import { useBeforeUnload } from "../course/hooks";
import { moveItem } from "../course/ReorderButtons";
import { BatchImportDialog } from "./BatchImportDialog";
import { QuestionCard, type Locale } from "./QuestionCard";

type DraftSlot = { key: string; createdId?: string };

let draftSeq = 0;

/** Inline question editor: reorderable cards, new drafts at the end, batch import. */
export function QuestionList({
  courseId,
  subjectId,
  examId,
  questions,
  invalidCount,
}: {
  courseId: string;
  subjectId: string;
  examId: string;
  questions: ExamEditorQuestion[];
  invalidCount: number;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const routes = courseRoutes(courseId);
  const [locale, setLocale] = React.useState<Locale>("es");
  const [drafts, setDrafts] = React.useState<DraftSlot[]>([]);
  const [importOpen, setImportOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<string | null>(null);
  const [dirtyKeys, setDirtyKeys] = React.useState<Set<string>>(() => new Set());

  // Optimistic order, valid only while the server list it came from is current.
  const [override, setOverride] = React.useState<{ base: ExamEditorQuestion[]; value: ExamEditorQuestion[] } | null>(
    null,
  );
  const ordered = override && override.base === questions ? override.value : questions;

  // A saved draft stays on screen until the refreshed list includes it.
  const openDrafts = drafts.filter((d) => !d.createdId || !questions.some((q) => q.id === d.createdId));

  const onDirtyChange = React.useCallback((key: string, dirty: boolean) => {
    setDirtyKeys((prev) => {
      if (prev.has(key) === dirty) return prev;
      const next = new Set(prev);
      if (dirty) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);
  useBeforeUnload(dirtyKeys.size > 0);

  const move = async (from: number, to: number) => {
    const next = moveItem(ordered, from, to);
    setOverride({ base: questions, value: next });
    const res = await api(routes.questionsReorder(subjectId, examId), "PATCH", {
      orderedQuestionIds: next.map((q) => q.id),
    });
    if (!res.ok) {
      setOverride(null);
      toast.error(es ? "No se pudo guardar el nuevo orden." : "Couldn't save the new order.");
      return;
    }
    router.refresh();
  };

  const onDragEnd = (r: DropResult) => {
    if (r.destination && r.destination.index !== r.source.index) void move(r.source.index, r.destination.index);
  };

  const remove = async () => {
    if (!toDelete) return;
    const res = await api(routes.question(subjectId, examId, toDelete), "DELETE");
    if (!res.ok) {
      toast.error(es ? "No se pudo eliminar la pregunta." : "Couldn't delete the question.");
      return;
    }
    toast.success(es ? "Pregunta eliminada" : "Question deleted");
    setDrafts((all) => all.filter((x) => x.createdId !== toDelete));
    router.refresh();
  };

  const addDraft = () => setDrafts((d) => [...d, { key: `draft-${++draftSeq}` }]);
  const total = ordered.length + openDrafts.length;

  return (
    <section aria-labelledby="questions-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="questions-heading" className="font-display text-lg font-semibold text-primary">
            {es ? "Preguntas" : "Questions"}{" "}
            <span className="tabular-nums text-primary/40">{ordered.length}</span>
          </h2>
          {invalidCount > 0 ? (
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-highlight/25 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <AlertTriangle className="size-3.5" aria-hidden />
              {es
                ? `${invalidCount} ${invalidCount === 1 ? "pregunta para revisar" : "preguntas para revisar"}`
                : `${invalidCount} ${invalidCount === 1 ? "question" : "questions"} to fix`}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="radiogroup"
            aria-label={es ? "Idioma que estás editando" : "Language you're editing"}
            className="inline-flex rounded-full border border-primary/15 bg-white p-0.5"
          >
            {(["es", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={locale === l}
                onClick={() => setLocale(l)}
                className={cn(
                  "h-8 rounded-full px-3 text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
                  locale === l ? "bg-primary text-white" : "text-primary/55 hover:text-primary",
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <FileJson aria-hidden />
            {es ? "Importar en lote" : "Batch import"}
          </Button>
        </div>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-primary/20 px-6 py-12 text-center">
          <span className="mb-3 grid size-11 place-items-center rounded-2xl bg-white text-primary/55">
            <ListChecks className="size-5" aria-hidden />
          </span>
          <p className="font-display font-semibold text-primary">{es ? "Todavía no hay preguntas" : "No questions yet"}</p>
          <p className="mt-1 max-w-sm text-sm text-primary/60">
            {es
              ? "Escribilas una por una o importalas en lote desde un JSON."
              : "Write them one by one or batch import them from JSON."}
          </p>
        </div>
      ) : null}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="questions">
          {(drop) => (
            <ol ref={drop.innerRef} {...drop.droppableProps} className="space-y-3">
              {ordered.map((q, i) => (
                <Draggable key={q.id} draggableId={q.id} index={i}>
                  {(drag, snap) => (
                    <li
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={cn(snap.isDragging && "rounded-2xl shadow-[0_12px_28px_rgba(0,0,0,0.12)]")}
                    >
                      <QuestionCard
                        courseId={courseId}
                        subjectId={subjectId}
                        examId={examId}
                        question={q}
                        index={i}
                        count={ordered.length}
                        locale={locale}
                        dragHandle={drag.dragHandleProps}
                        onMove={(from, to) => void move(from, to)}
                        onSaved={() => router.refresh()}
                        onRemove={(id) => id && setToDelete(id)}
                        onDirtyChange={onDirtyChange}
                      />
                    </li>
                  )}
                </Draggable>
              ))}
              {drop.placeholder}
            </ol>
          )}
        </Droppable>
      </DragDropContext>

      {openDrafts.length > 0 ? (
        <ol className="space-y-3">
          {openDrafts.map((d, i) => (
            <li key={d.key}>
              <QuestionCard
                courseId={courseId}
                subjectId={subjectId}
                examId={examId}
                index={ordered.length + i}
                count={total}
                locale={locale}
                onCreated={(id) => setDrafts((all) => all.map((x) => (x.key === d.key ? { ...x, createdId: id } : x)))}
                onSaved={() => router.refresh()}
                onRemove={(id) => {
                  if (id) setToDelete(id);
                  else setDrafts((all) => all.filter((x) => x.key !== d.key));
                }}
                onDirtyChange={onDirtyChange}
              />
            </li>
          ))}
        </ol>
      ) : null}

      <button
        type="button"
        onClick={addDraft}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/20 px-4 py-3.5 text-sm font-semibold text-primary/70 transition-colors hover:border-primary/35 hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        <Plus className="size-4" aria-hidden />
        {es ? "Agregar pregunta" : "Add question"}
      </button>

      <BatchImportDialog
        courseId={courseId}
        subjectId={subjectId}
        examId={examId}
        open={importOpen}
        onOpenChange={setImportOpen}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        destructive
        title={es ? "¿Eliminar esta pregunta?" : "Delete this question?"}
        description={
          es
            ? "Se borra con sus opciones. No se puede deshacer."
            : "It's deleted with its options. This can't be undone."
        }
        confirmLabel={es ? "Eliminar" : "Delete"}
        onConfirm={remove}
      />
    </section>
  );
}
