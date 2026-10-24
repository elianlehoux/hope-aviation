"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/context";
import { AuthField, AuthHeading, FormAlert, SubmitButton, currentOrigin, looksLikeEmail } from "./auth-ui";

export function RecoverForm() {
  const { lang } = useTranslation();
  const es = lang === "es";

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = !email.trim()
      ? es ? "Escribí tu mail." : "Enter your email."
      : !looksLikeEmail(email)
        ? es ? "Ese mail no parece válido." : "That email doesn't look right."
        : null;
    setEmailError(err);
    setFormError(null);
    if (err) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${currentOrigin()}/api/auth/callback?next=/auth/nueva-clave`,
    });
    setLoading(false);

    // Rate limiting is the only error worth surfacing; anything else still
    // shows the neutral message so we never reveal whether an account exists.
    if (error && error.status === 429) {
      setFormError(
        es
          ? "Pediste varios links seguidos. Esperá un minuto y probá de nuevo."
          : "You asked for several links in a row. Wait a minute and try again.",
      );
      return;
    }
    setSentTo(email.trim());
  }

  if (sentTo) {
    return (
      <div className="flex flex-col gap-8">
        <AuthHeading
          icon={<MailCheck />}
          title={es ? "Revisá tu mail" : "Check your email"}
          description={
            <>
              {es ? "Si existe una cuenta con " : "If an account exists for "}
              <span className="font-semibold text-primary break-all">{sentTo}</span>
              {es
                ? ", te mandamos un link para elegir una clave nueva."
                : ", we sent you a link to choose a new password."}
            </>
          }
        />
        <div className="rounded-[20px] border border-primary/10 bg-white p-5 text-[15px] leading-relaxed text-muted-foreground">
          {es
            ? "El link dura poco y sirve una sola vez. Si no te llega, fijate en spam o pedí otro."
            : "The link is short-lived and works once. If it doesn't arrive, check spam or ask for another."}
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-orange text-base font-semibold text-primary transition-all hover:bg-brand-orange/90 focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring active:scale-[0.98]"
          >
            {es ? "Volver a entrar" : "Back to sign in"}
          </Link>
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="rounded-full py-2 text-[15px] font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {es ? "Usar otro mail" : "Use a different email"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading
        icon={<KeyRound />}
        title={es ? "Recuperá tu clave" : "Reset your password"}
        description={
          es
            ? "Escribí el mail de tu cuenta y te mandamos un link para elegir una clave nueva."
            : "Enter your account email and we'll send you a link to choose a new password."
        }
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <AuthField
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          label={es ? "Mail" : "Email"}
          placeholder={es ? "nombre@ejemplo.com" : "name@example.com"}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          error={emailError}
          disabled={loading}
        />

        {formError ? <FormAlert>{formError}</FormAlert> : null}

        <SubmitButton loading={loading} loadingLabel={es ? "Enviando…" : "Sending…"} className="mt-1">
          {es ? "Mandame el link" : "Send me the link"}
        </SubmitButton>
      </form>

      <p className="text-center text-[15px] text-muted-foreground">
        {es ? "¿Te acordaste? " : "Remembered it? "}
        <Link
          href="/auth/login"
          className="rounded-sm font-semibold text-primary underline decoration-highlight decoration-2 underline-offset-4 hover:decoration-primary focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {es ? "Volvé a entrar" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
