"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { getLocalizedText } from "@/lib/utils/i18n-helpers";
import { CampusSurface } from "@/components/features/campus/ui/surface";
import { StatusBadge } from "@/components/features/campus/ui/status-badge";
import { ConfirmDialog } from "@/components/features/campus/ui/confirm-dialog";
import type { PersonExamAttempts } from "@/lib/campus/people";
import { resetExamAttempts } from "./people-api";

/** Exam attempts grouped per exam, with a confirmed "reset attempts" action for staff. */
export function PersonAttempts({
  userId,
  personName,
  attempts,
}: {
  userId: string;
  personName: string;
  attempts: PersonExamAttempts[];
}) {
  const { lang } = useTranslation();
  const es = lang === "es";
  const router = useRouter();
  const [target, setTarget] = React.useState<PersonExamAttempts | null>(null);

  const reset = async () => {
    if (!target) return;
    try {
      await resetExamAttempts(userId, target.examId);
      toast.success(es ? "Intentos reiniciados." : "Attempts reset.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : es ? "No pudimos reiniciar los intentos." : "Could not reset attempts.");
      throw e;
    }
  };

  return (
    <CampusSurface className="p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-primary">{es ? "Exámenes" : "Exams"}</h2>
      {attempts.length === 0 ? (
        <p className="mt-4 text-sm text-primary/65">
          {es ? "Todavía no rindió ningún examen." : "No exam attempts yet."}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-primary/5">
          {attempts.map((a) => (
            <li key={a.examId} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-primary">{getLocalizedText(a.examTitle, lang)}</p>
                <p className="mt-0.5 text-xs text-primary/65">{getLocalizedText(a.courseTitle, lang)}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-primary/70">
                  <StatusBadge status={a.passed ? "passed" : "failed"} />
                  <span className="tabular-nums">
                    {es ? `${a.attempts} de ${a.maxAttempts} intentos` : `${a.attempts} of ${a.maxAttempts} attempts`}
                  </span>
                  <span className="tabular-nums">
                    {es ? "Mejor nota" : "Best score"}: {a.best === null ? "—" : `${a.best}%`}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="self-start sm:self-center" onClick={() => setTarget(a)}>
                <RotateCcw aria-hidden />
                {es ? "Reiniciar intentos" : "Reset attempts"}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={target !== null}
        onOpenChange={(o) => !o && setTarget(null)}
        title={es ? "¿Reiniciar los intentos?" : "Reset attempts?"}
        description={
          target
            ? es
              ? `Se ${target.attempts === 1 ? "borra el intento" : `borran los ${target.attempts} intentos`} de ${personName} en “${getLocalizedText(target.examTitle, lang)}”. Va a poder rendirlo de nuevo y los módulos siguientes se vuelven a bloquear hasta que apruebe.`
              : `This deletes ${personName}'s ${target.attempts === 1 ? "attempt" : `${target.attempts} attempts`} on “${getLocalizedText(target.examTitle, lang)}”. They can take it again, and later modules lock until they pass.`
            : undefined
        }
        confirmLabel={es ? "Reiniciar intentos" : "Reset attempts"}
        destructive
        onConfirm={reset}
      />
    </CampusSurface>
  );
}
