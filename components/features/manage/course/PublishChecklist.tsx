"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/modal";
import { useTranslation } from "@/lib/i18n/context";
import type { ChecklistIssue } from "@/lib/campus/publish-checklist";
import { api, courseRoutes } from "./api";

/**
 * Publish dialog: lists every checklist issue as a link to the item that needs fixing.
 * "Publicar" stays disabled until the list is empty.
 */
export function PublishChecklist({
  courseId,
  issues,
  open,
  onOpenChange,
}: {
  courseId: string;
  issues: ChecklistIssue[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const ready = issues.length === 0;

  const publish = async () => {
    setPending(true);
    setServerError(null);
    const res = await api(courseRoutes(courseId).course, "PATCH", { status: "published" });
    setPending(false);
    if (!res.ok) {
      // The route has its own publish rules; surface its message as-is.
      setServerError(res.message);
      return;
    }
    toast.success(es ? "Curso publicado. Ya aparece en el catálogo." : "Course published. It's now in the catalog.");
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (pending) return;
        setServerError(null);
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto p-6 sm:max-w-lg sm:p-8">
        <DialogHeader>
          <DialogTitle className="font-display">
            {ready ? (es ? "Todo listo para publicar" : "Ready to publish") : es ? "Antes de publicar" : "Before publishing"}
          </DialogTitle>
          <DialogDescription>
            {ready
              ? es
                ? "El curso pasa al catálogo y cualquier alumno se puede inscribir."
                : "The course goes to the catalog and any learner can enroll."
              : es
                ? `Hay ${issues.length} ${issues.length === 1 ? "cosa" : "cosas"} para resolver. Tocá cada una para ir directo.`
                : `There ${issues.length === 1 ? "is 1 thing" : `are ${issues.length} things`} to fix. Click one to go straight there.`}
          </DialogDescription>
        </DialogHeader>

        {ready ? (
          <p className="flex items-center gap-3 rounded-2xl bg-success/10 px-4 py-3 text-sm font-medium text-success">
            <CheckCircle2 className="size-5 shrink-0" aria-hidden />
            {es
              ? "Módulos con clases, clases con contenido y exámenes con preguntas válidas."
              : "Modules have classes, classes have content and exams have valid questions."}
          </p>
        ) : (
          <ul className="divide-y divide-primary/5 overflow-hidden rounded-2xl border border-primary/10">
            {issues.map((issue, i) => (
              <li key={`${issue.code}-${i}`}>
                <Link
                  href={issue.href}
                  onClick={() => onOpenChange(false)}
                  className="group flex items-start gap-3 px-4 py-3 text-sm text-primary outline-none hover:bg-paper/70 focus-visible:bg-paper"
                >
                  <CircleAlert className="mt-0.5 size-4 shrink-0 text-primary/50" aria-hidden />
                  <span className="min-w-0 flex-1 leading-snug">{es ? issue.label.es : issue.label.en}</span>
                  <ArrowRight
                    className="mt-0.5 size-4 shrink-0 text-primary/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}

        {serverError ? (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {serverError}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            {es ? "Cerrar" : "Close"}
          </Button>
          <Button onClick={() => void publish()} disabled={!ready || pending}>
            {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {es ? "Publicar" : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
