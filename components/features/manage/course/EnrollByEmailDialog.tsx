"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
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
import { api, courseRoutes } from "./api";

/** Admin-only: enroll an existing account in this course by email. */
export function EnrollByEmailDialog({ courseId }: { courseId: string }) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(es ? "Escribí un email válido." : "Enter a valid email.");
      return;
    }
    setPending(true);
    setError(null);
    const res = await api(courseRoutes(courseId).enrollments, "POST", { email: value });
    setPending(false);
    if (!res.ok) {
      setError(
        res.code === "user_not_found"
          ? es
            ? "No hay ninguna cuenta con ese email. La persona tiene que registrarse primero."
            : "There's no account with that email. The person needs to sign up first."
          : res.status === 409 || res.code === "conflict" || res.code === "already_enrolled"
            ? es
              ? "Esa persona ya está inscripta en este curso."
              : "That person is already enrolled in this course."
            : es
              ? "No se pudo inscribir. Probá de nuevo."
              : "Couldn't enroll them. Try again.",
      );
      return;
    }
    toast.success(es ? `Inscribimos a ${value}` : `${value} is enrolled`);
    setOpen(false);
    setEmail("");
    router.refresh();
  };

  return (
    <>
      <Button
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <UserPlus aria-hidden />
        {es ? "Inscribir alumno" : "Enroll learner"}
      </Button>
      <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submit} className="grid gap-6">
            <DialogHeader>
              <DialogTitle className="font-display">{es ? "Inscribir alumno" : "Enroll learner"}</DialogTitle>
              <DialogDescription>
                {es
                  ? "La persona necesita tener una cuenta en el campus. Queda inscripta aunque el curso sea borrador."
                  : "The person needs a campus account. They're enrolled even if the course is a draft."}
              </DialogDescription>
            </DialogHeader>
            <Field label="Email" htmlFor="enroll-email" error={error ?? undefined}>
              <input
                id="enroll-email"
                type="email"
                autoComplete="off"
                className={fieldControl}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@ejemplo.com"
                aria-invalid={Boolean(error) || undefined}
                autoFocus
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
                {es ? "Cancelar" : "Cancel"}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
                {es ? "Inscribir" : "Enroll"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
