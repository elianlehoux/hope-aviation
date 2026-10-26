"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Layers, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ConfirmDialog } from "@/components/features/campus/ui/confirm-dialog";
import { EmptyState } from "@/components/features/campus/ui/empty-state";
import { CampusSurface } from "@/components/features/campus/ui/surface";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { ManageClass, ManageCourseTree, ManageExam, ManageSubject } from "@/lib/campus/manage";
import { api, courseRoutes, manageHref } from "./api";
import { ClassPanel } from "./ClassPanel";
import { CourseTree, type TreeItem } from "./CourseTree";
import { ExamSummaryPanel } from "./ExamSummaryPanel";
import { useIsDesktop } from "./hooks";
import { ModulePanel } from "./ModulePanel";
import { moveItem } from "./ReorderButtons";

function parseItem(raw: string | null): TreeItem | null {
  return raw && /^(module|class|exam):[0-9a-f-]{36}$/i.test(raw) ? (raw as TreeItem) : null;
}

/**
 * Contenido tab: outline on the left, the selected item's form on the right
 * (a bottom sheet below `lg`). Selection lives in `?item=kind:id`.
 */
export function CourseContentEditor({ tree }: { tree: ManageCourseTree }) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop();
  const courseId = tree.course.id;
  const routes = courseRoutes(courseId);

  const selected = parseItem(searchParams.get("item"));
  const [dirty, setDirty] = React.useState(false);
  const [pending, setPending] = React.useState<{ to: TreeItem | null } | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  // Optimistic order: valid only while the server tree it was derived from is current.
  const [override, setOverride] = React.useState<{ base: ManageSubject[]; value: ManageSubject[] } | null>(null);
  const subjects = override && override.base === tree.subjects ? override.value : tree.subjects;

  const go = React.useCallback(
    (to: TreeItem | null) => {
      setDirty(false);
      // Shallow URL update: no server round trip just to switch the panel.
      window.history.replaceState(null, "", manageHref.course(courseId, to ?? undefined));
    },
    [courseId],
  );

  const select = (to: TreeItem | null) => {
    if (to === selected) return;
    if (dirty) setPending({ to });
    else go(to);
  };

  type Resolved =
    | { kind: "module"; subject: ManageSubject; index: number }
    | { kind: "class"; subject: ManageSubject; index: number; cls: ManageClass }
    | { kind: "exam"; subject: ManageSubject; index: number; exam: ManageExam };

  const resolved = React.useMemo((): Resolved | null => {
    if (!selected) return null;
    const [kind, id] = selected.split(":") as ["module" | "class" | "exam", string];
    for (const [index, subject] of subjects.entries()) {
      if (kind === "module" && subject.id === id) return { kind, subject, index };
      const cls = kind === "class" ? subject.classes.find((x) => x.id === id) : undefined;
      if (cls) return { kind: "class", subject, index, cls };
      const exam = kind === "exam" ? subject.exams.find((x) => x.id === id) : undefined;
      if (exam) return { kind: "exam", subject, index, exam };
    }
    return null;
  }, [selected, subjects]);

  const persistOrder = async (next: ManageSubject[], request: Promise<{ ok: boolean }>) => {
    setOverride({ base: tree.subjects, value: next });
    const res = await request;
    if (!res.ok) {
      setOverride(null);
      toast.error(es ? "No se pudo guardar el nuevo orden." : "Couldn't save the new order.");
      return;
    }
    router.refresh();
  };

  const moveModule = (from: number, to: number) => {
    const next = moveItem(subjects, from, to);
    void persistOrder(next, api(routes.subjectsReorder, "PATCH", { orderedSubjectIds: next.map((s) => s.id) }));
  };

  const moveClass = (subjectId: string, from: number, to: number) => {
    const next = subjects.map((s) => (s.id === subjectId ? { ...s, classes: moveItem(s.classes, from, to) } : s));
    const classes = next.find((s) => s.id === subjectId)?.classes ?? [];
    void persistOrder(
      next,
      api(routes.classesReorder(subjectId), "PATCH", { orderedClassIds: classes.map((c) => c.id) }),
    );
  };

  const create = async (key: string, url: string, body: unknown, pick: (data: never) => TreeItem) => {
    setBusy(key);
    const res = await api(url, "POST", body);
    setBusy(null);
    if (!res.ok) {
      toast.error(es ? "No se pudo crear. Probá de nuevo." : "Couldn't create it. Try again.");
      return;
    }
    router.refresh();
    select(pick(res.data as never));
  };

  const addModule = () =>
    create(
      "module",
      routes.subjects,
      { title: { es: "Nuevo módulo", en: "New module" }, order_index: subjects.length },
      (d: { subject: { id: string } }) => `module:${d.subject.id}`,
    );

  const addClass = (subjectId: string) =>
    create(
      `class:${subjectId}`,
      routes.classes(subjectId),
      {
        title: { es: "Nueva clase", en: "New class" },
        order_index: subjects.find((s) => s.id === subjectId)?.classes.length ?? 0,
      },
      (d: { class: { id: string } }) => `class:${d.class.id}`,
    );

  const addExam = (subjectId: string) =>
    create(
      `exam:${subjectId}`,
      routes.exams(subjectId),
      { title: { es: "Examen del módulo", en: "Module exam" }, passing_score: 70, max_attempts: 1 },
      (d: { exam: { id: string } }) => `exam:${d.exam.id}`,
    );

  const onDeleted = () => go(null);

  const panel = !resolved ? null : resolved.kind === "module" ? (
    <ModulePanel
      key={resolved.subject.id}
      courseId={courseId}
      subject={resolved.subject}
      index={resolved.index}
      onDirtyChange={setDirty}
      onDeleted={onDeleted}
    />
  ) : resolved.kind === "class" ? (
    <ClassPanel
      key={resolved.cls.id}
      courseId={courseId}
      cls={resolved.cls}
      moduleName={getLocalizedText(resolved.subject.title, lang)}
      onDirtyChange={setDirty}
      onDeleted={onDeleted}
    />
  ) : (
    <ExamSummaryPanel
      key={resolved.exam.id}
      courseId={courseId}
      exam={resolved.exam}
      moduleName={getLocalizedText(resolved.subject.title, lang)}
      onDeleted={onDeleted}
    />
  );

  if (subjects.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title={es ? "Empezá por el primer módulo" : "Start with the first module"}
        description={
          es
            ? "Un curso se arma en módulos; cada módulo tiene clases y, si querés, un examen al final."
            : "A course is built in modules; each module has classes and, optionally, an exam at the end."
        }
        action={
          <Button onClick={addModule} disabled={busy === "module"}>
            {es ? "Agregar módulo" : "Add module"}
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto lg:pb-4">
          <CourseTree
            subjects={subjects}
            selected={resolved ? selected : null}
            busy={busy}
            onSelect={select}
            onMoveModule={moveModule}
            onMoveClass={moveClass}
            onAddModule={addModule}
            onAddClass={addClass}
            onAddExam={addExam}
          />
        </div>

        {isDesktop !== false ? (
          <section className="hidden min-w-0 lg:block" aria-live="polite">
            {panel ?? (
              <CampusSurface className="flex flex-col items-center px-6 py-20 text-center">
                <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-paper text-primary/55">
                  <MousePointerClick className="size-6" aria-hidden />
                </span>
                <p className="font-display text-lg font-semibold text-primary">
                  {es ? "Elegí qué querés editar" : "Pick something to edit"}
                </p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-primary/60">
                  {es
                    ? "Tocá un módulo, una clase o un examen del índice. Arrastralos para cambiar el orden."
                    : "Click a module, class or exam in the outline. Drag them to change the order."}
                </p>
              </CampusSurface>
            )}
          </section>
        ) : null}
      </div>

      {isDesktop === false ? (
        <Sheet open={Boolean(panel)} onOpenChange={(open) => !open && select(null)}>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="max-h-[92dvh] gap-0 overflow-y-auto bg-paper p-2 pt-3"
          >
            <SheetTitle className="sr-only">{es ? "Editar" : "Edit"}</SheetTitle>
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-primary/15" aria-hidden />
            {panel}
            <Button variant="outline" className="mt-3 w-full bg-white" onClick={() => select(null)}>
              {es ? "Volver al índice" : "Back to outline"}
            </Button>
          </SheetContent>
        </Sheet>
      ) : null}

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={es ? "Tenés cambios sin guardar" : "You have unsaved changes"}
        description={
          es
            ? "Si cambiás de elemento ahora, se pierden. Podés volver y tocar Guardar (o ⌘S)."
            : "If you switch now they're lost. You can go back and hit Save (or ⌘S)."
        }
        confirmLabel={es ? "Descartar cambios" : "Discard changes"}
        destructive
        onConfirm={() => {
          if (pending) go(pending.to);
          setPending(null);
        }}
      />
    </>
  );
}
