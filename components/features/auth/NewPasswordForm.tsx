"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, TimerOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/context";
import { AuthFormSkeleton, AuthHeading, FormAlert, PasswordField, SubmitButton } from "./auth-ui";

type Phase = "checking" | "expired" | "ready";

export function NewPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useTranslation();
  const es = lang === "es";
  const flaggedExpired = searchParams.get("expired") === "1";

  const [phase, setPhase] = useState<Phase>(flaggedExpired ? "expired" : "checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // The recovery link signs the user in via /api/auth/callback. Without a
  // session the link expired or was already used.
  useEffect(() => {
    if (flaggedExpired) return;
    let active = true;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (active) setPhase(data.user ? "ready" : "expired");
      });
    return () => {
      active = false;
    };
  }, [flaggedExpired]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pErr =
      password.length < 8
        ? es ? "La clave necesita al menos 8 caracteres." : "Your password needs at least 8 characters."
        : null;
    const cErr = !pErr && confirm !== password ? (es ? "Las claves no coinciden." : "The passwords don't match.") : null;
    setPasswordError(pErr);
    setConfirmError(cErr);
    setFormError(null);
    if (pErr || cErr) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setLoading(false);
      if (error.code === "same_password") {
        setPasswordError(es ? "Tiene que ser distinta de la clave anterior." : "It has to be different from your old password.");
      } else if (error.code === "weak_password") {
        setPasswordError(es ? "Esa clave es muy fácil. Probá con otra más larga." : "That password is too easy. Try a longer one.");
      } else if (error.code === "session_not_found" || error.status === 401 || error.status === 403) {
        setPhase("expired");
      } else {
        setFormError(es ? "No pudimos guardar la clave. Probá de nuevo." : "We couldn't save your password. Try again.");
      }
      return;
    }
    router.replace("/campus");
    router.refresh();
  }

  if (phase === "checking") return <AuthFormSkeleton />;

  if (phase === "expired") {
    return (
      <div className="flex flex-col gap-8">
        <AuthHeading
          icon={<TimerOff />}
          title={es ? "Este link venció" : "This link expired"}
          description={
            es
              ? "Los links para cambiar la clave duran poco y sirven una sola vez. Pedí uno nuevo y te llega en un minuto."
              : "Password links are short-lived and work only once. Ask for a new one and it'll arrive in a minute."
          }
        />
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/recuperar"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-orange text-base font-semibold text-primary transition-all hover:bg-brand-orange/90 focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring active:scale-[0.98]"
          >
            {es ? "Pedir un link nuevo" : "Request a new link"}
          </Link>
          <Link
            href="/auth/login"
            className="rounded-full py-2 text-center text-[15px] font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {es ? "Volver a entrar" : "Back to sign in"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading
        icon={<LockKeyhole />}
        title={es ? "Elegí tu nueva clave" : "Choose a new password"}
        description={
          es ? "Usá al menos 8 caracteres. Después entrás directo al campus." : "Use at least 8 characters. Then you'll go straight to the campus."
        }
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <PasswordField
          id="new_password"
          name="new_password"
          autoComplete="new-password"
          label={es ? "Nueva clave" : "New password"}
          hint={es ? "Mínimo 8 caracteres." : "At least 8 characters."}
          showLabel={es ? "Mostrar clave" : "Show password"}
          hideLabel={es ? "Ocultar clave" : "Hide password"}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError(null);
          }}
          error={passwordError}
          disabled={loading}
        />
        <PasswordField
          id="confirm_password"
          name="confirm_password"
          autoComplete="new-password"
          label={es ? "Repetila" : "Repeat it"}
          showLabel={es ? "Mostrar clave" : "Show password"}
          hideLabel={es ? "Ocultar clave" : "Hide password"}
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (confirmError) setConfirmError(null);
          }}
          error={confirmError}
          disabled={loading}
        />

        {formError ? <FormAlert>{formError}</FormAlert> : null}

        <SubmitButton loading={loading} loadingLabel={es ? "Guardando…" : "Saving…"} className="mt-1">
          {es ? "Guardar y entrar" : "Save and continue"}
        </SubmitButton>
      </form>
    </div>
  );
}
