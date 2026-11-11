"use client";

import * as React from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { AlertTriangle, ClipboardCheck, FileText, GripVertical, Loader2, PlayCircle, Plus } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import { cn } from "@/lib/utils";
import type { ManageSubject } from "@/lib/campus/manage";
import { ReorderButtons } from "./ReorderButtons";

export type TreeItem = `module:${string}` | `class:${string}` | `exam:${string}`;

/**
 * Course outline for the editor: modules → classes → module exam. Drag handles and
 * up/down buttons both reorder through the parent's callbacks.
 */
export function CourseTree({
  subjects,
  selected,
  busy,
  onSelect,
  onMoveModule,
  onMoveClass,
  onAddModule,
  onAddClass,
  onAddExam,
}: {
  subjects: ManageSubject[];
  selected: TreeItem | null;
  busy: string | null;
  onSelect: (item: TreeItem) => void;
  onMoveModule: (from: number, to: number) => void;
  onMoveClass: (subjectId: string, from: number, to: number) => void;
  onAddModule: () => void;
  onAddClass: (subjectId: string) => void;
  onAddExam: (subjectId: string) => void;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";

  const onDragEnd = (r: DropResult) => {
    if (!r.destination || r.destination.index === r.source.index) return;
    if (r.type === "module") onMoveModule(r.source.index, r.destination.index);
    else if (r.destination.droppableId === r.source.droppableId) {
      onMoveClass(r.source.droppableId.replace("classes:", ""), r.source.index, r.destination.index);
    }
  };

  return (
    <nav aria-label={es ? "Índice del curso" : "Course outline"} className="space-y-3">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="modules" type="module">
          {(drop) => (
            <ol ref={drop.innerRef} {...drop.droppableProps} className="space-y-3">
              {subjects.map((s, i) => {
                const moduleName = getLocalizedText(s.title, lang);
                return (
                  <Draggable key={s.id} draggableId={`module:${s.id}`} index={i}>
                    {(drag, snap) => (
                      <li
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        className={cn(
                          "rounded-2xl border border-primary/10 bg-white",
                          snap.isDragging && "shadow-[0_12px_28px_rgba(0,0,0,0.12)]",
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-1 rounded-t-2xl py-1.5 pl-1.5 pr-2",
                            selected === `module:${s.id}` && "bg-accent/[0.06]",
                          )}
                        >
                          <span
                            {...drag.dragHandleProps}
                            className="grid size-8 shrink-0 cursor-grab place-items-center rounded-full text-primary/30 hover:text-primary/65"
                            aria-label={es ? `Arrastrar «${moduleName}»` : `Drag “${moduleName}”`}
                          >
                            <GripVertical className="size-4" aria-hidden />
                          </span>
                          <button
                            type="button"
                            onClick={() => onSelect(`module:${s.id}`)}
                            aria-current={selected === `module:${s.id}` ? "true" : undefined}
                            className="flex min-w-0 flex-1 items-baseline gap-2 rounded-lg px-1 py-1.5 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                          >
                            <span className="font-display text-sm font-semibold tabular-nums text-primary/65">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="min-w-0 truncate font-display text-[15px] font-semibold text-primary">
                              {moduleName}
                            </span>
                          </button>
                          <ReorderButtons
                            index={i}
                            count={subjects.length}
                            onMove={onMoveModule}
                            label={moduleName}
                            disabled={Boolean(busy)}
                          />
                        </div>

                        <Droppable droppableId={`classes:${s.id}`} type={`class:${s.id}`}>
                          {(cdrop) => (
                            <ul ref={cdrop.innerRef} {...cdrop.droppableProps} className="px-1.5 pb-1">
                              {s.classes.map((c, j) => {
                                const key: TreeItem = `class:${c.id}`;
                                const name = getLocalizedText(c.title, lang);
                                const empty = !c.video_url?.trim() && !c.has_content;
                                return (
                                  <Draggable key={c.id} draggableId={key} index={j}>
                                    {(cdrag, csnap) => (
                                      <li
                                        ref={cdrag.innerRef}
                                        {...cdrag.draggableProps}
                                        className={cn(
                                          "group flex items-center gap-1 rounded-xl pr-1",
                                          selected === key ? "bg-accent/[0.07]" : "hover:bg-paper/70",
                                          csnap.isDragging && "bg-white shadow-[0_12px_28px_rgba(0,0,0,0.12)]",
                                        )}
                                      >
                                        <span
                                          {...cdrag.dragHandleProps}
                                          className="grid size-7 shrink-0 cursor-grab place-items-center text-primary/25 hover:text-primary/65"
                                          aria-label={es ? `Arrastrar «${name}»` : `Drag “${name}”`}
                                        >
                                          <GripVertical className="size-3.5" aria-hidden />
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => onSelect(key)}
                                          aria-current={selected === key ? "true" : undefined}
                                          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-2 text-left text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                                        >
                                          <ClassIcons video={Boolean(c.video_url?.trim())} text={c.has_content} />
                                          <span className={cn("min-w-0 truncate", selected === key ? "font-semibold text-primary" : "text-primary/80")}>
                                            {name}
                                          </span>
                                          {empty ? (
                                            <Warn label={es ? "Sin video ni texto" : "No video or text"} />
                                          ) : c.duration_minutes ? (
                                            <span className="ml-auto shrink-0 text-xs tabular-nums text-primary/65">
                                              {c.duration_minutes}′
                                            </span>
                                          ) : null}
                                        </button>
                                        <ReorderButtons
                                          index={j}
                                          count={s.classes.length}
                                          onMove={(from, to) => onMoveClass(s.id, from, to)}
                                          label={name}
                                          disabled={Boolean(busy)}
                                          className="opacity-60 group-focus-within:opacity-100 group-hover:opacity-100"
                                        />
                                      </li>
                                    )}
                                  </Draggable>
                                );
                              })}
                              {cdrop.placeholder}

                              {s.exams.map((e) => {
                                const key: TreeItem = `exam:${e.id}`;
                                const problem = e.questionCount === 0 || e.invalidQuestionCount > 0;
                                return (
                                  <li key={e.id}>
                                    <button
                                      type="button"
                                      onClick={() => onSelect(key)}
                                      aria-current={selected === key ? "true" : undefined}
                                      className={cn(
                                        "flex w-full min-w-0 items-center gap-2 rounded-xl py-2 pl-8 pr-3 text-left text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
                                        selected === key ? "bg-accent/[0.07]" : "hover:bg-paper/70",
                                      )}
                                    >
                                      <ClipboardCheck className="size-4 shrink-0 text-primary/65" aria-hidden />
                                      <span className={cn("min-w-0 truncate", selected === key ? "font-semibold text-primary" : "text-primary/80")}>
                                        {getLocalizedText(e.title, lang)}
                                      </span>
                                      {problem ? (
                                        <Warn
                                          label={
                                            e.questionCount === 0
                                              ? es
                                                ? "Sin preguntas"
                                                : "No questions"
                                              : es
                                                ? `${e.invalidQuestionCount} para revisar`
                                                : `${e.invalidQuestionCount} to fix`
                                          }
                                        />
                                      ) : (
                                        <span className="ml-auto shrink-0 text-xs tabular-nums text-primary/65">
                                          {e.questionCount} {es ? "preg." : "q."}
                                        </span>
                                      )}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </Droppable>

                        <div className="flex flex-wrap gap-1 border-t border-primary/5 px-3 py-2">
                          <AddButton busy={busy === `class:${s.id}`} onClick={() => onAddClass(s.id)}>
                            {es ? "Clase" : "Class"}
                          </AddButton>
                          {s.exams.length === 0 ? (
                            <AddButton busy={busy === `exam:${s.id}`} onClick={() => onAddExam(s.id)}>
                              {es ? "Examen" : "Exam"}
                            </AddButton>
                          ) : null}
                        </div>
                      </li>
                    )}
                  </Draggable>
                );
              })}
              {drop.placeholder}
            </ol>
          )}
        </Droppable>
      </DragDropContext>

      <button
        type="button"
        onClick={onAddModule}
        disabled={busy === "module"}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/20 px-4 py-3 text-sm font-semibold text-primary/70 transition-colors hover:border-primary/35 hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-60"
      >
        {busy === "module" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Plus className="size-4" aria-hidden />}
        {es ? "Módulo" : "Module"}
      </button>
    </nav>
  );
}

function ClassIcons({ video, text }: { video: boolean; text: boolean }) {
  return (
    <span className="flex w-8 shrink-0 items-center gap-0.5 text-primary/65">
      {video ? <PlayCircle className="size-3.5" aria-label="Video" /> : null}
      {text ? <FileText className="size-3.5" aria-label="Texto" /> : null}
      {!video && !text ? <span className="size-3.5 rounded-full border border-dashed border-primary/25" aria-hidden /> : null}
    </span>
  );
}

function Warn({ label }: { label: string }) {
  return (
    <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-highlight/25 px-2 py-0.5 text-[11px] font-semibold text-primary">
      <AlertTriangle className="size-3" aria-hidden />
      <span className="max-[380px]:sr-only">{label}</span>
    </span>
  );
}

function AddButton({ busy, onClick, children }: { busy: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-primary/65 transition-colors hover:bg-paper hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-60"
    >
      {busy ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Plus className="size-3.5" aria-hidden />}
      {children}
    </button>
  );
}
