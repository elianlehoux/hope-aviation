"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, ListChecks, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/features/campus/ui/confirm-dialog";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { ManageExam } from "@/lib/campus/manage";
import { api, courseRoutes, manageHref } from "./api";
import { PanelShell } from "./form-bits";

export function ExamSummaryPanel({
  courseId,
  exam,
  moduleName,
  onDeleted,
}: {
  courseId: string;
  exam: ManageExam;
  moduleName: string;
  onDeleted: () => void;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const name = getLocalizedText(exam.title, lang);

  const remove = async () => {
    const res = await api(courseRoutes(courseId).exam(exam.subject_id, exam.id), "DELETE");
    if (!res.ok) {
      toast.error(es ? "No se pudo eliminar el examen." : "Couldn't delete the exam.");
      return;
    }
    toast.success(es ? "Examen eliminado" : "Exam deleted");
    onDeleted();
    router.refresh();
  };

  const stats: { label: string; value: string }[] = [
    { label: es ? "Preguntas" : "Questions", value: String(exam.questionCount) },
    { label: es ? "Nota mínima" : "Passing score", value: `${Math.round(exam.passing_score)}%` },
    {
      label: es ? "Tiempo" : "Time",
      value: exam.time_limit_minutes ? `${exam.time_limit_minutes} min` : es ? "Sin límite" : "No limit",
    },
    { label: es ? "Intentos" : "Attempts", value: String(exam.max_attempts) },
  ];

  return (
    <>
      <PanelShell
        eyebrow={es ? `Examen · ${moduleName}` : `Exam · ${moduleName}`}
        title={name}
        footer={
          <>
            <Button type="button" variant="ghost" size="sm" className="-ml-3" onClick={() => setConfirmDelete(true)}>
              <Trash2 aria-hidden />
              {es ? "Eliminar examen" : "Delete exam"}
            </Button>
            <Link href={manageHref.exam(courseId, exam.id)} className={buttonVariants()}>
              <ListChecks aria-hidden />
              {es ? "Editar preguntas" : "Edit questions"}
            </Link>
          </>
        }
      >
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-primary/10 bg-primary/10 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white px-4 py-3">
              <dt className="text-xs font-semibold text-primary/50">{s.label}</dt>
              <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-primary">{s.value}</dd>
            </div>
          ))}
        </dl>

        {exam.questionCount === 0 ? (
          <Notice>
            {es
              ? "Todavía no tiene preguntas. Sin preguntas no se puede publicar el curso."
              : "No questions yet. The course can't be published without them."}
          </Notice>
        ) : exam.invalidQuestionCount > 0 ? (
          <Notice>
            {es
              ? `${exam.invalidQuestionCount} ${exam.invalidQuestionCount === 1 ? "pregunta necesita" : "preguntas necesitan"} al menos 2 opciones y una sola correcta.`
              : `${exam.invalidQuestionCount} ${exam.invalidQuestionCount === 1 ? "question needs" : "questions need"} at least 2 options and exactly one correct.`}
          </Notice>
        ) : (
          <p className="text-sm leading-relaxed text-primary/60">
            {es
              ? "Los alumnos lo rinden al terminar las clases del módulo; aprobarlo desbloquea el módulo siguiente."
              : "Learners take it after the module's classes; passing it unlocks the next module."}
          </p>
        )}
      </PanelShell>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        destructive
        title={es ? `¿Eliminar «${name}»?` : `Delete “${name}”?`}
        description={
          es
            ? "Se borran sus preguntas y los intentos de los alumnos. No se puede deshacer."
            : "Its questions and learner attempts are deleted. This can't be undone."
        }
        confirmLabel={es ? "Eliminar" : "Delete"}
        onConfirm={remove}
      />
    </>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-3 rounded-2xl bg-highlight/15 px-4 py-3 text-sm leading-relaxed text-primary">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
