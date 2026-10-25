"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowUpRight, Clock, FileText, PencilLine, PlayCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/features/campus/ui/confirm-dialog";
import { Field, fieldControl } from "@/components/features/campus/ui/field";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import { getYoutubeId } from "@/lib/utils/youtube";
import { cn } from "@/lib/utils";
import type { ManageClass } from "@/lib/campus/manage";
import { api, cleanOptionalText, cleanText, courseRoutes, manageHref } from "./api";
import { BilingualField, PanelShell, SaveBar, pairOf, type Pair } from "./form-bits";
import { useBeforeUnload, useSaveShortcut } from "./hooks";

type Form = { title: Pair; description: Pair; duration: string; video: string; resource: string };

const formOf = (c: ManageClass): Form => ({
  title: pairOf(c.title),
  description: pairOf(c.description),
  duration: c.duration_minutes != null ? String(c.duration_minutes) : "",
  video: c.video_url ?? "",
  resource: c.resource_url ?? "",
});

function isHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function ClassPanel({
  courseId,
  cls,
  moduleName,
  onDirtyChange,
  onDeleted,
}: {
  courseId: string;
  cls: ManageClass;
  moduleName: string;
  onDirtyChange: (dirty: boolean) => void;
  onDeleted: () => void;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const routes = courseRoutes(courseId);
  const [saved, setSaved] = React.useState(() => formOf(cls));
  const [form, setForm] = React.useState(saved);
  const [errors, setErrors] = React.useState<Partial<Record<keyof Form, string>>>({});
  const [saving, setSaving] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  React.useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useBeforeUnload(dirty);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const next: typeof errors = {};
    const title = cleanText(form.title.es, form.title.en);
    if (!title.es && !title.en) next.title = es ? "La clase necesita un título." : "The class needs a title.";
    if (form.video.trim() && !getYoutubeId(form.video.trim())) {
      next.video = es
        ? "No reconocemos ese link de YouTube. Pegá la URL del video o su ID de 11 caracteres."
        : "That doesn't look like a YouTube link. Paste the video URL or its 11-character ID.";
    }
    if (form.resource.trim() && !isHttpUrl(form.resource.trim())) {
      next.resource = es ? "Tiene que ser un link completo (https://…)." : "Use a full link (https://…).";
    }
    const d = form.duration.trim();
    if (d && (!/^\d+$/.test(d) || Number(d) > 1000)) {
      next.duration = es ? "Minutos enteros, por ejemplo 12." : "Whole minutes, e.g. 12.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!dirty || saving || !validate()) return;
    setSaving(true);
    const res = await api(routes.class(cls.subject_id, cls.id), "PATCH", {
      title: cleanText(form.title.es, form.title.en),
      description: cleanOptionalText(form.description.es, form.description.en),
      duration_minutes: form.duration.trim() ? Number(form.duration.trim()) : null,
      video_url: form.video.trim() || null,
      resource_url: form.resource.trim() || null,
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(es ? "No se pudo guardar la clase." : "Couldn't save the class.");
      return;
    }
    setSaved(form);
    toast.success(es ? "Clase guardada" : "Class saved");
    router.refresh();
  };
  useSaveShortcut(save, true);

  const remove = async () => {
    const res = await api(routes.class(cls.subject_id, cls.id), "DELETE");
    if (!res.ok) {
      toast.error(es ? "No se pudo eliminar la clase." : "Couldn't delete the class.");
      return;
    }
    toast.success(es ? "Clase eliminada" : "Class deleted");
    onDirtyChange(false);
    onDeleted();
    router.refresh();
  };

  const name = getLocalizedText(cls.title, lang);
  const videoId = getYoutubeId(form.video.trim());

  return (
    <>
      <PanelShell
        eyebrow={es ? `Clase · ${moduleName}` : `Class · ${moduleName}`}
        title={name}
        footer={
          <SaveBar
            dirty={dirty}
            saving={saving}
            onSave={() => void save()}
            onDelete={() => setConfirmDelete(true)}
            deleteLabel={es ? "Eliminar clase" : "Delete class"}
          />
        }
      >
        <BilingualField
          id={`class-${cls.id}-title`}
          label={es ? "Título" : "Title"}
          value={form.title}
          onChange={(v) => set("title", v)}
          error={errors.title}
        />

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
          <Field
            label={es ? "Video de YouTube" : "YouTube video"}
            htmlFor={`class-${cls.id}-video`}
            error={errors.video}
            hint={
              videoId
                ? es
                  ? `Video ${videoId} ✓`
                  : `Video ${videoId} ✓`
                : es
                  ? "Opcional si la clase tiene texto."
                  : "Optional when the class has text."
            }
          >
            <input
              id={`class-${cls.id}-video`}
              className={fieldControl}
              value={form.video}
              onChange={(e) => set("video", e.target.value)}
              placeholder="https://youtu.be/…"
              inputMode="url"
              aria-invalid={Boolean(errors.video) || undefined}
            />
          </Field>
          <Field label={es ? "Duración (min)" : "Length (min)"} htmlFor={`class-${cls.id}-duration`} error={errors.duration}>
            <input
              id={`class-${cls.id}-duration`}
              className={fieldControl}
              value={form.duration}
              onChange={(e) => set("duration", e.target.value)}
              inputMode="numeric"
              placeholder="12"
              aria-invalid={Boolean(errors.duration) || undefined}
            />
          </Field>
        </div>

        <div className="rounded-2xl border border-primary/10 bg-paper/60 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-primary/70">
                <FileText className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-primary">{es ? "Texto de la clase" : "Class text"}</p>
                <p className="mt-0.5 text-sm text-primary/60">
                  {cls.has_content
                    ? es
                      ? "Lectura con el mismo formato que ven los alumnos."
                      : "Reading in the same format learners see."
                    : es
                      ? "Todavía no tiene texto. Podés sumar lectura, gráficos y preguntas de repaso."
                      : "No text yet. You can add reading, charts and review questions."}
                </p>
                {cls.reading_minutes ? (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-primary/70">
                    <Clock className="size-3.5" aria-hidden />
                    {es ? `≈ ${cls.reading_minutes} min de lectura` : `≈ ${cls.reading_minutes} min read`}
                  </span>
                ) : null}
              </div>
            </div>
            {dirty ? (
              <span className="text-xs text-primary/50">{es ? "Guardá los cambios primero" : "Save your changes first"}</span>
            ) : (
              <Link
                href={manageHref.lesson(courseId, cls.id)}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "bg-white")}
              >
                <PencilLine aria-hidden />
                {cls.has_content ? (es ? "Editar texto" : "Edit text") : es ? "Escribir texto" : "Write text"}
              </Link>
            )}
          </div>
        </div>

        <Field
          label={es ? "Material de apoyo" : "Supporting material"}
          htmlFor={`class-${cls.id}-resource`}
          error={errors.resource}
          hint={es ? "Link a un PDF, una carpeta o una web. Opcional." : "Link to a PDF, folder or website. Optional."}
        >
          <input
            id={`class-${cls.id}-resource`}
            className={fieldControl}
            value={form.resource}
            onChange={(e) => set("resource", e.target.value)}
            placeholder="https://…"
            inputMode="url"
            aria-invalid={Boolean(errors.resource) || undefined}
          />
        </Field>

        <BilingualField
          id={`class-${cls.id}-description`}
          label={es ? "Descripción" : "Description"}
          value={form.description}
          onChange={(v) => set("description", v)}
          multiline
          hint={es ? "Se muestra debajo del video." : "Shown below the video."}
        />

        {videoId ? (
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            <PlayCircle className="size-4" aria-hidden />
            {es ? "Ver el video en YouTube" : "Watch on YouTube"}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        ) : null}
      </PanelShell>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        destructive
        title={es ? `¿Eliminar «${name}»?` : `Delete “${name}”?`}
        description={
          es
            ? "Se borra la clase con su texto y el progreso de los alumnos en ella. No se puede deshacer."
            : "The class, its text and learner progress on it are deleted. This can't be undone."
        }
        confirmLabel={es ? "Eliminar" : "Delete"}
        onConfirm={remove}
      />
    </>
  );
}
