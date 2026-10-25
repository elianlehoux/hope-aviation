"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/modal";
import { Field, fieldControl } from "@/components/features/campus/ui/field";
import { useTranslation } from "@/lib/i18n/context";
import { api, cleanText, manageHref } from "./api";

/** "Nuevo curso": title es/en, then straight into the editor. */
export function NewCourseDialog() {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [titleEs, setTitleEs] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const reset = () => {
    setTitleEs("");
    setTitleEn("");
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = cleanText(titleEs, titleEn);
    if (!title.es && !title.en) {
      setError(es ? "Escribí un título en al menos un idioma." : "Write a title in at least one language.");
      return;
    }
    setPending(true);
    setError(null);
    const res = await api<{ course: { id: string } }>("/api/courses", "POST", { title, status: "draft" });
    if (!res.ok) {
      setPending(false);
      setError(es ? "No pudimos crear el curso. Probá de nuevo." : "We couldn't create the course. Try again.");
      return;
    }
    router.push(manageHref.course(res.data.course.id));
  };

  return (
    <>
      <Button
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        <Plus aria-hidden />
        {es ? "Nuevo curso" : "New course"}
      </Button>
      <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submit} className="grid gap-6">
            <DialogHeader>
              <DialogTitle className="font-display">{es ? "Nuevo curso" : "New course"}</DialogTitle>
              <DialogDescription>
                {es
                  ? "Empezá por el título. El resto lo armás en el editor; queda como borrador hasta que lo publiques."
                  : "Start with the title. You'll build the rest in the editor; it stays a draft until you publish."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <Field label={es ? "Título en español" : "Title in Spanish"} htmlFor="new-course-es" error={error ?? undefined}>
                <input
                  id="new-course-es"
                  className={fieldControl}
                  value={titleEs}
                  onChange={(e) => setTitleEs(e.target.value)}
                  placeholder="Fundamentos de aviación misionera"
                  aria-invalid={Boolean(error)}
                  autoFocus
                />
              </Field>
              <Field label={es ? "Título en inglés" : "Title in English"} htmlFor="new-course-en" hint={es ? "Opcional" : "Optional"}>
                <input
                  id="new-course-en"
                  className={fieldControl}
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Mission aviation fundamentals"
                />
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                {es ? "Cancelar" : "Cancel"}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
                {es ? "Crear y editar" : "Create and edit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
