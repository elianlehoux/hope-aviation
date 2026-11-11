"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/features/campus/ui/confirm-dialog";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import type { ManageSubject } from "@/lib/campus/manage";
import { api, cleanOptionalText, cleanText, courseRoutes } from "./api";
import { BilingualField, PanelShell, SaveBar, pairOf, type Pair } from "./form-bits";
import { useBeforeUnload, useSaveShortcut } from "./hooks";

type Form = { title: Pair; description: Pair };

const formOf = (s: ManageSubject): Form => ({ title: pairOf(s.title), description: pairOf(s.description) });

export function ModulePanel({
  courseId,
  subject,
  index,
  onDirtyChange,
  onDeleted,
}: {
  courseId: string;
  subject: ManageSubject;
  index: number;
  onDirtyChange: (dirty: boolean) => void;
  onDeleted: () => void;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const routes = courseRoutes(courseId);
  const [saved, setSaved] = React.useState(() => formOf(subject));
  const [form, setForm] = React.useState(saved);
  const [saving, setSaving] = React.useState(false);
  const [titleError, setTitleError] = React.useState<string>();
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  React.useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useBeforeUnload(dirty);

  const save = async () => {
    if (!dirty || saving) return;
    const title = cleanText(form.title.es, form.title.en);
    if (!title.es && !title.en) {
      setTitleError(es ? "El módulo necesita un título." : "The module needs a title.");
      return;
    }
    setTitleError(undefined);
    setSaving(true);
    const res = await api(routes.subject(subject.id), "PATCH", {
      title,
      description: cleanOptionalText(form.description.es, form.description.en),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(es ? "No se pudo guardar el módulo." : "Couldn't save the module.");
      return;
    }
    setSaved(form);
    toast.success(es ? "Módulo guardado" : "Module saved");
    router.refresh();
  };
  useSaveShortcut(save, true);

  const remove = async () => {
    const res = await api(routes.subject(subject.id), "DELETE");
    if (!res.ok) {
      toast.error(es ? "No se pudo eliminar el módulo." : "Couldn't delete the module.");
      return;
    }
    toast.success(es ? "Módulo eliminado" : "Module deleted");
    onDirtyChange(false);
    onDeleted();
    router.refresh();
  };

  const name = getLocalizedText(subject.title, lang);
  const items = subject.classes.length + subject.exams.length;

  return (
    <>
      <PanelShell
        eyebrow={es ? `Módulo ${index + 1}` : `Module ${index + 1}`}
        title={name}
        footer={
          <SaveBar
            dirty={dirty}
            saving={saving}
            onSave={() => void save()}
            onDelete={() => setConfirmDelete(true)}
            deleteLabel={es ? "Eliminar módulo" : "Delete module"}
          />
        }
      >
        <BilingualField
          id={`module-${subject.id}-title`}
          label={es ? "Título" : "Title"}
          value={form.title}
          onChange={(title) => setForm({ ...form, title })}
          error={titleError}
        />
        <BilingualField
          id={`module-${subject.id}-description`}
          label={es ? "Descripción" : "Description"}
          value={form.description}
          onChange={(description) => setForm({ ...form, description })}
          multiline
          hint={es ? "Una o dos líneas: qué se lleva el alumno de este módulo." : "One or two lines: what learners take away."}
        />
      </PanelShell>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        destructive
        title={es ? `¿Eliminar «${name}»?` : `Delete “${name}”?`}
        description={
          items > 0
            ? es
              ? `Se borran también sus ${items} ${items === 1 ? "elemento" : "elementos"} (clases y examen) y el progreso de los alumnos en ellos. No se puede deshacer.`
              : `Its ${items} ${items === 1 ? "item" : "items"} (classes and exam) and learner progress on them are deleted too. This can't be undone.`
            : es
              ? "El módulo está vacío. No se puede deshacer."
              : "The module is empty. This can't be undone."
        }
        confirmLabel={es ? "Eliminar" : "Delete"}
        onConfirm={remove}
      />
    </>
  );
}
